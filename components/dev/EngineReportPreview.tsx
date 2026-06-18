import type { ReactNode } from 'react';
import { SpeechCloud, type SpeechCloudItem } from '@/components/SpeechCloud';
import {
  getDevOnlyEngineReportBlocks,
  getEngineReportBlockDefinition,
  getFeedbackEnabledEngineReportBlocks,
  getHiddenEngineReportBlocks,
  getVisibleEngineReportBlocks,
  type EngineReportBlockId,
} from '@/lib/mindloom-engine/report-block-registry';
import type {
  NormalizedBlindSpot,
  NormalizedGraphEdge,
  NormalizedGraphNode,
  ReportV2Block,
  ReportV2PayloadFromEngine,
} from '@/lib/mindloom-engine/types';

const C = {
  bg: '#f5f3ef',
  card: '#ffffff',
  cardSoft: '#faf8f4',
  border: '#e8ddd0',
  text: '#201d1b',
  body: '#5d564f',
  muted: '#8c8176',
  purpleBg: '#f2edff',
  red: '#e46f61',
  redBg: '#fff4f1',
  greenBg: '#edf9f3',
  yellowBg: '#fff9ea',
  blueBg: '#eef6fc',
} as const;

const CODE_LABELS: Record<string, string> = {
  'defense.self_attack': '?????????',
  'defense.hypercontrol': '?????????????',
  'defense.minimization': '????????????? ???????????',
  'defense.rationalization': '??????????????',
  'unmet_need.acceptance': '??????????? ? ????????',
  'unmet_need.recognition': '??????????? ? ?????????',
  'unmet_need.safety': '??????????? ? ????????????',
  'unmet_need.rest': '??????????? ? ??????',
  'behavior_and_speech.minimize_silence': '??????????? ? ????????',
  'behavior_and_speech.self_justification': '?????????????? ? ????',
  'behavior_and_speech.overexplaining': '???????? ????????? ?????????',
  'behavior_and_speech.control_through_clarifying': '???????? ????? ?????????',
  contact_regime: '????? ????????',
};
function getReportBlockByRegistryId(report: ReportV2PayloadFromEngine, id: EngineReportBlockId): ReportV2Block | null {
  switch (id) {
    case 'hero':
      return report.hero;
    case 'disclaimer':
      return report.disclaimer;
    case 'speech_cloud':
      return report.speech_cloud;
    case 'main_pattern':
      return report.main_pattern;
    case 'where_visible':
      return report.evidence;
    case 'pattern_support':
      return report.protection_support;
    case 'pattern_protection':
      return report.protection_purpose;
    case 'phrases_meaning':
      return report.phrases_meaning;
    case 'heatmap':
      return report.heatmap;
    case 'graph':
      return report.graph;
    case 'attention_route':
      return report.attention_route;
    case 'attention_blind':
      return report.blind_spots;
    case 'pattern_cycle':
      return report.pattern_cycle;
    case 'levels_visible':
      return report.levels_visible;
    case 'evidence_basis':
      return report.evidence_basis;
    case 'shift_signals':
      return report.shift_signals;
    case 'practices':
      return report.practices;
    case 'business_impact':
      return report.business_impact;
    default:
      return null;
  }
}

function getRegistrySummary() {
  const shown = getVisibleEngineReportBlocks().map((block) => block.id);
  const hidden = getHiddenEngineReportBlocks().map((block) => block.id);
  const feedbackReady = getFeedbackEnabledEngineReportBlocks().map((block) => block.id);
  const devOnly = getDevOnlyEngineReportBlocks().map((block) => block.id);

  return { shown, hidden, feedbackReady, devOnly };
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

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

function pct(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return `${Math.round(value * 100)}%`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function humanizeEngineLabel(value: string | null | undefined): string {
  if (!value) return '';
  const normalized = value.replace(/[()]/g, '').trim();
  if (CODE_LABELS[normalized]) return CODE_LABELS[normalized];
  if (!/[a-z]/.test(normalized)) return normalized;
  return '';
}

export function cleanUserText(value: string): string {
  let text = value;

  for (const [code, label] of Object.entries(CODE_LABELS)) {
    text = text.replace(new RegExp(`\\(?${escapeRegex(code)}\\)?`, 'gi'), label);
  }

  text = text
    .replace(/\bsource_fields?\b\s*:?[^,.;]*/gi, '')
    .replace(/\b(node_id|edge_id|input_id|segment_id)\b\s*:?[^,.;]*/gi, '')
    .replace(/\b[a-z_]+\.[a-z0-9_.]+\b/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();

  return text;
}

function cleanLabel(value: string | null | undefined, fallback: string): string {
  const humanized = humanizeEngineLabel(value);
  if (humanized) return humanized;
  if (value && !/[a-z]/.test(value)) return cleanUserText(value);
  return fallback;
}

function uniqueNonEmpty(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!hasText(value)) continue;
    const normalized = cleanUserText(value);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }

  return result;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: C.muted,
      }}
    >
      {children}
    </p>
  );
}

