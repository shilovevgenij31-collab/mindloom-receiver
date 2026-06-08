import { getDb } from './db';

export interface Report {
  id: string;
  public_token: string;
  status: string;
  raw_payload_json: string;
  normalized_report_json: string | null;
  source: string | null;
  archived_at: string | null;
  archived_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReportInput {
  id: string;
  public_token: string;
  raw_payload_json: string;
  source?: string;
}

export function createReport(input: CreateReportInput): Report {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO mindloom_reports (id, public_token, status, raw_payload_json, source, created_at, updated_at)
    VALUES (@id, @public_token, 'received', @raw_payload_json, @source, @created_at, @updated_at)
  `);
  stmt.run({
    id: input.id,
    public_token: input.public_token,
    raw_payload_json: input.raw_payload_json,
    source: input.source ?? null,
    created_at: now,
    updated_at: now,
  });
  return getReportById(input.id)!;
}

export function getReportByToken(token: string): Report | null {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM mindloom_reports WHERE public_token = ? AND archived_at IS NULL')
    .get(token);
  return (row as Report) ?? null;
}

export function getReportById(id: string): Report | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM mindloom_reports WHERE id = ?').get(id);
  return (row as Report) ?? null;
}

export function listReports(limit = 100, offset = 0): Report[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT * FROM mindloom_reports
      WHERE archived_at IS NULL
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(limit, offset) as Report[];
}

export function countReports(): number {
  const db = getDb();
  const row = db
    .prepare('SELECT COUNT(*) as cnt FROM mindloom_reports WHERE archived_at IS NULL')
    .get() as { cnt: number };
  return row.cnt;
}

export function archiveReport(id: string, reason?: string): Report | null {
  const db = getDb();
  const existing = getReportById(id);
  if (!existing) return null;
  if (existing.archived_at) return existing;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE mindloom_reports
    SET archived_at = ?, archived_reason = ?, updated_at = ?
    WHERE id = ?
  `).run(now, reason?.trim() || null, now, id);

  return getReportById(id);
}

export function checkDbHealth(): boolean {
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    return true;
  } catch {
    return false;
  }
}
