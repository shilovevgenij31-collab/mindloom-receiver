import type { ReactNode } from 'react';
import {
  ENGINE_REPORT_BLOCK_REGISTRY,
  type EngineReportBlockId,
} from '@/lib/mindloom-engine/report-block-registry';
import type {
  ReportV2Block,
  ReportV2PayloadFromEngine,
} from '@/lib/mindloom-engine/types';
import type { MindloomReportV2 } from '@/lib/normalize-report';
import { ReportV2Dashboard } from '@/app/r/[publicToken]/ReportV2Dashboard';

const C = {
  bg: '#f5f3ef',
  card: '#ffffff',
  cardSoft: '#faf8f4',
  border: '#e8ddd0',
  text: '#201d1b',
  body: '#5d564f',
  muted: '#8c8176',
  purpleBg: '#f2edff',
  greenBg: '#edf9f3',
  yellowBg: '#fff9ea',
  blueBg: '#eef6fc',
} as const;

// ── Registry ID → payload field ───────────────────────────────────────────────

function getReportBlockByRegistryId(report: ReportV2PayloadFromEngine, id: EngineReportBlockId): ReportV2Block | null {
  switch (id) {
    case 'hero': return report.hero;
    case 'disclaimer': return report.disclaimer;
    case 'speech_cloud': return report.speech_cloud;
    case 'main_pattern': return report.main_pattern;
    case 'where_visible': return report.evidence;
    case 'pattern_support': return report.protection_support;
    case 'pattern_protection': return report.protection_purpose;
    case 'phrases_meaning': return report.phrases_meaning;
    case 'heatmap': return report.heatmap;
    case 'graph': return report.graph;
    case 'attention_route': return report.attention_route;
    case 'attention_blind': return report.blind_spots;
    case 'pattern_cycle': return report.pattern_cycle;
    case 'evidence_basis': return report.evidence_basis;
    case 'practices': return report.practices;
    case 'business_impact': return report.business_impact;
    default: return null;
  }
}

// ── Block coverage ─────────────────────────────────────────────────────────────

type BlockCoverageStatus = 'present' | 'missing' | 'hidden' | 'dev_only';

interface BlockCoverageEntry {
  id: EngineReportBlockId;
  order: number;
  title: string;
  status: BlockCoverageStatus;
  reason?: string;
}

