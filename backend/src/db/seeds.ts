import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const DB_PATH = path.join(__dirname, "../../data/events.db");

export function seedDatabase() {
  const db = new Database(DB_PATH);

  // Get current user count to avoid seeding multiple times
  const existingUsers = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };

  if (existingUsers.count > 0) {
    console.log("✓ Database already seeded, skipping...");
    return;
  }

  console.log("🌱 Seeding database...");

  // User IDs
  const organizerId1 = uuidv4();
  const organizerId2 = uuidv4();
  const attendeeId1 = uuidv4();
  const attendeeId2 = uuidv4();
  const attendeeId3 = uuidv4();

  const hashedPassword = bcrypt.hashSync("password123", 10);

  // Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run(
    organizerId1,
    "organizer1@eventflow.com",
    hashedPassword,
    "John Organizer",
    "organizer",
  );
  insertUser.run(
    organizerId2,
    "organizer2@eventflow.com",
    hashedPassword,
    "Jane Planner",
    "organizer",
  );
  insertUser.run(
    attendeeId1,
    "attendee1@eventflow.com",
    hashedPassword,
    "Alice Johnson",
    "attendee",
  );
  insertUser.run(
    attendeeId2,
    "attendee2@eventflow.com",
    hashedPassword,
    "Bob Smith",
    "attendee",
  );
  insertUser.run(
    attendeeId3,
    "attendee3@eventflow.com",
    hashedPassword,
    "Carol White",
    "attendee",
  );

  // Insert User Settings
  const insertSettings = db.prepare(`
    INSERT INTO user_settings (id, user_id, notifications_enabled, security_level)
    VALUES (?, ?, ?, ?)
  `);

  [organizerId1, organizerId2, attendeeId1, attendeeId2, attendeeId3].forEach(
    (userId) => {
      insertSettings.run(uuidv4(), userId, 1, "medium");
    },
  );

  // Insert Events
  const eventId1 = uuidv4();
  const eventId2 = uuidv4();
  const eventId3 = uuidv4();
  const eventId4 = uuidv4();

  const insertEvent = db.prepare(`
    INSERT INTO events (id, organizer_id, title, description, category, date, time, location, image_url, price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEvent.run(
    eventId1,
    organizerId1,
    "Tech Summit 2026",
    "Annual technology conference featuring keynotes from industry leaders",
    "tech",
    "2026-05-15",
    "09:00",
    "San Francisco Convention Center",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
    150.0,
    "upcoming",
  );

  insertEvent.run(
    eventId2,
    organizerId1,
    "Music Festival",
    "Three-day music festival with live performances",
    "music",
    "2026-06-20",
    "14:00",
    "Central Park, New York",
    "https://images.unsplash.com/photo-1533281011116-8175b558facf?w=400",
    85.0,
    "upcoming",
  );

  insertEvent.run(
    eventId3,
    organizerId2,
    "Business Workshop",
    "Learn startup strategies and entrepreneurship from successful founders",
    "business",
    "2026-04-10",
    "10:00",
    "Downtown Marriott",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
    50.0,
    "upcoming",
  );

  insertEvent.run(
    eventId4,
    organizerId2,
    "Networking Night",
    "Connect with professionals in your industry over drinks and appetizers",
    "networking",
    "2026-04-22",
    "18:00",
    "Rooftop Bar & Lounge",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
    25.0,
    "upcoming",
  );

  // Insert Event Attendees
  const attendeeId1_EventId1 = uuidv4();
  const attendeeId1_EventId2 = uuidv4();
  const attendeeId2_EventId1 = uuidv4();
  const attendeeId3_EventId2 = uuidv4();
  const attendeeId2_EventId3 = uuidv4();

  const insertAttendee = db.prepare(`
    INSERT INTO event_attendees (id, event_id, attendee_id, status, checked_in_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAttendee.run(
    attendeeId1_EventId1,
    eventId1,
    attendeeId1,
    "confirmed",
    null,
  );
  insertAttendee.run(
    attendeeId1_EventId2,
    eventId2,
    attendeeId1,
    "confirmed",
    null,
  );
  insertAttendee.run(
    attendeeId2_EventId1,
    eventId1,
    attendeeId2,
    "checked_in",
    new Date().toISOString(),
  );
  insertAttendee.run(
    attendeeId3_EventId2,
    eventId2,
    attendeeId3,
    "pending",
    null,
  );
  insertAttendee.run(
    attendeeId2_EventId3,
    eventId3,
    attendeeId2,
    "confirmed",
    null,
  );

  // Insert Tickets
  const insertTicket = db.prepare(`
    INSERT INTO tickets (id, event_attendee_id, ticket_number, qr_code)
    VALUES (?, ?, ?, ?)
  `);

  insertTicket.run(
    uuidv4(),
    attendeeId1_EventId1,
    "TK-TECH2026-001",
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TK-TECH2026-001",
  );
  insertTicket.run(
    uuidv4(),
    attendeeId1_EventId2,
    "TK-MUSIC2026-001",
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TK-MUSIC2026-001",
  );
  insertTicket.run(
    uuidv4(),
    attendeeId2_EventId1,
    "TK-TECH2026-002",
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TK-TECH2026-002",
  );
  insertTicket.run(
    uuidv4(),
    attendeeId3_EventId2,
    "TK-MUSIC2026-002",
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TK-MUSIC2026-002",
  );
  insertTicket.run(
    uuidv4(),
    attendeeId2_EventId3,
    "TK-BUSINESS2026-001",
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TK-BUSINESS2026-001",
  );

  console.log("✓ Database seeded successfully!");
  console.log("\nTest Credentials:");
  console.log("─────────────────────────────────────");
  console.log("Organizer:");
  console.log("  Email: organizer1@eventflow.com");
  console.log("  Password: password123");
  console.log("\nAttendee:");
  console.log("  Email: attendee1@eventflow.com");
  console.log("  Password: password123");
  console.log("─────────────────────────────────────");

  db.close();
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
}
