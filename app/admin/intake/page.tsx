import Link from 'next/link';
import { listIntakes, countIntakes } from '@/lib/intake-repository';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const C = {
  bg: '#f5f3ef',
  card: '#ffffff',
  border: '1px solid #e8e3db',
  shadow: '0 1px 10px rgba(0,0,0,0.06)',
  text: '#1a1a1a',
  muted: '#8a8580',
  link: '#5c6bc0',
  font: 'system-ui, -apple-system, sans-serif',
} as const;

const STATUS: Record<string, { bg: string; color: string }> = {
  new:       { bg: '#ede7f6', color: '#5b21b6' },
  completed: { bg: '#d9f2eb', color: '#1a7a63' },
};

const STATUS_LABELS: Record<string, string> = {
  new: 'новая',
  completed: 'завершена',
};

function statusChip(status: string) {
  const s = STATUS[status] ?? { bg: '#f0ede8', color: '#6b6560' };
  return (
    <span style={{
      display: 'inline-block', padding: '0.22rem 0.7rem', borderRadius: 20,
      fontSize: '0.73rem', fontWeight: 600, background: s.bg, color: s.color,
      letterSpacing: '0.02em',
    }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function sourceChip(source: string | null) {
  if (!source) return null;
  return (
    <span style={{
      display: 'inline-block', padding: '0.22rem 0.6rem', borderRadius: 20,
      fontSize: '0.73rem', color: C.muted, background: '#f0ede6',
    }}>
      {source}
    </span>
  );
}

function excerpt(text: string | null, max = 180): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default async function AdminIntakePage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const intakes = listIntakes(PAGE_SIZE, offset);
  const total = countIntakes();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const base = process.env.BASE_URL ?? 'http://localhost:3000';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, padding: '2rem 1.25rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Breadcrumb nav */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/admin" style={{ fontSize: '0.82rem', color: C.link, textDecoration: 'none' }}>← Админ</Link>
          <Link href="/admin/reports" style={{ fontSize: '0.82rem', color: C.link, textDecoration: 'none' }}>Отчёты →</Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: C.text, margin: '0 0 0.3rem' }}>
            Входящие заявки
          </h1>
          <p style={{ color: C.muted, fontSize: '0.88rem', margin: 0 }}>
            {total} {total === 1 ? 'заявка' : total >= 2 && total <= 4 ? 'заявки' : 'заявок'}
          </p>
          <p style={{ color: C.muted, fontSize: '0.78rem', margin: '0.35rem 0 0' }}>
            Archived items are hidden.
          </p>
        </div>

        {/* Empty state */}
        {intakes.length === 0 ? (
          <div style={{
            background: C.card, border: C.border, borderRadius: 20,
            padding: '3.5rem 2rem', textAlign: 'center', boxShadow: C.shadow,
          }}>
            <p style={{ color: C.muted, fontSize: '0.95rem', margin: 0 }}>
              Заявок пока нет.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {intakes.map((intake) => {
              const reportUrl = intake.report_public_token
                ? `${base}/r/${intake.report_public_token}`
                : null;

              return (
                <div key={intake.id} style={{
                  background: C.card, border: C.border, borderRadius: 16,
                  padding: '1.1rem 1.25rem', boxShadow: C.shadow,
                }}>
                  {/* Top row: chips + date */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginBottom: '0.7rem', flexWrap: 'wrap',
                  }}>
                    {statusChip(intake.status)}
                    {sourceChip(intake.source)}
                    <span style={{ fontSize: '0.75rem', color: C.muted, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                      {fmtDate(intake.created_at)}
                    </span>
                  </div>

                  {/* Message excerpt */}
                  {intake.user_message && (
                    <p style={{
                      margin: '0 0 0.8rem',
                      fontSize: '0.9rem', color: '#383530', lineHeight: 1.6,
                    }}>
                      {excerpt(intake.user_message)}
                    </p>
                  )}

                  {/* Bottom row: id + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#ccc' }}>
                      {intake.id.slice(0, 12)}…
                    </span>
                    <Link
                      href={`/admin/intake/${intake.id}`}
                      style={{ fontSize: '0.83rem', color: C.link, textDecoration: 'none', fontWeight: 500 }}
                    >
                      Подробнее →
                    </Link>
                    {reportUrl && (
                      <a
                        href={reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.83rem', color: '#1a7a63', textDecoration: 'none', fontWeight: 500 }}
                      >
                        Отчёт ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
            {page > 1 && (
              <Link href={`/admin/intake?page=${page - 1}`} style={{
                padding: '0.45rem 1rem', background: C.card, border: C.border,
                borderRadius: 10, textDecoration: 'none', color: C.text, fontSize: '0.85rem', boxShadow: C.shadow,
              }}>
                ← Назад
              </Link>
            )}
            <span style={{ padding: '0.45rem 0.5rem', color: C.muted, fontSize: '0.85rem' }}>
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/admin/intake?page=${page + 1}`} style={{
                padding: '0.45rem 1rem', background: C.card, border: C.border,
                borderRadius: 10, textDecoration: 'none', color: C.text, fontSize: '0.85rem', boxShadow: C.shadow,
              }}>
                Далее →
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