function computeBlockCoverage(report: ReportV2PayloadFromEngine): BlockCoverageEntry[] {
  return ENGINE_REPORT_BLOCK_REGISTRY.map((def) => {
    if (def.status === 'dev_only') {
      return { id: def.id, order: def.order, title: def.title, status: 'dev_only' as const };
    }
    if (def.status === 'hidden') {
      return { id: def.id, order: def.order, title: def.title, status: 'hidden' as const, reason: def.hiddenReason };
    }
    const reportBlock = getReportBlockByRegistryId(report, def.id);
    if (!reportBlock || !reportBlock.shown) {
      return { id: def.id, order: def.order, title: def.title, status: 'missing' as const, reason: reportBlock?.reason };
    }
    return { id: def.id, order: def.order, title: def.title, status: 'present' as const };
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSessionType(value: string): string {
  return value === 'returning' ? 'повторная сессия' : 'первая сессия';
}

function formatConfidenceBand(value: string | null | undefined): string {
  if (value === 'green') return 'высокая';
  if (value === 'yellow') return 'средняя';
  if (value === 'white') return 'предварительная';
  if (value === 'abstained') return 'недостаточно данных';
  return 'предварительная';
}

// ── Primitives ────────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>
      {children}
    </p>
  );
}

function StatChip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'purple' | 'green' | 'yellow' | 'blue';
}) {
  const palette = {
    neutral: { bg: '#f0ede6', color: '#6b6560' },
    purple: { bg: C.purpleBg, color: '#5d4aa8' },
    green: { bg: C.greenBg, color: '#3f6e5a' },
    yellow: { bg: C.yellowBg, color: '#896119' },
    blue: { bg: C.blueBg, color: '#3f678b' },
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

// ── Dev summary panel ─────────────────────────────────────────────────────────

function DevSummaryPanel({ report, coverage }: { report: ReportV2PayloadFromEngine; coverage: BlockCoverageEntry[] }) {
  const presentCount = coverage.filter((e) => e.status === 'present').length;
  const missingCount = coverage.filter((e) => e.status === 'missing').length;
  const hiddenCount = coverage.filter((e) => e.status === 'hidden').length;
  const devOnlyCount = coverage.filter((e) => e.status === 'dev_only').length;

  return (
    <div style={{ background: '#f0ede6', border: `1px solid ${C.border}`, borderRadius: 18, padding: '1rem 1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <Eyebrow>Engine Report Preview</Eyebrow>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>dev-only · не для клиентов</span>
      </div>
      <p style={{ margin: '0 0 0.65rem', fontSize: 13, color: C.body, lineHeight: 1.5 }}>
        Source:{' '}
        <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.35em', borderRadius: 4 }}>mock-engine-output.json</code>
        {' → '}
        <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.35em', borderRadius: 4 }}>normalize</code>
        {' → '}
        <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.35em', borderRadius: 4 }}>map-to-report-v2</code>
        {' → '}
        <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0.1em 0.35em', borderRadius: 4 }}>ReportV2Dashboard</code>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        <StatChip tone="green">present: {presentCount}</StatChip>
        <StatChip tone="yellow">missing: {missingCount}</StatChip>
        <StatChip>hidden: {hiddenCount}</StatChip>
        <StatChip tone="blue">dev-only: {devOnlyCount}</StatChip>
        <StatChip>session: {formatSessionType(report.session_type)}</StatChip>
        <StatChip tone={report.meta.confidence_summary === 'green' ? 'green' : report.meta.confidence_summary === 'yellow' ? 'yellow' : 'neutral'}>
          confidence: {formatConfidenceBand(report.meta.confidence_summary)}
        </StatChip>
      </div>
    </div>
  );
}

// ── Block coverage panel ──────────────────────────────────────────────────────

const COVERAGE_STYLE: Record<BlockCoverageStatus, { bg: string; color: string; label: string }> = {
  present: { bg: C.greenBg, color: '#2f6147', label: 'present' },
  missing: { bg: C.yellowBg, color: '#7a5812', label: 'missing' },
  hidden: { bg: '#f0ede6', color: '#7a7268', label: 'hidden' },
  dev_only: { bg: C.blueBg, color: '#3a5e82', label: 'dev-only' },
};

function BlockCoveragePanel({ coverage }: { coverage: BlockCoverageEntry[] }) {
  const presentCount = coverage.filter((e) => e.status === 'present').length;
  const visibleCount = coverage.filter((e) => e.status === 'present' || e.status === 'missing').length;

  return (
    <details style={{ background: C.cardSoft, border: `1px solid ${C.border}`, borderRadius: 22, padding: '0.85rem 1rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 700, color: C.text, fontSize: 14 }}>
        Block coverage — {presentCount} из {visibleCount} visible blocks с данными
      </summary>
      <div style={{ marginTop: '0.85rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['#', 'Блок', 'Статус', 'Причина'].map((h) => (
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
            {coverage.map((entry) => {
              const st = COVERAGE_STYLE[entry.status];
              return (
                <tr key={entry.id} style={{ borderBottom: `1px solid rgba(232,221,208,0.45)` }}>
                  <td style={{ padding: '0.45rem 0.6rem', color: C.muted, fontSize: 12 }}>{entry.order}</td>
                  <td style={{ padding: '0.45rem 0.6rem', color: C.text, fontWeight: 500 }}>{entry.title}</td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>
                    <span style={{ display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: 999, background: st.bg, color: st.color, fontSize: 11, fontWeight: 700 }}>
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem', color: C.muted, fontSize: 12, maxWidth: 280 }}>
                    {entry.reason ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}

// ── Data inspector ────────────────────────────────────────────────────────────

function DataInspector({
  enginePayload,
  dashboardReport,
  rawEngineOutput,
  normalized,
}: {
  enginePayload: ReportV2PayloadFromEngine;
  dashboardReport: MindloomReportV2;
  rawEngineOutput?: unknown;
  normalized?: unknown;
}) {
  const sections: Array<{ title: string; data: unknown }> = [
    ...(rawEngineOutput !== undefined ? [{ title: 'Raw engine output (mock-engine-output.json)', data: rawEngineOutput }] : []),
    ...(normalized !== undefined ? [{ title: 'Normalized analysis', data: normalized }] : []),
    { title: 'Mapped engine payload (ReportV2PayloadFromEngine)', data: enginePayload },
    { title: 'Dashboard report (MindloomReportV2 → ReportV2Dashboard)', data: dashboardReport },
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

// ── Main export ───────────────────────────────────────────────────────────────

export interface EngineReportPreviewProps {
  enginePayload: ReportV2PayloadFromEngine;
  dashboardReport: MindloomReportV2;
  rawEngineOutput?: unknown;
  normalized?: unknown;
}

export function EngineReportPreview({ enginePayload, dashboardReport, rawEngineOutput, normalized }: EngineReportPreviewProps) {
  const coverage = computeBlockCoverage(enginePayload);

  return (
    <main style={{
      minHeight: '100vh',
      background: C.bg,
      padding: '1.35rem 1rem 2rem',
      color: C.text,
      fontFamily: '"Segoe UI", system-ui, sans-serif',
    }}>
      {/* Dev header */}
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <DevSummaryPanel report={enginePayload} coverage={coverage} />
        <BlockCoveragePanel coverage={coverage} />
      </div>

      {/* Production Report V2 */}
      <div style={{ maxWidth: 560, margin: '0 auto', overflowX: 'clip' }}>
        <ReportV2Dashboard report={dashboardReport} createdAt={enginePayload.meta.generated_at} />
      </div>

      {/* Data inspector */}
      <div style={{ maxWidth: 560, margin: '1.5rem auto 0' }}>
        <DataInspector
          enginePayload={enginePayload}
          dashboardReport={dashboardReport}
          rawEngineOutput={rawEngineOutput}
          normalized={normalized}
        />
      </div>
    </main>
  );
}
