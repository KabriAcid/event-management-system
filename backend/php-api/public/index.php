<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/bootstrap.php';

function jsonResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function normalizePath(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if (!is_string($path) || $path === '') {
        return '/';
    }

    $trimmed = rtrim($path, '/');
    return $trimmed === '' ? '/' : $trimmed;
}

function bearerToken(): ?string
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!is_string($authHeader) || stripos($authHeader, 'Bearer ') !== 0) {
        return null;
    }

    return trim(substr($authHeader, 7));
}

function firstWhere(array $items, callable $predicate): ?array
{
    foreach ($items as $item) {
        if ($predicate($item)) {
            return $item;
        }
    }

    return null;
}

function sortEvents(array $events): array
{
    usort($events, static function (array $a, array $b): int {
        $aTime = strtotime(($a['date'] ?? '') . ' ' . ($a['time'] ?? ''));
        $bTime = strtotime(($b['date'] ?? '') . ' ' . ($b['time'] ?? ''));

        return ($bTime ?: 0) <=> ($aTime ?: 0);
    });

    return $events;
}

function getUserFromSession(JsonStore $store): ?array
{
    $token = bearerToken();
    if ($token === null || $token === '') {
        return null;
    }

    $sessions = $store->read('sessions.json', []);
    $session = firstWhere(
        $sessions,
        static fn(array $item): bool => ($item['token'] ?? '') === $token
    );

    if ($session === null) {
        return null;
    }

    $expiresAt = (int) ($session['expiresAt'] ?? 0);
    if ($expiresAt > 0 && $expiresAt < time()) {
        return null;
    }

    $users = $store->read('users.json', []);

    return firstWhere(
        $users,
        static fn(array $item): bool => ($item['id'] ?? '') === ($session['userId'] ?? '')
    );
}

function upsertUserIdCollection(JsonStore $store, string $fileName, string $userId, string $eventId): array
{
    $rows = $store->read($fileName, []);
    $updated = false;

    foreach ($rows as &$row) {
        if (($row['userId'] ?? '') !== $userId) {
            continue;
        }

        $eventIds = isset($row['eventIds']) && is_array($row['eventIds']) ? $row['eventIds'] : [];
        if (!in_array($eventId, $eventIds, true)) {
            $eventIds[] = $eventId;
        }

        $row['eventIds'] = array_values(array_unique($eventIds));
        $updated = true;
        break;
    }
    unset($row);

    if (!$updated) {
        $rows[] = [
            'userId' => $userId,
            'eventIds' => [$eventId],
        ];
    }

    $store->write($fileName, $rows);
    return $rows;
}