function StatChip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'purple' | 'green' | 'yellow' | 'blue' | 'red';
}) {
  const palette = {
    neutral: { bg: '#f0ede6', color: '#6b6560' },
    purple: { bg: C.purpleBg, color: '#5d4aa8' },
    green: { bg: C.greenBg, color: '#3f6e5a' },
    yellow: { bg: C.yellowBg, color: '#896119' },
    blue: { bg: C.blueBg, color: '#3f678b' },
    red: { bg: C.redBg, color: '#a34a3e' },
  }[tone];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        padding: '0.25rem 0.72rem',
        background: palette.bg,
        color: palette.color,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.3,
      }}
    >
      {children}
    </span>
  );
}

function SectionShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 28,
        padding: '1.4rem 1.3rem',
        boxShadow: '0 4px 16px rgba(70,53,35,0.05)',
      }}
    >
      <div style={{ marginBottom: '0.95rem' }}>
        <Eyebrow>{eyebrow ?? 'Раздел отчета'}</Eyebrow>
        <h2 style={{ margin: '0.45rem 0 0', fontSize: '1.2rem', lineHeight: 1.18, color: C.text }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function QuoteList({ quotes }: { quotes: string[] }) {
  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      {quotes.map((quote, index) => (
        <div
          key={`${quote}-${index}`}
          style={{
            padding: '0.85rem 0.95rem',
            borderLeft: `3px solid ${C.red}`,
            borderRadius: '0 16px 16px 0',
            background: '#fbf7f2',
          }}
        >
          <p style={{ margin: 0, color: '#4d453d', fontStyle: 'italic', lineHeight: 1.6 }}>{quote}</p>
        </div>
      ))}
    </div>
  );
}

function DevBanner() {
  return (
    <div
      style={{
        background: '#faf7f2',
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: '0.8rem 1rem',
        color: C.body,
      }}
    >
      <Eyebrow>DEV PREVIEW · Mindloom Lite Engine → Report V2</Eyebrow>
      <p style={{ margin: '0.35rem 0 0', fontSize: 14, lineHeight: 1.55 }}>
        Источник: mock engine output. Production route не затронут.
      </p>
    </div>
  );
}

