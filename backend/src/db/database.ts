import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { seedDatabase } from "./seeds";

const DB_DIR = path.join(__dirname, "../../data");
const DB_PATH = path.join(DB_DIR, "events.db");
const SCHEMA_PATH = path.join(__dirname, "./schema.sql");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL"); // Write-Ahead Logging for better concurrency
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  if (!db) return;

  const schemaSQL = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schemaSQL);

  // Check if database is empty and seed if needed
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };

  if (userCount.count === 0) {
    seedDatabase();
  }
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

export default getDatabase();