function removeFromUserIdCollection(JsonStore $store, string $fileName, string $userId, string $eventId): array
{
    $rows = $store->read($fileName, []);

    foreach ($rows as &$row) {
        if (($row['userId'] ?? '') !== $userId) {
            continue;
        }

        $eventIds = isset($row['eventIds']) && is_array($row['eventIds']) ? $row['eventIds'] : [];
        $row['eventIds'] = array_values(
            array_filter($eventIds, static fn(string $id): bool => $id !== $eventId)
        );
        break;
    }
    unset($row);

    $store->write($fileName, $rows);
    return $rows;
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$path = normalizePath();
$body = readJsonBody();

if ($method === 'GET' && $path === '/api/health') {
    jsonResponse([
        'ok' => true,
        'service' => 'eventflow-php-mock-api',
        'timestamp' => gmdate('c'),
    ]);
}

if ($method === 'POST' && $path === '/api/auth/login') {
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    $role = (string) ($body['role'] ?? '');

    if ($email === '' || $password === '' || $role === '') {
        jsonResponse(['error' => 'email, password and role are required'], 422);
    }

    $users = $store->read('users.json', []);
    $user = firstWhere(
        $users,
        static fn(array $item): bool => strtolower((string) ($item['email'] ?? '')) === $email
    );

    if ($user === null) {
        jsonResponse(['error' => 'No account found for this email'], 404);
    }

    if (($user['password'] ?? '') !== $password) {
        jsonResponse(['error' => 'Incorrect password'], 401);
    }

    if (($user['role'] ?? '') !== $role) {
        jsonResponse([
            'error' => 'Role mismatch',
            'expectedRole' => $user['role'] ?? null,
        ], 409);
    }

    $token = 'mock_' . bin2hex(random_bytes(16));
    $session = [
        'token' => $token,
        'userId' => $user['id'],
        'createdAt' => gmdate('c'),
        'expiresAt' => time() + (7 * 24 * 60 * 60),
    ];

    $sessions = $store->read('sessions.json', []);
    $sessions[] = $session;
    $store->write('sessions.json', $sessions);

    $publicUser = [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ];

    jsonResponse([
        'token' => $token,
        'user' => $publicUser,
        'expiresAt' => $session['expiresAt'] * 1000,
    ]);
}

if ($method === 'POST' && $path === '/api/auth/register') {
    $name = trim((string) ($body['name'] ?? ''));
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    $role = (string) ($body['role'] ?? 'attendee');

    if ($name === '' || $email === '' || $password === '') {
        jsonResponse(['error' => 'name, email and password are required'], 422);
    }

    $users = $store->read('users.json', []);
    $existing = firstWhere(
        $users,
        static fn(array $item): bool => strtolower((string) ($item['email'] ?? '')) === $email
    );

    if ($existing !== null) {
        jsonResponse(['error' => 'An account with this email already exists'], 409);
    }

    $newUser = [
        'id' => 'u-custom-' . time(),
        'name' => $name,
        'email' => $email,
        'password' => $password,
        'role' => $role,
    ];

    $users[] = $newUser;
    $store->write('users.json', $users);

    $token = 'mock_' . bin2hex(random_bytes(16));
    $session = [
        'token' => $token,
        'userId' => $newUser['id'],
        'createdAt' => gmdate('c'),
        'expiresAt' => time() + (7 * 24 * 60 * 60),
    ];

    $sessions = $store->read('sessions.json', []);
    $sessions[] = $session;
    $store->write('sessions.json', $sessions);

    jsonResponse([
        'token' => $token,
        'user' => [
            'id' => $newUser['id'],
            'name' => $newUser['name'],
            'email' => $newUser['email'],
            'role' => $newUser['role'],
        ],
        'expiresAt' => $session['expiresAt'] * 1000,
    ], 201);
}

if ($method === 'GET' && $path === '/api/auth/me') {
    $user = getUserFromSession($store);
    if ($user === null) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }

    jsonResponse([
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ],
    ]);
}

if ($method === 'POST' && $path === '/api/auth/change-password') {
    $user = getUserFromSession($store);
    if ($user === null) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }

    $currentPassword = (string) ($body['currentPassword'] ?? '');
    $newPassword = (string) ($body['newPassword'] ?? '');

    if ($currentPassword === '' || $newPassword === '') {
        jsonResponse(['error' => 'currentPassword and newPassword are required'], 422);
    }

    if (($user['password'] ?? '') !== $currentPassword) {
        jsonResponse(['error' => 'Current password is incorrect'], 401);
    }

    $users = $store->read('users.json', []);
    foreach ($users as &$item) {
        if (($item['id'] ?? '') === ($user['id'] ?? '')) {
            $item['password'] = $newPassword;
            break;
        }
    }
    unset($item);

    $store->write('users.json', $users);
    jsonResponse(['ok' => true, 'message' => 'Password updated']);
}

if ($method === 'GET' && $path === '/api/events') {
    $events = $store->read('events.json', []);
    jsonResponse(['events' => sortEvents($events)]);
}

if ($method === 'POST' && $path === '/api/events') {
    $required = ['title', 'date', 'time', 'location', 'category', 'price', 'description'];
    foreach ($required as $field) {
        if (!isset($body[$field]) || trim((string) $body[$field]) === '') {
            jsonResponse(['error' => "{$field} is required"], 422);
        }
    }

    $events = $store->read('events.json', []);
    $newEvent = [
        'id' => 'ev-' . time(),
        'title' => trim((string) $body['title']),
        'date' => (string) $body['date'],
        'time' => (string) $body['time'],
        'location' => trim((string) $body['location']),
        'category' => (string) $body['category'],
        'image' => trim((string) ($body['image'] ?? '')),
        'attendees' => 0,
        'price' => (float) $body['price'],
        'status' => (string) ($body['status'] ?? 'Upcoming'),
        'description' => trim((string) $body['description']),
    ];

    if ($newEvent['image'] === '') {
        $newEvent['image'] = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
    }

    $events[] = $newEvent;
    $store->write('events.json', $events);

    jsonResponse(['event' => $newEvent], 201);
}

