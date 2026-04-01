-- Users Table (Organizers & Attendees)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('organizer', 'attendee')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  organizer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  price REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN ('upcoming', 'completed', 'cancelled')) DEFAULT 'upcoming',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Event Attendees (Registration)
CREATE TABLE IF NOT EXISTS event_attendees (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  attendee_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('confirmed', 'pending', 'checked_in', 'cancelled')) DEFAULT 'pending',
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  checked_in_at DATETIME,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (attendee_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(event_id, attendee_id)
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  event_attendee_id TEXT NOT NULL,
  ticket_number TEXT UNIQUE NOT NULL,
  qr_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (event_attendee_id) REFERENCES event_attendees(id) ON DELETE CASCADE
);

-- User Settings/Preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  notifications_enabled INTEGER DEFAULT 1,
  security_level TEXT DEFAULT 'medium' CHECK(security_level IN ('low', 'medium', 'high')),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_attendee_id ON event_attendees(attendee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_attendee_id ON tickets(event_attendee_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
