<?php

declare(strict_types=1);

require_once __DIR__ . '/storage.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

date_default_timezone_set('UTC');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = realpath(__DIR__ . '/../data');
if ($dataDir === false) {
    $dataDir = __DIR__ . '/../data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0777, true);
    }
}

$store = new JsonStore($dataDir);

$seedFiles = [
    'users.json' => [
        [
            'id' => 'u-org-001',
            'name' => 'Event Organizer',
            'email' => 'organizer@eventflow.demo',
            'password' => 'demo123',
            'role' => 'organizer',
        ],
        [
            'id' => 'u-att-001',
            'name' => 'Happy Attendee',
            'email' => 'attendee@eventflow.demo',
            'password' => 'demo123',
            'role' => 'attendee',
        ],
    ],
    'events.json' => [
        [
            'id' => '1',
            'title' => 'Tech Summit 2026',
            'date' => '2026-03-15',
            'time' => '09:00 AM',
            'location' => 'San Francisco, CA',
            'category' => 'Technology',
            'image' => 'https://images.unsplash.com/photo-1761223976272-0d6d4bc38636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
            'attendees' => 1240,
            'price' => 299,
            'status' => 'Upcoming',
            'description' => 'The biggest tech conference of the year featuring industry leaders and innovative workshops.',
        ],
        [
            'id' => '2',
            'title' => 'Summer Music Festival',
            'date' => '2026-06-20',
            'time' => '04:00 PM',
            'location' => 'Austin, TX',
            'category' => 'Music',
            'image' => 'https://images.unsplash.com/photo-1735748917428-be035e873f97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
            'attendees' => 5400,
            'price' => 150,
            'status' => 'Upcoming',
            'description' => 'Three days of non-stop music, food, and fun under the summer sun.',
        ],
    ],
    'attendees.json' => [],
    'sessions.json' => [],
    'ticket_purchases.json' => [],
    'ticket_favorites.json' => [],
    'ticket_meta.json' => [],
    'security_settings.json' => [],
];

foreach ($seedFiles as $fileName => $data) {
    $existing = $store->read($fileName, []);
    if ($existing === []) {
        $store->write($fileName, $data);
    }
}
