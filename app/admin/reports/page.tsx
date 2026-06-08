import Link from 'next/link';
import { listReports, countReports } from '@/lib/reports-repository';

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
  received:  { bg: '#e0f2fe', color: '#075985' },
  processed: { bg: '#d9f2eb', color: '#1a7a63' },
  error:     { bg: '#fee2e2', color: '#991b1b' },
};

const STATUS_LABELS: Record<string, string> = {
  received: 'получен',
  processed: 'обработан',
  error: 'ошибка',
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

function reportTitle(raw: string): string | null {
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    const report = p.report as Record<string, unknown> | undefined;
    if (typeof report?.title === 'string' && report.title) return report.title;
    const participant = p.participant as Record<string, unknown> | undefined;
    if (typeof participant?.name === 'string' && participant.name) return participant.name;
  } catch {}
  return null;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const reports = listReports(PAGE_SIZE, offset);
  const total = countReports();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const base = process.env.BASE_URL ?? 'http://localhost:3000';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, padding: '2rem 1.25rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Breadcrumb nav */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/admin" style={{ fontSize: '0.82rem', color: C.link, textDecoration: 'none' }}>← Админ</Link>
          <Link href="/admin/intake" style={{ fontSize: '0.82rem', color: C.link, textDecoration: 'none' }}>Заявки →</Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: C.text, margin: '0 0 0.3rem' }}>
            Отчёты
          </h1>
          <p style={{ color: C.muted, fontSize: '0.88rem', margin: 0 }}>
            {total} {total === 1 ? 'отчёт' : total >= 2 && total <= 4 ? 'отчёта' : 'отчётов'}
          </p>
          <p style={{ color: C.muted, fontSize: '0.78rem', margin: '0.35rem 0 0' }}>
            Archived items are hidden.
          </p>
        </div>

        {/* Empty state */}
        {reports.length === 0 ? (
          <div style={{
            background: C.card, border: C.border, borderRadius: 20,
            padding: '3.5rem 2rem', textAlign: 'center', boxShadow: C.shadow,
          }}>
            <p style={{ color: C.muted, fontSize: '0.95rem', margin: 0 }}>Отчётов пока нет.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reports.map((r) => {
              const reportUrl = `${base}/r/${r.public_token}`;
              const title = reportTitle(r.raw_payload_json);

              return (
                <div key={r.id} style={{
                  background: C.card, border: C.border, borderRadius: 16,
                  padding: '1.1rem 1.25rem', boxShadow: C.shadow,
                }}>
                  {/* Top row: chips + date */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginBottom: '0.7rem', flexWrap: 'wrap',
                  }}>
                    {statusChip(r.status)}
                    {sourceChip(r.source)}
                    <span style={{ fontSize: '0.75rem', color: C.muted, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                      {fmtDate(r.created_at)}
                    </span>
                  </div>

                  {/* Title / participant name */}
                  {title && (
                    <p style={{ margin: '0 0 0.7rem', fontSize: '0.92rem', fontWeight: 500, color: '#2a2725' }}>
                      {title}
                    </p>
                  )}

                  {/* Token link */}
                  <a
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block', marginBottom: '0.8rem',
                      fontSize: '0.75rem', fontFamily: 'monospace',
                      color: '#bbb', textDecoration: 'none', wordBreak: 'break-all',
                    }}
                  >
                    /r/{r.public_token.slice(0, 18)}…
                  </a>

                  {/* Bottom row: id + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#ccc' }}>
                      {r.id.slice(0, 12)}…
                    </span>
                    <a
                      href={reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.83rem', color: '#1a7a63', textDecoration: 'none', fontWeight: 500 }}
                    >
                      Открыть ↗
                    </a>
                    <Link
                      href={`/admin/reports/${r.id}`}
                      style={{ fontSize: '0.83rem', color: C.link, textDecoration: 'none', fontWeight: 500 }}
                    >
                      Подробнее →
                    </Link>
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
              <Link href={`/admin/reports?page=${page - 1}`} style={{
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
              <Link href={`/admin/reports?page=${page + 1}`} style={{
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
