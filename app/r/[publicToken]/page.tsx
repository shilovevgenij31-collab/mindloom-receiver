import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getReportByToken } from '@/lib/reports-repository';
import { ReportV2Dashboard } from './ReportV2Dashboard';
import {
  normalizeMindloomReport,
  normalizeMindloomReportV2,
  isMindloomReportV2,
  type NormalizedReport,
  type RichSummary,
  type FixedBlock,
  type FixedBlocks,
  type MindloomReportV2,
  FIXED_BLOCK_KEYS,
} from '@/lib/normalize-report';

interface PageProps {
  params: Promise<{ publicToken: string }>;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

const C = {
  bg: '#f5f3ef',
  card: '#ffffff',
  border: '1px solid #e8e3db',
  shadow: '0 2px 16px rgba(0,0,0,0.07)',
  text: '#1a1a1a',
  muted: '#8a8580',
  font: 'system-ui, -apple-system, sans-serif',
} as const;

const CHIP_COLORS = [
  { bg: '#ede7f6', color: '#5b21b6' },
  { bg: '#d9f2eb', color: '#1a7a63' },
  { bg: '#e0f2fe', color: '#075985' },
  { bg: '#f0ede6', color: '#6b6560' },
  { bg: '#fce4ec', color: '#880e4f' },
  { bg: '#e8f5e9', color: '#2e7d32' },
];

const BLOCK_ACCENTS: Record<string, { border: string; bg: string }> = {
  main_insight:              { border: '#7c3aed', bg: '#faf8ff' },
  executive_summary:         { border: '#0284c7', bg: '#f0f9ff' },
  core_pattern:              { border: '#be185d', bg: '#fff0f6' },
  emotional_map:             { border: '#c2410c', bg: '#fff7ed' },
  strengths_resources:       { border: '#15803d', bg: '#f0fdf4' },
  limitations_risks:         { border: '#b45309', bg: '#fffbeb' },
  defenses_distortions:      { border: '#7e22ce', bg: '#fdf4ff' },
  growth_vector:             { border: '#047857', bg: '#ecfdf5' },
  practical_recommendations: { border: '#0e7490', bg: '#ecfeff' },
  reflection_practice:       { border: '#6d28d9', bg: '#f5f3ff' },
};

const FIELD_LABELS: Record<string, string> = {
  intensity: 'интенсивность',
  likelihood: 'вероятность',
  frequency: 'частота',
  significance: 'значимость',
  tension: 'напряжение',
  duration: 'длительность',
  type: 'тип',
  level: 'уровень',
};

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

function fmtPercent(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '0%';
  return `${Math.round(value * 100)}%`;
}

function measureColor(color?: string): string {
  switch (color) {
    case 'red':
      return '#dc2626';
    case 'yellow':
      return '#ca8a04';
    case 'green':
      return '#16a34a';
    case 'blue':
      return '#2563eb';
    case 'purple':
      return '#7c3aed';
    case 'gray':
    default:
      return '#6b7280';
  }
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p style={{
      margin: '0 0 0.75rem',
      fontSize: '0.7rem', fontWeight: 700,
      textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted,
      paddingLeft: '0.25rem',
    }}>
      {children}
    </p>
  );
}

