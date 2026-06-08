import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getReportById } from '@/lib/reports-repository';
import CopyButton from './CopyButton';
import ArchiveReportButton from './ArchiveReportButton';

interface PageProps {
  params: Promise<{ id: string }>;
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

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function parseTitle(raw: string): string | null {
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    const report = p.report as Record<string, unknown> | undefined;
    if (typeof report?.title === 'string' && report.title) return report.title;
    const participant = p.participant as Record<string, unknown> | undefined;
    if (typeof participant?.name === 'string' && participant.name) return participant.name;
  } catch {}
  return null;
}

export default async function AdminReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  const report = getReportById(id);

  if (!report) notFound();

  const base = process.env.BASE_URL ?? 'http://localhost:3000';
  const reportUrl = `${base}/r/${report.public_token}`;
  const title = parseTitle(report.raw_payload_json);

  const statusS = STATUS[report.status] ?? { bg: '#f0ede8', color: '#6b6560' };
  const statusLabel = STATUS_LABELS[report.status] ?? report.status;
  const isArchived = Boolean(report.archived_at);

  let prettyJson: string;
  try {
    prettyJson = JSON.stringify(JSON.parse(report.raw_payload_json), null, 2);
  } catch {
    prettyJson = report.raw_payload_json;
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, padding: '2rem 1.25rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/admin/reports" style={{ fontSize: '0.82rem', color: C.link, textDecoration: 'none' }}>← Отчёты</Link>
          <Link href="/admin" style={{ fontSize: '0.82rem', color: C.link, textDecoration: 'none' }}>Админ</Link>
        </div>

        {/* Page header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: C.text, margin: 0 }}>
              {title ?? 'Отчёт'}
            </h1>
            <span style={{
              display: 'inline-block', padding: '0.22rem 0.7rem', borderRadius: 20,
              fontSize: '0.73rem', fontWeight: 600, background: statusS.bg, color: statusS.color,
            }}>
              {statusLabel}
            </span>
            {isArchived && (
              <span style={{
                display: 'inline-block', padding: '0.22rem 0.7rem', borderRadius: 20,
                fontSize: '0.73rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b',
              }}>
                Archived
              </span>
            )}
            {report.source && (
              <span style={{
                display: 'inline-block', padding: '0.22rem 0.6rem', borderRadius: 20,
                fontSize: '0.73rem', color: C.muted, background: '#f0ede6',
              }}>
                {report.source}
              </span>
            )}
          </div>
          <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#ccc', margin: '0 0 0.35rem' }}>
            {report.id}
          </p>
          <p style={{ fontSize: '0.82rem', color: C.muted, margin: 0 }}>
            Создано {fmtDate(report.created_at)}
          </p>
        </div>

        {/* Public report link card */}
        {isArchived && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 16, padding: '1rem 1.25rem',
            boxShadow: C.shadow, marginBottom: '1rem',
          }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.88rem', fontWeight: 700, color: '#991b1b' }}>
              Отчёт архивирован
            </p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.55 }}>
              Он скрыт из рабочих списков, а публичная ссылка больше не показывает активный отчёт. Данные физически не удалены.
            </p>
          </div>
        )}

        {/* Public report link card */}
        <div style={{
          background: C.card, border: C.border, borderRadius: 20,
          padding: '1.25rem 1.5rem', boxShadow: C.shadow, marginBottom: '1rem',
        }}>
          <p style={{ margin: '0 0 0.6rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted }}>
            Публичная ссылка на отчёт
          </p>
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', marginBottom: '1rem',
              fontSize: '0.88rem', fontFamily: 'monospace',
              color: C.link, wordBreak: 'break-all', textDecoration: 'none',
            }}
          >
            {reportUrl}
          </a>
          {isArchived && (
            <p style={{ margin: '0 0 0.85rem', color: '#991b1b', fontSize: '0.82rem', lineHeight: 1.55 }}>
              Archived reports are not publicly accessible.
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {!isArchived && (
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', padding: '0.45rem 1.1rem',
                  background: C.link, color: '#fff', borderRadius: 10,
                  textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
                }}
              >
                Открыть отчёт ↗
              </a>
            )}
            <CopyButton text={reportUrl} label="Скопировать ссылку" />
          </div>
        </div>

        {/* Token / meta */}
        <div style={{
          background: C.card, border: C.border, borderRadius: 16,
          padding: '1rem 1.5rem', boxShadow: C.shadow, marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ color: C.muted, minWidth: 120 }}>Публичный токен</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#555', wordBreak: 'break-all' }}>{report.public_token}</span>
            </div>
          </div>
        </div>

        {/* Raw JSON — technical secondary section */}
        <div style={{
          background: '#1c1c1e', border: '1px solid #2c2c2e',
          borderRadius: 16, padding: '1.25rem 1.5rem',
        }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#666' }}>
            Raw JSON
          </p>
          <pre style={{
            margin: 0, color: '#ccc', fontSize: '0.78rem', lineHeight: 1.55,
            overflowX: 'auto', fontFamily: 'monospace',
          }}>
            {prettyJson}
          </pre>
        </div>

        {/* Archive action */}
        <div style={{
          background: C.card, border: C.border, borderRadius: 16,
          padding: '1rem 1.5rem', boxShadow: C.shadow, marginTop: '1rem',
        }}>
          <p style={{ margin: '0 0 0.6rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted }}>
            Cleanup
          </p>
          {isArchived ? (
            <p style={{ margin: 0, color: C.muted, fontSize: '0.84rem' }}>
              Отчёт уже архивирован. Действия отключены.
            </p>
          ) : (
            <>
              <p style={{ margin: '0 0 0.75rem', color: C.muted, fontSize: '0.84rem', lineHeight: 1.55 }}>
                Запись будет скрыта из рабочих списков, а публичная ссылка перестанет открывать активный отчёт. Данные физически не удаляются.
              </p>
              <ArchiveReportButton reportId={report.id} />
            </>
          )}
        </div>

      </div>
    </div>
  );
}
