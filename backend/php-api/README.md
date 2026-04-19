# PHP Mock API Backend

This is a setup-light PHP API that mimics a real backend using JSON file storage.

## Run

```bash
cd backend/php-api
php -S localhost:8080 -t public
```

Base URL: `http://localhost:8080`

## Main Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/change-password`

- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/{id}`
- `DELETE /api/events/{id}`

- `GET /api/attendees`
- `POST /api/attendees`
- `PUT /api/attendees/{id}`
- `DELETE /api/attendees/{id}`
- `POST /api/attendees/register-ticket`
- `POST /api/attendees/cancel-ticket`

- `GET /api/tickets?userId={id}`
- `POST /api/tickets/purchase`
- `POST /api/tickets/cancel`
- `GET /api/tickets/favorites?userId={id}`
- `POST /api/tickets/favorites/toggle`
- `GET /api/tickets/meta?userId={id}`

- `GET /api/settings/security?userId={id}`
- `POST /api/settings/security`

## Notes

- Uses file-based JSON in `backend/php-api/data`.
- Password storage is plain text for demo only.
- CORS is enabled for quick frontend integration.