if (preg_match('#^/api/events/([^/]+)$#', $path, $matches) === 1) {
    $eventId = $matches[1];
    $events = $store->read('events.json', []);
    $index = null;

    foreach ($events as $i => $event) {
        if (($event['id'] ?? '') === $eventId) {
            $index = $i;
            break;
        }
    }

    if ($index === null) {
        jsonResponse(['error' => 'Event not found'], 404);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $current = $events[$index];

        $events[$index] = [
            'id' => $current['id'],
            'title' => trim((string) ($body['title'] ?? $current['title'])),
            'date' => (string) ($body['date'] ?? $current['date']),
            'time' => (string) ($body['time'] ?? $current['time']),
            'location' => trim((string) ($body['location'] ?? $current['location'])),
            'category' => (string) ($body['category'] ?? $current['category']),
            'image' => trim((string) ($body['image'] ?? $current['image'])),
            'attendees' => (int) ($body['attendees'] ?? $current['attendees']),
            'price' => (float) ($body['price'] ?? $current['price']),
            'status' => (string) ($body['status'] ?? $current['status']),
            'description' => trim((string) ($body['description'] ?? $current['description'])),
        ];

        $store->write('events.json', $events);
        jsonResponse(['event' => $events[$index]]);
    }

    if ($method === 'DELETE') {
        $events = array_values(array_filter(
            $events,
            static fn(array $event): bool => ($event['id'] ?? '') !== $eventId
        ));
        $store->write('events.json', $events);
        jsonResponse(['ok' => true]);
    }
}

if ($method === 'GET' && $path === '/api/attendees') {
    $attendees = $store->read('attendees.json', []);
    jsonResponse(['attendees' => $attendees]);
}

if ($method === 'POST' && $path === '/api/attendees') {
    $required = ['name', 'email', 'event', 'status', 'date'];
    foreach ($required as $field) {
        if (!isset($body[$field]) || trim((string) $body[$field]) === '') {
            jsonResponse(['error' => "{$field} is required"], 422);
        }
    }

    $attendees = $store->read('attendees.json', []);
    $newAttendee = [
        'id' => $store->nextNumericId($attendees),
        'name' => trim((string) $body['name']),
        'email' => strtolower(trim((string) $body['email'])),
        'event' => trim((string) $body['event']),
        'status' => (string) $body['status'],
        'date' => (string) $body['date'],
    ];

    $attendees[] = $newAttendee;
    $store->write('attendees.json', $attendees);
    jsonResponse(['attendee' => $newAttendee], 201);
}

if (preg_match('#^/api/attendees/(\d+)$#', $path, $matches) === 1) {
    $attendeeId = (int) $matches[1];
    $attendees = $store->read('attendees.json', []);
    $index = null;

    foreach ($attendees as $i => $attendee) {
        if ((int) ($attendee['id'] ?? 0) === $attendeeId) {
            $index = $i;
            break;
        }
    }

    if ($index === null) {
        jsonResponse(['error' => 'Attendee not found'], 404);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $current = $attendees[$index];
        $attendees[$index] = [
            'id' => $current['id'],
            'name' => trim((string) ($body['name'] ?? $current['name'])),
            'email' => strtolower(trim((string) ($body['email'] ?? $current['email']))),
            'event' => trim((string) ($body['event'] ?? $current['event'])),
            'status' => (string) ($body['status'] ?? $current['status']),
            'date' => (string) ($body['date'] ?? $current['date']),
        ];

        $store->write('attendees.json', $attendees);
        jsonResponse(['attendee' => $attendees[$index]]);
    }

    if ($method === 'DELETE') {
        $attendees = array_values(array_filter(
            $attendees,
            static fn(array $item): bool => (int) ($item['id'] ?? 0) !== $attendeeId
        ));
        $store->write('attendees.json', $attendees);
        jsonResponse(['ok' => true]);
    }
}

