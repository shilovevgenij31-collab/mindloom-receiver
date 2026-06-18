import type { ReactNode } from 'react';
import type { MindloomReportV2 } from '@/lib/normalize-report';
import type { ReportV2PayloadFromEngine } from '@/lib/mindloom-engine/types';
import type {
  ReportSourceComparison,
  BlockComparisonEntry,
  BlockPresence,
} from '@/lib/mindloom-engine/compare-report-sources';

// ── Palette ───────────────────────────────────────────────────────────────────

const C = {
  bg: '#f5f3ef',
  card: '#ffffff',
  cardSoft: '#faf8f4',
  border: '#e8ddd0',
  text: '#201d1b',
  body: '#5d564f',
  muted: '#8c8176',
  greenBg: '#edf9f3',
  greenText: '#2f6147',
  yellowBg: '#fff9ea',
  yellowText: '#7a5812',
  redBg: '#fef0ee',
  redText: '#8b3228',
  purpleBg: '#f2edff',
  purpleText: '#5d4aa8',
  blueBg: '#eef6fc',
  blueText: '#3a5e82',
} as const;

// ── Primitives ────────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>
      {children}
    </p>
  );
}

function Chip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'yellow' | 'red' | 'purple' | 'blue';
}) {
  const palette = {
    neutral: { bg: '#f0ede6', color: '#6b6560' },
    green: { bg: C.greenBg, color: C.greenText },
    yellow: { bg: C.yellowBg, color: C.yellowText },
    red: { bg: C.redBg, color: C.redText },
    purple: { bg: C.purpleBg, color: C.purpleText },
    blue: { bg: C.blueBg, color: C.blueText },
  }[tone];

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', borderRadius: 999,
      padding: '0.25rem 0.72rem',
      background: palette.bg, color: palette.color,
      fontSize: 12, fontWeight: 700, lineHeight: 1.3,
    }}>
      {children}
    </span>
  );
}

// ── Presence badge ────────────────────────────────────────────────────────────

const PRESENCE_STYLE: Record<BlockPresence, { bg: string; color: string; label: string }> = {
  present: { bg: C.greenBg, color: C.greenText, label: 'present' },
  missing: { bg: C.yellowBg, color: C.yellowText, label: 'missing' },
  hidden: { bg: '#f0ede6', color: C.muted, label: 'hidden' },
  dev_only: { bg: C.blueBg, color: C.blueText, label: 'dev-only' },
};

function PresenceBadge({ status }: { status: BlockPresence }) {
  const st = PRESENCE_STYLE[status];
  return (
    <span style={{
      display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: 999,
      background: st.bg, color: st.color, fontSize: 11, fontWeight: 700,
    }}>
      {st.label}
    </span>
  );
}

// ── Top panel ─────────────────────────────────────────────────────────────────

