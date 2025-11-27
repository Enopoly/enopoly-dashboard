import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../utils/logger";

const DEFAULT_DB_PATH = "./database.sqlite";
const DB_PATH = process.env.DATABASE_PATH || DEFAULT_DB_PATH;

// Ensure the directory exists if a custom path is provided
if (DB_PATH !== DEFAULT_DB_PATH) {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  try {
    logger.info(`Connecting to database at: ${DB_PATH}`);
    db = new Database(DB_PATH);

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    // Enable WAL mode for better concurrency
    db.pragma("journal_mode = WAL");

    logger.info("Database connection established successfully");
    return db;
  } catch (error) {
    logger.error("Failed to connect to database", error);
    throw error;
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    logger.info("Database connection closed");
  }
}

// Export runMigrations for use in index.ts
export { runMigrations } from "./migrate";

// Graceful shutdown handler
process.on("SIGINT", () => {
  closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", () => {
  closeDatabase();
  process.exit(0);
});