function RichItem({ obj, i }: { obj: Record<string, unknown>; i: number }) {
  const TITLE_KEYS = ['name', 'title', 'emotion', 'scenario', 'focus', 'marker'];
  const BODY_KEYS = ['description', 'text', 'content'];
  const SKIP = new Set([...TITLE_KEYS, ...BODY_KEYS, 'id', 'examples', 'quotes', 'recommendations', 'nodes', 'type']);

  let title: string | undefined;
  for (const k of TITLE_KEYS) {
    const v = obj[k];
    if (typeof v === 'string' && v) { title = v; break; }
    if (typeof v === 'number') { title = String(v); break; }
  }

  let body: string | undefined;
  for (const k of BODY_KEYS) {
    const v = obj[k];
    if (typeof v === 'string' && v) { body = v; break; }
  }

  const chips: Array<{ k: string; v: string }> = [];
  for (const [k, v] of Object.entries(obj)) {
    if (SKIP.has(k)) continue;
    if (typeof v === 'string' && v) chips.push({ k, v });
    else if (typeof v === 'number') chips.push({ k, v: String(v) });
  }

  const examples = (Array.isArray(obj.examples) ? obj.examples : []).filter(
    (e): e is string => typeof e === 'string'
  );
  const nodes = (Array.isArray(obj.nodes) ? obj.nodes : []).filter(
    (n): n is string => typeof n === 'string'
  );

  const hasContent = title || body || chips.length > 0 || examples.length > 0 || nodes.length > 0;
  if (!hasContent) return null;

  return (
    <div key={i} style={{
      background: C.card, border: C.border, borderRadius: 16,
      padding: '1rem 1.25rem', boxShadow: C.shadow,
    }}>
      {title && (
        <p style={{ margin: body || chips.length > 0 || examples.length > 0 ? '0 0 0.35rem' : '0', fontWeight: 600, fontSize: '0.92rem', color: C.text }}>
          {title}
        </p>
      )}
      {body && (
        <p style={{ margin: chips.length > 0 || examples.length > 0 || nodes.length > 0 ? '0 0 0.5rem' : '0', fontSize: '0.88rem', color: '#444', lineHeight: 1.65 }}>
          {body}
        </p>
      )}
      {chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: examples.length > 0 || nodes.length > 0 ? '0.5rem' : '0' }}>
          {chips.map(({ k, v }) => (
            <span key={k} style={{
              padding: '0.15rem 0.6rem', borderRadius: 20,
              background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem',
            }}>
              {fieldLabel(k)}: {v}
            </span>
          ))}
        </div>
      )}
      {examples.length > 0 && (
        <div style={{ borderLeft: '3px solid #ede7f6', paddingLeft: '0.75rem', marginBottom: nodes.length > 0 ? '0.4rem' : '0' }}>
          {examples.map((e, ei) => (
            <p key={ei} style={{
              margin: ei < examples.length - 1 ? '0 0 0.3rem' : '0',
              color: '#5b5060', fontStyle: 'italic', fontSize: '0.85rem', lineHeight: 1.5,
            }}>
              «{e}»
            </p>
          ))}
        </div>
      )}
      {nodes.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {nodes.map((n, ni) => (
            <span key={ni} style={{
              padding: '0.15rem 0.6rem', borderRadius: 20,
              background: '#e0f2fe', color: '#075985', fontSize: '0.75rem',
            }}>
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ObjSection({ label, items }: { label: string; items: Array<Record<string, unknown>> }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <SectionTitle>{label}</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {items.map((obj, i) => <RichItem key={i} obj={obj} i={i} />)}
      </div>
    </div>
  );
}

function ResourceDeficitSection({ items }: { items: Array<Record<string, unknown>> }) {
  const resources = items.filter((i) => i.type === 'resource');
  const deficits = items.filter((i) => i.type === 'deficit');
  const unsorted = items.filter((i) => i.type !== 'resource' && i.type !== 'deficit');

  return (
    <div style={{ marginBottom: '1rem' }}>
      <SectionTitle>Ресурсы и дефициты</SectionTitle>
      {(resources.length > 0 || deficits.length > 0) ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '0.6rem',
        }}>
          {resources.map((item, i) => {
            const name = typeof item.name === 'string' ? item.name : undefined;
            const desc = typeof item.description === 'string' ? item.description : undefined;
            return (
              <div key={`r${i}`} style={{
                background: '#d9f2eb', border: '1px solid #a8dfd1',
                borderRadius: 14, padding: '0.875rem 1rem',
              }}>
                {name && <p style={{ margin: '0 0 0.25rem', fontWeight: 600, fontSize: '0.88rem', color: '#1a5048' }}>{name}</p>}
                {desc && <p style={{ margin: 0, fontSize: '0.83rem', color: '#1a6050', lineHeight: 1.55 }}>{desc}</p>}
                <span style={{ display: 'inline-block', marginTop: '0.4rem', padding: '0.1rem 0.5rem', borderRadius: 20, background: '#a8dfd1', color: '#1a5048', fontSize: '0.7rem', fontWeight: 600 }}>ресурс</span>
              </div>
            );
          })}
          {deficits.map((item, i) => {
            const name = typeof item.name === 'string' ? item.name : undefined;
            const desc = typeof item.description === 'string' ? item.description : undefined;
            return (
              <div key={`d${i}`} style={{
                background: '#fce4ec', border: '1px solid #f8bbd0',
                borderRadius: 14, padding: '0.875rem 1rem',
              }}>
                {name && <p style={{ margin: '0 0 0.25rem', fontWeight: 600, fontSize: '0.88rem', color: '#5d1a2e' }}>{name}</p>}
                {desc && <p style={{ margin: 0, fontSize: '0.83rem', color: '#7a2040', lineHeight: 1.55 }}>{desc}</p>}
                <span style={{ display: 'inline-block', marginTop: '0.4rem', padding: '0.1rem 0.5rem', borderRadius: 20, background: '#f8bbd0', color: '#5d1a2e', fontSize: '0.7rem', fontWeight: 600 }}>дефицит</span>
              </div>
            );
          })}
        </div>
      ) : null}
      {unsorted.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: resources.length > 0 || deficits.length > 0 ? '0.6rem' : '0' }}>
          {unsorted.map((obj, i) => <RichItem key={i} obj={obj} i={i} />)}
        </div>
      )}
    </div>
  );
}

