# Event Management System Backend

SQLite backend server for the Event Management System.

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   # or cd backend && npm install
   ```

2. **Initialize Database & Seed**

   ```bash
   npm run seed
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:5000`

## Database

- **Location:** `./data/events.db`
- **Engine:** SQLite with WAL mode
- **Schema:** See [schema.sql](src/db/schema.sql)
- **Seeds:** See [seeds.ts](src/db/seeds.ts)

### Test Credentials

```
Organizer:
  Email: organizer1@eventflow.com
  Password: password123

Attendee:
  Email: attendee1@eventflow.com
  Password: password123
```

## API Endpoints (To Be Implemented)

### Auth

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Organizer

- GET /api/organizer/events
- POST /api/organizer/events
- GET /api/organizer/events/:eventId
- PUT /api/organizer/events/:eventId
- DELETE /api/organizer/events/:eventId
- GET /api/organizer/events/:eventId/attendees
- PUT /api/organizer/attendees/:attendeeId
- GET /api/organizer/dashboard

### Attendee

- GET /api/attendee/events
- GET /api/attendee/events/search?q=query
- POST /api/attendee/events/:eventId/register
- GET /api/attendee/tickets
- DELETE /api/attendee/events/:eventId/unregister

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── database.ts       # DB connection & init
│   │   ├── schema.sql        # SQLite schema
│   │   └── seeds.ts          # Seed data
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication
│   ├── controllers/          # Request handlers (to be added)
│   ├── routes/               # API routes (to be added)
│   └── index.ts              # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Environment Variables

Copy `.env.example` to `.env` and update:

```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```
