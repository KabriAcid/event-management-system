# SQLite Backend Setup Guide

## 📁 Files Created

### Backend Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── schema.sql          # SQLite database schema (tables & indexes)
│   │   ├── seeds.ts            # Seed data (5 users, 4 events, 5 attendees, 5 tickets)
│   │   └── database.ts         # Database initialization & connection manager
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication & role-based access control
│   ├── controllers/            # (To be implemented: auth, event, attendee, ticket)
│   ├── routes/                 # (To be implemented: auth, organizer, attendee)
│   └── index.ts                # Express server entry point
├── package.json                # Backend dependencies
├── tsconfig.json               # TypeScript configuration
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # Backend documentation
```

### Root Project Updates

```
pnpm-workspace.yaml            # Workspace configuration for monorepo
package.json                   # Updated with workspace scripts
```

## 🚀 Quick Start

### Step 1: Install All Dependencies

From the **root directory**:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

Or use the convenience script:

```bash
npm run install:all
```

### Step 2: Initialize Database & Seed

```bash
npm run seed
```

This will:

- Create `backend/data/events.db` (SQLite database)
- Create all tables from [schema.sql](backend/src/db/schema.sql)
- Populate with test data (5 users, 4 events, 5 attendees, 5 tickets)

### Step 3: Set Up Environment Variables

Copy the example file:

```bash
cd backend
cp .env.example .env
```

The `.env` file includes:

- `PORT=5000` - Backend server port
- `JWT_SECRET` - Change this in production!
- `CORS_ORIGIN=http://localhost:5173` - Frontend dev server

### Step 4: Run Backend

From the root or backend directory:

```bash
# Development mode (from root)
npm run dev:backend

# Or from backend directory
npm run dev
```

Server will start at `http://localhost:5000`

## 🧪 Test the Backend

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2026-04-01T12:00:00.000Z"
}
```

### Test Credentials

Use these to test login endpoints (to be implemented):

**Organizer Account:**

- Email: `organizer1@eventflow.com`
- Password: `password123`

**Attendee Account:**

- Email: `attendee1@eventflow.com`
- Password: `password123`

## 📊 Database Schema

### Tables Created

1. **users** - User accounts (organizers & attendees)
   - id, email, password_hash, full_name, role, created_at, updated_at

2. **events** - Event listings
   - id, organizer_id, title, description, category, date, time, location, image_url, price, status, created_at, updated_at

3. **event_attendees** - Event registrations
   - id, event_id, attendee_id, status, registered_at, checked_in_at

4. **tickets** - Individual tickets for attendees
   - id, event_attendee_id, ticket_number, qr_code, created_at, expires_at

5. **user_settings** - User preferences
   - id, user_id, notifications_enabled, security_level, updated_at

### Seed Data

- **2 Organizers** with events
- **3 Attendees** registered for events
- **4 Events** (Tech, Music, Business, Networking)
- **5 Tickets** with QR codes

## 🔑 Authentication

The backend includes JWT-based authentication:

### Auth Middleware ([middleware/auth.ts](backend/src/middleware/auth.ts))

```typescript
// Usage in routes
app.get("/api/organizer/events", authMiddleware, requireRole(["organizer"]), ...)
```

- `authMiddleware` - Verifies JWT token from `Authorization: Bearer <token>`
- `requireRole(["role"])` - Restricts access by user role

## 📋 Next Steps

### Phase 1: Implement Auth Controllers

Create `src/controllers/authController.ts`:

- `register()` - Create new user account
- `login()` - Generate JWT token
- `logout()` - Invalidate token (optional)
- `getCurrentUser()` - Get authenticated user info

### Phase 2: Implement Event Controllers

Create `src/controllers/eventController.ts`:

- `getEvents()` - List events
- `createEvent()` - Create new event (organizers only)
- `updateEvent()` - Edit event
- `deleteEvent()` - Remove event
- `getEventAttendees()` - List attendees for event
- `getDashboardStats()` - KPIs (revenue, counts, etc.)

### Phase 3: Implement Attendee Controllers

Create `src/controllers/attendeeController.ts`:

- `searchEvents()` - Find events with filters
- `registerEvent()` - Sign up for event
- `getTickets()` - View my tickets
- `unregisterEvent()` - Cancel registration

## 🛠 Useful Commands

```bash
# Development
npm run dev:backend        # Start backend dev server
npm run dev:frontend       # Start frontend dev server
npm run dev                # Run both concurrently

# Build & Production
npm run build:all          # Build frontend & backend
npm run start              # Start production server (from backend)

# Database
npm run seed               # Run seed script
npm run db:init            # Initialize database

# TypeScript
npm run build              # Compile TypeScript (from backend)
```

## 📝 Dependencies Added to Backend

### Production

- **express** - Web framework
- **better-sqlite3** - SQLite database
- **jsonwebtoken** - JWT auth tokens
- **bcryptjs** - Password hashing
- **uuid** - Generate unique IDs
- **dotenv** - Environment variables
- **cors** - Cross-origin requests
- **express-validator** - Input validation
- **qrcode** - QR code generation

### Development

- **typescript** - TypeScript compiler
- **ts-node** - Run TypeScript directly
- **@types/\*** - TypeScript type definitions

## 🔒 Security Notes

1. **Change JWT_SECRET** in `.env` before going to production
2. **Password Hashing** - Uses bcryptjs with 10 salt rounds
3. **CORS** configured to only allow frontend origin
4. **Database** - Uses WAL mode for better concurrency
5. **Input Validation** - Use express-validator in controllers

## 📚 Database Browser

To inspect the database:

```bash
# Using sqlite3 CLI
sqlite3 backend/data/events.db

# Or use a GUI app like:
# - DBeaver Community
# - SQLite Browser
# - Adminer
```

## ❓ Troubleshooting

### "Cannot find module" errors

```bash
# Rebuild node_modules
rm -rf backend/node_modules
npm install (from backend directory)
```

### Port already in use

Change `PORT` in `backend/.env`

### Database locked

```bash
# Remove database and reseed
rm backend/data/events.db
npm run seed
```

---

**Next:** Create controller files for auth, events, and attendees to implement the API endpoints!