function HeroBlock({ report }: { report: ReportV2PayloadFromEngine }) {
  const headline = cleanUserText(report.hero.data?.headline_text ?? report.hero.data?.regime_label ?? 'Preview отчета');
  const summary = cleanUserText(report.hero.data?.regime_label ?? '');
  const defenses = (report.hero.data?.top_defenses ?? [])
    .map((item, index) => cleanLabel(item, `защитная стратегия ${index + 1}`))
    .filter(Boolean);

  return (
    <section
      style={{
        background:
          'radial-gradient(circle at 22% 12%, rgba(196,185,244,0.25), transparent 26%), radial-gradient(circle at 82% 18%, rgba(208,235,225,0.42), transparent 26%), #fdfaf5',
        border: `1px solid ${C.border}`,
        borderRadius: 32,
        padding: '1.55rem 1.35rem',
        boxShadow: '0 8px 28px rgba(70,53,35,0.05)',
      }}
    >
      <div className="engine-preview-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(260px, 0.75fr)', gap: '1rem' }}>
        <div>
          <Eyebrow>Ключевой паттерн</Eyebrow>
          <h1 style={{ margin: '0.8rem 0 0', fontSize: 'clamp(2rem, 5vw, 3.35rem)', lineHeight: 0.98, color: '#231d19' }}>
            {headline}
          </h1>
          {hasText(summary) && (
            <p style={{ margin: '0.9rem 0 0', maxWidth: 760, fontSize: '1rem', lineHeight: 1.65, color: '#665c53' }}>{summary}</p>
          )}
          {defenses.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.42rem', marginTop: '1rem' }}>
              {defenses.map((item) => (
                <StatChip key={item} tone="purple">{item}</StatChip>
              ))}
            </div>
          )}
        </div>

        <aside
          style={{
            background: 'rgba(255,253,248,0.86)',
            border: `1px solid rgba(232,221,208,0.95)`,
            borderRadius: 28,
            padding: '1rem 1.05rem',
            alignSelf: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            <div>
              <Eyebrow>Источник</Eyebrow>
              <p style={{ margin: '0.35rem 0 0', color: C.text, fontSize: 15, fontWeight: 700 }}>mock engine output</p>
            </div>
            <div>
              <Eyebrow>Состояние</Eyebrow>
              <p style={{ margin: '0.35rem 0 0', color: C.text, fontSize: 15, fontWeight: 700 }}>данные проходят через adapter</p>
            </div>
            <div>
              <Eyebrow>Сессия</Eyebrow>
              <p style={{ margin: '0.35rem 0 0', color: C.text, fontSize: 15, fontWeight: 700 }}>{formatSessionType(report.session_type)}</p>
            </div>
            <div>
              <Eyebrow>Уверенность</Eyebrow>
              <p style={{ margin: '0.35rem 0 0', color: C.text, fontSize: 15, fontWeight: 700 }}>{formatConfidenceBand(report.meta.confidence_summary)}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function DisclaimerSection({ report }: { report: ReportV2PayloadFromEngine }) {
  if (!report.disclaimer.shown || !report.disclaimer.data) return null;

  return (
    <SectionShell title="Дисклеймер" eyebrow="Границы интерпретации">
      <p style={{ margin: 0, color: C.body, lineHeight: 1.7 }}>{cleanUserText(report.disclaimer.data.confidence_note)}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.42rem', marginTop: '0.85rem' }}>
        <StatChip>сессий: {report.disclaimer.data.n_sessions}</StatChip>
        <StatChip tone={report.disclaimer.data.l7_earned ? 'green' : 'yellow'}>
          {report.disclaimer.data.l7_earned ? 'есть глубина наблюдений' : 'картина пока предварительная'}
        </StatChip>
      </div>
    </SectionShell>
  );
}

function getSpeechCloudItems(report: ReportV2PayloadFromEngine): SpeechCloudItem[] {
  const markers = report.speech_cloud.data?.markers ?? [];
  const frames = report.speech_cloud.data?.frequent_frames ?? [];

  const markerItems = markers.slice(0, 5).map((marker, index) => ({
    id: `marker-${index}`,
    text: cleanUserText(marker.cue),
    tone: (['rose', 'peach', 'warm', 'sand', 'blush'] as const)[index % 5],
  }));

  const frameItems = frames.slice(0, 3).map((frame, index) => ({
    id: `frame-${index}`,
    text: cleanUserText(frame.frame),
    tone: (['sage', 'sky', 'lavender'] as const)[index % 3],
  }));

  return [...markerItems, ...frameItems];
}

function getCenterMeaning(report: ReportV2PayloadFromEngine): string {
  const firstSentence = report.main_pattern.data?.contact_mode_text
    ?.split(/[.!?]/)
    .map((part) => cleanUserText(part).trim())
    .find(Boolean);

  return firstSentence ?? cleanUserText(report.hero.data?.regime_label ?? 'внутренняя логика паттерна');
}

function SpeechCloudSection({ report }: { report: ReportV2PayloadFromEngine }) {
  const items = getSpeechCloudItems(report);
  const quotes = uniqueNonEmpty((report.speech_cloud.data?.markers ?? []).map((marker) => marker.quote)).slice(0, 3);
  if (items.length === 0 && quotes.length === 0) return null;

  return (
    <SectionShell title="Что повторяется в речи" eyebrow="Речевая карта">
      {items.length > 0 && (
        <SpeechCloud items={items} centerText={getCenterMeaning(report)} centerLabel="центральная тема" />
      )}
      {quotes.length > 0 && <QuoteList quotes={quotes} />}
    </SectionShell>
  );
}

function MainPatternSection({ report }: { report: ReportV2PayloadFromEngine }) {
  const patternText = cleanUserText(report.main_pattern.data?.contact_mode_text ?? '');
  if (!patternText) return null;

  return (
    <SectionShell title="Самый заметный паттерн" eyebrow="Внутренняя логика">
      <p style={{ margin: 0, color: C.body, fontSize: 15, lineHeight: 1.75 }}>{patternText}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.42rem', marginTop: '0.9rem' }}>
        {hasText(report.main_pattern.data?.confidence_band) && (
          <StatChip tone="yellow">уверенность: {formatConfidenceBand(report.main_pattern.data?.confidence_band)}</StatChip>
        )}
        {hasText(report.hero.data?.regime_label) && <StatChip>{cleanUserText(report.hero.data?.regime_label)}</StatChip>}
      </div>
    </SectionShell>
  );
}

function EvidenceSection({ report }: { report: ReportV2PayloadFromEngine }) {
  const quotes = uniqueNonEmpty((report.evidence.data?.quotes ?? []).map((item) => item.quote));
  if (quotes.length === 0) return null;
  return (
    <SectionShell title="Где это видно" eyebrow="Опорные фразы">
      <QuoteList quotes={quotes} />
    </SectionShell>
  );
}

function SupportSection({ report }: { report: ReportV2PayloadFromEngine }) {
  const items = report.protection_support.data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <SectionShell title="Что может поддерживать паттерн" eyebrow="Поддерживающие механизмы">
      <div style={{ display: 'grid', gap: '0.7rem' }}>
        {items.map((item, index) => (
          <div
            key={`${item.defense_label}-${index}`}
            style={{
              borderRadius: 20,
              padding: '0.95rem 1rem',
              background: C.blueBg,
              border: '1px solid rgba(75,132,182,0.14)',
            }}
          >
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
              {cleanLabel(item.defense_label, `поддерживающий механизм ${index + 1}`)}
            </p>
            {hasText(item.evoked_by) && (
              <p style={{ margin: '0.45rem 0 0', color: '#4f6171', lineHeight: 1.6 }}>
                Что запускает: {cleanLabel(item.evoked_by, 'не удалось безопасно показать формулировку')}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function PurposeSection({ report }: { report: ReportV2PayloadFromEngine }) {
  const items = report.protection_purpose.data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <SectionShell title="Что паттерн может защищать" eyebrow="Скрытая функция">
      <div style={{ display: 'grid', gap: '0.7rem' }}>
        {items.map((item, index) => (
          <div
            key={`${item.defense_label}-${index}`}
            style={{
              borderRadius: 20,
              padding: '1rem',
              background: C.greenBg,
              border: '1px solid rgba(104,169,141,0.16)',
            }}
          >
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
              {cleanLabel(item.defense_label, `защита ${index + 1}`)}
            </p>
            {hasText(item.masks) && (
              <p style={{ margin: '0.45rem 0 0', color: '#456355', lineHeight: 1.6 }}>
                Что прикрывает: {cleanLabel(item.masks, 'внутреннее напряжение или потребность')}
              </p>
            )}
            {hasText(item.quote) && (
              <p style={{ margin: '0.55rem 0 0', color: '#456355', lineHeight: 1.6, fontStyle: 'italic' }}>
                {cleanUserText(item.quote)}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function GraphNodeList({ nodes }: { nodes: NormalizedGraphNode[] }) {
  if (nodes.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.42rem' }}>
      {nodes.map((node, index) => (
        <StatChip key={`${node.node_id}-${index}`} tone="purple">
          {cleanLabel(node.display_label, `тема ${index + 1}`)}
          {pct(node.activation) ? ` · ${pct(node.activation)}` : ''}
        </StatChip>
      ))}
    </div>
  );
}

function GraphEdgeList({ edges }: { edges: NormalizedGraphEdge[] }) {
  if (edges.length === 0) return null;
  return (
    <div style={{ display: 'grid', gap: '0.55rem' }}>
      {edges.map((edge, index) => (
        <div
          key={`${edge.from_id}-${edge.to_id}-${index}`}
          style={{
            borderRadius: 18,
            padding: '0.85rem 0.95rem',
            background: '#fbf7f2',
            border: `1px solid ${C.border}`,
            color: C.body,
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: C.text }}>{cleanLabel(edge.from_label, `тема ${index + 1}`)}</strong> усиливает или удерживает{' '}
          <strong style={{ color: C.text }}>{cleanLabel(edge.to_label, `связь ${index + 1}`)}</strong>
        </div>
      ))}
    </div>
  );
}

function GraphSection({ report }: { report: ReportV2PayloadFromEngine }) {
  const nodes = report.graph.data?.nodes ?? [];
  const edges = report.graph.data?.edges ?? [];
  const topPattern = cleanUserText(report.graph.data?.top_pattern ?? '');
  if (nodes.length === 0 && edges.length === 0 && !topPattern) return null;

  return (
    <SectionShell title="Как темы усиливают друг друга" eyebrow="Связи внутри системы">
      {topPattern && (
        <div
          style={{
            marginBottom: '0.9rem',
            borderRadius: 22,
            padding: '0.95rem 1rem',
            background: C.redBg,
            border: '1px solid rgba(228,111,97,0.14)',
          }}
        >
          <Eyebrow>Ключевая цепочка</Eyebrow>
          <p style={{ margin: '0.4rem 0 0', color: '#563a35', lineHeight: 1.65 }}>{topPattern}</p>
        </div>
      )}
      <p style={{ margin: '0 0 0.9rem', color: C.body, lineHeight: 1.65 }}>
        Одна тема может усиливать другую — это не диагноз, а гипотеза по материалу.
      </p>
      {nodes.length > 0 && (
        <div style={{ marginBottom: edges.length > 0 ? '0.9rem' : 0 }}>
          <Eyebrow>Основные темы</Eyebrow>
          <div style={{ marginTop: '0.5rem' }}>
            <GraphNodeList nodes={nodes} />
          </div>
        </div>
      )}
      {edges.length > 0 && (
        <div>
          <Eyebrow>Как они соединяются</Eyebrow>
          <div style={{ marginTop: '0.5rem' }}>
            <GraphEdgeList edges={edges} />
          </div>
        </div>
      )}
    </SectionShell>
  );
}

function AttentionRouteSection({ report }: { report: ReportV2PayloadFromEngine }) {
  const path = report.attention_route.data?.path ?? [];
  if (path.length === 0) return null;

  return (
    <SectionShell title="Маршрут внимания" eyebrow="Как внимание движется по теме">
      <div style={{ display: 'grid', gap: '0.65rem' }}>
        {path.map((step, index) => (
          <div
            key={`${step.level}-${index}`}
            style={{
              borderRadius: 20,
              padding: '0.95rem 1rem',
              background: index % 2 === 0 ? C.purpleBg : C.yellowBg,
              border: `1px solid ${index % 2 === 0 ? 'rgba(127,104,217,0.14)' : 'rgba(216,165,52,0.16)'}`,
            }}
          >
            <Eyebrow>{step.level}</Eyebrow>
            <p style={{ margin: '0.4rem 0 0', color: C.body, lineHeight: 1.65 }}>
              {cleanUserText(step.description ?? 'Описание уровня пока не заполнено')}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function BlindSpotsSection({ report }: { report: ReportV2PayloadFromEngine }) {
  const items = report.blind_spots.data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <SectionShell title="Что внимание может пропускать" eyebrow="Слепые зоны">
      <div style={{ display: 'grid', gap: '0.65rem' }}>
        {items.map((item: NormalizedBlindSpot, index) => (
          <div
            key={`${item.text}-${index}`}
            style={{
              borderRadius: 18,
              padding: '0.9rem 1rem',
              background: '#fff8ef',
              border: '1px solid rgba(216,165,52,0.16)',
            }}
          >
            <p style={{ margin: 0, color: C.text, lineHeight: 1.6 }}>{cleanUserText(item.text)}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function PatternCycleSection({ report }: { report: ReportV2PayloadFromEngine }) {
  if (!report.pattern_cycle.shown || !hasText(report.pattern_cycle.data?.description)) return null;
  return (
    <SectionShell title="Цикл паттерна" eyebrow="Повторяющаяся сцена">
      <p style={{ margin: 0, color: C.body, lineHeight: 1.7 }}>
        {cleanUserText(report.pattern_cycle.data?.description ?? '')}
      </p>
    </SectionShell>
  );
}

function EvidenceBasisSection({ report }: { report: ReportV2PayloadFromEngine }) {
  const quotes = uniqueNonEmpty((report.evidence_basis.data?.quotes ?? []).map((item) => item.quote));
  if (quotes.length === 0) return null;
  return (
    <SectionShell title="На чем основаны выводы" eyebrow="Основание для гипотез">
      <QuoteList quotes={quotes} />
    </SectionShell>
  );
}

function PracticesSection({ report }: { report: ReportV2PayloadFromEngine }) {
  const items = report.practices.data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <SectionShell title="Маленькие шаги на неделю" eyebrow="Практика">
      <div style={{ display: 'grid', gap: '0.7rem' }}>
        {items.map((item, index) => (
          <div
            key={`${item.text}-${index}`}
            style={{
              borderRadius: 22,
              padding: '1rem',
              background: C.greenBg,
              border: '1px solid rgba(104,169,141,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
              <StatChip tone="green">шаг {index + 1}</StatChip>
              {hasText(item.source) && <StatChip>{item.source === 'try_this' ? 'из блока рекомендаций' : 'из карты переходов'}</StatChip>}
            </div>
            <p style={{ margin: 0, color: '#365746', lineHeight: 1.65 }}>{cleanUserText(item.text)}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function renderBlock(report: ReportV2PayloadFromEngine, blockId: EngineReportBlockId): ReactNode {
  switch (blockId) {
    case 'hero':
      return report.hero.shown ? <HeroBlock report={report} /> : null;
    case 'disclaimer':
      return report.disclaimer.shown ? <DisclaimerSection report={report} /> : null;
    case 'speech_cloud':
      return report.speech_cloud.shown ? <SpeechCloudSection report={report} /> : null;
    case 'main_pattern':
      return report.main_pattern.shown ? <MainPatternSection report={report} /> : null;
    case 'where_visible':
      return report.evidence.shown ? <EvidenceSection report={report} /> : null;
    case 'pattern_support':
      return report.protection_support.shown ? <SupportSection report={report} /> : null;
    case 'pattern_protection':
      return report.protection_purpose.shown ? <PurposeSection report={report} /> : null;
    case 'graph':
      return report.graph.shown ? <GraphSection report={report} /> : null;
    case 'attention_route':
      return report.attention_route.shown ? <AttentionRouteSection report={report} /> : null;
    case 'attention_blind':
      return report.blind_spots.shown ? <BlindSpotsSection report={report} /> : null;
    case 'pattern_cycle':
      return report.pattern_cycle.shown ? <PatternCycleSection report={report} /> : null;
    case 'evidence_basis':
      return report.evidence_basis.shown ? <EvidenceBasisSection report={report} /> : null;
    case 'practices':
      return report.practices.shown ? <PracticesSection report={report} /> : null;
    default:
      return null;
  }
}

function DebugSummary({ report }: { report: ReportV2PayloadFromEngine }) {
  const summary = getRegistrySummary();

  return (
    <details
      style={{
        background: C.cardSoft,
        border: `1px dashed ${C.border}`,
        borderRadius: 22,
        padding: '0.95rem 1rem',
      }}
    >
      <summary style={{ cursor: 'pointer', color: C.text, fontWeight: 700 }}>Debug summary</summary>
      <div style={{ display: 'grid', gap: '0.85rem', marginTop: '0.9rem', color: C.body, fontSize: 14, lineHeight: 1.55 }}>
        <div><strong style={{ color: C.text }}>engine_input_id:</strong> {report.engine_input_id}</div>
        <div><strong style={{ color: C.text }}>source:</strong> {report.source}</div>
        <div><strong style={{ color: C.text }}>shown:</strong> {summary.shown.join(', ') || 'none'}</div>
        <div><strong style={{ color: C.text }}>hidden:</strong> {summary.hidden.join(', ') || 'none'}</div>
        <div><strong style={{ color: C.text }}>dev-only:</strong> {summary.devOnly.join(', ') || 'none'}</div>
        <div><strong style={{ color: C.text }}>feedback-ready:</strong> {summary.feedbackReady.join(', ') || 'none'}</div>
        <div style={{ display: 'grid', gap: '0.55rem' }}>
          {summary.hidden.map((id) => {
            const definition = getEngineReportBlockDefinition(id);
            const block = getReportBlockByRegistryId(report, id);
            return (
              <div key={id} style={{ borderTop: `1px solid ${C.border}`, paddingTop: '0.55rem' }}>
                <strong style={{ color: C.text }}>{definition.title}</strong>
                <div>status: {definition.status}</div>
                <div>reason: {block?.reason ?? definition.hiddenReason ?? 'reason not provided'}</div>
                <div>source_fields: {definition.sourceFields.join(', ')}</div>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}

export function EngineReportPreview({ report }: { report: ReportV2PayloadFromEngine }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: C.bg,
        padding: '1.35rem 1rem 2rem',
        color: C.text,
        fontFamily: '"Segoe UI", system-ui, sans-serif',
      }}
    >
      <style>{`
        @media (max-width: 860px) {
          .engine-preview-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <DevBanner />
        {getVisibleEngineReportBlocks().map((block) => (
          <div key={block.id}>{renderBlock(report, block.id)}</div>
        ))}
        <DebugSummary report={report} />
      </div>
    </main>
  );
}
