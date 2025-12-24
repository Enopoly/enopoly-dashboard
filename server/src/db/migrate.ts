import * as fs from "fs";
import * as path from "path";
import { getDatabase } from "./connection";
import { logger } from "../utils/logger";

export async function runMigrations(): Promise<void> {
  try {
    const db = getDatabase();
    const schemaPath = path.join(__dirname, "schema.sql");

    if (!fs.existsSync(schemaPath)) {
      logger.error(`Schema file not found at: ${schemaPath}`);
      throw new Error("Schema file not found");
    }

    const schema = fs.readFileSync(schemaPath, "utf-8");
    logger.info("Running database migrations...");

    // Remove comments and split by semicolons
    const statements = schema
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    // Execute the entire schema script
    // Note: Local adapter uses exec(), Turso adapter uses executeMultiple()
    await db.exec(statements);

    // Manual migration for processing_fee (safe to ignore if exists)
    try {
      await db.exec("ALTER TABLE invoices ADD COLUMN processing_fee REAL DEFAULT 0");
      logger.info("Added processing_fee column to invoices");
    } catch (e) {
      // Column likely exists
    }

    // Manual migration for customer_address
    try {
      await db.exec("ALTER TABLE invoices ADD COLUMN customer_address TEXT");
      logger.info("Added customer_address column to invoices");
    } catch (e) {
      // Column likely exists
    }

    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error("Migration failed", error);
    // Don't kill the process, just log error. 
    // This allows the app to start even if migration fails (e.g. table already exists)
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
