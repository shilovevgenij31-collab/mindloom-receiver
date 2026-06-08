import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'mindloom.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  migrate(_db);
  return _db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS mindloom_reports (
      id                     TEXT PRIMARY KEY,
      public_token           TEXT UNIQUE NOT NULL,
      status                 TEXT NOT NULL DEFAULT 'received',
      raw_payload_json       TEXT NOT NULL,
      normalized_report_json TEXT,
      source                 TEXT,
      archived_at            TEXT,
      archived_reason        TEXT,
      created_at             TEXT NOT NULL,
      updated_at             TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mindloom_events (
      id             TEXT PRIMARY KEY,
      report_id      TEXT NOT NULL REFERENCES mindloom_reports(id),
      event_type     TEXT NOT NULL,
      metadata_json  TEXT,
      created_at     TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reports_token   ON mindloom_reports(public_token);
    CREATE INDEX IF NOT EXISTS idx_reports_created ON mindloom_reports(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_report   ON mindloom_events(report_id);

    CREATE TABLE IF NOT EXISTS mindloom_intakes (
      id                  TEXT PRIMARY KEY,
      status              TEXT NOT NULL DEFAULT 'new',
      source              TEXT,
      user_message        TEXT,
      raw_payload_json    TEXT NOT NULL,
      report_id           TEXT,
      report_public_token TEXT,
      archived_at         TEXT,
      archived_reason     TEXT,
      completed_at        TEXT,
      created_at          TEXT NOT NULL,
      updated_at          TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_intakes_created ON mindloom_intakes(created_at DESC);
  `);

  // Safe additive migration for existing databases
  addColumnIfMissing(db, 'mindloom_intakes', 'report_id', 'TEXT');
  addColumnIfMissing(db, 'mindloom_intakes', 'report_public_token', 'TEXT');
  addColumnIfMissing(db, 'mindloom_intakes', 'completed_at', 'TEXT');
  addColumnIfMissing(db, 'mindloom_intakes', 'archived_at', 'TEXT');
  addColumnIfMissing(db, 'mindloom_intakes', 'archived_reason', 'TEXT');
  addColumnIfMissing(db, 'mindloom_reports', 'archived_at', 'TEXT');
  addColumnIfMissing(db, 'mindloom_reports', 'archived_reason', 'TEXT');
}

function addColumnIfMissing(
  db: Database.Database,
  table: string,
  column: string,
  definition: string
): void {
  const cols = db.prepare(`PRAGMA table_info("${table}")`).all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
  }
}
