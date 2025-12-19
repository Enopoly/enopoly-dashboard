import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../utils/logger";
import Database from "better-sqlite3";

// Determine if we are using Turso (Cloud) or local SQLite
const useTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

export interface DbAdapter {
  query<T = any>(sql: string, args?: any[]): Promise<T[]>;
  get<T = any>(sql: string, args?: any[]): Promise<T | undefined>;
  execute(sql: string, args?: any[]): Promise<{ lastInsertRowid?: number | bigint }>;
  exec(sql: string): Promise<void>; // For running multiple statements (migrations)
}

class LocalDbAdapter implements DbAdapter {
  private db: Database.Database;

  constructor(dbPath: string) {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    logger.info(`Connecting to local database at: ${dbPath}`);
    this.db = new Database(dbPath);
    this.db.pragma("foreign_keys = ON");
    this.db.pragma("journal_mode = WAL");
  }

  async query<T = any>(sql: string, args: any[] = []): Promise<T[]> {
    return this.db.prepare(sql).all(args) as T[];
  }

  async get<T = any>(sql: string, args: any[] = []): Promise<T | undefined> {
    return this.db.prepare(sql).get(args) as T | undefined;
  }

  async execute(sql: string, args: any[] = []): Promise<{ lastInsertRowid?: number | bigint }> {
    const info = this.db.prepare(sql).run(args);
    return { lastInsertRowid: info.lastInsertRowid };
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }
}

class TursoDbAdapter implements DbAdapter {
  private client: ReturnType<typeof createClient>;

  constructor(url: string, authToken: string) {
    logger.info("Connecting to Turso Database...");
    this.client = createClient({ url, authToken });
  }

  async query<T = any>(sql: string, args: any[] = []): Promise<T[]> {
    const result = await this.client.execute({ sql, args });
    return result.rows as unknown as T[];
  }

  async get<T = any>(sql: string, args: any[] = []): Promise<T | undefined> {
    const result = await this.client.execute({ sql, args });
    return (result.rows[0] as unknown as T) || undefined;
  }

  async execute(sql: string, args: any[] = []): Promise<{ lastInsertRowid?: number | bigint }> {
    const result = await this.client.execute({ sql, args });
    return { lastInsertRowid: result.lastInsertRowid };
  }

  async exec(sql: string): Promise<void> {
    // Turso client supports 'executeMultiple' for migrations or just splitting
    await this.client.executeMultiple(sql);
  }
}

let dbInstance: DbAdapter | null = null;

export function getDatabase(): DbAdapter {
  if (dbInstance) return dbInstance;

  if (useTurso) {
    dbInstance = new TursoDbAdapter(process.env.TURSO_DATABASE_URL!, process.env.TURSO_AUTH_TOKEN!);
  } else {
    const DEFAULT_DB_PATH = "./database.sqlite";
    const DB_PATH = process.env.DATABASE_PATH || DEFAULT_DB_PATH;
    dbInstance = new LocalDbAdapter(DB_PATH);
  }
  return dbInstance;
}

export function closeDatabase() {
  // Graceful shutdown logic if needed
}

export { runMigrations } from "./migrate";
