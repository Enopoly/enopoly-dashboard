import * as fs from "fs";
import * as path from "path";
import { getDatabase } from "./connection";
import { logger } from "../utils/logger";

export function runMigrations(): void {
  try {
    const db = getDatabase();
    const schemaPath = path.join(__dirname, "schema.sql");

    if (!fs.existsSync(schemaPath)) {
      logger.error(`Schema file not found at: ${schemaPath}`);
      throw new Error("Schema file not found");
    }

    const schema = fs.readFileSync(schemaPath, "utf-8");
    logger.info("Running database migrations...");

    // Split schema by semicolons and execute each statement
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    db.exec("BEGIN TRANSACTION;");

    try {
      for (const statement of statements) {
        if (statement.trim()) {
          db.exec(statement + ";");
          logger.debug(`Executed: ${statement.substring(0, 50)}...`);
        }
      }

      db.exec("COMMIT;");
      logger.info("Database migrations completed successfully");
    } catch (error) {
      db.exec("ROLLBACK;");
      throw error;
    }
  } catch (error) {
    logger.error("Migration failed", error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
  process.exit(0);
}