function TopPanel({
  comparison,
}: {
  comparison: ReportSourceComparison;
}) {
  const { summary } = comparison;

  return (
    <div style={{ background: '#f0ede6', border: `1px solid ${C.border}`, borderRadius: 18, padding: '1rem 1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <Eyebrow>Engine vs GPT Report Comparison</Eyebrow>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>dev-only · fixture/mock · no Anthropic key required</span>
      </div>

      <div style={{ display: 'grid', gap: '0.25rem', marginBottom: '0.7rem' }}>
        <p style={{ margin: 0, fontSize: 13, color: C.body }}>
          <span style={{ color: C.muted }}>GPT source:</span>{' '}
          <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.35em', borderRadius: 4, fontSize: 12 }}>
            docs/examples/mindloom-v2-realistic-sample.json
          </code>
        </p>
        <p style={{ margin: 0, fontSize: 13, color: C.body }}>
          <span style={{ color: C.muted }}>Engine source:</span>{' '}
          <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.35em', borderRadius: 4, fontSize: 12 }}>
            lib/mindloom-engine/mock-engine-output.json
          </code>
          {' → '}
          <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.35em', borderRadius: 4, fontSize: 12 }}>
            normalize → map-to-report-v2
          </code>
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        <Chip tone="green">shared: {summary.presentInBoth}</Chip>
        <Chip tone="yellow">GPT only: {summary.presentInGptOnly}</Chip>
        <Chip tone="purple">engine only: {summary.presentInEngineOnly}</Chip>
        <Chip tone="red">missing in engine: {comparison.missingInEngine.length}</Chip>
        <Chip>missing in GPT: {comparison.missingInGpt.length}</Chip>
        <Chip tone="neutral">visible blocks: {summary.totalVisible}</Chip>
      </div>
    </div>
  );
}

// ── Block comparison table ────────────────────────────────────────────────────

function BlockComparisonTable({ coverage }: { coverage: BlockComparisonEntry[] }) {
  const visible = coverage.filter((b) => b.registryStatus !== 'dev_only');
  const devOnly = coverage.filter((b) => b.registryStatus === 'dev_only');

  return (
    <details style={{ background: C.cardSoft, border: `1px solid ${C.border}`, borderRadius: 22, padding: '0.85rem 1rem' }} open>
      <summary style={{ cursor: 'pointer', fontWeight: 700, color: C.text, fontSize: 14 }}>
        Block-by-block comparison ({visible.length} blocks)
      </summary>
      <div style={{ marginTop: '0.85rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['#', 'Block', 'GPT', 'Engine', 'Note'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '0.4rem 0.6rem',
                  borderBottom: `1px solid ${C.border}`,
                  color: C.muted, fontWeight: 600, fontSize: 11,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: `1px solid rgba(232,221,208,0.45)` }}>
                <td style={{ padding: '0.45rem 0.6rem', color: C.muted, fontSize: 12 }}>{entry.order}</td>
                <td style={{ padding: '0.45rem 0.6rem', color: C.text, fontWeight: 500 }}>
                  {entry.title}
                  {entry.registryStatus === 'hidden' && (
                    <span style={{ marginLeft: 6, fontSize: 10, color: C.muted, fontWeight: 400 }}>(hidden in registry)</span>
                  )}
                </td>
                <td style={{ padding: '0.45rem 0.6rem' }}>
                  <PresenceBadge status={entry.gpt} />
                </td>
                <td style={{ padding: '0.45rem 0.6rem' }}>
                  <PresenceBadge status={entry.engine} />
                </td>
                <td style={{ padding: '0.45rem 0.6rem', color: C.muted, fontSize: 12, maxWidth: 320, lineHeight: 1.4 }}>
                  {entry.note ?? '—'}
                </td>
              </tr>
            ))}
            {devOnly.length > 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '0.6rem', background: C.blueBg, color: C.blueText, fontSize: 11, fontWeight: 600 }}>
                  dev-only blocks: {devOnly.map((b) => b.title).join(', ')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}

// ── Qualitative notes ─────────────────────────────────────────────────────────