function ContextualAnalysisSection({ ca }: { ca: Record<string, unknown> }) {
  const context = typeof ca.context === 'string' ? ca.context : undefined;
  const description = typeof ca.description === 'string' ? ca.description : undefined;
  const keyFactors = Array.isArray(ca.key_factors)
    ? (ca.key_factors as unknown[]).filter((f): f is string => typeof f === 'string')
    : [];

  if (!context && !description && keyFactors.length === 0) return null;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <SectionTitle>Контекстуальный анализ</SectionTitle>
      <div style={{
        background: C.card, border: C.border, borderRadius: 20,
        padding: '1.25rem 1.5rem', boxShadow: C.shadow,
      }}>
        {context && (
          <p style={{ margin: '0 0 0.6rem', fontSize: '0.92rem', color: '#333', lineHeight: 1.7, fontWeight: 500 }}>
            {context}
          </p>
        )}
        {description && (
          <p style={{ margin: keyFactors.length > 0 ? '0 0 0.75rem' : '0', fontSize: '0.88rem', color: '#444', lineHeight: 1.65 }}>
            {description}
          </p>
        )}
        {keyFactors.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {keyFactors.map((f, fi) => (
              <span key={fi} style={{
                padding: '0.2rem 0.7rem', borderRadius: 20,
                background: '#e0f2fe', color: '#075985', fontSize: '0.8rem',
              }}>
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RewrittenTextSection({ text }: { text: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <SectionTitle>Честный текст</SectionTitle>
      <div style={{
        background: '#faf9f7', border: C.border, borderRadius: 20,
        padding: '1.25rem 1.5rem', boxShadow: C.shadow,
        borderLeft: '4px solid #ede7f6',
      }}>
        <p style={{ margin: 0, fontSize: '0.93rem', color: '#3a3540', lineHeight: 1.8, fontStyle: 'italic' }}>
          {text}
        </p>
      </div>
    </div>
  );
}

function ReflectionQuestionsSection({ questions }: { questions: string[] }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <SectionTitle>Вопросы для рефлексии</SectionTitle>
      <div style={{
        background: C.card, border: C.border, borderRadius: 20,
        padding: '1.25rem 1.5rem', boxShadow: C.shadow,
        display: 'flex', flexDirection: 'column', gap: '0.7rem',
      }}>
        {questions.map((q, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: '#ede7f6', color: '#5b21b6',
              fontSize: '0.7rem', fontWeight: 700, marginTop: '0.05rem',
            }}>
              {i + 1}
            </span>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#333', lineHeight: 1.65 }}>
              {q}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PracticeSection({ items }: { items: Array<Record<string, unknown>> }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <SectionTitle>Практика</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {items.map((item, i) => {
          const title = typeof item.title === 'string' ? item.title : typeof item.name === 'string' ? item.name : undefined;
          const description = typeof item.description === 'string' ? item.description : typeof item.text === 'string' ? item.text : undefined;
          const duration = typeof item.duration === 'string' ? item.duration : undefined;
          return (
            <div key={i} style={{
              background: '#f0faf5', border: '1px solid #c8e6d8',
              borderRadius: 16, padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: description ? '0.4rem' : '0', flexWrap: 'wrap' }}>
                {title && <p style={{ margin: 0, fontWeight: 600, fontSize: '0.92rem', color: '#1a4a38' }}>{title}</p>}
                {duration && (
                  <span style={{
                    padding: '0.1rem 0.5rem', borderRadius: 20,
                    background: '#c8e6d8', color: '#1a4a38', fontSize: '0.72rem', fontWeight: 600,
                  }}>
                    {duration}
                  </span>
                )}
              </div>
              {description && (
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#1a6050', lineHeight: 1.6 }}>
                  {description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RichSummaryCard({ sr }: { sr: RichSummary }) {
  const fields: Array<{ key: keyof RichSummary; label: string; color: string; bg: string }> = [
    { key: 'core_pattern', label: 'Ключевой паттерн', color: '#5b21b6', bg: '#ede7f6' },
    { key: 'dominant_conflict', label: 'Доминирующий конфликт', color: '#880e4f', bg: '#fce4ec' },
    { key: 'main_compensation', label: 'Основная компенсация', color: '#075985', bg: '#e0f2fe' },
    { key: 'risk', label: 'Риск', color: '#92400e', bg: '#fef3c7' },
  ];
  const visible = fields.filter((f) => sr[f.key]);
  if (visible.length === 0) return null;

  return (
    <div style={{
      background: C.card, border: C.border, borderRadius: 20,
      padding: '1.25rem 1.5rem', boxShadow: C.shadow, marginBottom: '1rem',
    }}>
      <p style={{
        margin: '0 0 1rem', fontSize: '0.7rem', fontWeight: 700,
        textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted,
      }}>
        Краткое резюме
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {visible.map(({ key, label, color, bg }) => (
          <div key={key} style={{
            padding: '0.7rem 1rem', borderRadius: 12,
            background: bg, borderLeft: `3px solid ${color}`,
          }}>
            <p style={{ margin: '0 0 0.2rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color }}>
              {label}
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.6 }}>
              {sr[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fixed blocks rendering ──────────────────────────────────────────────────

function FixedBlockCard({ blockKey, block }: { blockKey: string; block: FixedBlock }) {
  const accent = BLOCK_ACCENTS[blockKey] ?? { border: '#c0bdb8', bg: C.card };

  const hasItems = block.items && block.items.length > 0;
  const hasQuotes = block.quotes && block.quotes.length > 0;
  const hasRecs = block.recommendations && block.recommendations.length > 0;
  const hasMarkers = block.markers && block.markers.length > 0;
  const hasSteps = block.steps && block.steps.length > 0;
  const hasQuestions = block.questions && block.questions.length > 0;
  const hasPractice =
    block.practice &&
    (block.practice.title || block.practice.description || (block.practice.steps && block.practice.steps.length > 0));

  return (
    <div style={{
      background: accent.bg,
      border: C.border,
      borderTop: `3px solid ${accent.border}`,
      borderRadius: 20,
      padding: '1.25rem 1.5rem',
      boxShadow: C.shadow,
    }}>
      {block.title && (
        <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: C.text, margin: '0 0 0.7rem', lineHeight: 1.3 }}>
          {block.title}
        </h2>
      )}

      {block.text && (
        <p style={{
          fontSize: '0.95rem', color: '#333', lineHeight: 1.75,
          margin: hasItems || hasQuotes || hasRecs || hasMarkers || hasSteps || hasQuestions || hasPractice ? '0 0 0.85rem' : '0',
        }}>
          {block.text}
        </p>
      )}

      {hasMarkers && block.markers && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: hasItems || hasQuotes || hasRecs || hasSteps || hasQuestions || hasPractice ? '0.75rem' : '0' }}>
          {block.markers.map((m, i) => {
            const cc = CHIP_COLORS[i % CHIP_COLORS.length];
            return (
              <span key={i} style={{ padding: '0.2rem 0.7rem', borderRadius: 20, background: cc.bg, color: cc.color, fontSize: '0.78rem', fontWeight: 500 }}>
                {m}
              </span>
            );
          })}
        </div>
      )}

      {hasQuotes && block.quotes && (
        <div style={{ marginBottom: hasItems || hasRecs || hasSteps || hasQuestions || hasPractice ? '0.75rem' : '0' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted }}>
            Фразы из материала
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {block.quotes.map((q, i) => (
              <div key={i} style={{ padding: '0.5rem 0.9rem', borderLeft: '3px solid #ede7f6', background: '#faf9fb', borderRadius: '0 10px 10px 0' }}>
                <p style={{ margin: 0, color: '#5b5060', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.55 }}>«{q}»</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasItems && block.items && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: hasRecs || hasSteps || hasQuestions || hasPractice ? '0.75rem' : '0' }}>
          {block.items.map((item, i) => <RichItem key={i} obj={item} i={i} />)}
        </div>
      )}

      {hasRecs && block.recommendations && (
        <div style={{ marginBottom: hasSteps || hasQuestions || hasPractice ? '0.75rem' : '0' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted }}>
            Рекомендации
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {block.recommendations.map((rec, i) => (
              <div key={i} style={{ padding: '0.45rem 0.9rem', background: '#f0faf5', border: '1px solid #c8e6d8', borderRadius: 10, fontSize: '0.88rem', color: '#1a4a38', lineHeight: 1.55 }}>
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSteps && block.steps && (
        <div style={{ marginBottom: hasQuestions || hasPractice ? '0.75rem' : '0' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted }}>
            Шаги
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {block.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: '#e0f2fe', color: '#075985', fontSize: '0.68rem', fontWeight: 700, marginTop: '0.1rem' }}>
                  {i + 1}
                </span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.65 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasQuestions && block.questions && (
        <div style={{ marginBottom: hasPractice ? '0.75rem' : '0' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted }}>
            Вопросы для рефлексии
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {block.questions.map((q, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: '#ede7f6', color: '#5b21b6', fontSize: '0.68rem', fontWeight: 700, marginTop: '0.1rem' }}>
                  {i + 1}
                </span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.65 }}>{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasPractice && block.practice && (
        <div style={{ background: '#f0faf5', border: '1px solid #c8e6d8', borderRadius: 14, padding: '1rem 1.25rem' }}>
          {block.practice.title && (
            <p style={{ margin: '0 0 0.35rem', fontWeight: 600, fontSize: '0.92rem', color: '#1a4a38' }}>
              {block.practice.title}
            </p>
          )}
          {block.practice.description && (
            <p style={{ margin: block.practice.steps && block.practice.steps.length > 0 ? '0 0 0.5rem' : '0', fontSize: '0.88rem', color: '#1a6050', lineHeight: 1.6 }}>
              {block.practice.description}
            </p>
          )}
          {block.practice.steps && block.practice.steps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {block.practice.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: '#c8e6d8', color: '#1a4a38', fontSize: '0.65rem', fontWeight: 700, marginTop: '0.1rem' }}>
                    {i + 1}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.87rem', color: '#1a5040', lineHeight: 1.55 }}>{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FixedBlocksSection({ blocks }: { blocks: FixedBlocks }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
      {FIXED_BLOCK_KEYS.map((key) => {
        const block = blocks[key];
        if (!block || (!block.text && !block.title)) return null;
        return <FixedBlockCard key={key} blockKey={key} block={block} />;
      })}
    </div>
  );
}

function MetricBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | null | undefined;
  tone: string;
}) {
  const width = typeof value === 'number' ? `${Math.max(0, Math.min(100, Math.round(value * 100)))}%` : '0%';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#555' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', color: C.text, fontWeight: 600 }}>{fmtPercent(value)}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: '#ece7de', overflow: 'hidden' }}>
        <div style={{ width, height: '100%', borderRadius: 999, background: tone }} />
      </div>
    </div>
  );
}

function V2SectionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div style={{
      background: C.card, border: C.border, borderRadius: 20,
      padding: '1.25rem 1.5rem', boxShadow: C.shadow, marginBottom: '1rem',
    }}>
      <p style={{
        margin: '0 0 0.55rem', fontSize: '0.7rem', fontWeight: 700,
        textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted,
      }}>
        {eyebrow}
      </p>
      {title && (
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', lineHeight: 1.3, color: C.text }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function V2BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: '#b8aa92', marginTop: '0.55rem', flexShrink: 0,
          }} />
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#333', lineHeight: 1.65 }}>{item}</p>
        </div>
      ))}
    </div>
  );
}

function V2KeyValueGrid({ items }: { items: Array<{ label: string; value?: string | null }> }) {
  const visible = items.filter((item) => item.value);
  if (visible.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
      {visible.map((item) => (
        <div key={item.label} style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '0.95rem 1rem' }}>
          <p style={{
            margin: '0 0 0.35rem', fontSize: '0.68rem', fontWeight: 700,
            textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: C.muted,
          }}>
            {item.label}
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.6 }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function ReportV2({ report, createdAt }: { report: MindloomReportV2; createdAt: string }) {
  const visibleActiveNodes = report.active_nodes.filter((node) => node.label || node.description);
  const visibleHeatmapZones = report.heatmap.zones.filter((zone) => zone.label || zone.description);
  const visibleGraphNodes = report.node_graph.nodes.filter((node) => node.id || node.label);
  const visibleGraphEdges = report.node_graph.edges.filter((edge) => edge.from || edge.to || edge.label);
  const visibleHypotheses = report.hypothesis_table.filter((item) => item.hypothesis || item.node_id);
  const visibleLayers = report.mindloom_layers.filter((item) => item.layer || item.description || item.manifestation);
  const visibleTransformationMarkers = report.transformation_markers.filter(
    (item) => item.marker || item.description || item.shift_signal
  );
  const visiblePractices = report.recommended_practices.filter(
    (item) => item.title || item.purpose || item.how_to_do
  );

  return (
    <>
      <div style={{
        background: C.card, border: C.border, borderRadius: 24,
        padding: '1.75rem 2rem', boxShadow: C.shadow, marginBottom: '1rem',
      }}>
        <span style={{
          display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: 20,
          background: '#ede7f6', color: '#5b21b6',
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase' as const, marginBottom: '0.9rem',
        }}>
          Mindloom Report v2
        </span>

        <h1 style={{
          fontSize: 'clamp(1.35rem, 4vw, 2rem)', fontWeight: 700,
          color: C.text, margin: '0 0 0.5rem', lineHeight: 1.25,
        }}>
          {report.hero.title ?? 'Отчёт Mindloom'}
        </h1>

        {report.participant.name && (
          <p style={{ fontSize: '1rem', color: '#555', margin: '0 0 0.65rem', fontWeight: 500 }}>
            {report.participant.name}
          </p>
        )}

        {report.hero.main_insight && (
          <p style={{ margin: '0 0 0.6rem', fontSize: '1rem', color: '#333', lineHeight: 1.7 }}>
            {report.hero.main_insight}
          </p>
        )}

        {report.hero.one_sentence_summary && (
          <p style={{ margin: '0 0 0.9rem', fontSize: '0.92rem', color: '#666', lineHeight: 1.65 }}>
            {report.hero.one_sentence_summary}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {report.meta.language && (
            <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem' }}>
              {report.meta.language}
            </span>
          )}
          {report.meta.analysis_type && (
            <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem' }}>
              {report.meta.analysis_type}
            </span>
          )}
          {report.source.type && (
            <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem' }}>
              {report.source.type}
            </span>
          )}
          {report.source.material_volume && (
            <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem' }}>
              {report.source.material_volume}
            </span>
          )}
          <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem' }}>
            {fmtDate(createdAt)}
          </span>
        </div>
      </div>

      {report.source.source_summary && (
        <V2SectionCard eyebrow="Материал">
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#333', lineHeight: 1.75 }}>
            {report.source.source_summary}
          </p>
        </V2SectionCard>
      )}

      <V2SectionCard eyebrow="Target" title="Фокус роста">
        <V2KeyValueGrid
          items={[
            { label: 'Growth blocker', value: report.target.growth_blocker },
            { label: 'Central knot', value: report.target.central_knot },
            { label: 'Core pain', value: report.target.core_pain },
            { label: 'Short explanation', value: report.target.short_explanation },
          ]}
        />
      </V2SectionCard>

      <V2SectionCard eyebrow="Desired State" title="Желаемое состояние">
        <V2KeyValueGrid
          items={[
            { label: 'Explicit request', value: report.desired_state.explicit_request },
            { label: 'Hidden request', value: report.desired_state.hidden_request },
            { label: 'Future state', value: report.desired_state.future_state },
          ]}
        />
      </V2SectionCard>

      <V2SectionCard eyebrow="Mechanism" title="Механизм удержания">
        <V2KeyValueGrid
          items={[
            { label: 'Protective logic', value: report.mechanism.protective_logic },
            { label: 'Hidden gain', value: report.mechanism.hidden_gain },
            { label: 'Perceived threat', value: report.mechanism.perceived_threat },
            { label: 'Cost', value: report.mechanism.cost },
          ]}
        />
      </V2SectionCard>

      <V2SectionCard eyebrow="Speech Layer" title="Речевой слой">
        {report.speech_layer.key_phrases.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: report.speech_layer.speech_patterns.length > 0 ? '0.85rem' : '0' }}>
            {report.speech_layer.key_phrases.map((phrase, i) => {
              const cc = CHIP_COLORS[i % CHIP_COLORS.length];
              return (
                <span key={i} style={{
                  padding: '0.28rem 0.8rem', borderRadius: 20,
                  background: cc.bg, color: cc.color, fontSize: '0.82rem', fontWeight: 500,
                }}>
                  {phrase}
                </span>
              );
            })}
          </div>
        )}
        {report.speech_layer.speech_patterns.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {report.speech_layer.speech_patterns.map((item, i) => (
              <div key={i} style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '1rem' }}>
                {item.pattern && <p style={{ margin: '0 0 0.3rem', fontWeight: 600, color: C.text }}>{item.pattern}</p>}
                {item.description && <p style={{ margin: item.evidence.length > 0 ? '0 0 0.5rem' : '0', fontSize: '0.9rem', color: '#444', lineHeight: 1.6 }}>{item.description}</p>}
                <V2BulletList items={item.evidence} />
              </div>
            ))}
          </div>
        )}
      </V2SectionCard>

      {visibleActiveNodes.length > 0 && (
        <V2SectionCard eyebrow="Active Nodes" title="Активные узлы">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {visibleActiveNodes.map((node, i) => {
              const tone = measureColor(node.color);
              return (
                <div key={node.id ?? i} style={{ background: '#faf8f4', border: C.border, borderRadius: 16, padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.45rem' }}>
                    <div>
                      {node.label && <p style={{ margin: '0 0 0.15rem', fontWeight: 600, color: C.text }}>{node.label}</p>}
                      {node.type && <p style={{ margin: 0, fontSize: '0.78rem', color: C.muted }}>{node.type}</p>}
                    </div>
                    <span style={{
                      alignSelf: 'flex-start', width: 12, height: 12, borderRadius: '50%',
                      background: tone, boxShadow: `0 0 0 4px ${tone}22`,
                    }} />
                  </div>
                  {node.description && (
                    <p style={{ margin: '0 0 0.7rem', fontSize: '0.88rem', color: '#444', lineHeight: 1.6 }}>
                      {node.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: node.evidence.length > 0 || node.connected_to.length > 0 ? '0.75rem' : '0' }}>
                    <MetricBar label="Intensity" value={node.intensity} tone={tone} />
                    <MetricBar label="Confidence" value={node.confidence} tone="#8b5cf6" />
                  </div>
                  {node.evidence.length > 0 && (
                    <div style={{ marginBottom: node.connected_to.length > 0 ? '0.65rem' : '0' }}>
                      <p style={{ margin: '0 0 0.35rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: C.muted }}>
                        Evidence
                      </p>
                      <V2BulletList items={node.evidence} />
                    </div>
                  )}
                  {node.connected_to.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {node.connected_to.map((item, index) => (
                        <span key={index} style={{ padding: '0.15rem 0.55rem', borderRadius: 20, background: '#ede7f6', color: '#5b21b6', fontSize: '0.75rem' }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </V2SectionCard>
      )}

      {visibleHeatmapZones.length > 0 && (
        <V2SectionCard eyebrow="Heatmap" title="Тепловая карта">
          {report.heatmap.legend.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.9rem' }}>
              {report.heatmap.legend.map((item, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.25rem 0.7rem', borderRadius: 20, background: '#faf8f4', border: C.border,
                  fontSize: '0.78rem', color: '#444',
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: measureColor(item.color) }} />
                  {item.meaning ?? item.color ?? 'zone'}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {visibleHeatmapZones.map((zone, i) => {
              const tone = measureColor(zone.color);
              return (
                <div key={zone.id ?? i} style={{
                  borderRadius: 16, padding: '1rem', border: C.border,
                  background: `linear-gradient(135deg, ${tone}18 0%, #ffffff 90%)`,
                }}>
                  {zone.label && <p style={{ margin: '0 0 0.3rem', fontWeight: 600, color: C.text }}>{zone.label}</p>}
                  {zone.description && <p style={{ margin: '0 0 0.7rem', fontSize: '0.88rem', color: '#444', lineHeight: 1.6 }}>{zone.description}</p>}
                  <MetricBar label="Intensity" value={zone.intensity} tone={tone} />
                  {zone.related_node_ids.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
                      {zone.related_node_ids.map((item, index) => (
                        <span key={index} style={{ padding: '0.15rem 0.55rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem' }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </V2SectionCard>
      )}

      {(visibleGraphNodes.length > 0 || visibleGraphEdges.length > 0) && (
        <V2SectionCard eyebrow="Node Graph" title="Граф связей">
          {visibleGraphNodes.length > 0 && (
            <div style={{ marginBottom: visibleGraphEdges.length > 0 ? '0.9rem' : '0' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: C.muted }}>Узлы</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
                {visibleGraphNodes.map((node, i) => (
                  <div key={node.id ?? i} style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '0.9rem 1rem' }}>
                    <p style={{ margin: '0 0 0.15rem', fontWeight: 600, color: C.text }}>{node.label ?? node.id ?? 'Node'}</p>
                    {node.type && <p style={{ margin: '0 0 0.55rem', fontSize: '0.78rem', color: C.muted }}>{node.type}</p>}
                    <MetricBar label="Intensity" value={node.intensity} tone="#2563eb" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {visibleGraphEdges.length > 0 && (
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: C.muted }}>Связи</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {visibleGraphEdges.map((edge, i) => (
                  <div key={i} style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '0.9rem 1rem' }}>
                    <p style={{ margin: '0 0 0.45rem', fontWeight: 600, color: C.text }}>
                      {(edge.from ?? 'source')} {'->'} {(edge.to ?? 'target')}
                    </p>
                    {edge.label && <p style={{ margin: '0 0 0.55rem', fontSize: '0.88rem', color: '#444' }}>{edge.label}</p>}
                    <MetricBar label="Strength" value={edge.strength} tone="#7c3aed" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </V2SectionCard>
      )}

      {visibleHypotheses.length > 0 && (
        <V2SectionCard eyebrow="Hypothesis Table" title="Гипотезы">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {visibleHypotheses.map((item, i) => (
              <div key={i} style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '1rem' }}>
                {item.node_id && <p style={{ margin: '0 0 0.25rem', fontSize: '0.78rem', color: C.muted }}>{item.node_id}</p>}
                {item.hypothesis && <p style={{ margin: '0 0 0.65rem', fontSize: '0.92rem', color: '#333', lineHeight: 1.65 }}>{item.hypothesis}</p>}
                <div style={{ marginBottom: item.evidence.length > 0 ? '0.7rem' : '0' }}>
                  <MetricBar label="Confidence" value={item.confidence} tone="#be185d" />
                </div>
                <V2BulletList items={item.evidence} />
              </div>
            ))}
          </div>
        </V2SectionCard>
      )}

      <V2SectionCard eyebrow="Trajectory" title="Траектория">
        {report.trajectory.cycle.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.85rem' }}>
            {report.trajectory.cycle.map((item, i) => (
              <span key={i} style={{ padding: '0.28rem 0.8rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.82rem' }}>
                {item}
              </span>
            ))}
          </div>
        )}
        <V2KeyValueGrid
          items={[
            { label: 'Blocking point', value: report.trajectory.blocking_point },
            { label: 'Possible exit', value: report.trajectory.possible_exit },
          ]}
        />
      </V2SectionCard>

      <V2SectionCard eyebrow="Processing Dashboard" title="Сводка обработки">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
          {typeof report.processing_dashboard.active_nodes_count === 'number' && (
            <div style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '0.95rem 1rem' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: C.muted }}>Active nodes</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: C.text }}>{report.processing_dashboard.active_nodes_count}</p>
            </div>
          )}
          {typeof report.processing_dashboard.markers_detected === 'number' && (
            <div style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '0.95rem 1rem' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: C.muted }}>Markers detected</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: C.text }}>{report.processing_dashboard.markers_detected}</p>
            </div>
          )}
          {report.processing_dashboard.main_layer && (
            <div style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '0.95rem 1rem' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: C.muted }}>Main layer</p>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#333', lineHeight: 1.5 }}>{report.processing_dashboard.main_layer}</p>
            </div>
          )}
          {report.processing_dashboard.priority && (
            <div style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '0.95rem 1rem' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: C.muted }}>Priority</p>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#333', lineHeight: 1.5 }}>{report.processing_dashboard.priority}</p>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <MetricBar label="Overheat level" value={report.processing_dashboard.overheat_level} tone="#dc2626" />
          <MetricBar label="Resource level" value={report.processing_dashboard.resource_level} tone="#16a34a" />
        </div>
      </V2SectionCard>

      {visibleLayers.length > 0 && (
        <V2SectionCard eyebrow="Mindloom Layers" title="Слои Mindloom">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {visibleLayers.map((item, i) => (
              <div key={i} style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '1rem' }}>
                {item.layer && <p style={{ margin: '0 0 0.3rem', fontWeight: 600, color: C.text }}>{item.layer}</p>}
                {item.description && <p style={{ margin: '0 0 0.45rem', fontSize: '0.9rem', color: '#444', lineHeight: 1.6 }}>{item.description}</p>}
                {item.manifestation && <p style={{ margin: '0 0 0.65rem', fontSize: '0.88rem', color: '#555', lineHeight: 1.6 }}>{item.manifestation}</p>}
                <div style={{ marginBottom: item.evidence.length > 0 ? '0.65rem' : '0' }}>
                  <MetricBar label="Intensity" value={item.intensity} tone="#ca8a04" />
                </div>
                <V2BulletList items={item.evidence} />
              </div>
            ))}
          </div>
        </V2SectionCard>
      )}

      {visibleTransformationMarkers.length > 0 && (
        <V2SectionCard eyebrow="Transformation Markers" title="Маркеры трансформации">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {visibleTransformationMarkers.map((item, i) => (
              <div key={i} style={{ background: '#faf8f4', border: C.border, borderRadius: 14, padding: '1rem' }}>
                {item.marker && <p style={{ margin: '0 0 0.3rem', fontWeight: 600, color: C.text }}>{item.marker}</p>}
                {item.description && <p style={{ margin: '0 0 0.4rem', fontSize: '0.9rem', color: '#444', lineHeight: 1.6 }}>{item.description}</p>}
                {item.shift_signal && <p style={{ margin: 0, fontSize: '0.88rem', color: '#555', lineHeight: 1.6 }}>{item.shift_signal}</p>}
              </div>
            ))}
          </div>
        </V2SectionCard>
      )}

      {visiblePractices.length > 0 && (
        <V2SectionCard eyebrow="Recommended Practices" title="Рекомендуемые практики">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {visiblePractices.map((item, i) => (
              <div key={i} style={{ background: '#f0faf5', border: '1px solid #c8e6d8', borderRadius: 16, padding: '1rem 1.1rem' }}>
                {item.title && <p style={{ margin: '0 0 0.35rem', fontWeight: 600, color: '#1a4a38' }}>{item.title}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: item.purpose || item.how_to_do || item.observe.length > 0 || item.shift_signal ? '0.6rem' : '0' }}>
                  {item.target_node && <span style={{ padding: '0.15rem 0.55rem', borderRadius: 20, background: '#d9f2eb', color: '#1a6050', fontSize: '0.75rem' }}>{item.target_node}</span>}
                  {item.layer && <span style={{ padding: '0.15rem 0.55rem', borderRadius: 20, background: '#d9f2eb', color: '#1a6050', fontSize: '0.75rem' }}>{item.layer}</span>}
                  {item.frequency && <span style={{ padding: '0.15rem 0.55rem', borderRadius: 20, background: '#d9f2eb', color: '#1a6050', fontSize: '0.75rem' }}>{item.frequency}</span>}
                </div>
                <V2KeyValueGrid
                  items={[
                    { label: 'Purpose', value: item.purpose },
                    { label: 'How to do', value: item.how_to_do },
                    { label: 'Shift signal', value: item.shift_signal },
                  ]}
                />
                {item.observe.length > 0 && (
                  <div style={{ marginTop: '0.7rem' }}>
                    <p style={{ margin: '0 0 0.35rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#1a6050' }}>
                      Observe
                    </p>
                    <V2BulletList items={item.observe} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </V2SectionCard>
      )}

      {(report.disclaimer ?? '').trim() && (
        <div style={{
          background: '#faf8f4', border: C.border, borderRadius: 16,
          padding: '0.9rem 1.25rem', marginBottom: '1rem',
        }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: C.muted, lineHeight: 1.55, fontStyle: 'italic' }}>
            {report.disclaimer}
          </p>
        </div>
      )}
    </>
  );
}

// ── Main report renderer ────────────────────────────────────────────────────

void ReportV2;

function ReportStructured({ nr, createdAt }: { nr: NormalizedReport; createdAt: string }) {
  const isRich = nr.format === 'rich';
  const isFixed = nr.format === 'fixed_blocks';

  return (
    <>
      {/* Hero card */}
      <div style={{
        background: C.card, border: C.border, borderRadius: 24,
        padding: '1.75rem 2rem', boxShadow: C.shadow, marginBottom: '1rem',
      }}>
        <span style={{
          display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: 20,
          background: '#ede7f6', color: '#5b21b6',
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase' as const, marginBottom: '0.9rem',
        }}>
          {isRich ? 'Mindloom Rich Analysis' : isFixed ? 'Mindloom Analysis' : 'Отчёт Mindloom'}
        </span>

        <h1 style={{
          fontSize: 'clamp(1.35rem, 4vw, 2rem)', fontWeight: 700,
          color: C.text, margin: '0 0 0.5rem', lineHeight: 1.25,
        }}>
          {nr.title ?? 'Отчёт'}
        </h1>

        {nr.participantName && (
          <p style={{ fontSize: '1rem', color: '#555', margin: '0 0 0.85rem', fontWeight: 500 }}>
            {nr.participantName}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {nr.sessionMeta?.language && (
            <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem' }}>
              {nr.sessionMeta.language}
            </span>
          )}
          {nr.sessionMeta?.source && (
            <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem' }}>
              {nr.sessionMeta.source}
            </span>
          )}
          {nr.sessionMeta?.version && (
            <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem' }}>
              v{nr.sessionMeta.version}
            </span>
          )}
          <span style={{ padding: '0.2rem 0.65rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.75rem' }}>
            {fmtDate(createdAt)}
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: '#faf8f4', border: C.border, borderRadius: 16,
        padding: '0.9rem 1.25rem', marginBottom: '1rem',
      }}>
        <p style={{ margin: 0, fontSize: '0.82rem', color: C.muted, lineHeight: 1.55, fontStyle: 'italic' }}>
          Это автоматический аналитический отчёт. Не является медицинским диагнозом и не заменяет консультацию специалиста.
        </p>
      </div>

      {/* Rich summary (object form) */}
      {nr.summaryRich && <RichSummaryCard sr={nr.summaryRich} />}

      {/* Text summary (v1 or fixed_blocks source_summary) */}
      {nr.summaryText && !nr.summaryRich && (
        <div style={{
          background: C.card, border: C.border, borderRadius: 20,
          padding: '1.25rem 1.75rem', boxShadow: C.shadow, marginBottom: '1rem',
        }}>
          <p style={{
            margin: '0 0 0.65rem', fontSize: '0.7rem', fontWeight: 700,
            textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted,
          }}>
            {isFixed ? 'Материал' : 'Краткое резюме'}
          </p>
          <p style={{ margin: 0, fontSize: '1rem', color: '#333', lineHeight: 1.75 }}>
            {nr.summaryText}
          </p>
        </div>
      )}

      {/* Markers */}
      {nr.markers.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{
            margin: '0 0 0.6rem', fontSize: '0.7rem', fontWeight: 700,
            textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted,
            paddingLeft: '0.25rem',
          }}>
            Ключевые маркеры
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {nr.markers.map((m, i) => {
              if (!m) return null;
              const cc = CHIP_COLORS[i % CHIP_COLORS.length];
              return (
                <span key={i} style={{
                  padding: '0.28rem 0.8rem', borderRadius: 20,
                  background: cc.bg, color: cc.color,
                  fontSize: '0.82rem', fontWeight: 500,
                }}>
                  {m}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Fixed blocks (v2 format) */}
      {isFixed && nr.fixedBlocks && (
        <FixedBlocksSection blocks={nr.fixedBlocks} />
      )}

      {/* v1 blocks */}
      {!isFixed && nr.blocks.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{
            margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700,
            textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted,
            paddingLeft: '0.25rem',
          }}>
            Анализ
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {nr.blocks.map((block, i) => (
              <div key={block.id ?? i} style={{
                background: C.card, border: C.border, borderRadius: 20,
                padding: '1.25rem 1.5rem', boxShadow: C.shadow,
              }}>
                {block.title && (
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: C.text, margin: '0 0 0.65rem', lineHeight: 1.3 }}>
                    {block.title}
                  </h2>
                )}
                {block.text && (
                  <p style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.75, margin: '0 0 0.75rem' }}>
                    {block.text}
                  </p>
                )}
                {block.quotes && block.quotes.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: '0 0 0.45rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted }}>
                      Фразы из материала
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {block.quotes.map((q, qi) => (
                        <div key={qi} style={{ padding: '0.5rem 0.9rem', borderLeft: '3px solid #ede7f6', background: '#faf9fb', borderRadius: '0 10px 10px 0' }}>
                          <p style={{ margin: 0, color: '#5b5060', fontStyle: 'italic', fontSize: '0.88rem', lineHeight: 1.55 }}>«{q}»</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {block.recommendations && block.recommendations.length > 0 && (
                  <div>
                    <p style={{ margin: '0 0 0.45rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted }}>
                      Рекомендации
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {block.recommendations.map((rec, ri) => (
                        <div key={ri} style={{ padding: '0.45rem 0.9rem', background: '#f0faf5', border: '1px solid #c8e6d8', borderRadius: 10, fontSize: '0.88rem', color: '#1a4a38', lineHeight: 1.55 }}>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layers (v1 only) */}
      {nr.layers.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: C.muted, paddingLeft: '0.25rem' }}>
            Уровни анализа
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.6rem' }}>
            {nr.layers.map((layer, i) => (
              <div key={i} style={{ background: '#faf9f7', border: C.border, borderRadius: 16, padding: '1rem 1.25rem' }}>
                {layer.name && <p style={{ margin: '0 0 0.3rem', fontWeight: 600, fontSize: '0.88rem', color: C.text }}>{layer.name}</p>}
                {layer.description && <p style={{ margin: 0, fontSize: '0.85rem', color: '#555', lineHeight: 1.6 }}>{layer.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RICH-ONLY SECTIONS ── */}

      {nr.emotionalMap && nr.emotionalMap.length > 0 && (
        <ObjSection label="Эмоциональная карта" items={nr.emotionalMap} />
      )}

      {nr.contextualAnalysis && (
        <ContextualAnalysisSection ca={nr.contextualAnalysis} />
      )}

      {nr.motives && nr.motives.length > 0 && (
        <ObjSection label="Мотивы" items={nr.motives} />
      )}

      {nr.mindloomNodes && nr.mindloomNodes.length > 0 && (
        <ObjSection label="Mindloom — узлы" items={nr.mindloomNodes} />
      )}

      {nr.nodeConflicts && nr.nodeConflicts.length > 0 && (
        <ObjSection label="Конфликты узлов" items={nr.nodeConflicts} />
      )}

      {nr.attentionLevels && nr.attentionLevels.length > 0 && (
        <ObjSection label="Уровни внимания" items={nr.attentionLevels} />
      )}

      {nr.resourceVsDeficit && nr.resourceVsDeficit.length > 0 && (
        <ResourceDeficitSection items={nr.resourceVsDeficit} />
      )}

      {nr.rhetoricalPatterns && nr.rhetoricalPatterns.length > 0 && (
        <ObjSection label="Риторические паттерны" items={nr.rhetoricalPatterns} />
      )}

      {nr.forecast && nr.forecast.length > 0 && (
        <ObjSection label="Прогноз" items={nr.forecast} />
      )}

      {nr.rewrittenHonestText && (
        <RewrittenTextSection text={nr.rewrittenHonestText} />
      )}

      {nr.reflectionQuestions && nr.reflectionQuestions.length > 0 && (
        <ReflectionQuestionsSection questions={nr.reflectionQuestions} />
      )}

      {nr.practice && nr.practice.length > 0 && (
        <PracticeSection items={nr.practice} />
      )}
    </>
  );
}

export default async function ReportPage({ params }: PageProps) {
  const { publicToken } = await params;
  const record = getReportByToken(publicToken);
  if (!record) notFound();

  let payload: unknown = null;
  try {
    payload = JSON.parse(record.raw_payload_json);
  } catch {
    // invalid JSON in DB — will show fallback
  }

  const v2 = normalizeMindloomReportV2(payload);
  const nr = normalizeMindloomReport(payload);
  const hasV2Content =
    !!v2 &&
    (v2.hero.title !== null ||
      v2.hero.main_insight !== null ||
      v2.source.source_summary !== null ||
      v2.active_nodes.length > 0 ||
      v2.recommended_practices.length > 0);
  const hasContent =
    nr.format !== 'unknown' &&
    (nr.title !== null ||
      nr.summaryText !== null ||
      nr.summaryRich !== null ||
      nr.blocks.length > 0 ||
      nr.markers.length > 0 ||
      nr.emotionalMap !== null ||
      nr.motives !== null ||
      nr.reflectionQuestions !== null ||
      nr.fixedBlocks !== null);
  const usesV2Dashboard = isMindloomReportV2(payload) && !!v2 && hasV2Content;
  const pageMaxWidth = usesV2Dashboard ? 560 : 720;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, padding: '2rem 1.25rem' }}>
      <div style={{ maxWidth: pageMaxWidth, margin: '0 auto', overflowX: 'clip' }}>

        {usesV2Dashboard ? (
          <ReportV2Dashboard report={v2} createdAt={record.created_at} />
        ) : hasContent ? (
          <ReportStructured nr={nr} createdAt={record.created_at} />
        ) : (
          <div style={{
            background: C.card, border: C.border, borderRadius: 20,
            padding: '3rem 2rem', textAlign: 'center', boxShadow: C.shadow,
            marginBottom: '1rem',
          }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '1.1rem', color: C.text }}>
              Отчёт получен и сохранён
            </p>
            <p style={{ margin: 0, color: C.muted, fontSize: '0.9rem', lineHeight: 1.5 }}>
              Структура отчёта отличается от стандартных поддерживаемых схем Mindloom.
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e8e3db', textAlign: 'center', marginTop: '0.5rem', display: usesV2Dashboard ? 'none' : 'block' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#c5c0bb' }}>
            Mindloom{v2?.meta.schema_version ? ` · schema ${v2.meta.schema_version}` : nr.schemaVersion ? ` · schema ${nr.schemaVersion}` : ''}
          </p>
        </div>

      </div>
    </div>
  );
}