if ($method === 'POST' && $path === '/api/attendees/register-ticket') {
    $name = trim((string) ($body['name'] ?? ''));
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $event = trim((string) ($body['event'] ?? ''));
    $date = (string) ($body['date'] ?? gmdate('Y-m-d'));

    if ($name === '' || $email === '' || $event === '') {
        jsonResponse(['error' => 'name, email and event are required'], 422);
    }

    $attendees = $store->read('attendees.json', []);
    $updated = false;

    foreach ($attendees as &$attendee) {
        if (
            strtolower((string) ($attendee['email'] ?? '')) === $email &&
            strtolower((string) ($attendee['event'] ?? '')) === strtolower($event)
        ) {
            $attendee['name'] = $name;
            $attendee['status'] = 'Confirmed';
            $attendee['date'] = $date;
            $updated = true;
            break;
        }
    }
    unset($attendee);

    if (!$updated) {
        $attendees[] = [
            'id' => $store->nextNumericId($attendees),
            'name' => $name,
            'email' => $email,
            'event' => $event,
            'status' => 'Confirmed',
            'date' => $date,
        ];
    }

    $store->write('attendees.json', $attendees);
    jsonResponse(['attendees' => $attendees]);
}

if ($method === 'POST' && $path === '/api/attendees/cancel-ticket') {
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $event = strtolower(trim((string) ($body['event'] ?? '')));

    if ($email === '' || $event === '') {
        jsonResponse(['error' => 'email and event are required'], 422);
    }

    $attendees = $store->read('attendees.json', []);

    foreach ($attendees as &$attendee) {
        if (
            strtolower((string) ($attendee['email'] ?? '')) === $email &&
            strtolower((string) ($attendee['event'] ?? '')) === $event
        ) {
            $attendee['status'] = 'Cancelled';
        }
    }
    unset($attendee);

    $store->write('attendees.json', $attendees);
    jsonResponse(['attendees' => $attendees]);
}

if ($method === 'GET' && $path === '/api/tickets') {
    $userId = (string) ($_GET['userId'] ?? '');
    if ($userId === '') {
        jsonResponse(['error' => 'userId is required'], 422);
    }

    $rows = $store->read('ticket_purchases.json', []);
    $row = firstWhere(
        $rows,
        static fn(array $item): bool => ($item['userId'] ?? '') === $userId
    );

    $eventIds = isset($row['eventIds']) && is_array($row['eventIds']) ? $row['eventIds'] : [];
    jsonResponse(['eventIds' => array_values($eventIds)]);
}

if ($method === 'POST' && $path === '/api/tickets/purchase') {
    $userId = (string) ($body['userId'] ?? '');
    $eventId = (string) ($body['eventId'] ?? '');
    $ticketCode = (string) ($body['ticketCode'] ?? ('EVF-' . strtoupper(substr($userId, -4)) . '-' . strtoupper($eventId)));

    if ($userId === '' || $eventId === '') {
        jsonResponse(['error' => 'userId and eventId are required'], 422);
    }

    $purchases = upsertUserIdCollection($store, 'ticket_purchases.json', $userId, $eventId);

    $meta = $store->read('ticket_meta.json', []);
    $metaIndex = null;

    foreach ($meta as $i => $item) {
        if (($item['userId'] ?? '') === $userId && ($item['eventId'] ?? '') === $eventId) {
            $metaIndex = $i;
            break;
        }
    }

    if ($metaIndex === null) {
        $meta[] = [
            'userId' => $userId,
            'eventId' => $eventId,
            'ticketCode' => $ticketCode,
            'purchasedAt' => gmdate('c'),
        ];
    } else {
        $meta[$metaIndex]['ticketCode'] = $ticketCode;
    }

    $store->write('ticket_meta.json', $meta);

    jsonResponse([
        'ok' => true,
        'purchases' => $purchases,
        'meta' => $meta,
    ]);
}

if ($method === 'POST' && $path === '/api/tickets/cancel') {
    $userId = (string) ($body['userId'] ?? '');
    $eventId = (string) ($body['eventId'] ?? '');

    if ($userId === '' || $eventId === '') {
        jsonResponse(['error' => 'userId and eventId are required'], 422);
    }

    $purchases = removeFromUserIdCollection($store, 'ticket_purchases.json', $userId, $eventId);

    $meta = $store->read('ticket_meta.json', []);
    $meta = array_values(array_filter(
        $meta,
        static fn(array $item): bool => !(($item['userId'] ?? '') === $userId && ($item['eventId'] ?? '') === $eventId)
    ));
    $store->write('ticket_meta.json', $meta);

    jsonResponse([
        'ok' => true,
        'purchases' => $purchases,
        'meta' => $meta,
    ]);
}