function QualitativeNotes({
  notes,
}: {
  notes: Array<{ area: string; note: string }>;
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, padding: '0.85rem 1rem' }}>
      <p style={{ margin: '0 0 0.65rem', fontWeight: 700, color: C.text, fontSize: 14 }}>
        Qualitative notes
      </p>
      <div style={{ display: 'grid', gap: '0.55rem' }}>
        {notes.map(({ area, note }) => (
          <div key={area} style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0, fontWeight: 700, fontSize: 11,
              color: C.purpleText, background: C.purpleBg,
              borderRadius: 8, padding: '0.2rem 0.55rem',
              whiteSpace: 'nowrap',
            }}>
              {area}
            </span>
            <p style={{ margin: 0, fontSize: 13, color: C.body, lineHeight: 1.5 }}>{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Coverage gap lists ────────────────────────────────────────────────────────

function CoverageGaps({
  missingInEngine,
  missingInGpt,
  sharedBlocks,
}: {
  missingInEngine: string[];
  missingInGpt: string[];
  sharedBlocks: string[];
}) {
  return (
    <div style={{ display: 'grid', gap: '0.55rem' }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
        padding: '0.75rem 0.9rem', display: 'grid', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.greenText }}>Shared blocks:</span>
          {sharedBlocks.map((id) => (
            <Chip key={id} tone="green">{id}</Chip>
          ))}
        </div>
        {missingInEngine.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.redText }}>Missing in engine mock:</span>
            {missingInEngine.map((id) => (
              <Chip key={id} tone="red">{id}</Chip>
            ))}
          </div>
        )}
        {missingInGpt.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.yellowText }}>Missing in GPT sample:</span>
            {missingInGpt.map((id) => (
              <Chip key={id} tone="yellow">{id}</Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Data inspector ────────────────────────────────────────────────────────────

function DataInspector({
  gptReport,
  enginePayload,
  engineReport,
}: {
  gptReport: unknown;
  enginePayload: unknown;
  engineReport: unknown;
}) {
  const sections = [
    { title: 'GPT Report (MindloomReportV2 from sample)', data: gptReport },
    { title: 'Engine payload (ReportV2PayloadFromEngine from mock)', data: enginePayload },
    { title: 'Engine mapped to MindloomReportV2 (for ReportV2Dashboard)', data: engineReport },
  ];

  return (
    <div style={{ display: 'grid', gap: '0.55rem' }}>
      {sections.map(({ title, data }) => (
        <details key={title} style={{ background: C.cardSoft, border: `1px dashed ${C.border}`, borderRadius: 18, padding: '0.75rem 0.9rem' }}>
          <summary style={{ cursor: 'pointer', color: C.text, fontWeight: 700, fontSize: 13 }}>{title}</summary>
          <pre style={{
            marginTop: '0.7rem', fontSize: 11.5, lineHeight: 1.55, color: '#4a4440',
            overflowX: 'auto', maxHeight: 400, overflowY: 'auto',
            background: '#faf7f2', borderRadius: 12, padding: '0.8rem',
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      ))}
    </div>
  );
}

// ── Navigation hint ───────────────────────────────────────────────────────────

function NavHint() {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
      padding: '0.75rem 0.9rem', fontSize: 13, color: C.body,
    }}>
      <span style={{ fontWeight: 700, color: C.text }}>Full previews:</span>
      {' '}
      <a href="/dev/engine-report" style={{ color: C.purpleText, textDecoration: 'underline', fontWeight: 600 }}>
        /dev/engine-report
      </a>
      {' '}— engine mock rendered with production{' '}
      <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.35em', borderRadius: 4 }}>ReportV2Dashboard</code>.
      {' '}GPT report full preview: see{' '}
      <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.35em', borderRadius: 4 }}>mindloom-v2-realistic-sample.json</code>
      {' '}or any production report at{' '}
      <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.35em', borderRadius: 4 }}>/r/[publicToken]</code>.
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface EngineReportComparisonProps {
  comparison: ReportSourceComparison;
  gptReport: MindloomReportV2;
  enginePayload: ReportV2PayloadFromEngine;
  engineReport: unknown;
}

export function EngineReportComparison({
  comparison,
  gptReport,
  enginePayload,
  engineReport,
}: EngineReportComparisonProps) {
  return (
    <main style={{
      minHeight: '100vh',
      background: C.bg,
      padding: '1.35rem 1rem 2rem',
      color: C.text,
      fontFamily: '"Segoe UI", system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: '0.75rem' }}>

        {/* Top panel */}
        <TopPanel comparison={comparison} />

        {/* Navigation */}
        <NavHint />

        {/* Coverage gaps (chip lists) */}
        <CoverageGaps
          missingInEngine={comparison.missingInEngine}
          missingInGpt={comparison.missingInGpt}
          sharedBlocks={comparison.sharedBlocks}
        />

        {/* Block comparison table */}
        <BlockComparisonTable coverage={comparison.blockCoverage} />

        {/* Qualitative notes */}
        <QualitativeNotes notes={comparison.qualitativeNotes} />

        {/* Data inspector */}
        <DataInspector
          gptReport={gptReport}
          enginePayload={enginePayload}
          engineReport={engineReport}
        />

      </div>
    </main>
  );
}
