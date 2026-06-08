import { nanoid } from 'nanoid';
import { getDb } from './db';

export interface Intake {
  id: string;
  status: string;
  source: string | null;
  user_message: string | null;
  raw_payload_json: string;
  report_id: string | null;
  report_public_token: string | null;
  archived_at: string | null;
  archived_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function extractString(p: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = p[key];
    if (typeof v === 'string' && v.trim().length > 0) return v;
  }
  return null;
}

function extractMainMaterial(p: Record<string, unknown>): string | null {
  const inputType = typeof p.input_type === 'string' ? p.input_type : null;
  const extractedText = extractString(p, ['extracted_text']);

  if (
    extractedText &&
    (inputType === 'file_extracted_text' || inputType === 'transcript' || inputType === 'document')
  ) {
    return extractedText;
  }

  return extractString(p, ['user_message', 'text', 'message', 'content', 'transcript', 'extracted_text']);
}

function extractSource(p: Record<string, unknown>): string {
  if (typeof p.source === 'string') return p.source;
  const session = p.session as Record<string, unknown> | undefined;
  if (session && typeof session.source === 'string') return session.source;
  return 'unknown';
}

export function createIntake(rawPayload: unknown): Intake {
  const db = getDb();
  const id = nanoid(21);
  const now = new Date().toISOString();

  const p =
    rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload)
      ? (rawPayload as Record<string, unknown>)
      : {};

  const user_message = extractMainMaterial(p);
  const source = extractSource(p);
  const raw_payload_json = JSON.stringify(rawPayload);

  db.prepare(`
    INSERT INTO mindloom_intakes (id, status, source, user_message, raw_payload_json, created_at, updated_at)
    VALUES (@id, 'new', @source, @user_message, @raw_payload_json, @created_at, @updated_at)
  `).run({ id, source, user_message, raw_payload_json, created_at: now, updated_at: now });

  return getIntakeById(id)!;
}

export function getIntakeById(id: string): Intake | null {
  const db = getDb();
  return (db.prepare('SELECT * FROM mindloom_intakes WHERE id = ?').get(id) as Intake) ?? null;
}

export function listIntakes(limit = 100, offset = 0): Intake[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT * FROM mindloom_intakes
      WHERE archived_at IS NULL
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    .all(limit, offset) as Intake[];
}

export function countIntakes(): number {
  const db = getDb();
  const row = db
    .prepare('SELECT COUNT(*) as cnt FROM mindloom_intakes WHERE archived_at IS NULL')
    .get() as { cnt: number };
  return row.cnt;
}

export function countIntakesByStatus(status: string): number {
  const db = getDb();
  const row = db
    .prepare('SELECT COUNT(*) as cnt FROM mindloom_intakes WHERE status = ? AND archived_at IS NULL')
    .get(status) as { cnt: number };
  return row.cnt;
}

export function completeIntakeWithReport(
  intakeId: string,
  reportId: string,
  publicToken: string
): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE mindloom_intakes
    SET status = 'completed', report_id = ?, report_public_token = ?, completed_at = ?, updated_at = ?
    WHERE id = ?
  `).run(reportId, publicToken, now, now, intakeId);
}

export function archiveIntake(id: string, reason?: string): Intake | null {
  const db = getDb();
  const existing = getIntakeById(id);
  if (!existing) return null;
  if (existing.archived_at) return existing;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE mindloom_intakes
    SET archived_at = ?, archived_reason = ?, updated_at = ?
    WHERE id = ?
  `).run(now, reason?.trim() || null, now, id);

  return getIntakeById(id);
}