if ($method === 'GET' && $path === '/api/tickets/favorites') {
    $userId = (string) ($_GET['userId'] ?? '');
    if ($userId === '') {
        jsonResponse(['error' => 'userId is required'], 422);
    }

    $rows = $store->read('ticket_favorites.json', []);
    $row = firstWhere(
        $rows,
        static fn(array $item): bool => ($item['userId'] ?? '') === $userId
    );

    $eventIds = isset($row['eventIds']) && is_array($row['eventIds']) ? $row['eventIds'] : [];
    jsonResponse(['eventIds' => array_values($eventIds)]);
}

if ($method === 'POST' && $path === '/api/tickets/favorites/toggle') {
    $userId = (string) ($body['userId'] ?? '');
    $eventId = (string) ($body['eventId'] ?? '');

    if ($userId === '' || $eventId === '') {
        jsonResponse(['error' => 'userId and eventId are required'], 422);
    }

    $rows = $store->read('ticket_favorites.json', []);
    $updated = false;

    foreach ($rows as &$row) {
        if (($row['userId'] ?? '') !== $userId) {
            continue;
        }

        $ids = isset($row['eventIds']) && is_array($row['eventIds']) ? $row['eventIds'] : [];
        if (in_array($eventId, $ids, true)) {
            $ids = array_values(array_filter($ids, static fn(string $id): bool => $id !== $eventId));
        } else {
            $ids[] = $eventId;
        }

        $row['eventIds'] = array_values(array_unique($ids));
        $updated = true;
        break;
    }
    unset($row);

    if (!$updated) {
        $rows[] = [
            'userId' => $userId,
            'eventIds' => [$eventId],
        ];
    }

    $store->write('ticket_favorites.json', $rows);
    $row = firstWhere($rows, static fn(array $item): bool => ($item['userId'] ?? '') === $userId);

    jsonResponse([
        'eventIds' => isset($row['eventIds']) && is_array($row['eventIds']) ? array_values($row['eventIds']) : [],
    ]);
}

if ($method === 'GET' && $path === '/api/tickets/meta') {
    $userId = (string) ($_GET['userId'] ?? '');
    if ($userId === '') {
        jsonResponse(['error' => 'userId is required'], 422);
    }

    $meta = $store->read('ticket_meta.json', []);
    $items = array_values(array_filter(
        $meta,
        static fn(array $item): bool => ($item['userId'] ?? '') === $userId
    ));

    jsonResponse(['items' => $items]);
}

if ($method === 'GET' && $path === '/api/settings/security') {
    $userId = (string) ($_GET['userId'] ?? '');
    if ($userId === '') {
        jsonResponse(['error' => 'userId is required'], 422);
    }

    $rows = $store->read('security_settings.json', []);
    $row = firstWhere(
        $rows,
        static fn(array $item): bool => ($item['userId'] ?? '') === $userId
    );

    if ($row === null) {
        $row = [
            'userId' => $userId,
            'twoFactorEnabled' => false,
            'loginAlerts' => true,
            'autoLogoutMinutes' => '60',
        ];
    }

    jsonResponse(['settings' => $row]);
}

if ($method === 'POST' && $path === '/api/settings/security') {
    $userId = (string) ($body['userId'] ?? '');
    if ($userId === '') {
        jsonResponse(['error' => 'userId is required'], 422);
    }

    $rows = $store->read('security_settings.json', []);
    $newSettings = [
        'userId' => $userId,
        'twoFactorEnabled' => (bool) ($body['twoFactorEnabled'] ?? false),
        'loginAlerts' => (bool) ($body['loginAlerts'] ?? true),
        'autoLogoutMinutes' => (string) ($body['autoLogoutMinutes'] ?? '60'),
    ];

    $updated = false;
    foreach ($rows as $i => $row) {
        if (($row['userId'] ?? '') === $userId) {
            $rows[$i] = $newSettings;
            $updated = true;
            break;
        }
    }

    if (!$updated) {
        $rows[] = $newSettings;
    }

    $store->write('security_settings.json', $rows);
    jsonResponse(['settings' => $newSettings]);
}

jsonResponse([
    'error' => 'Route not found',
    'method' => $method,
    'path' => $path,
], 404);
