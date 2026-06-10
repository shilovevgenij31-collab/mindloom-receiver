'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type {
  MindloomReportV2,
  MindloomReportV2GraphNode,
  MindloomReportV2HeatmapZone,
  MindloomReportV2Node,
  MindloomReportV2HonestTranslation,
  MindloomReportV2PhraseFragment,
  MindloomReportV2PhraseMicroscope,
  MindloomReportV2ProtectedNeed,
  MindloomReportV2Snapshot,
} from '@/lib/normalize-report';

// ── Visual System Tokens ──────────────────────────────────────────────────────
// Unified design constants — applied across all sections for consistency.
const VS = {
  r: { hero: 32, xl: 28, lg: 24, md: 20, sm: 16, row: 14, chip: 999 } as const,
  shadow: {
    card: '0 2px 10px rgba(70,53,35,0.048), 0 6px 22px rgba(70,53,35,0.038)',
    panel: '0 4px 16px rgba(70,53,35,0.052), 0 14px 44px rgba(70,53,35,0.056)',
  } as const,
  text: {
    eyebrow: '#90847a' as const,
    muted: '#7d746b' as const,
    body: '#3e3832' as const,
  } as const,
} as const;

// ── Types & helpers ───────────────────────────────────────────────────────────

type Tone = 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';

type DetailSheetType = 'heatmap-node' | 'graph-node' | 'graph-edge' | 'evidence-node' | 'layer' | 'marker';

interface DetailSheetState {
  type: DetailSheetType;
  title: string;
  eyebrow: string;
  tone?: Tone | 'beige';
  percent?: number | null;
  description?: string | null;
  explanation?: string | null;
  why?: string | null;
  evidence?: string[];
  tags?: string[];
  badge?: string | null;
  note?: string | null;
  rows?: Array<{ label: string; text?: string | null }>;
  edgeType?: string;
  strength?: number | null;
}

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(iso));
  } catch { return iso; }
}

function SnapshotSectionExact({ snap }: { snap: NonNullable<MindloomReportV2['snapshot']> }) {
  const { three_signals, first_step } = snap;
  const hasContent = three_signals.length > 0 || has(first_step);
  if (!hasContent) return null;
  return (
    <SectionShell title="Где это видно" icon="spark" intro="Этот блок показывает конкретные признаки из материала, по которым заметен главный паттерн.">
      <SharedPanel padding="1.18rem 1rem">
        {three_signals.length > 0 && (
          <div>
            <SmallLabel>Три признака</SmallLabel>
            <div style={{ display: 'grid', gap: '0.42rem', marginTop: '0.5rem' }}>
              {three_signals.map((sig, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.72rem' }}>
                  <div style={{ width: 28, textAlign: 'right', fontSize: 17, lineHeight: 1, fontWeight: 720, color: '#e46f61' }}>{String(i + 1)}</div>
                  <div style={{ width: 1, height: 20, background: 'rgba(118,92,68,0.14)' }} />
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#2e2820', lineHeight: 1.4, fontWeight: 550 }}>{sanitizeUserText(sig) ?? sig}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </SharedPanel>
      {has(first_step) && (
        <div style={{ marginTop: '0.75rem', borderRadius: 22, padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'linear-gradient(135deg, #edf9f3, #e3f2eb)', border: '1px solid rgba(104,169,141,0.28)' }}>
          <MLIcon name="leaf" tone="green" size={18} />
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#3f6e5a' }}>Что можно начать замечать</div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '14px', fontWeight: 650, color: '#201d1b', lineHeight: 1.4 }}>{sanitizeUserText(first_step) ?? first_step}</p>
            <p style={{ margin: '0.4rem 0 0', fontSize: '11.5px', color: '#4a7a62', lineHeight: 1.5 }}>Не нужно менять всё сразу. Начните замечать момент, когда паттерн включается автоматически.</p>
          </div>
        </div>
      )}
    </SectionShell>
  );
}

function GrowthBlockerSectionExact({ report }: { report: MindloomReportV2 }) {
  const quote = report.phrase_microscope?.quote ?? report.speech_layer.key_phrases[0] ?? report.target.central_knot ?? report.target.growth_blocker ?? report.hero.title;
  const blocker = report.target.growth_blocker ?? report.target.core_pain ?? report.target.central_knot;
  const repeat = report.mechanism.protective_logic ?? report.mechanism.hidden_gain ?? report.mechanism.perceived_threat ?? report.mechanism.cost;
  const systemGoal = report.desired_state.explicit_request ?? report.desired_state.hidden_request ?? report.desired_state.future_state;
  if (!has(quote) && !has(blocker) && !has(repeat) && !has(systemGoal)) return null;
  return (
    <SectionShell title="Что поддерживает паттерн" icon="target" intro="Здесь показано, из-за чего паттерн включается, что он помогает почувствовать на короткое время и куда можно двигаться дальше.">
      {has(quote) && (
        <div style={{ borderRadius: 28, padding: '1.2rem 1.1rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #fff4f1 0%, #fff8e8 100%)', border: '1px solid rgba(228,111,97,0.13)' }}>
          <div style={{ position: 'absolute', top: 14, right: 16, color: 'rgba(228,111,97,0.28)' }}>
            <MLIcon name="quote" tone="red" size={18} />
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#a8392c' }}>Ключевая фраза</div>
          <div style={{ marginTop: 8, fontSize: '19px', fontWeight: 720, lineHeight: 1.2, color: '#201d1b' }}>{`«${quote}»`}</div>
        </div>
      )}
      <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.6rem' }}>
        {has(blocker) && (
          <div style={{ gridColumn: '1 / -1', borderRadius: VS.r.md, padding: '1rem', display: 'flex', gap: '0.72rem', alignItems: 'flex-start', background: '#fff4f1', border: '1px solid rgba(228,111,97,0.15)' }}>
            <MLIcon name="warning" tone="red" size={16} />
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#a8392c' }}>Что включает паттерн</div>
              <div style={{ marginTop: 4, fontSize: '14px', fontWeight: 650, lineHeight: 1.45, color: '#3a241d' }}>{sanitizeUserText(blocker)}</div>
            </div>
          </div>
        )}
        {has(repeat) && (
          <div style={{ borderRadius: VS.r.md, padding: '1rem', background: '#f5f3ff', border: '1px solid rgba(127,104,217,0.16)' }}>
            <MLIcon name="cycle" tone="purple" size={16} />
            <div style={{ marginTop: '0.5rem', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#4d3aa6' }}>Что помогает почувствовать</div>
            <div style={{ marginTop: 5, fontSize: '12.5px', lineHeight: 1.6, color: '#4a4060' }}>{sanitizeUserText(repeat)}</div>
          </div>
        )}
        {has(systemGoal) && (
          <div style={{ borderRadius: VS.r.md, padding: '1rem', background: 'linear-gradient(135deg, #eef9f4, #e6f3ec)', border: '1px solid rgba(104,169,141,0.20)' }}>
            <MLIcon name="compass" tone="green" size={16} />
            <div style={{ marginTop: '0.5rem', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#3f6e5a' }}>Куда можно двигаться</div>
            <div style={{ marginTop: 5, fontSize: '12.5px', lineHeight: 1.6, color: '#315a49' }}>{sanitizeUserText(systemGoal)}</div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

function ProtectedNeedSectionExact({ pn }: { pn: NonNullable<MindloomReportV2['protected_need']> }) {
  const { title, description, named, strategy_gets, sacrificed, leading_need, interpretation } = pn;
  return (
    <SectionShell title={title ?? 'Что паттерн может защищать'} icon="shield" intro="Этот блок помогает понять, какая потребность может стоять за паттерном и к чему приводит привычный способ справляться.">
      {has(leading_need) && (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, padding: '1rem', background: 'linear-gradient(140deg, #eef7ff 0%, #eef9f4 100%)', border: '1px solid rgba(74,149,211,0.16)' }}>
          <div style={{ position: 'absolute', top: -36, right: -24, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,149,211,0.14), transparent 70%)', filter: 'blur(8px)' }} />
          <div style={{ position: 'relative', display: 'flex', gap: '0.78rem', alignItems: 'flex-start' }}>
            <MLIcon name="shield" tone="blue" size={18} />
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#2a5a85' }}>Ведущая потребность</div>
              <div style={{ marginTop: 4, fontSize: 21, fontWeight: 720, lineHeight: 1.16, letterSpacing: '-0.02em' }}>{leading_need}</div>
              {has(description) && <p style={{ margin: '0.45rem 0 0', fontSize: '13px', lineHeight: 1.55, color: '#5d6a73' }}>{description}</p>}
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gap: '0.7rem', marginTop: '0.75rem' }}>
        <TagGroup label="Что слышно в вашей речи" tone="blue" icon="speech" items={named} />
        <TagGroup label="Что это помогает почувствовать" tone="yellow" icon="target" items={strategy_gets} />
        <TagGroup label="К чему это приводит" tone="red" icon="warning" items={sacrificed} />
      </div>
      {has(interpretation) && (
        <div style={{ marginTop: '0.9rem', paddingInline: '0.1rem', fontSize: '13.5px', lineHeight: 1.6, color: '#7d746b', fontStyle: 'italic' }}>
          <span style={{ display: 'inline-block', width: 18, height: 1, background: '#e46f61', verticalAlign: 'middle', marginRight: 8 }} />
          {sanitizeUserText(interpretation)}
        </div>
      )}
    </SectionShell>
  );
}

function PhraseMicroscopeSectionExact({ pm }: {
  pm?: MindloomReportV2['phrase_microscope'];
}) {
  if (!pm) return null;
  const visibleFragments = pm.fragments.slice(0, 3);
  return (
    <SectionShell title="Что слышно в этой фразе" icon="quote" intro="Здесь одна фраза разбирается на части, чтобы показать, как в ней проявляется паттерн.">
      {has(pm.quote) && <PhraseQuoteHighlight quote={pm.quote} />}
      <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#7d746b' }}>
        <MLIcon name="brain" tone="purple" size={14} />
        Фрагменты речи · {visibleFragments.length || 1}
      </div>
      {visibleFragments.length > 0 && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {visibleFragments.map((frag, i) => {
            const accent = i === 0 ? '#e46f61' : i === 1 ? '#7f68d9' : '#e4a634';
            const bg = i === 0 ? '#fff6f4' : i === 1 ? '#f5f3ff' : '#fffbef';
            const border = i === 0 ? 'rgba(228,111,97,0.13)' : i === 1 ? 'rgba(127,104,217,0.13)' : 'rgba(228,166,52,0.13)';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 0.85rem', borderRadius: 18, background: bg, border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.38rem', width: 28, flexShrink: 0, paddingTop: 2 }}>
                  <div style={{ width: 3, height: 28, borderRadius: 999, background: accent }} />
                  <div style={{ fontSize: 11, fontWeight: 740, color: '#7d746b' }}>{String(i + 1)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {has(frag.text) && <div style={{ fontSize: '13.5px', fontWeight: 660, lineHeight: 1.35, color: '#201d1b' }}>{`«${frag.text}»`}</div>}
                  {[frag.meaning, frag.pattern, frag.explanation].filter(has).length > 0 && (
                    <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {[frag.meaning, frag.pattern, frag.explanation].filter(has).map((item, j) => (
                        <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '13px', color: '#3a3228', lineHeight: 1.55 }}>
                          <div style={{ width: 6, height: 6, borderRadius: 999, background: accent, flexShrink: 0, marginTop: '0.45em' }} />
                          <span>{sanitizeUserText(item) ?? item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {has(pm.summary ?? undefined) && (
        <div style={{ marginTop: '0.75rem', borderRadius: 18, padding: '0.9rem 1rem', background: '#fbf5ec', border: '1px solid rgba(118,92,68,0.14)', color: '#5d564f', fontSize: '13px', lineHeight: 1.6 }}>
          {sanitizeUserText(pm.summary) ?? pm.summary}
        </div>
      )}
    </SectionShell>
  );
}

function HonestTranslationSectionExact({ ht }: { ht: NonNullable<MindloomReportV2['honest_translation']> }) {
  if (ht.items.length === 0) return null;
  const visible = ht.items.slice(0, 2);
  return (
    <SectionShell title="Фразы и возможный смысл" icon="speech" intro="Здесь привычные фразы переводятся в возможный внутренний смысл. Это не точный перевод, а версия для проверки.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {visible.map((item, i) => (
          <div key={i} style={{ borderRadius: VS.r.lg, overflow: 'hidden', border: '1px solid rgba(118,92,68,0.13)', background: '#fffdf8', boxShadow: VS.shadow.card }}>
            <div className="mlm-translation-row" style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.7rem', background: '#faf6ef' }}>
              <div className="mlm-translation-label" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#7d746b', flexShrink: 0, marginTop: 3 }}>Фраза</div>
              {has(item.as_said) && <div style={{ fontSize: '14px', color: '#7d746b', lineHeight: 1.58, fontStyle: 'italic' }}>{`«${item.as_said}»`}</div>}
            </div>
            <div style={{ position: 'relative', height: 0 }}>
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: -12, width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', background: '#edf9f3', border: '1px solid rgba(104,169,141,0.25)', color: '#68a98d', fontSize: 11, opacity: 0.82 }}>↓</div>
            </div>
            <div className="mlm-translation-row" style={{ padding: '1.1rem 1rem 0.95rem', display: 'flex', alignItems: 'flex-start', gap: '0.7rem', background: 'linear-gradient(135deg, #edf9f3, #e3f2eb)' }}>
              <div className="mlm-translation-label" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#3f6e5a', flexShrink: 0, marginTop: 3 }}>Что может за этим стоять</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {has(item.more_honest) && <div style={{ fontSize: '13.5px', fontWeight: 620, color: '#1e3e30', lineHeight: 1.58 }}>{sanitizeUserText(item.more_honest) ?? item.more_honest}</div>}
                {has(item.explanation) && item.explanation !== item.more_honest && item.explanation.trim().toLowerCase() !== item.more_honest?.trim().toLowerCase() && (
                  <div style={{ marginTop: 7, fontSize: '12px', color: '#5f7369', lineHeight: 1.55, borderTop: '1px solid rgba(104,169,141,0.18)', paddingTop: 7 }}>{sanitizeUserText(item.explanation) ?? item.explanation}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function fmtPct(v: number | null | undefined): string {
  const percent = normalizePercent(v);
  if (percent == null) return '—';
  return `${Math.round(percent)}%`;
}

function clampInt(v: number | null | undefined): number {
  const percent = normalizePercent(v);
  if (percent == null) return 0;
  return Math.round(percent);
}

function has(v: string | null | undefined): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function normalizePercent(v: number | null | undefined): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  const scaled = v <= 1 ? v * 100 : v;
  return Math.max(0, Math.min(100, scaled));
}

function firstNonEmpty(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (has(value)) return value.trim();
  }
  return null;
}

function uniqueStrings(items: Array<string | null | undefined>, limit?: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (!has(item)) continue;
    const value = item.trim();
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (typeof limit === 'number' && out.length >= limit) break;
  }
  return out;
}

function softClampText(text: string | null | undefined, max = 180): string | null {
  if (!has(text)) return null;
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function sanitizeUserText(text: string | null | undefined): string | null {
  if (!has(text)) return null;
  return text
    // "Система привыкла/привык X" → "Вы можете X"
    .replace(/(?<![а-яёА-ЯЁ])[Сс]истема привык[а-яёА-ЯЁ]*/g, m => m[0] === 'С' ? 'Вы можете' : 'вы можете')
    // "Паттерн привыкла/привык X" → "Вы можете X"
    .replace(/(?<![а-яёА-ЯЁ])[Пп]аттерн привык[а-яёА-ЯЁ]*/g, m => m[0] === 'П' ? 'Вы можете' : 'вы можете')
    // Full-phrase copy fixes (must come before general replacements)
    .replace(/[Сс]истема воспринимает зависимость и поддержку как риск слабости\.?/g, 'Просить помощь ощущается слишком уязвимо и небезопасно.')
    .replace(/[Сс]истема заранее предполагает ухудшение[^.]*\./g, 'Расслабление кажется небезопасным.')
    .replace(/[Аа]втоматическая связка между отдыхом и потерей ценности\.?/g, 'Отдых начинает восприниматься как риск потерять ценность.')
    .replace(/[Аа]втоматическая связка между[^.]*\./g, m => {
      const rest = m.replace(/^[Аа]втоматическая связка между\s*/i, '');
      return (m[0] === 'А' ? 'Внутренняя связь: ' : 'внутренняя связь: ') + rest;
    })
    // "Текущая стратегия" / "Эта стратегия" → human wording
    .replace(/[Тт]екущая стратегия/g, m => m[0] === 'Т' ? 'Привычный способ' : 'привычный способ')
    .replace(/[Ээ]та стратегия/g, m => m[0] === 'Э' ? 'Этот способ' : 'этот способ')
    .replace(/[Сс]тратегия/g, m => m[0] === 'С' ? 'Способ' : 'способ')
    // Compound Mindloom system terms (before single-word replacements)
    .replace(/[Аа]ктивные узлы/g, m => m[0] === 'А' ? 'Активные темы' : 'активные темы')
    .replace(/[Gg]лавный перегрев/gi, 'самый заметный паттерн')
    .replace(/[Гг]лавный перегрев/g, m => m[0] === 'Г' ? 'Самый заметный паттерн' : 'самый заметный паттерн')
    // узел/узлы forms → тема/темы
    .replace(/(?<![а-яёА-ЯЁ])([Уу])злами(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'У' ? 'Темами' : 'темами')
    .replace(/(?<![а-яёА-ЯЁ])([Уу])злом(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'У' ? 'Темой' : 'темой')
    .replace(/(?<![а-яёА-ЯЁ])([Уу])злу(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'У' ? 'Теме' : 'теме')
    .replace(/(?<![а-яёА-ЯЁ])([Уу])зла(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'У' ? 'Темы' : 'темы')
    .replace(/(?<![а-яёА-ЯЁ])([Уу])злов(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'У' ? 'Тем' : 'тем')
    .replace(/(?<![а-яёА-ЯЁ])([Уу])злы(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'У' ? 'Темы' : 'темы')
    .replace(/(?<![а-яёА-ЯЁ])([Уу])зел(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'У' ? 'Тема' : 'тема')
    .replace(/[Сс]лои обработки/g, m => m[0] === 'С' ? 'Уровни' : 'уровни')
    .replace(/[Сс]лой обработки/g, m => m[0] === 'С' ? 'Уровень' : 'уровень')
    .replace(/[Сс]мысловые точки/g, m => m[0] === 'С' ? 'Повторяющиеся фразы' : 'повторяющиеся фразы')
    .replace(/[Сс]мысловая точка/g, m => m[0] === 'С' ? 'Повторяющаяся фраза' : 'повторяющаяся фраза')
    .replace(/[Рр]ечевые признаки/g, m => m[0] === 'Р' ? 'Фразы из материала' : 'фразы из материала')
    .replace(/[Рр]ечевой признак/g, m => m[0] === 'Р' ? 'Фраза из материала' : 'фраза из материала')
    .replace(/[Вв]ыраженность/g, m => m[0] === 'В' ? 'Насколько сильно это проявилось' : 'насколько сильно это проявилось')
    // "внутренняя система" → "внутренний механизм" (must come before general система rule)
    .replace(/[Вв]нутренняя система/g, m => m[0] === 'В' ? 'Внутренний механизм' : 'внутренний механизм')
    .replace(/[Вв]нутренней системы/g, m => m[0] === 'В' ? 'Внутреннего механизма' : 'внутреннего механизма')
    .replace(/[Вв]нутренней системе/g, m => m[0] === 'В' ? 'Внутреннему механизму' : 'внутреннему механизму')
    .replace(/[Вв]нутреннюю систему/g, m => m[0] === 'В' ? 'Внутренний механизм' : 'внутренний механизм')
    .replace(/[Вв]нутренней системой/g, m => m[0] === 'В' ? 'Внутренним механизмом' : 'внутренним механизмом')
    // General система → паттерн replacements
    .replace(/(?<![а-яёА-ЯЁ])([Сс])истема(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'С' ? 'Паттерн' : 'паттерн')
    .replace(/(?<![а-яёА-ЯЁ])([Сс])истемы(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'С' ? 'Паттерна' : 'паттерна')
    .replace(/(?<![а-яёА-ЯЁ])([Сс])истеме(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'С' ? 'Паттерне' : 'паттерне')
    .replace(/(?<![а-яёА-ЯЁ])([Сс])истему(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'С' ? 'Паттерн' : 'паттерн')
    .replace(/(?<![а-яёА-ЯЁ])([Сс])истемой(?![а-яёА-ЯЁ])/g, (_m, cap) => cap === 'С' ? 'Паттерном' : 'паттерном')
    .replace(/[Аа]втоматическая связка/g, m => m[0] === 'А' ? 'Внутренняя связь' : 'внутренняя связь')
    // Strip redundant disclaimer sentences from body text
    .replace(/\s*Это не диагноз и не медицинская оценка\.\s*/g, ' ')
    .replace(/\s*Это гипотеза по вашему материалу\.\s*/g, ' ')
    .replace(/\s*Это самый заметный повторяющийся паттерн в материале\.\s*/g, ' ')
    .trim();
}

function humanizeGraphTitle(title: string | null | undefined): string {
  if (!has(title)) return 'Как темы усиливают друг друга';
  const lower = title.toLowerCase();
  if (lower.includes('граф') || lower.includes('причинно') || lower.includes('следственн')) {
    return 'Как темы усиливают друг друга';
  }
  return title;
}

function getStrongestNode(activeNodes: MindloomReportV2Node[]): MindloomReportV2Node | null {
  return activeNodes.find((node) => has(node.label) || has(node.description) || node.intensity != null) ?? null;
}

function getStrongestZone(report: MindloomReportV2): MindloomReportV2HeatmapZone | null {
  return [...report.heatmap.zones]
    .filter((zone) => has(zone.label) || has(zone.description) || zone.intensity != null)
    .sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0))[0] ?? null;
}

function collectSpeechPhrases(report: MindloomReportV2): string[] {
  return uniqueStrings([
    ...report.speech_layer.key_phrases,
    ...report.speech_layer.speech_patterns.flatMap((item) => [item.pattern, item.description, ...item.evidence]),
    report.phrase_microscope?.quote ?? null,
    report.target.growth_blocker,
    report.target.central_knot,
    report.hero.title,
  ]);
}

function collectDirectPhrases(report: MindloomReportV2): string[] {
  return uniqueStrings([
    ...report.speech_layer.key_phrases,
    ...report.speech_layer.speech_patterns.flatMap((item) => item.evidence),
    report.phrase_microscope?.quote ?? null,
  ]);
}

function collectAnalyticalThemes(report: MindloomReportV2): string[] {
  const direct = new Set(collectDirectPhrases(report).map(s => s.toLowerCase().trim()));
  return uniqueStrings([
    ...report.speech_layer.speech_patterns.map(item => item.pattern),
    report.target.growth_blocker,
    report.target.central_knot,
  ]).filter(s => {
    const lower = s.toLowerCase().trim();
    return !direct.has(lower) && s.split(/\s+/).length <= 8;
  });
}

function inferNeedLabel(report: MindloomReportV2, activeNodes: MindloomReportV2Node[], layers: MindloomReportV2['mindloom_layers']): string | null {
  const layerNeed = layers.find((layer) => {
    const lower = layer.layer?.toLowerCase() ?? '';
    return lower.includes('need') || lower.includes('unmet') || lower.includes('потреб');
  })?.layer;
  if (has(layerNeed)) return layerNeed;
  const nodeNeed = activeNodes.find((node) => {
    const lower = `${node.type ?? ''} ${node.label ?? ''}`.toLowerCase();
    return lower.includes('need') || lower.includes('value') || lower.includes('потреб') || lower.includes('ценност');
  })?.label;
  return firstNonEmpty(nodeNeed);
}

function buildSnapshotFallback(report: MindloomReportV2, activeNodes: MindloomReportV2Node[]): MindloomReportV2Snapshot | null {
  const strongestNode = getStrongestNode(activeNodes);
  const strongestZone = getStrongestZone(report);
  const keyPattern = firstNonEmpty(
    report.hero.title,
    report.target.growth_blocker,
    report.target.central_knot,
    strongestNode?.label,
  );
  const shortExplanation = firstNonEmpty(
    report.hero.main_insight,
    report.hero.one_sentence_summary,
    report.target.short_explanation,
    report.mechanism.protective_logic,
    strongestNode?.description,
  );
  const threeSignals = uniqueStrings([
    ...collectSpeechPhrases(report).slice(0, 3),
    report.target.growth_blocker ? `Включает паттерн: ${report.target.growth_blocker}` : null,
    report.mechanism.protective_logic ? `Почему повторяется: ${report.mechanism.protective_logic}` : null,
    report.desired_state.explicit_request ? `Куда двигаться: ${report.desired_state.explicit_request}` : null,
  ], 3);
  const overheatScore = strongestNode?.intensity ?? strongestZone?.intensity ?? report.processing_dashboard.overheat_level ?? null;
  const mainOverheat = overheatScore != null || has(strongestNode?.label) || has(strongestZone?.label)
    ? {
        label: firstNonEmpty(strongestNode?.label, strongestZone?.label, report.processing_dashboard.priority) ?? undefined,
        score: overheatScore,
        explanation: firstNonEmpty(strongestNode?.description, strongestZone?.description, report.target.short_explanation) ?? undefined,
      }
    : null;
  const firstStep = firstNonEmpty(
    report.desired_state.future_state,
    report.desired_state.explicit_request,
    report.recommended_practices[0]?.purpose,
    report.recommended_practices[0]?.title,
  );

  if (!keyPattern && !shortExplanation && threeSignals.length === 0 && !mainOverheat && !firstStep) return null;
  return {
    key_pattern: keyPattern,
    short_explanation: shortExplanation,
    three_signals: threeSignals,
    main_overheat: mainOverheat,
    first_step: firstStep,
  };
}

function buildProtectedNeedFallback(
  report: MindloomReportV2,
  activeNodes: MindloomReportV2Node[],
  layers: MindloomReportV2['mindloom_layers'],
): MindloomReportV2ProtectedNeed | null {
  const leadingNeed = inferNeedLabel(report, activeNodes, layers);
  const named = uniqueStrings([
    activeNodes.find((node) => (node.label ?? '').toLowerCase().includes('автоном'))?.label,
    activeNodes.find((node) => (node.label ?? '').toLowerCase().includes('близ'))?.label,
    activeNodes.find((node) => (node.label ?? '').toLowerCase().includes('досто'))?.label,
  ], 3);
  const strategyGets = uniqueStrings([
    report.mechanism.hidden_gain,
    report.mechanism.protective_logic,
    report.mechanism.perceived_threat ? 'безопасность' : null,
  ], 3);
  const sacrificed = uniqueStrings([
    report.mechanism.cost,
    report.target.growth_blocker ? 'отдых' : null,
    report.desired_state.future_state ? 'ясность' : null,
  ], 3);
  const description = firstNonEmpty(report.target.short_explanation, report.hero.one_sentence_summary);
  const interpretation = firstNonEmpty(
    report.target.short_explanation,
    report.mechanism.protective_logic,
    report.mechanism.hidden_gain,
  );
  if (!leadingNeed && named.length === 0 && strategyGets.length === 0 && sacrificed.length === 0 && !interpretation) return null;
  return {
    title: 'Что паттерн может защищать',
    description,
    named,
    strategy_gets: strategyGets,
    sacrificed,
    leading_need: leadingNeed,
    interpretation,
  };
}

function inferPhraseFragments(report: MindloomReportV2, quote: string): MindloomReportV2PhraseFragment[] {
  const fromPatterns = report.speech_layer.speech_patterns
    .map((item) => ({
      text: firstNonEmpty(item.pattern, item.evidence[0]) ?? undefined,
      meaning: item.pattern ?? undefined,
      pattern: item.description ?? undefined,
      explanation: item.evidence[0] ?? undefined,
    }))
    .filter((item) => has(item.text) || has(item.meaning) || has(item.pattern))
    .slice(0, 3);
  if (fromPatterns.length > 0) return fromPatterns;

  const lower = quote.toLowerCase();
  const heuristics: MindloomReportV2PhraseFragment[] = [];
  if (lower.includes('контрол')) {
    heuristics.push({ text: 'контроль', meaning: 'контроль как защита', pattern: 'Тревога снижается через постоянное управление и контроль.' });
  }
  if (lower.includes('останов') || lower.includes('пауз') || lower.includes('отдых')) {
    heuristics.push({ text: 'остановка / пауза', meaning: 'страх потери опоры', pattern: 'Пауза переживается как угроза, а не как восстановление.' });
  }
  if (lower.includes('долж') || lower.includes('обязан') || lower.includes('сам')) {
    heuristics.push({ text: 'должен / сам', meaning: 'гиперответственность', pattern: 'Внутреннее давление не даёт делегировать и отпускать.' });
  }
  return heuristics.slice(0, 3);
}

function buildPhraseMicroscopeFallback(
  report: MindloomReportV2,
  activeNodes: MindloomReportV2Node[],
): MindloomReportV2PhraseMicroscope | null {
  const strongestNode = getStrongestNode(activeNodes);
  const quote = firstNonEmpty(
    collectSpeechPhrases(report)[0],
    strongestNode?.evidence[0],
    report.target.growth_blocker,
    report.target.central_knot,
  );
  if (!quote) return null;
  const fragments = inferPhraseFragments(report, quote);
  return {
    title: 'Что слышно в этой фразе',
    quote,
    why_this_quote: firstNonEmpty(report.target.short_explanation, report.mechanism.protective_logic),
    fragments,
    summary: firstNonEmpty(report.target.short_explanation, report.mechanism.protective_logic, report.mechanism.hidden_gain),
  };
}

function buildHonestTranslationFallback(
  report: MindloomReportV2,
  phraseMicroscope: MindloomReportV2PhraseMicroscope | null,
): MindloomReportV2HonestTranslation | null {
  const desired = firstNonEmpty(
    report.desired_state.explicit_request,
    report.desired_state.future_state,
    report.recommended_practices[0]?.purpose,
    report.recommended_practices[0]?.title,
  );
  const items = uniqueStrings([
    phraseMicroscope?.quote,
    ...collectSpeechPhrases(report).slice(0, 2),
  ], 2).map((phrase, index) => {
    const lower = phrase.toLowerCase();
    let moreHonest = desired ?? 'Мне нужна опора, а не ещё больше внутреннего давления.';
    if (lower.includes('сам') || lower.includes('долж') || lower.includes('тянуть')) {
      moreHonest = desired ?? 'Мне нужна опора, и я могу не держать всё в одиночку.';
    } else if (lower.includes('останов') || lower.includes('пауза') || lower.includes('отдых')) {
      moreHonest = desired ?? 'Пауза не равна провалу; часть процессов может выдержать без моего постоянного контроля.';
    }
    return {
      as_said: phrase,
      more_honest: moreHonest,
      explanation: index === 0 ? firstNonEmpty(report.mechanism.protective_logic, report.target.short_explanation) ?? undefined : undefined,
    };
  });
  if (items.length === 0) return null;
  return { title: 'Фразы и возможный смысл', items };
}

function accentHeroTitle(title: string): React.ReactNode {
  if (!title) return title;
  const parts = title.split(/(ценн\w*)/gi);
  if (parts.length === 1) return title;
  return parts.map((part, i) => {
    if (/^ценн\w*$/i.test(part)) {
      return (
        <span
          key={i}
          style={{
            background: 'linear-gradient(110deg, #c9655a, #a84038)',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function toneFromColor(color?: string): Tone {
  if (color === 'red' || color === 'yellow' || color === 'green' ||
      color === 'blue' || color === 'purple' || color === 'gray') return color;
  return 'gray';
}

function toneHex(t: Tone): string {
  switch (t) {
    case 'red':    return '#c95b52';
    case 'yellow': return '#c98222';
    case 'green':  return '#5f9f7e';
    case 'blue':   return '#477dc2';
    case 'purple': return '#6f56c7';
    default:       return '#a87855';
  }
}

function graphNodePalette(t: Tone): { light: string; base: string; deep: string; text: string; glow: string } {
  switch (t) {
    case 'red':
      return { light: '#efa29a', base: '#e27b70', deep: '#c85d53', text: '#301d19', glow: '226,123,112' };
    case 'yellow':
      return { light: '#f4cf84', base: '#e5a84c', deep: '#c77f25', text: '#332211', glow: '229,168,76' };
    case 'green':
      return { light: '#bee0cf', base: '#8fc8ad', deep: '#5f9f7e', text: '#163125', glow: '143,200,173' };
    case 'blue':
      return { light: '#b3cdeb', base: '#7ca7dd', deep: '#4f82c4', text: '#15263d', glow: '124,167,221' };
    case 'purple':
      return { light: '#c2b3ee', base: '#9178df', deep: '#6f56c8', text: '#211838', glow: '145,120,223' };
    default:
      return { light: '#dfbea0', base: '#c99a76', deep: '#a87855', text: '#2f241d', glow: '201,154,118' };
  }
}

function graphEdgeStyle(type?: string): { color: string; strokeWidth: number; opacity: number; dasharray?: string; marker: boolean } {
  switch (type) {
    case 'hard':
      return { color: '#b84840', strokeWidth: 0.62, opacity: 0.84, marker: true };
    case 'choice_blocked':
      return { color: '#b05850', strokeWidth: 0.50, opacity: 0.74, marker: true };
    case 'soft':
      return { color: '#a07c30', strokeWidth: 0.30, opacity: 0.50, dasharray: '2.5 5', marker: false };
    case 'choice_available':
      return { color: '#3d8c60', strokeWidth: 0.34, opacity: 0.56, dasharray: '2 5', marker: true };
    case 'normal':
    default:
      return { color: '#6656a8', strokeWidth: 0.46, opacity: 0.68, marker: true };
  }
}

function resolveGraphEdgeType(type: string | undefined, strength: number | null | undefined): string {
  if (has(type)) return type;
  const value = typeof strength === 'number' ? strength : 0;
  if (value >= 0.82) return 'hard';
  if (value >= 0.68) return 'normal';
  if (value >= 0.52) return 'choice_available';
  return 'soft';
}

function graphSemanticSlot(label: string, type?: string): 'belief' | 'trigger' | 'support' | 'pattern' | 'body' | 'extra' {
  const lower = label.toLowerCase();
  if (lower.includes('вина') || lower.includes('guilt') || lower.includes('trigger') || lower.includes('отдых')) return 'trigger';
  if (lower.includes('ценност') || lower.includes('value') || lower.includes('belief') || lower.includes('убежд')) return 'belief';
  if (lower.includes('выгод') || lower.includes('benefit') || lower.includes('gain') || lower.includes('незамен')) return 'support';
  if (lower.includes('перегруз') || lower.includes('overload') || lower.includes('pattern') || lower.includes('паттерн')) return 'pattern';
  if (lower.includes('тело') || lower.includes('телес') || lower.includes('body') || lower.includes('somatic')) return 'body';
  if (type === 'body' || type === 'somatic') return 'body';
  if (type === 'belief' || type === 'value') return 'belief';
  if (type === 'trigger') return 'trigger';
  if (type === 'resource' || type === 'gain') return 'support';
  return 'extra';
}

function getShortLabel(label: string | null | undefined): string {
  if (!label) return '';
  const cleaned = label.trim();
  const lower = cleaned.toLowerCase();
  if (lower.includes('гиперконтрол')) return 'Контроль';
  if (lower.includes('вина')) return 'Вина';
  if (lower.includes('ценность')) return 'Ценность';
  if (lower.includes('телес') || lower.includes('тело')) return 'Тело';
  if (lower.includes('выгода')) return 'Выгода';
  if (lower.includes('перегруз')) return 'Перегрузка';
  if (lower.includes('отдых')) return 'Отдых';
  const words = cleaned.split(/\s+/);
  if (words.length <= 1) return cleaned;
  const first = words[0];
  return first.length <= 13 ? first : first.slice(0, 12) + '…';
}

function phraseSemantic(phrase: string): { bg: string; border: string; text: string } {
  const lower = phrase.toLowerCase();
  if (/контрол|вина|обязан|долж|страх|тревог|нельз|запрет|критик/.test(lower)) {
    return { bg: '#fff0ec', border: 'rgba(228,111,97,0.28)', text: '#9a3020' };
  }
  if (/избег|напряж|невозмож|тяжел|перегруз|сложно/.test(lower)) {
    return { bg: '#fff9ea', border: 'rgba(228,166,52,0.28)', text: '#8a6012' };
  }
  if (/хочу|могу|ресурс|изменен|лучше|свобод|возможн/.test(lower)) {
    return { bg: '#edf9f3', border: 'rgba(104,169,141,0.28)', text: '#2f7c61' };
  }
  if (/тело|устал|пауза|отдых|остановит|телес/.test(lower)) {
    return { bg: '#edf6ff', border: 'rgba(74,149,211,0.28)', text: '#326ea6' };
  }
  return { bg: '#f2efff', border: 'rgba(127,104,217,0.22)', text: '#5244a8' };
}

function shortCentralText(text: string | null | undefined, maxWords = 5): string | null {
  if (!has(text)) return null;
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + '…';
}

function edgeTypeLabel(type?: string): string {
  switch (type) {
    case 'hard': return 'Жёсткая';
    case 'normal': return 'Обычная';
    case 'soft': return 'Мягкая';
    case 'choice_available': return 'Выбор открыт';
    case 'choice_blocked': return 'Выбор заблокирован';
    default: return type ?? '';
  }
}

function buildHumanEdgeTitle(fromLabel: string, toLabel: string, edgeType: string, explanation?: string | null): string {
  if (has(explanation)) return explanation;
  const from = fromLabel || 'Тема';
  const to = toLabel || 'Тема';
  switch (edgeType) {
    case 'hard': return `${from} автоматически запускает ${to}.`;
    case 'choice_blocked': return `${from} ведёт к ${to} — выбор здесь переживается как недоступный.`;
    case 'normal': return `${from} усиливает ${to}.`;
    case 'soft': return `${from} слабо связан с ${to}.`;
    case 'choice_available': return `${from} влияет на ${to} — здесь может появляться пространство выбора.`;
    default: return `${from} связан с ${to}.`;
  }
}

function edgeTypeDescription(type?: string): string {
  switch (type) {
    case 'hard': return 'быстро запускает другую тему';
    case 'normal': return 'заметно поддерживает паттерн';
    case 'soft': return 'проявляется слабее';
    case 'choice_available': return 'эту связь можно начать ослаблять';
    case 'choice_blocked': return 'переживается как автоматическая';
    default: return 'заметно поддерживает паттерн';
  }
}

function nodeTypeLabel(type?: string): string {
  switch (type) {
    case 'unmet_need': return 'Потребность';
    case 'somatic_emotional_reaction': return 'Соматика';
    case 'traumatic_imprint': return 'Травматика';
    case 'core_belief': return 'Убеждение';
    case 'compensatory_belief': return 'Компенсация';
    case 'defense': return 'Защита';
    case 'secondary_gain': return 'Вторичная выгода';
    case 'subpersonality': return 'Субличность';
    case 'behavior_speech': return 'Речевое поведение';
    case 'reinforced_program': return 'Программа';
    case 'hidden_value': return 'Скрытая ценность';
    case 'worldview_block': return 'Картина мира';
    case 'paradigm': return 'Парадигма';
    default: return type ?? '';
  }
}

function graphNodeTone(label: string, type?: string, fallback?: Tone): Tone {
  const lower = label.toLowerCase();
  if (lower.includes('вина') || lower.includes('триггер')) return 'yellow';
  if (lower.includes('ценность') || lower.includes('убежден') || lower.includes('убежд')) return 'red';
  if (lower.includes('перегруз') || lower.includes('паттерн') || type === 'behavior_speech') return 'purple';
  if (lower.includes('тело') || lower.includes('телес')) return 'red';
  if (lower.includes('выгода') || lower.includes('компенса')) return 'blue';
  if (lower.includes('выбор') || lower.includes('ресурс') || lower.includes('выход')) return 'green';
  return fallback ?? 'purple';
}

function graphIconKind(label: string, type?: string): 'shield' | 'person' | 'pause' | 'brain' | 'thermo' | 'star' | 'leaf' | 'alert' | 'quote' {
  const lower = label.toLowerCase();
  if (lower.includes('контрол') || type === 'defense') return 'shield';
  if (lower.includes('ценность') || lower.includes('полез')) return 'person';
  if (lower.includes('вина') || lower.includes('отдых')) return 'pause';
  if (lower.includes('перегруз') || lower.includes('паттерн')) return 'brain';
  if (lower.includes('тело') || lower.includes('телес')) return 'thermo';
  if (lower.includes('выгода') || type === 'secondary_gain') return 'star';
  if (lower.includes('выбор') || lower.includes('ресурс')) return 'leaf';
  if (lower.includes('речь') || type === 'behavior_speech') return 'quote';
  return 'alert';
}

function GraphIcon({
  kind,
  color = 'currentColor',
  size = 20,
}: {
  kind: ReturnType<typeof graphIconKind>;
  color?: string;
  size?: number;
}) {
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {kind === 'shield' && <path {...common} d="M12 3l7 3v5c0 4.2-2.7 7.9-7 10-4.3-2.1-7-5.8-7-10V6l7-3z" />}
      {kind === 'person' && (
        <>
          <circle {...common} cx="12" cy="8" r="3" />
          <path {...common} d="M6.5 20c.8-3.2 2.7-5 5.5-5s4.7 1.8 5.5 5" />
        </>
      )}
      {kind === 'pause' && (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M10 9v6M14 9v6" />
        </>
      )}
      {kind === 'brain' && (
        <>
          <path {...common} d="M9 5a3 3 0 00-3 3 3 3 0 00-1 5.5A3.5 3.5 0 009 19" />
          <path {...common} d="M15 5a3 3 0 013 3 3 3 0 011 5.5A3.5 3.5 0 0115 19" />
          <path {...common} d="M9 5v14M15 5v14M9 11h6" />
        </>
      )}
      {kind === 'thermo' && (
        <>
          <path {...common} d="M10 14.5V5a2 2 0 114 0v9.5a4 4 0 11-4 0z" />
          <path {...common} d="M12 8v7" />
        </>
      )}
      {kind === 'star' && <path {...common} d="M12 3l2.5 5.1 5.6.8-4 4 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-4 5.6-.8L12 3z" />}
      {kind === 'leaf' && (
        <>
          <path {...common} d="M5 19c8 0 13-5 14-14-9 1-14 6-14 14z" />
          <path {...common} d="M5 19c2.5-4.5 6-7.5 11-10" />
        </>
      )}
      {kind === 'quote' && (
        <>
          <path {...common} d="M8 10h3v6H6v-4c0-3 1.5-5 4-6" />
          <path {...common} d="M17 10h3v6h-5v-4c0-3 1.5-5 4-6" />
        </>
      )}
      {kind === 'alert' && (
        <>
          <path {...common} d="M12 4l9 16H3L12 4z" />
          <path {...common} d="M12 9v5M12 17h.01" />
        </>
      )}
    </svg>
  );
}

// ── Primitive components ──────────────────────────────────────────────────────

function HelpTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);
  const overlay = open ? createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
      />
      <div
        role="tooltip"
        style={{
          position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem',
          maxWidth: 'min(480px, calc(100vw - 2rem))', marginInline: 'auto',
          zIndex: 9999, background: '#fffdf8', color: '#3a3228',
          fontSize: '0.84rem', lineHeight: 1.62,
          padding: '0.9rem 1rem', borderRadius: 20,
          border: '1px solid rgba(118,92,68,0.18)',
          boxShadow: '0 -2px 16px rgba(70,53,35,0.10), 0 8px 32px rgba(70,53,35,0.12)',
          fontWeight: 400, wordBreak: 'normal', overflowWrap: 'break-word',
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>{text}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          aria-label="Закрыть"
          style={{
            flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
            border: '1px solid rgba(118,92,68,0.18)', background: 'rgba(118,92,68,0.06)',
            color: '#7d746b', cursor: 'pointer', fontSize: 16,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
          }}
        >×</button>
      </div>
    </>,
    document.body
  ) : null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, lineHeight: 1 }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        aria-label="Пояснение"
        className="mlm-helptip-btn"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 19, height: 19, borderRadius: '50%',
          background: 'rgba(228,222,214,0.55)', border: '1px solid rgba(118,92,68,0.11)', cursor: 'pointer',
          fontSize: '0.62rem', fontWeight: 700, color: '#918980', flexShrink: 0,
        }}
      >?</button>
      {overlay}
    </span>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p style={{
      margin: '0 0 0.44rem',
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.16em', textTransform: 'uppercase' as const,
      color: VS.text.eyebrow,
    }}>
      {children}
    </p>
  );
}

function SectionHead({ eyebrow, title, help }: {
  eyebrow?: string; title: string; help?: string;
}) {
  return (
    <div style={{ marginBottom: '1.05rem' }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 style={{
        margin: 0,
        fontSize: 'clamp(19px, 5.2vw, 26px)',
        fontWeight: 660, lineHeight: 1.15, color: '#201d1b',
        letterSpacing: '-0.02em',
        display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'nowrap' as const,
      }}>
        <span style={{ flex: '1 1 auto' }}>{title}</span>
        {help && <HelpTip text={help} />}
      </h2>
    </div>
  );
}

function SmallLabel({ children }: { children: string }) {
  return (
    <p style={{
      margin: '0 0 0.42rem',
      fontSize: '0.64rem', fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase' as const,
      color: VS.text.eyebrow,
    }}>
      {children}
    </p>
  );
}

function toneSurface(tone: Tone | 'beige' = 'gray') {
  const tones: Record<string, { soft: string; line: string; text: string; deep: string }> = {
    red: { soft: '#fff0ec', line: 'rgba(228,111,97,0.16)', text: '#9a4339', deep: '#e46f61' },
    yellow: { soft: '#fff7df', line: 'rgba(228,166,52,0.18)', text: '#8a6112', deep: '#e4a634' },
    green: { soft: '#edf9f3', line: 'rgba(104,169,141,0.18)', text: '#2f7c61', deep: '#68a98d' },
    blue: { soft: '#edf6ff', line: 'rgba(74,149,211,0.18)', text: '#326ea6', deep: '#4a95d3' },
    purple: { soft: '#f2efff', line: 'rgba(127,104,217,0.18)', text: '#5e4db3', deep: '#7f68d9' },
    beige: { soft: '#fbf5ec', line: 'rgba(118,92,68,0.12)', text: '#74675d', deep: '#b58a5d' },
    gray: { soft: 'rgba(255,255,255,0.58)', line: 'rgba(120,95,70,0.10)', text: '#6f655d', deep: '#8d8075' },
  };
  return tones[tone] ?? tones.gray;
}

type IconName =
  | 'brain'
  | 'node'
  | 'network'
  | 'heat'
  | 'shield'
  | 'target'
  | 'spark'
  | 'quote'
  | 'speech'
  | 'body'
  | 'pause'
  | 'steps'
  | 'eye'
  | 'leaf'
  | 'warning'
  | 'check'
  | 'info'
  | 'cycle'
  | 'layers'
  | 'practice'
  | 'compass';

function MLIcon({ name, tone = 'gray', size = 22 }: { name: IconName; tone?: Tone | 'beige'; size?: number }) {
  const surface = toneSurface(tone);
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <span
      className="ml-icon"
      data-tone={tone}
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        display: 'grid',
        placeItems: 'center',
        background: surface.soft,
        color: surface.deep,
        flex: '0 0 auto',
        border: `1px solid ${surface.line}`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        {name === 'brain' && (
          <>
            <path {...common} d="M9 5a3 3 0 00-3 3 3 3 0 00-1 5.5A3.5 3.5 0 009 19" />
            <path {...common} d="M15 5a3 3 0 013 3 3 3 0 011 5.5A3.5 3.5 0 0115 19" />
            <path {...common} d="M9 5v14M15 5v14M9 11h6" />
          </>
        )}
        {name === 'node' && (
          <>
            <circle {...common} cx="6" cy="12" r="2.2" />
            <circle {...common} cx="18" cy="7" r="2.2" />
            <circle {...common} cx="18" cy="17" r="2.2" />
            <path {...common} d="M8.2 11l7.6-3M8.2 13l7.6 3" />
          </>
        )}
        {name === 'network' && (
          <>
            <circle {...common} cx="6" cy="7" r="2" />
            <circle {...common} cx="18" cy="7" r="2" />
            <circle {...common} cx="12" cy="17" r="2" />
            <path {...common} d="M8 7h8M7.3 8.5l3.4 6M16.7 8.5l-3.4 6" />
          </>
        )}
        {name === 'heat' && <path {...common} d="M12 4c2 2.4 3.5 4.8 3.5 7.3A3.5 3.5 0 1112 7.8a5.2 5.2 0 00-3.5 4.8C8.5 16 11 18 12 20c3-1.4 6-4.3 6-8.2C18 8.7 16 6.3 12 4z" />}
        {name === 'shield' && <path {...common} d="M12 3l7 3v5c0 4.2-2.7 7.9-7 10-4.3-2.1-7-5.8-7-10V6l7-3z" />}
        {name === 'target' && (
          <>
            <circle {...common} cx="12" cy="12" r="7" />
            <circle {...common} cx="12" cy="12" r="3.2" />
            <path {...common} d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
          </>
        )}
        {name === 'spark' && <path {...common} d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />}
        {name === 'quote' && (
          <>
            <path {...common} d="M8 10h3v6H6v-4c0-3 1.5-5 4-6" />
            <path {...common} d="M17 10h3v6h-5v-4c0-3 1.5-5 4-6" />
          </>
        )}
        {name === 'speech' && (
          <>
            <path {...common} d="M5 6.5A2.5 2.5 0 017.5 4h9A2.5 2.5 0 0119 6.5v6A2.5 2.5 0 0116.5 15H11l-4 4v-4H7.5A2.5 2.5 0 015 12.5z" />
          </>
        )}
        {name === 'body' && (
          <>
            <circle {...common} cx="12" cy="6.5" r="2.4" />
            <path {...common} d="M8.5 20v-4.8l-1.5-2.2 1.6-3.5h6.8l1.6 3.5-1.5 2.2V20M10 20v-4M14 20v-4" />
          </>
        )}
        {name === 'pause' && (
          <>
            <circle {...common} cx="12" cy="12" r="8" />
            <path {...common} d="M10 9v6M14 9v6" />
          </>
        )}
        {name === 'steps' && <path {...common} d="M5 18h4v-4h4v-4h4V6h2" />}
        {name === 'eye' && (
          <>
            <path {...common} d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
            <circle {...common} cx="12" cy="12" r="2.5" />
          </>
        )}
        {name === 'leaf' && (
          <>
            <path {...common} d="M5 19c8 0 13-5 14-14-9 1-14 6-14 14z" />
            <path {...common} d="M5 19c2.5-4.5 6-7.5 11-10" />
          </>
        )}
        {name === 'warning' && (
          <>
            <path {...common} d="M12 4l9 16H3L12 4z" />
            <path {...common} d="M12 9v5M12 17h.01" />
          </>
        )}
        {name === 'check' && <path {...common} d="M5 12.5l4.2 4.2L19 7" />}
        {name === 'info' && (
          <>
            <circle {...common} cx="12" cy="12" r="8" />
            <path {...common} d="M12 10v5M12 7h.01" />
          </>
        )}
        {name === 'cycle' && <path {...common} d="M20 7h-5l1.8-2M4 17h5l-1.8 2M6.5 8.5A7 7 0 0118 7M17.5 15.5A7 7 0 016 17" />}
        {name === 'layers' && (
          <>
            <path {...common} d="M12 4l8 4-8 4-8-4 8-4z" />
            <path {...common} d="M4 12l8 4 8-4M4 16l8 4 8-4" />
          </>
        )}
        {name === 'practice' && <path {...common} d="M8 4h8v4H8zM6 10h12v10H6zM9 13h6M9 16h4" />}
        {name === 'compass' && (
          <>
            <circle {...common} cx="12" cy="12" r="8" />
            <path {...common} d="M14.8 9.2l-1.7 4.1-4.1 1.7 1.7-4.1 4.1-1.7z" />
          </>
        )}
      </svg>
    </span>
  );
}

function SectionShell({
  eyebrow,
  title,
  help,
  intro,
  icon: _icon,
  id,
  children,
}: {
  eyebrow?: string;
  title: string;
  help?: string;
  intro?: string;
  icon?: IconName;
  id?: string;
  children: React.ReactNode;
}) {
  void _icon;
  return (
    <section id={id} style={{
      paddingInline: '1.25rem',
      paddingTop: '0',
    }}>
      <div style={{ maxWidth: '100%' }}>
        <SectionHead eyebrow={eyebrow} title={title} help={help} />
      </div>
      {intro && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '13px', lineHeight: 1.6, color: '#8a8077' }}>{intro}</p>
      )}
      {children}
    </section>
  );
}

function BentoTile({
  children,
  tone = 'beige',
  padding = '0.95rem 1rem',
}: {
  children: React.ReactNode;
  tone?: Tone | 'beige' | 'gray';
  padding?: string;
}) {
  const surface = toneSurface(tone);
  return (
    <div style={{
      background: surface.soft,
      border: `1px solid ${surface.line}`,
      borderRadius: 22,
      padding,
      boxShadow: VS.shadow.card,
    }}>
      {children}
    </div>
  );
}

function SharedPanel({ children, padding = '1.1rem 1rem' }: { children: React.ReactNode; padding?: string }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #fffdf8 0%, #fbf5ec 100%)',
      border: '1px solid rgba(118, 92, 68, 0.13)',
      borderRadius: VS.r.xl,
      boxShadow: VS.shadow.panel,
      overflow: 'hidden',
      padding,
    }}>
      {children}
    </div>
  );
}

function DisclosurePanel({
  summary,
  children,
  tone = 'beige',
}: {
  summary: string;
  children: React.ReactNode;
  tone?: Tone | 'beige' | 'gray';
}) {
  const [open, setOpen] = useState(false);
  const surface = toneSurface(tone);
  return (
    <div style={{ marginTop: '0.7rem' }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="mlm-interactive-card"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          borderRadius: VS.r.row,
          border: `1px solid ${surface.line}`,
          background: surface.soft,
          color: '#4c443d',
          padding: '0.78rem 0.9rem',
          fontSize: '0.82rem',
          fontWeight: 700,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span>{summary}</span>
        <span aria-hidden="true" style={{ fontSize: 16, color: surface.deep, lineHeight: 1 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0.78rem 0.2rem 0 0.2rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function DottedDivider({ margin = '1rem 0' }: { margin?: string }) {
  return (
    <div
      style={{
        margin,
        backgroundImage: 'linear-gradient(to right, rgba(118,92,68,0.22) 0 4px, transparent 4px 8px)',
        backgroundSize: '8px 1px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center',
        height: 1,
      }}
    />
  );
}

function PhraseQuoteHighlight({ quote }: { quote: string }) {
  const commaIdx = quote.indexOf(',');
  const splitAt = commaIdx > 2 ? commaIdx : Math.ceil(quote.length / 2);
  const part1 = quote.slice(0, splitAt);
  const part2 = quote.slice(splitAt);
  return (
    <div style={{
      borderRadius: VS.r.xl, padding: '1.15rem 1.05rem',
      background: 'linear-gradient(160deg, #f5f3ff 0%, #fffdf8 72%)',
      border: '1px solid rgba(127,104,217,0.14)', boxShadow: VS.shadow.card,
    }}>
      <div style={{ fontSize: '20px', lineHeight: 1.24, fontWeight: 720, letterSpacing: '-0.02em' }}>
        «<span style={{ color: '#c8392c' }}>{part1}</span>
        {part2 && <span style={{ color: '#4d3aa6' }}>{part2}</span>}»
      </div>
    </div>
  );
}

function TagGroup({
  label,
  tone,
  icon,
  items,
}: {
  label: string;
  tone: Tone | 'beige';
  icon: IconName;
  items: string[];
}) {
  const visibleItems = uniqueStrings(items.filter(has));
  if (visibleItems.length === 0) return null;
  const s = toneSurface(tone);
  const hasLong = visibleItems.some(item => item.length > 22);
  return (
    <BentoTile tone="gray" padding="0.9rem 0.9rem">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.65rem' }}>
        <MLIcon name={icon} tone={tone} size={14} />
        <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: s.text }}>{label}</div>
      </div>
      {hasLong ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {visibleItems.map((item, i) => (
            <div key={`${label}-${i}`} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.52rem',
              fontSize: '12.5px', lineHeight: 1.5, color: s.text,
              padding: '0.28rem 0',
              borderTop: i > 0 ? `1px solid ${s.line}` : 'none',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: s.deep, marginTop: '0.38rem', flexShrink: 0 }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.38rem' }}>
          {visibleItems.map((item, i) => <Chip key={`${label}-${i}`} tone={tone}>{item}</Chip>)}
        </div>
      )}
    </BentoTile>
  );
}

function Chip({ children, tone = 'gray' }: { children: React.ReactNode; tone?: Tone | 'beige' }) {
  const cs = toneSurface(tone);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, minHeight: 22,
      padding: '4px 8px', borderRadius: 999,
      fontSize: 11, lineHeight: 1,
      background: cs.soft, color: cs.text, border: `1px solid ${cs.line}`,
    }}>
      {children}
    </span>
  );
}

function KeyPhrasesSupportSection({ phrases, centralMeaning, analyticalThemes }: { phrases: string[]; centralMeaning?: string | null; analyticalThemes?: string[] }) {
  const normalized = uniqueStrings(phrases.filter(has));
  const themes = uniqueStrings((analyticalThemes ?? []).filter(has));
  if (normalized.length === 0 && themes.length === 0) return null;
  const visible = normalized.slice(0, 6);
  const hidden = normalized.slice(6);
  return (
    <SectionShell title="Что повторяется в речи" icon="speech" intro="Здесь собраны повторяющиеся слова и темы. Они помогают увидеть, вокруг чего чаще всего собирается паттерн.">
      <SharedPanel padding="0.95rem 1rem">
        {has(centralMeaning) && (
          <div style={{ marginBottom: '0.85rem', padding: '0.72rem 0.9rem', borderRadius: 14, background: '#f2efff', border: '1px solid rgba(127,104,217,0.18)' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#5244a8', marginBottom: '0.28rem' }}>
              Центральная тема
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.5, color: '#4d3aa6', fontWeight: 600 }}>
              {softClampText(centralMeaning, 120) ?? centralMeaning}
            </p>
          </div>
        )}
        {visible.length > 0 && (
          <>
            <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#7d746b', marginBottom: '0.38rem' }}>Фразы из материала</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.38rem 0.46rem', alignItems: 'center' }}>
              {visible.map((phrase, index) => {
                const scale = index === 0 ? { fontSize: 14, fontWeight: 680, padding: '5px 13px', opacity: 1, borderRadius: 10 }
                  : index === 1 ? { fontSize: 13, fontWeight: 630, padding: '4px 11px', opacity: 0.97, borderRadius: 10 }
                  : index === 2 ? { fontSize: 12, fontWeight: 580, padding: '4px 10px', opacity: 0.92, borderRadius: 9 }
                  : { fontSize: 11, fontWeight: 520, padding: '3px 9px', opacity: 0.78, borderRadius: 8 };
                return (
                  <span key={`${phrase}-${index}`} style={{
                    display: 'inline-flex', alignItems: 'center', lineHeight: 1.4,
                    background: index < 3 ? '#eeebff' : '#f4f2ff',
                    color: '#5244a8', border: '1px solid rgba(127,104,217,0.20)',
                    ...scale,
                  }}>
                    {phrase}
                  </span>
                );
              })}
            </div>
          </>
        )}
        {hidden.length > 0 && (
          <DisclosurePanel summary={`Показать ещё ${hidden.length} фраз`} tone="purple">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.42rem' }}>
              {hidden.map((phrase, index) => (
                <span key={`${phrase}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 24, padding: '4px 10px', borderRadius: 8, fontSize: 11, lineHeight: 1, background: '#f2efff', color: '#5244a8', border: '1px solid rgba(127,104,217,0.22)', fontWeight: 550 }}>
                  {phrase}
                </span>
              ))}
            </div>
          </DisclosurePanel>
        )}
        {themes.length > 0 && (
          <div style={{ marginTop: visible.length > 0 ? '0.75rem' : '0', borderTop: visible.length > 0 ? '1px solid rgba(127,104,217,0.11)' : 'none', paddingTop: visible.length > 0 ? '0.65rem' : '0' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#7d746b', marginBottom: '0.38rem' }}>Темы, которые заметил отчёт</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.38rem 0.46rem' }}>
              {themes.map((theme, i) => (
                <span key={`theme-${i}`} style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 8, fontSize: 11, lineHeight: 1.4, background: '#f5f5f0', color: '#7d746b', border: '1px solid rgba(118,92,68,0.18)', fontWeight: 560 }}>
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </SharedPanel>
    </SectionShell>
  );
}

function MindloomSpeechCloud({ phrases, centralMeaning, analyticalThemes }: { phrases: string[]; centralMeaning?: string | null; analyticalThemes?: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const normalized = uniqueStrings(phrases.filter(has));
  if (normalized.length < 2) {
    return <KeyPhrasesSupportSection phrases={phrases} centralMeaning={centralMeaning} analyticalThemes={analyticalThemes} />;
  }
  const rawCentral = firstNonEmpty(
    has(centralMeaning) && (centralMeaning ?? '').split(/\s+/).length <= 7 ? centralMeaning : null,
    normalized[0] && normalized[0].split(/\s+/).length <= 7 ? normalized[0] : null,
    centralMeaning,
  ) ?? normalized[0];
  const centralText = shortCentralText(rawCentral, 5) ?? rawCentral;

  const INITIAL = 6;
  const visiblePhrases = showAll ? normalized : normalized.slice(0, INITIAL);
  const hiddenCount = normalized.length - INITIAL;

  const renderChip = (phrase: string, idx: number) => {
    const sem = phraseSemantic(phrase);
    const isFirst = idx === 0;
    const isProminent = idx <= 2;
    return (
      <span key={`sc-${idx}`} className="mlm-chip-float" style={{
        display: 'inline-flex', alignItems: 'center',
        padding: isFirst ? '6px 14px' : isProminent ? '5px 11px' : '4px 9px',
        borderRadius: 999,
        fontSize: isFirst ? 13.5 : isProminent ? 12 : 11,
        lineHeight: 1.4,
        fontWeight: isFirst ? 650 : isProminent ? 610 : 570,
        background: sem.bg, color: sem.text,
        border: `1px solid ${sem.border}`,
        boxShadow: isFirst
          ? '0 2px 8px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)'
          : isProminent
            ? '0 1px 5px rgba(0,0,0,0.05)'
            : '0 1px 3px rgba(0,0,0,0.03)',
        maxWidth: 'calc(100% - 8px)',
      }}>
        {phrase}
      </span>
    );
  };

  return (
    <SectionShell title="Что повторяется в речи" icon="speech"
      intro="Здесь собраны повторяющиеся слова и темы. Они помогают увидеть, вокруг чего чаще всего собирается паттерн.">
      <div style={{
        position: 'relative',
        background: 'linear-gradient(155deg, #fffefc 0%, #fdfaf5 52%, #fbf6ee 100%)',
        border: '1px solid rgba(118,92,68,0.11)',
        borderRadius: '26px 30px 28px 24px / 28px 26px 30px 26px',
        boxShadow: '0 4px 20px rgba(70,53,35,0.058), 0 14px 40px rgba(70,53,35,0.042)',
        padding: '1.5rem 1.2rem',
        overflow: 'hidden',
      }}>
        {/* Blob decorations — clipped by overflow:hidden, pointer-events:none */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: -44, right: -32,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(127,104,217,0.07) 0%, transparent 70%)',
          filter: 'blur(44px)', pointerEvents: 'none', zIndex: 0,
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: -28, left: -24,
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(228,111,97,0.05) 0%, transparent 70%)',
          filter: 'blur(36px)', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Central bubble */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: '0.75rem', position: 'relative', zIndex: 1,
        }}>
          <div className="mlm-speech-center" style={{
            width: 148, height: 148, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '1rem',
            background: 'linear-gradient(148deg, #f0edff 0%, #e8e2ff 55%, #ddd5ff 100%)',
            border: '2px solid rgba(127,104,217,0.20)',
            boxShadow: '0 4px 16px rgba(127,104,217,0.11), 0 0 0 8px rgba(127,104,217,0.05), 0 0 0 16px rgba(127,104,217,0.02)',
          }}>
            <strong style={{ fontSize: '12px', lineHeight: 1.35, color: '#3a2e5e', fontWeight: 720, letterSpacing: '-0.02em' }}>
              {centralText}
            </strong>
          </div>
        </div>

        {/* Chips below bubble in flex-wrap */}
        {visiblePhrases.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.42rem 0.46rem',
            justifyContent: 'center',
            position: 'relative', zIndex: 1,
          }}>
            {visiblePhrases.map((phrase, i) => renderChip(phrase, i))}
          </div>
        )}

        {/* Expand button */}
        {!showAll && hiddenCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.9rem', position: 'relative', zIndex: 1 }}>
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mlm-interactive-card"
              style={{
                background: 'rgba(127,104,217,0.08)',
                border: '1px solid rgba(127,104,217,0.20)',
                cursor: 'pointer',
                fontSize: '0.77rem', color: '#6658b8', fontWeight: 650,
                padding: '0.32rem 0.9rem', borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', gap: '0.28rem',
              }}
            >
              + ещё {hiddenCount}
            </button>
          </div>
        )}

        {/* Analytical themes group */}
        {analyticalThemes && analyticalThemes.length > 0 && (
          <div style={{
            marginTop: '0.85rem', paddingTop: '0.75rem',
            borderTop: '1px solid rgba(127,104,217,0.12)',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#9d9890', marginBottom: '0.45rem', textAlign: 'center' }}>
              Темы, которые заметил отчёт
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.38rem 0.46rem', justifyContent: 'center' }}>
              {analyticalThemes.map((theme, i) => (
                <span key={`analytic-${i}`} style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '4px 11px', borderRadius: 999,
                  fontSize: 11.5, lineHeight: 1.4, fontWeight: 570,
                  background: '#f5f4f0', color: '#7d746b',
                  border: '1px solid rgba(118,92,68,0.18)',
                }}>
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

function QuoteRow({ text }: { text: string }) {
  return (
    <div style={{
      borderLeft: '3px solid #c8bef0', borderRadius: '0 12px 12px 0',
      background: 'rgba(244,241,255,0.68)', padding: '0.45rem 0.75rem',
      margin: '0.35rem 0 0',
    }}>
      <p style={{ margin: 0, color: '#504868', fontStyle: 'italic', fontSize: '0.84rem', lineHeight: 1.55 }}>
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

// ── Heatmap visualization ─────────────────────────────────────────────────────

type HeatPoint = {
  id: string; label: string; description?: string;
  intensity?: number | null; tone: Tone; kind: 'zone' | 'node';
  why_it_matters?: string;
};

type HeatPalette = {
  light: string; base: string; deep: string; rgb: string; text: string;
};

const DEFAULT_HEAT_SCALE = [
  { label: 'Слабее', range: '0-40%', description: 'слабое проявление', tone: 'blue' as Tone },
  { label: 'Заметно', range: '40-65%', description: 'заметное проявление', tone: 'green' as Tone },
  { label: 'Сильно', range: '65-88%', description: 'сильное проявление', tone: 'yellow' as Tone },
  { label: 'Очень сильно', range: '88-100%', description: 'пик активности', tone: 'red' as Tone },
];

const HEAT_POSITIONS = [
  { x: 20, y: 26 }, { x: 50, y: 18 }, { x: 78, y: 28 },
  { x: 14, y: 56 }, { x: 38, y: 50 }, { x: 62, y: 44 },
  { x: 85, y: 58 }, { x: 28, y: 76 }, { x: 55, y: 72 },
];

const HEAT_SLOT_POSITIONS: Record<string, { x: number; y: number }[]> = {
  control: [{ x: 22, y: 28 }, { x: 50, y: 21 }],
  value: [{ x: 80, y: 30 }, { x: 34, y: 68 }],
  body: [{ x: 17, y: 56 }, { x: 43, y: 49 }],
  pattern: [{ x: 68, y: 44 }, { x: 54, y: 24 }],
  resource: [{ x: 58, y: 72 }, { x: 34, y: 70 }],
  guilt: [{ x: 78, y: 62 }, { x: 28, y: 70 }],
  extra: [{ x: 48, y: 47 }, { x: 86, y: 48 }, { x: 30, y: 76 }],
};

function heatPalette(tone: Tone): HeatPalette {
  switch (tone) {
    case 'red':
      return { light: '#ff8f82', base: '#e54848', deep: '#c83232', rgb: '229,72,72', text: '#ffffff' };
    case 'yellow':
      return { light: '#ffb85a', base: '#f07c26', deep: '#cc5d13', rgb: '240,124,38', text: '#fffaf2' };
    case 'green':
      return { light: '#b8dcbf', base: '#6aa887', deep: '#4d8568', rgb: '106,168,135', text: '#ffffff' };
    case 'blue':
      return { light: '#79b9f2', base: '#3f96db', deep: '#2470b8', rgb: '63,150,219', text: '#ffffff' };
    case 'purple':
      return { light: '#b98cff', base: '#9858d6', deep: '#7434b1', rgb: '152,88,214', text: '#ffffff' };
    default:
      return { light: '#ffd36d', base: '#f3ad25', deep: '#d78912', rgb: '243,173,37', text: '#fffaf2' };
  }
}

function heatTone(label: string, color?: string): Tone {
  const explicit = toneFromColor(color);
  const lower = label.toLowerCase();
  if (
    lower.includes('контрол') || lower.includes('перегрев') || lower.includes('перегруз') ||
    lower.includes('тело') || lower.includes('телес') || lower.includes('защит') ||
    lower.includes('control') || lower.includes('overheat') || lower.includes('body')
  ) return 'red';
  if (
    lower.includes('ценност') || lower.includes('вина') || lower.includes('напряж') ||
    lower.includes('актив') || lower.includes('value') || lower.includes('guilt')
  ) return 'yellow';
  if (
    lower.includes('паттерн') || lower.includes('убежден') || lower.includes('убеждён') ||
    lower.includes('повтор') || lower.includes('pattern') || lower.includes('belief')
  ) return 'purple';
  if (
    lower.includes('ресурс') || lower.includes('значим') || lower.includes('ясност') ||
    lower.includes('будущ') || lower.includes('resource') || lower.includes('clarity')
  ) return 'blue';
  if (explicit !== 'gray') return explicit;
  return 'yellow';
}

function heatSlot(label: string): keyof typeof HEAT_SLOT_POSITIONS {
  const lower = label.toLowerCase();
  if (lower.includes('контрол') || lower.includes('control')) return 'control';
  if (lower.includes('ценност') || lower.includes('value')) return 'value';
  if (lower.includes('тело') || lower.includes('телес') || lower.includes('body') || lower.includes('somatic')) return 'body';
  if (lower.includes('паттерн') || lower.includes('перегруз') || lower.includes('pattern') || lower.includes('overload')) return 'pattern';
  if (lower.includes('ресурс') || lower.includes('значим') || lower.includes('отдых') || lower.includes('resource') || lower.includes('rest')) return 'resource';
  if (lower.includes('вина') || lower.includes('guilt')) return 'guilt';
  return 'extra';
}

function heatPosition(label: string, index: number, used: Map<string, number>) {
  const slot = heatSlot(label);
  const list = HEAT_SLOT_POSITIONS[slot] ?? HEAT_SLOT_POSITIONS.extra;
  const usedCount = used.get(slot) ?? 0;
  used.set(slot, usedCount + 1);
  return list[usedCount] ?? HEAT_SLOT_POSITIONS.extra[index % HEAT_SLOT_POSITIONS.extra.length];
}

function ReportDetailSheet({ state, onClose }: {
  state: DetailSheetState | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [state, onClose]);

  if (!state) return null;
  const surf = toneSurface(state.tone ?? 'beige');
  const pct = (state.percent != null) ? clampInt(state.percent) : null;

  const edgeMeaning: Record<string, string> = {
    hard: 'Связь срабатывает быстро и почти автоматически.',
    normal: 'Связь заметно поддерживает паттерн.',
    soft: 'Связь проявляется слабее или не всегда.',
    choice_available: 'Здесь может появляться пространство выбора.',
    choice_blocked: 'Выбор здесь переживается как недоступный.',
  };

  return createPortal(
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mlm-sheet-title"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, calc(100% - 32px))',
          maxHeight: '60vh',
          zIndex: 201,
          background: 'linear-gradient(160deg, #fffdf8 0%, #fbf5ec 100%)',
          borderRadius: 24,
          border: '1px solid rgba(118,92,68,0.22)',
          boxShadow: '0 4px 32px rgba(70,53,35,0.16), 0 12px 48px rgba(70,53,35,0.10)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1rem 1.1rem 0.4rem', flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 0.18rem', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: surf.text }}>{state.eyebrow}</p>
            <h2 id="mlm-sheet-title" style={{ margin: 0, fontSize: 'clamp(16px, 5vw, 21px)', fontWeight: 730, lineHeight: 1.2, color: '#201d1b', letterSpacing: '-0.02em' }}>{state.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              flexShrink: 0, marginLeft: '0.75rem', marginTop: 2,
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid rgba(118,92,68,0.18)',
              background: 'rgba(255,250,244,0.9)',
              cursor: 'pointer', fontSize: 18, lineHeight: 1, color: '#7d746b',
              display: 'grid', placeItems: 'center',
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0.1rem 1.1rem 1.6rem' }}>
          {/* Percent metric */}
          {pct != null && (
            <div style={{ marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '0.32rem' }}>
                <strong style={{ fontSize: 38, fontWeight: 760, lineHeight: 1, color: surf.deep }}>{pct}</strong>
                <span style={{ fontSize: 18, color: surf.deep, fontWeight: 760 }}>%</span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: '#f1e8de', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: surf.deep }} />
              </div>
            </div>
          )}

          {/* Badge */}
          {has(state.badge) && (
            <span style={{ display: 'inline-flex', marginBottom: '0.7rem', padding: '0.22rem 0.65rem', borderRadius: 999, background: surf.soft, border: `1px solid ${surf.line}`, color: surf.text, fontSize: '0.70rem', fontWeight: 760, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {state.badge}
            </span>
          )}

          {/* Edge type chip + strength */}
          {has(state.edgeType) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
              <span style={{ padding: '0.22rem 0.6rem', borderRadius: 999, background: surf.soft, border: `1px solid ${surf.line}`, color: surf.text, fontSize: '0.72rem', fontWeight: 700 }}>
                {edgeTypeLabel(state.edgeType)}
              </span>
              {state.strength != null && (
                <span style={{ fontSize: '0.72rem', color: '#7d746b' }}>сила {fmtPct(state.strength)}</span>
              )}
            </div>
          )}

          {/* Edge type meaning */}
          {has(state.edgeType) && has(edgeMeaning[state.edgeType]) && (
            <div style={{ marginBottom: '0.8rem', borderRadius: 16, padding: '0.72rem 0.85rem', background: surf.soft, border: `1px solid ${surf.line}` }}>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#3a3228' }}>{edgeMeaning[state.edgeType]}</p>
            </div>
          )}

          {/* Description */}
          {has(state.description) && (
            <p style={{ margin: '0 0 0.8rem', fontSize: '14px', lineHeight: 1.65, color: '#2e2820' }}>{state.description}</p>
          )}

          {/* Fallback description for heatmap-node */}
          {state.type === 'heatmap-node' && !has(state.description) && (
            <p style={{ margin: '0 0 0.8rem', fontSize: '13.5px', lineHeight: 1.65, color: '#5d564f', fontStyle: 'italic' }}>
              Эта тема показывает, где паттерн проявляется заметнее всего в материале.
            </p>
          )}

          {/* Fallback description for graph-node */}
          {state.type === 'graph-node' && !has(state.description) && (
            <p style={{ margin: '0 0 0.8rem', fontSize: '13.5px', lineHeight: 1.65, color: '#5d564f', fontStyle: 'italic' }}>
              Эта тема участвует в общей цепочке паттерна.
            </p>
          )}

          {/* Why / explanation */}
          {has(state.why) && (
            <div style={{ marginBottom: '0.8rem', borderRadius: 16, padding: '0.72rem 0.85rem', background: surf.soft, border: `1px solid ${surf.line}` }}>
              <p style={{ margin: 0, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: surf.text, marginBottom: 5 }}>Почему важно</p>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.62, color: '#3a3228' }}>{state.why}</p>
            </div>
          )}
          {!has(state.why) && has(state.explanation) && (
            <div style={{ marginBottom: '0.8rem', borderRadius: 16, padding: '0.72rem 0.85rem', background: surf.soft, border: `1px solid ${surf.line}` }}>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.62, color: '#3a3228' }}>{state.explanation}</p>
            </div>
          )}

          {/* Tags */}
          {state.tags && state.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.8rem' }}>
              {state.tags.map((tag, i) => (
                <span key={i} style={{ padding: '0.2rem 0.55rem', borderRadius: 999, background: surf.soft, border: `1px solid ${surf.line}`, color: surf.text, fontSize: '0.70rem', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Rows (incoming/outgoing edges for graph-node) */}
          {state.rows && state.rows.length > 0 && (
            <div style={{ marginBottom: '0.8rem', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(118,92,68,0.12)' }}>
              {state.rows.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.55rem', padding: '0.55rem 0.85rem', borderTop: i > 0 ? '1px solid rgba(118,92,68,0.10)' : 0, background: i % 2 === 0 ? 'rgba(255,252,246,0.6)' : 'rgba(255,255,255,0.4)' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: surf.text, minWidth: 52, flexShrink: 0, paddingTop: 1 }}>{row.label}</span>
                  {has(row.text) && <span style={{ fontSize: '0.72rem', lineHeight: 1.5, color: '#5d564f' }}>{row.text}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Evidence quotes */}
          {state.evidence && state.evidence.length > 0 && (
            <div style={{ marginBottom: '0.8rem' }}>
              {state.evidence.slice(0, 3).map((ev, i) => <QuoteRow key={i} text={ev} />)}
            </div>
          )}

          {/* Note */}
          {has(state.note) && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '11px', lineHeight: 1.62, color: '#9a9088', fontStyle: 'italic' }}>{state.note}</p>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

function HeatmapInfographic({ points, heatmap }: {
  points: HeatPoint[];
  heatmap: MindloomReportV2['heatmap'];
}) {
  const sorted = [...points].sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0));
  const visible = sorted.slice(0, 8);
  const topThree = visible.slice(0, 3);
  const usedSlots = new Map<string, number>();
  const positioned = visible.map((pt, i) => ({ ...pt, pos: heatPosition(pt.label, i, usedSlots) }));
  const remaining = sorted.slice(8);
  const focusNames = topThree.map(pt => getShortLabel(pt.label)).filter(Boolean).join(', ');
  const focusText = has(heatmap.description)
    ? heatmap.description
    : `Фокус: работа с зонами ${focusNames || 'перегрузки'} и восстановление ресурса поможет снизить общий уровень напряжения.`;
  const callouts = heatmap.callouts.length > 0
    ? heatmap.callouts.slice(0, 3)
    : [
      { title: 'Самые активные зоны', text: `${focusNames || 'Ключевые зоны'} формируют основной кластер напряжения. Их влияние максимальное.` },
      { title: 'Что показывает карта', text: 'Карта отражает распределение активности нейронных зон и их взаимосвязи по всему материалу.' },
      { title: 'Как читать', text: 'Цвет и размер зоны показывают интенсивность. Тёплые зоны — перегрузка, синие — ресурс или сниженная активность.' },
    ];
  const scale = heatmap.scale.length > 0
    ? heatmap.scale.slice(0, 4).map((s, i) => ({ ...s, tone: DEFAULT_HEAT_SCALE[i]?.tone ?? 'yellow' as Tone }))
    : DEFAULT_HEAT_SCALE;

  return (
    <div className="mlm-heatmap-module">
      <div className="mlm-heatmap-canvas" style={{
        position: 'relative', height: 390, borderRadius: 26, overflow: 'hidden',
        border: '1px solid rgba(118,92,68,0.16)',
        background: [
          'radial-gradient(circle at 22% 35%, rgba(239,72,72,0.18), transparent 30%)',
          'radial-gradient(circle at 48% 28%, rgba(239,72,72,0.16), transparent 30%)',
          'radial-gradient(circle at 78% 35%, rgba(239,124,38,0.13), transparent 30%)',
          'radial-gradient(circle at 34% 70%, rgba(245,176,55,0.18), transparent 28%)',
          'radial-gradient(circle at 62% 70%, rgba(76,152,218,0.17), transparent 28%)',
          'radial-gradient(circle at 68% 48%, rgba(151,88,214,0.15), transparent 28%)',
          'linear-gradient(145deg, #fffaf3 0%, #fbf3e9 48%, #f7efe6 100%)',
        ].join(', '),
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72), 0 14px 32px rgba(83,61,39,0.07)',
      }}>
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.42,
          maskImage: 'radial-gradient(ellipse at center, black 18%, rgba(0,0,0,0.74) 54%, transparent 92%)',
        }}>
          <defs>
            <pattern id="mlm-heat-hex-pattern" width="5.2" height="4.5" patternUnits="userSpaceOnUse">
              <path d="M1.3 0.2 3.9 0.2 5.15 2.25 3.9 4.3 1.3 4.3 0.05 2.25Z" fill="none" stroke="rgba(255,255,255,0.58)" strokeWidth="0.22" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#mlm-heat-hex-pattern)" />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.72,
          filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.42))',
        }}>
          <path d="M15 58 C26 42, 34 36, 46 48 S63 58, 76 42" fill="none" stroke="rgba(255,255,255,0.58)" strokeWidth="0.34" />
          <path d="M21 28 C34 21, 46 22, 56 36 S72 47, 84 31" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.28" />
          <path d="M31 74 C43 62, 52 62, 60 73 S74 80, 83 64" fill="none" stroke="rgba(255,255,255,0.44)" strokeWidth="0.28" />
          <path d="M43 50 C50 38, 56 36, 68 44" fill="none" stroke="rgba(255,255,255,0.46)" strokeWidth="0.24" strokeDasharray="2 2" />
          {[{ x: 18, y: 56 }, { x: 31, y: 45 }, { x: 43, y: 49 }, { x: 55, y: 36 }, { x: 68, y: 44 }, { x: 78, y: 31 }, { x: 59, y: 72 }].map((dot, i) => (
            <circle key={i} cx={dot.x} cy={dot.y} r="0.85" fill="rgba(255,255,255,0.82)" />
          ))}
        </svg>
        {positioned.map((pt) => {
          const pal = heatPalette(pt.tone);
          const size = Math.min(78, Math.max(56, 50 + clampInt(pt.intensity) * 0.31));
          return (
            <div key={`heat-node-${pt.id}`} className="mlm-heat-node" title={pt.description ?? pt.label} style={{
              position: 'absolute', left: `${pt.pos.x}%`, top: `${pt.pos.y}%`,
              width: size, transform: 'translate(-50%, -50%)', zIndex: 3,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.38rem',
              textAlign: 'center',
            }}>
              <div style={{
                width: size, height: size, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: pal.text, fontWeight: 850, fontSize: size > 70 ? '1.08rem' : '0.94rem',
                letterSpacing: '-0.03em',
                background: `radial-gradient(circle at 38% 30%, rgba(255,255,255,0.34), transparent 28%), linear-gradient(145deg, ${pal.light}, ${pal.base} 56%, ${pal.deep})`,
                border: '2px solid rgba(255,255,255,0.82)',
                boxShadow: `0 14px 34px rgba(${pal.rgb},0.26), 0 0 0 8px rgba(255,255,255,0.22), 0 0 0 14px rgba(${pal.rgb},0.10), inset 0 1px 0 rgba(255,255,255,0.35)`,
                textShadow: '0 1px 7px rgba(70,36,20,0.24)',
              }}>
                {fmtPct(pt.intensity)}
              </div>
              <strong style={{
                display: 'block', width: 92, maxWidth: '30vw',
                fontSize: '0.72rem', fontWeight: 800, lineHeight: 1.22,
                color: '#231f1b', textShadow: '0 1px 0 rgba(255,255,255,0.62)',
                overflowWrap: 'normal', wordBreak: 'normal',
              }}>
                {getShortLabel(pt.label)}
              </strong>
            </div>
          );
        })}
      </div>
      <div className="mlm-heatmap-bento" style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '0.65rem', marginTop: '0.8rem' }}>
        <div style={{ border: '1px solid rgba(118,92,68,0.13)', borderRadius: 18, background: 'rgba(255,253,248,0.82)', padding: '0.9rem' }}>
          <SmallLabel>Шкала активности</SmallLabel>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${scale.length}, 1fr)`, gap: '0.25rem', paddingTop: '0.8rem' }}>
            <div style={{ position: 'absolute', left: '9%', right: '9%', top: 18, height: 2, background: 'linear-gradient(90deg, #79b9f2, #ffd36d, #f07c26, #e54848)', opacity: 0.38 }} />
            {scale.map((s, i) => {
              const pal = heatPalette(s.tone);
              return (
                <div key={i} style={{ position: 'relative', textAlign: 'center', minWidth: 0 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: pal.base, boxShadow: `0 0 0 5px rgba(${pal.rgb},0.12)`, marginBottom: '0.58rem' }} />
                  <strong style={{ display: 'block', fontSize: '0.66rem', lineHeight: 1.2, color: '#312a24', overflowWrap: 'normal', wordBreak: 'normal' }}>{s.label ?? DEFAULT_HEAT_SCALE[i]?.label}</strong>
                  <span style={{ display: 'block', marginTop: '0.18rem', fontSize: '0.58rem', lineHeight: 1.25, color: '#81786f' }}>{s.range ?? DEFAULT_HEAT_SCALE[i]?.range}</span>
                </div>
              );
            })}
          </div>
          <p style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start', margin: '0.85rem 0 0', fontSize: '0.69rem', lineHeight: 1.45, color: '#8a8178' }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid rgba(129,120,111,0.42)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', flexShrink: 0 }}>i</span>
            Процент отражает условную силу проявления зоны в материале, не медицинскую оценку.
          </p>
        </div>
        <div className="mlm-heatmap-callouts" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.55rem' }}>
          {callouts.map((c, i) => {
            const tone: Tone = i === 0 ? 'red' : i === 1 ? 'purple' : 'blue';
            const pal = heatPalette(tone);
            return (
              <div key={i} style={{ border: '1px solid rgba(118,92,68,0.13)', borderRadius: 18, background: 'rgba(255,253,248,0.82)', padding: '0.76rem 0.82rem' }}>
                <div style={{ display: 'flex', gap: '0.56rem', alignItems: 'flex-start' }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `rgba(${pal.rgb},0.12)`, color: pal.base }}>
                    <GraphIcon kind={i === 0 ? 'alert' : i === 1 ? 'brain' : 'quote'} size={16} />
                  </span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.22rem', fontSize: '0.76rem', lineHeight: 1.25, color: '#2a2520' }}>{c.title ?? DEFAULT_HEAT_SCALE[i]?.label}</strong>
                    {has(c.text) && <p style={{ margin: 0, fontSize: '0.72rem', lineHeight: 1.48, color: '#5e554d' }}>{c.text}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {remaining.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.32rem', marginTop: '0.72rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#8f867d' }}>Ещё {remaining.length} зоны:</span>
          {remaining.slice(0, 4).map(pt => <Chip key={pt.id}>{pt.label}</Chip>)}
        </div>
      )}
      <div className="mlm-heatmap-focus" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        marginTop: '0.85rem', padding: '0.78rem 0.9rem',
        borderRadius: 20, background: 'rgba(245,240,232,0.78)',
        border: '1px solid rgba(118,92,68,0.09)', color: '#70675e',
      }}>
        <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start', minWidth: 0 }}>
          <span style={{ color: '#d5aa38', flexShrink: 0, marginTop: 1 }}><GraphIcon kind="leaf" size={18} /></span>
          <p style={{ margin: 0, fontSize: '0.76rem', lineHeight: 1.45 }}>{focusText}</p>
        </div>
        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.42rem 0.65rem', borderRadius: 999, background: 'rgba(255,253,248,0.76)', border: '1px solid rgba(118,92,68,0.12)', color: '#4d443c', fontSize: '0.72rem', fontWeight: 750 }}>
          Подробнее <span aria-hidden="true">→</span>
        </span>
      </div>
    </div>
  );
}

function NeuroHeatmap({ zones, nodes, heatmap, displayLimit = 4 }: {
  zones: MindloomReportV2HeatmapZone[];
  nodes: MindloomReportV2Node[];
  heatmap: MindloomReportV2['heatmap'];
  displayLimit?: number;
}) {
  void displayLimit;
  const zoneItems = zones.filter(z => z.label || z.description);
  const nodeItems = nodes.filter(n => n.label || n.description);

  return <HeatmapInfographic points={[
    ...zoneItems.map((z, i) => ({
      id: z.id ?? `zone-${i}`,
      label: z.label ?? `Зона ${i + 1}`,
      description: z.description,
      intensity: z.intensity,
      tone: heatTone(z.label ?? '', z.color),
      kind: 'zone' as const,
      why_it_matters: z.why_it_matters,
    })),
    ...nodeItems.slice(0, Math.max(0, 9 - zoneItems.length)).map((n, i) => ({
      id: n.id ?? `node-${i}`,
      label: n.label ?? `Тема ${i + 1}`,
      description: n.description,
      intensity: n.intensity,
      tone: heatTone(n.label ?? '', n.color),
      kind: 'node' as const,
    })),
  ]} heatmap={heatmap} />;

  const points: HeatPoint[] = [
    ...zoneItems.map((z, i) => ({
      id: z.id ?? `zone-${i}`,
      label: z.label ?? `Зона ${i + 1}`,
      description: z.description,
      intensity: z.intensity,
      tone: heatTone(z.label ?? '', z.color),
      kind: 'zone' as const,
      why_it_matters: z.why_it_matters,
    })),
    ...nodeItems.slice(0, Math.max(0, 9 - zoneItems.length)).map((n, i) => ({
      id: n.id ?? `node-${i}`,
      label: n.label ?? `Тема ${i + 1}`,
      description: n.description,
      intensity: n.intensity,
      tone: heatTone(n.label ?? '', n.color),
      kind: 'node' as const,
    })),
  ];

  if (points.length === 0) {
    return <p style={{ color: '#9a9088', fontSize: '0.88rem' }}>Нет данных для отображения.</p>;
  }

  const sorted = [...points].sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0));

  return (
    <div>
      {/* Visual panel */}
      <div style={{
        position: 'relative', minHeight: 320, borderRadius: 20, overflow: 'hidden',
        background: 'linear-gradient(150deg, #fefcf9 0%, #f9f4ee 60%, #f5ede4 100%)',
        border: '1px solid #e4d8cc', marginBottom: '0.75rem',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(60,44,28,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(60,44,28,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 78%)',
        }} />
        {/* Blobs */}
        {sorted.slice(0, HEAT_POSITIONS.length).map((pt, i) => {
          const pos = HEAT_POSITIONS[i];
          const ival = clampInt(pt.intensity);
          const color = toneHex(pt.tone);
          return (
            <div key={`blob-${pt.id}`} style={{
              position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`,
              width: 120 + ival * 1.2, height: 120 + ival * 1.2,
              transform: 'translate(-50%, -50%)', borderRadius: '50%',
              background: `radial-gradient(circle, ${color}26 0%, ${color}10 42%, transparent 68%)`,
              filter: 'blur(30px)', pointerEvents: 'none',
            }} />
          );
        })}
        {/* Nodes */}
        {sorted.slice(0, HEAT_POSITIONS.length).map((pt, i) => {
          const pos = HEAT_POSITIONS[i];
          const ival = clampInt(pt.intensity);
          const sz = 52 + ival * 0.48;
          const color = toneHex(pt.tone);
          return (
            <div key={`node-${pt.id}`} title={pt.description ?? pt.label} style={{
              position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`,
              width: sz, height: sz,
              transform: 'translate(-50%, -50%)', borderRadius: '50%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', padding: '0.4rem',
              background: `radial-gradient(circle at 38% 35%, color-mix(in srgb, ${color} 80%, white 20%) 0%, color-mix(in srgb, ${color} 55%, transparent) 48%, transparent 72%)`,
              filter: `drop-shadow(0 0 14px color-mix(in srgb, ${color} 58%, transparent))`,
              zIndex: 2,
            }}>
              <span style={{ display: 'block', color: 'rgba(255,255,255,0.95)', fontSize: '0.68rem', fontWeight: 900, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                {fmtPct(pt.intensity)}
              </span>
              <strong style={{ display: 'block', color: '#fff', fontSize: '0.6rem', fontWeight: 700, lineHeight: 1.15, textShadow: '0 1px 5px rgba(0,0,0,0.4)', maxWidth: 72 }}>
                {getShortLabel(pt.label)}
              </strong>
            </div>
          );
        })}
      </div>

      {/* Zone cards — top N */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {sorted.slice(0, displayLimit).map(pt => {
          const hex = toneHex(pt.tone);
          return (
            <div key={`card-${pt.id}`} style={{
              borderRadius: 14, padding: '0.8rem 1rem',
              background: `${hex}10`,
              border: `1px solid ${hex}25`,
              borderLeft: `4px solid ${hex}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <strong style={{ fontSize: '0.88rem', color: '#1e1a16', lineHeight: 1.25 }}>{pt.label}</strong>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: hex, whiteSpace: 'nowrap' }}>{fmtPct(pt.intensity)}</span>
              </div>
              {has(pt.description) && (
                <p style={{ margin: '0 0 0.35rem', fontSize: '0.82rem', lineHeight: 1.55, color: '#5a5450' }}>{pt.description}</p>
              )}
              <div style={{ height: 4, borderRadius: 999, background: 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ width: `${clampInt(pt.intensity)}%`, height: '100%', borderRadius: 999, background: hex }} />
              </div>
              {has(pt.why_it_matters) && (
                <p style={{ margin: '0.45rem 0 0', fontSize: '0.8rem', lineHeight: 1.55, color: '#6a5e50', fontStyle: 'italic' }}>
                  {pt.why_it_matters}
                </p>
              )}
            </div>
          );
        })}
        {sorted.length > displayLimit && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center', padding: '0.3rem 0.1rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#9a9088' }}>Также в карте:</span>
            {sorted.slice(displayLimit).map((pt, i) => (
              <Chip key={i}>{pt.label}</Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Node graph visualization ──────────────────────────────────────────────────

void NeuroHeatmap;

function normalizeHeatLabel(label: string): string {
  return label.toLowerCase().trim().replace(/\s+/g, ' ');
}

function heatmapGroupKey(label: string): string {
  const s = normalizeHeatLabel(label);
  if (s.includes('гиперконтрол') || s.includes('контрол') || s.includes('защит')) return 'control';
  if (s.includes('тел') || s.includes('сомат')) return 'body';
  if (s.includes('вина') || s.includes('отдых') || s.includes('пауза')) return 'guilt_rest';
  if (s.includes('ценност') || s.includes('полезн') || s.includes('значим')) return 'value';
  if (s.includes('паттерн') || s.includes('перегруз') || s.includes('повтор')) return 'pattern';
  if (s.includes('ресурс') || s.includes('ясност') || s.includes('выбор') || s.includes('будущ')) return 'resource';
  return s;
}

function heatSemanticType(label: string): 'control' | 'value' | 'body' | 'pattern' | 'guilt_rest' | 'resource' | 'other' {
  const key = heatmapGroupKey(label);
  if (key === 'control' || key === 'value' || key === 'body' || key === 'pattern' || key === 'guilt_rest' || key === 'resource') {
    return key;
  }
  return 'other';
}

function shortHeatLabel(label: string): string {
  const s = normalizeHeatLabel(label);
  if (s.includes('гиперконтрол')) return 'Гиперконтроль';
  if (s.includes('контрол')) return 'Контроль';
  if (s.includes('выгода') && s.includes('незамен')) return 'Выгода';
  if (s.includes('телес') || s.includes('перегрев')) return 'Телесный перегрев';
  if (s.includes('тело')) return 'Тело';
  if (s.includes('ценност')) return 'Ценность';
  if (s.includes('вина')) return 'Вина';
  if (s.includes('отдых')) return 'Отдых';
  if (s.includes('паттерн')) return 'Паттерн';
  if (s.includes('перегруз')) return 'Перегрузка';
  if (s.includes('значим')) return 'Значимость';
  if (s.includes('ресурс')) return 'Ресурс';
  return label;
}

function heatNodeSize(intensity: number | null | undefined): number {
  const value = typeof intensity === 'number' && Number.isFinite(intensity) ? intensity : 0;
  if (value >= 0.92) return 76;
  if (value >= 0.86) return 68;
  if (value >= 0.76) return 60;
  return 54;
}

function HeatmapCanvasFirst({ points, heatmap, onNodeClick, activeNodesRef, graphNodesRef, keyPhrasesRef }: {
  points: HeatPoint[];
  heatmap: MindloomReportV2['heatmap'];
  onNodeClick?: (s: DetailSheetState) => void;
  activeNodesRef?: MindloomReportV2Node[];
  graphNodesRef?: MindloomReportV2GraphNode[];
  keyPhrasesRef?: string[];
}) {
  // dedup: keep highest-intensity per semantic group
  const uniqueMap = new Map<string, HeatPoint>();
  for (const point of [...points].sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0))) {
    const key = heatmapGroupKey(point.label);
    if (!key) continue;
    const existing = uniqueMap.get(key);
    if (!existing) {
      uniqueMap.set(key, point);
      continue;
    }
    const existingIntensity = existing.intensity ?? 0;
    const nextIntensity = point.intensity ?? 0;
    if (nextIntensity > existingIntensity || (nextIntensity === existingIntensity && point.label.length > existing.label.length)) {
      uniqueMap.set(key, point);
    }
  }

  const uniquePoints = Array.from(uniqueMap.values());
  const visible = uniquePoints.slice(0, Math.min(7, uniquePoints.length));
  const slotLayouts: Record<number, Array<{ x: number; y: number }>> = {
    5: [
      { x: 24, y: 25 },
      { x: 58, y: 19 },
      { x: 80, y: 43 },
      { x: 20, y: 62 },
      { x: 57, y: 76 },
    ],
    6: [
      { x: 23, y: 23 },
      { x: 58, y: 18 },
      { x: 81, y: 30 },
      { x: 18, y: 58 },
      { x: 70, y: 54 },
      { x: 45, y: 74 },
    ],
    7: [
      { x: 22, y: 23 },
      { x: 56, y: 18 },
      { x: 82, y: 30 },
      { x: 17, y: 56 },
      { x: 46, y: 49 },
      { x: 70, y: 53 },
      { x: 44, y: 74 },
    ],
  };
  const layout = slotLayouts[visible.length] ?? [
    { x: 23, y: 23 },
    { x: 55, y: 18 },
    { x: 82, y: 28 },
    { x: 16, y: 52 },
    { x: 45, y: 47 },
    { x: 72, y: 49 },
    { x: 32, y: 76 },
    { x: 62, y: 78 },
  ];
  const semanticPriority: Record<string, number[]> = {
    control: [1, 0, 4],
    value: [2],
    body: [3, 4],
    pattern: [5],
    guilt_rest: [6, 3],
    resource: [6, 5, 4],
    other: [4, 5, 3, 0, 2, 6, 1],
  };
  const usedIndexes = new Set<number>();
  const positioned = visible.map((pt, idx) => {
    const type = heatSemanticType(pt.label);
    const preferred = semanticPriority[type] ?? semanticPriority.other;
    const slotIndex = preferred.find((candidate) => candidate < layout.length && !usedIndexes.has(candidate))
      ?? layout.findIndex((_, candidate) => !usedIndexes.has(candidate));
    const resolvedIndex = slotIndex >= 0 ? slotIndex : Math.min(idx, layout.length - 1);
    usedIndexes.add(resolvedIndex);
    return { ...pt, pos: layout[resolvedIndex] ?? layout[layout.length - 1] };
  });
  const scale = heatmap.scale.length > 0
    ? heatmap.scale.slice(0, 4).map((s, i) => ({ ...s, tone: DEFAULT_HEAT_SCALE[i]?.tone ?? 'yellow' as Tone }))
    : DEFAULT_HEAT_SCALE;
  const focusText = has(heatmap.description)
    ? heatmap.description
    : 'Фокус: работа с перегрузкой и восстановлением телесного баланса поможет снизить общий уровень напряжения.';
  const remainderNames = uniquePoints.slice(7).map((pt) => pt.label).filter(Boolean);

  const bgNodeFields = positioned.map((pt) => {
    const pal = heatPalette(pt.tone);
    const intensity = pt.intensity ?? 0.7;
    const alpha = (0.06 + intensity * 0.08).toFixed(2);
    return `radial-gradient(ellipse 20% 16% at ${pt.pos.x}% ${pt.pos.y}%, rgba(${pal.rgb},${alpha}), transparent 84%)`;
  });
  const canvasBg = [
    ...bgNodeFields,
    'radial-gradient(ellipse 70% 55% at 40% 36%, rgba(255,248,240,0.72) 0%, transparent 70%)',
    'linear-gradient(150deg, #fffaf4 0%, #fdeee2 40%, #faeadf 72%, #f8ebea 100%)',
  ].join(', ');

  // Semantic connection topology
  const connSemanticTypes = positioned.map(p => heatSemanticType(p.label));
  const guiltCIdx = connSemanticTypes.findIndex(t => t === 'guilt_rest');
  const bodyCIdx = connSemanticTypes.findIndex(t => t === 'body');
  const patternCIdx = connSemanticTypes.findIndex(t => t === 'pattern');
  const resourceCIdx = connSemanticTypes.findIndex(t => t === 'resource');
  const rawConns: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  if (positioned.length >= 2) {
    const hub = positioned[0];
    for (let i = 1; i < positioned.length && i <= 5; i++) {
      rawConns.push({ x1: hub.pos.x, y1: hub.pos.y, x2: positioned[i].pos.x, y2: positioned[i].pos.y });
    }
    if (guiltCIdx > 0 && bodyCIdx > 0 && guiltCIdx !== bodyCIdx) {
      rawConns.push({ x1: positioned[guiltCIdx].pos.x, y1: positioned[guiltCIdx].pos.y, x2: positioned[bodyCIdx].pos.x, y2: positioned[bodyCIdx].pos.y });
    } else if (positioned.length >= 4) {
      rawConns.push({ x1: positioned[1].pos.x, y1: positioned[1].pos.y, x2: positioned[3].pos.x, y2: positioned[3].pos.y });
    }
    if (patternCIdx > 0 && resourceCIdx > 0 && patternCIdx !== resourceCIdx) {
      rawConns.push({ x1: positioned[patternCIdx].pos.x, y1: positioned[patternCIdx].pos.y, x2: positioned[resourceCIdx].pos.x, y2: positioned[resourceCIdx].pos.y });
    } else if (positioned.length >= 6) {
      rawConns.push({ x1: positioned[2].pos.x, y1: positioned[2].pos.y, x2: positioned[5].pos.x, y2: positioned[5].pos.y });
    }
  }
  const connPaths: Array<{ d: string; dotX: number; dotY: number }> = rawConns.slice(0, 7).map((c, i) => {
    const dx = c.x2 - c.x1; const dy = c.y2 - c.y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const curve = Math.min(len * 0.12, 7.5);
    const side = i % 2 === 0 ? 1 : -1;
    const cx = (c.x1 + c.x2) / 2 - (dy / len) * curve * side;
    const cy = (c.y1 + c.y2) / 2 + (dx / len) * curve * side;
    const t = 0.42;
    const dotX = (1 - t) * (1 - t) * c.x1 + 2 * (1 - t) * t * cx + t * t * c.x2;
    const dotY = (1 - t) * (1 - t) * c.y1 + 2 * (1 - t) * t * cy + t * t * c.y2;
    return { d: `M${c.x1} ${c.y1} Q${cx} ${cy} ${c.x2} ${c.y2}`, dotX, dotY };
  });

  return (
    <div className="mlm-heatmap-canvas-first">
      {/* ── Canvas ── */}
      <div className="mlm-heatmap-canvas-fix" style={{
        position: 'relative',
        width: '100%',
        minHeight: 480,
        height: 'clamp(480px, 122vw, 540px)',
        borderRadius: 28,
        overflow: 'hidden',
        border: '1px solid rgba(122,93,66,0.13)',
        background: canvasBg,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.62), inset 0 -32px 64px rgba(255,255,255,0.26), 0 20px 48px rgba(84,64,42,0.10)',
      }}>

        {/* Layer 1: Outer thermal ambient — large, very soft territorial halo */}
        {positioned.map((pt) => {
          const pal = heatPalette(pt.tone);
          const size = heatNodeSize(pt.intensity);
          const mul = (pt.intensity ?? 0) >= 0.88 ? 4.8 : 4.2;
          return (
            <div key={`heat-a-${pt.id}`} style={{
              position: 'absolute', left: `${pt.pos.x}%`, top: `${pt.pos.y}%`,
              width: `${size * mul}px`, height: `${size * mul}px`,
              transform: 'translate(-50%, -50%)', borderRadius: 999,
              background: `radial-gradient(circle, rgba(${pal.rgb},0.14) 0%, rgba(${pal.rgb},0.08) 42%, rgba(${pal.rgb},0.02) 66%, transparent 82%)`,
              filter: 'blur(38px)', pointerEvents: 'none', zIndex: 1,
            }} />
          );
        })}

        {/* Layer 2: Middle thermal field — defines color territory */}
        {positioned.map((pt) => {
          const pal = heatPalette(pt.tone);
          const size = heatNodeSize(pt.intensity);
          const mul = (pt.intensity ?? 0) >= 0.88 ? 3.3 : 2.8;
          return (
            <div key={`heat-b-${pt.id}`} style={{
              position: 'absolute', left: `${pt.pos.x}%`, top: `${pt.pos.y}%`,
              width: `${size * mul}px`, height: `${size * mul}px`,
              transform: 'translate(-50%, -50%)', borderRadius: 999,
              background: `radial-gradient(circle, rgba(${pal.rgb},0.38) 0%, rgba(${pal.rgb},0.22) 38%, rgba(${pal.rgb},0.08) 62%, transparent 80%)`,
              filter: 'blur(18px)', pointerEvents: 'none', zIndex: 2,
            }} />
          );
        })}

        {/* Layer 3: Inner dense glow — hot core */}
        {positioned.map((pt) => {
          const pal = heatPalette(pt.tone);
          const size = heatNodeSize(pt.intensity);
          return (
            <div key={`heat-c-${pt.id}`} style={{
              position: 'absolute', left: `${pt.pos.x}%`, top: `${pt.pos.y}%`,
              width: `${size * 1.9}px`, height: `${size * 1.9}px`,
              transform: 'translate(-50%, -50%)', borderRadius: 999,
              background: `radial-gradient(circle, rgba(${pal.rgb},0.62) 0%, rgba(${pal.rgb},0.40) 30%, rgba(${pal.rgb},0.14) 55%, transparent 74%)`,
              filter: 'blur(8px)', pointerEvents: 'none', zIndex: 2,
            }} />
          );
        })}

        {/* Layer 4: Premium neural surface — micro-grain dots + organic fiber mesh */}
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', mixBlendMode: 'soft-light', zIndex: 3,
        }}>
          <defs>
            <pattern id="ml-grain-fx6" width="3.8" height="3.8" patternUnits="userSpaceOnUse">
              <circle cx="1.9" cy="1.9" r="0.52" fill="rgba(172,140,105,0.38)" />
              <circle cx="0" cy="0" r="0.30" fill="rgba(172,140,105,0.18)" />
              <circle cx="3.8" cy="3.8" r="0.30" fill="rgba(172,140,105,0.18)" />
            </pattern>
            <radialGradient id="ml-grain-fade-fx6" cx="48%" cy="46%" r="58%">
              <stop offset="0%" stopColor="white" stopOpacity="0.92" />
              <stop offset="36%" stopColor="white" stopOpacity="0.74" />
              <stop offset="65%" stopColor="white" stopOpacity="0.28" />
              <stop offset="84%" stopColor="white" stopOpacity="0.05" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="ml-grain-mask-fx6">
              <rect width="100" height="100" fill="url(#ml-grain-fade-fx6)" />
            </mask>
          </defs>
          <rect width="100" height="100" fill="url(#ml-grain-fx6)" mask="url(#ml-grain-mask-fx6)" opacity="0.72" />
          <g fill="none" stroke="rgba(188,155,115,0.88)" strokeWidth="0.44">
            <path d="M0,14 C22,10 50,18 76,12 S94,16 100,14" opacity="0.082" />
            <path d="M100,30 C74,26 48,34 24,28 S4,32 0,30" opacity="0.076" />
            <path d="M0,46 C26,42 54,50 80,44 S97,48 100,46" opacity="0.080" />
            <path d="M100,63 C68,59 42,67 18,61 S2,65 0,63" opacity="0.072" />
            <path d="M0,79 C28,75 58,83 84,77 S97,81 100,79" opacity="0.068" />
            <path d="M20,0 C24,24 14,48 20,72 S16,88 20,100" opacity="0.074" />
            <path d="M48,0 C52,22 42,46 48,70 S44,86 48,100" opacity="0.066" />
            <path d="M78,0 C74,26 82,50 76,74 S80,90 76,100" opacity="0.070" />
          </g>
        </svg>

        {/* Layer 5: Connection network — two-pass glow+wire + junction dots */}
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 4,
        }}>
          <defs>
            <filter id="ml-conn-glow-fx6" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" />
            </filter>
            <filter id="ml-dot-glow-fx6" x="-300%" y="-300%" width="700%" height="700%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
            </filter>
          </defs>
          {connPaths.length > 0 && (
            <>
              <g filter="url(#ml-conn-glow-fx6)">
                {connPaths.map((p, i) => <path key={i} d={p.d} fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="3.2" />)}
              </g>
              <g>
                {connPaths.map((p, i) => <path key={i} d={p.d} fill="none" stroke="rgba(255,255,255,0.64)" strokeWidth="0.86" vectorEffect="non-scaling-stroke" />)}
              </g>
              <g filter="url(#ml-dot-glow-fx6)">
                {connPaths.slice(0, 5).map((p, i) => <circle key={i} cx={p.dotX} cy={p.dotY} r="2.6" fill="rgba(255,255,255,0.62)" />)}
              </g>
              <g>
                {connPaths.slice(0, 5).map((p, i) => <circle key={i} cx={p.dotX} cy={p.dotY} r="1.45" fill="rgba(255,255,255,0.92)" />)}
              </g>
            </>
          )}
        </svg>

        {/* Layer 6: Node orbs */}
        {positioned.map((pt) => {
          const pal = heatPalette(pt.tone);
          const size = heatNodeSize(pt.intensity);
          const pctSize = Math.max(16, Math.round(size * 0.255));
          const label = shortHeatLabel(pt.label);
          const handleNodeClick = onNodeClick ? () => {
            const matchingActive = activeNodesRef?.find(n =>
              n.id === pt.id ||
              (n.label && pt.label && n.label.toLowerCase().trim() === pt.label.toLowerCase().trim())
            );
            const nodeEvidence = uniqueStrings([
              ...(matchingActive?.evidence ?? []),
              ...(keyPhrasesRef?.slice(0, 2) ?? []),
            ], 4);
            const relatedIds = matchingActive?.connected_to ?? [];
            const relatedLabels = relatedIds
              .map(rid => graphNodesRef?.find(gn => gn.id === rid)?.label ?? activeNodesRef?.find(an => an.id === rid)?.label)
              .filter(has)
              .slice(0, 4);
            const sheetRows: Array<{ label: string; text?: string | null }> = [];
            if (has(pt.why_it_matters)) {
              sheetRows.push({ label: 'Почему важно', text: pt.why_it_matters });
            }
            if (relatedLabels.length > 0) {
              sheetRows.push({ label: 'Связанные темы', text: relatedLabels.join(' · ') });
            }
            const descriptionText = pt.description ?? matchingActive?.description;
            const whyText = !has(pt.why_it_matters) ? 'В материале эта тема связана с повторяющимся напряжением и поддерживает общий паттерн.' : null;
            onNodeClick({
              type: 'heatmap-node',
              eyebrow: 'Тема',
              title: pt.label,
              tone: pt.tone,
              percent: pt.intensity,
              description: descriptionText,
              why: whyText,
              rows: sheetRows.length > 0 ? sheetRows : undefined,
              evidence: nodeEvidence.length > 0 ? nodeEvidence : undefined,
              note: 'Тема выражена в этом материале. Процент показывает, насколько сильно она проявилась.',
            });
          } : undefined;
          return (
            <div
              key={`heat-fix-${pt.id}`}
              className="mlm-heat-node-fix"
              title={pt.description ?? pt.label}
              onClick={handleNodeClick}
              role={handleNodeClick ? 'button' : undefined}
              tabIndex={handleNodeClick ? 0 : undefined}
              onKeyDown={handleNodeClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeClick(); } } : undefined}
              aria-label={handleNodeClick ? `Открыть подробности зоны: ${pt.label}${pt.intensity != null ? `, ${fmtPct(pt.intensity)}` : ''}` : undefined}
              style={{
                position: 'absolute', left: `${pt.pos.x}%`, top: `${pt.pos.y}%`,
                transform: 'translate(-50%, -50%)', width: 96,
                textAlign: 'center', zIndex: 6, isolation: 'isolate',
                cursor: handleNodeClick ? 'pointer' : 'default',
              }}
            >
              {/* Wide aura */}
              <div style={{
                position: 'absolute', left: '50%', top: size / 2,
                width: size * 2.8, height: size * 2.8,
                transform: 'translate(-50%, -50%)', borderRadius: 999,
                background: `radial-gradient(circle, rgba(${pal.rgb},0.32) 0%, rgba(${pal.rgb},0.16) 42%, rgba(${pal.rgb},0.05) 64%, transparent 80%)`,
                filter: 'blur(14px)', zIndex: -1, pointerEvents: 'none',
              }} />
              {/* Orb */}
              <div className="mlm-heat-orb-fix" style={{
                width: size, height: size, margin: '0 auto', borderRadius: 999,
                display: 'grid', placeItems: 'center',
                background: `radial-gradient(circle at 38% 28%, rgba(255,255,255,0.20), transparent 42%), linear-gradient(148deg, ${pal.light}, ${pal.base} 58%, ${pal.deep})`,
                border: '1.5px solid rgba(255,255,255,0.72)',
                boxShadow: `0 0 0 3px rgba(255,255,255,0.14), 0 0 0 10px rgba(${pal.rgb},0.08), 0 0 28px rgba(${pal.rgb},0.18), inset 0 1px 0 rgba(255,255,255,0.20)`,
              }}>
                <span className="mlm-heat-percent-fix" style={{
                  display: 'block', fontSize: pctSize,
                  lineHeight: 1, fontWeight: 780, letterSpacing: '-0.03em',
                  color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.20)',
                }}>
                  {fmtPct(pt.intensity)}
                </span>
              </div>
              {/* Label */}
              <div className="mlm-heat-label-fix" style={{
                display: 'block', marginTop: 9, width: 96, maxWidth: 96,
                fontSize: 11.5, lineHeight: 1.15, fontWeight: 700, color: '#2b2520',
                textAlign: 'center', whiteSpace: 'normal', overflowWrap: 'normal',
                wordBreak: 'normal', hyphens: 'none', textWrap: 'balance' as const,
                textShadow: '0 1px 3px rgba(255,255,255,0.78)', marginInline: 'auto',
              }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 info cards below canvas */}
      <div className="mlm-heatmap-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.85rem' }}>
        {/* Самые активные */}
        <div className="mlm-heatmap-info-active" style={{ borderRadius: 20, padding: '0.72rem 0.75rem', background: 'rgba(255,252,246,0.74)', border: '1px solid rgba(130,100,70,0.10)' }}>
          <SmallLabel>Самые активные</SmallLabel>
          <div style={{ marginTop: '0.45rem', display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
            {[...positioned].sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0)).slice(0, 3).map((pt, i) => {
              const pal = heatPalette(pt.tone);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: pal.base, flexShrink: 0, display: 'inline-block', boxShadow: `0 0 0 3px rgba(${pal.rgb},0.14)` }} />
                  <span style={{ flex: 1, fontSize: '0.66rem', lineHeight: 1.2, color: '#2f2822', fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortHeatLabel(pt.label)}</span>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: pal.deep, flexShrink: 0 }}>{fmtPct(pt.intensity)}</span>
                </div>
              );
            })}
          </div>
          {remainderNames.length > 0 && (
            <p style={{ margin: '0.38rem 0 0', fontSize: '0.59rem', color: '#a09688', lineHeight: 1.3 }}>Ещё: {remainderNames.slice(0, 2).join(', ')}</p>
          )}
        </div>

        {/* Что показывает */}
        <div className="mlm-heatmap-info-focus" style={{ borderRadius: 20, padding: '0.72rem 0.75rem', background: 'rgba(255,252,246,0.74)', border: '1px solid rgba(130,100,70,0.10)' }}>
          <SmallLabel>Что показывает</SmallLabel>
          <p style={{ margin: '0.45rem 0 0', fontSize: '0.67rem', lineHeight: 1.46, color: '#70675e' }}>
            {focusText.length > 70 ? 'Показывает, какие зоны активированы сильнее всего и как они связаны.' : focusText}
          </p>
        </div>

        {/* Шкала + Как читать */}
        <div className="mlm-heatmap-info-scale" style={{ borderRadius: 20, padding: '0.72rem 0.75rem', background: 'rgba(255,252,246,0.74)', border: '1px solid rgba(130,100,70,0.10)' }}>
          <SmallLabel>Шкала активности</SmallLabel>
          <div style={{ marginTop: '0.45rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.18rem 0.3rem' }}>
            {scale.map((s, i) => {
              const pal = heatPalette(s.tone);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.28rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: pal.base, flexShrink: 0, display: 'inline-block', boxShadow: `0 0 0 2.5px rgba(${pal.rgb},0.12)` }} />
                  <span style={{ fontSize: '0.6rem', lineHeight: 1.15, fontWeight: 600, color: '#3a3228', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label ?? DEFAULT_HEAT_SCALE[i]?.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {remainderNames.length > 0 && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {remainderNames.map((name, i) => (
            <span key={i} style={{ fontSize: '0.64rem', padding: '0.18rem 0.5rem', borderRadius: 999, background: 'rgba(230,218,204,0.48)', color: '#7d736a', lineHeight: 1.3 }}>{name}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function NeuroHeatmapCanvasFirst({ zones, nodes, heatmap, onNodeClick, activeNodesRef, graphNodesRef, keyPhrasesRef }: {
  zones: MindloomReportV2HeatmapZone[];
  nodes: MindloomReportV2Node[];
  heatmap: MindloomReportV2['heatmap'];
  onNodeClick?: (s: DetailSheetState) => void;
  activeNodesRef?: MindloomReportV2Node[];
  graphNodesRef?: MindloomReportV2GraphNode[];
  keyPhrasesRef?: string[];
}) {
  const zoneItems = zones.filter(z => z.label || z.description);
  const nodeItems = nodes.filter(n => n.label || n.description);
  const points: HeatPoint[] = [
    ...zoneItems.map((z, i) => ({
      id: z.id ?? `zone-fix-${i}`,
      label: z.label ?? `Зона ${i + 1}`,
      description: z.description,
      intensity: z.intensity,
      tone: heatTone(z.label ?? '', z.color),
      kind: 'zone' as const,
      why_it_matters: z.why_it_matters,
    })),
    ...nodeItems.slice(0, Math.max(0, 10 - zoneItems.length)).map((n, i) => ({
      id: n.id ?? `node-fix-${i}`,
      label: n.label ?? `Тема ${i + 1}`,
      description: n.description,
      intensity: n.intensity,
      tone: heatTone(n.label ?? '', n.color),
      kind: 'node' as const,
    })),
  ];

  if (points.length === 0) {
    return (
      <div style={{ border: '1px solid rgba(118,92,68,0.14)', borderRadius: 24, background: '#fffaf3', padding: '1rem', color: '#81786f', fontSize: '0.9rem', lineHeight: 1.55 }}>
        Нет данных для построения карты активности.
      </div>
    );
  }

  return <HeatmapCanvasFirst points={points} heatmap={heatmap} onNodeClick={onNodeClick} activeNodesRef={activeNodesRef} graphNodesRef={graphNodesRef} keyPhrasesRef={keyPhrasesRef} />;
}

function NeuroNodeGraph({ graphNodes, activeNodes, edges, centralNodeId, legend, howToRead, edgeLimit = 4, onNodeClick, onEdgeClick }: {
  graphNodes: MindloomReportV2GraphNode[];
  activeNodes: MindloomReportV2Node[];
  edges: MindloomReportV2['node_graph']['edges'];
  centralNodeId?: string | null;
  legend: MindloomReportV2['node_graph']['legend'];
  howToRead: MindloomReportV2['node_graph']['how_to_read'];
  edgeLimit?: number;
  onNodeClick?: (s: DetailSheetState) => void;
  onEdgeClick?: (s: DetailSheetState) => void;
}) {
  const sourceNodes = graphNodes.length > 0
    ? graphNodes
    : activeNodes.map(n => ({ id: n.id, label: n.label, type: n.type, intensity: n.intensity, description: n.description }));

  const visibleNodes = sourceNodes.filter(n => n.id || n.label);

  if (visibleNodes.length === 0) {
    return <p style={{ color: '#9a9088', fontSize: '0.88rem' }}>Нет данных для отображения.</p>;
  }

  const activeById = new Map(activeNodes.filter(n => n.id).map(n => [n.id!, n]));
  const enrichedNodes = visibleNodes.map((n, idx) => {
    const active = n.id ? activeById.get(n.id) : undefined;
    const displayLabel = n.label ?? active?.label ?? `Тема ${idx + 1}`;
    const fallbackTone = toneFromColor(active?.color);
    return {
      ...n,
      label: displayLabel,
      description: n.description ?? active?.description,
      intensity: n.intensity ?? active?.intensity ?? null,
      tone: graphNodeTone(displayLabel, n.type ?? active?.type, fallbackTone),
      displayLabel,
    };
  });

  const explicitCentral = centralNodeId
    ? enrichedNodes.find(n => n.id === centralNodeId)
    : undefined;
  const central = explicitCentral
    ?? [...enrichedNodes].sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0))[0]
    ?? enrichedNodes[0];

  const centralId = central.id;
  const edgeScore = (nodeId?: string) => {
    if (!nodeId || !centralId) return 0;
    return edges
      .filter(e => (e.from === centralId && e.to === nodeId) || (e.to === centralId && e.from === nodeId))
      .reduce((sum, e) => sum + (e.strength ?? 0.45), 0);
  };
  const surrounding = enrichedNodes
    .filter(n => n !== central)
    .sort((a, b) => {
      const edgeDelta = edgeScore(b.id) - edgeScore(a.id);
      if (edgeDelta !== 0) return edgeDelta;
      return (b.intensity ?? 0) - (a.intensity ?? 0);
    })
    .slice(0, 6);

  // Deterministic layout by node count — prevents floating/overlap for small counts.
  // For 1-6 surrounding nodes use balanced fixed positions; 7+ fall back to semantic slots.
  const deterministicLayouts: Record<number, Array<{ x: number; y: number }>> = {
    1: [{ x: 50, y: 19 }],
    2: [{ x: 75, y: 50 }, { x: 25, y: 50 }],
    3: [{ x: 50, y: 17 }, { x: 78, y: 70 }, { x: 22, y: 70 }],
    4: [{ x: 50, y: 15 }, { x: 82, y: 48 }, { x: 66, y: 81 }, { x: 18, y: 48 }],
    5: [{ x: 50, y: 15 }, { x: 81, y: 38 }, { x: 75, y: 74 }, { x: 25, y: 74 }, { x: 19, y: 38 }],
    6: [{ x: 50, y: 15 }, { x: 80, y: 33 }, { x: 80, y: 67 }, { x: 50, y: 83 }, { x: 20, y: 67 }, { x: 20, y: 33 }],
  };
  const semanticPositions: Record<ReturnType<typeof graphSemanticSlot>, Array<{ x: number; y: number }>> = {
    belief:  [{ x: 16, y: 24 }, { x: 20, y: 14 }],
    trigger: [{ x: 14, y: 68 }, { x: 20, y: 80 }],
    support: [{ x: 65, y: 14 }, { x: 78, y: 22 }],
    pattern: [{ x: 84, y: 44 }, { x: 76, y: 28 }],
    body:    [{ x: 80, y: 70 }, { x: 64, y: 82 }],
    extra:   [{ x: 38, y: 14 }, { x: 34, y: 84 }, { x: 86, y: 62 }],
  };
  const usedSlots = new Map<ReturnType<typeof graphSemanticSlot>, number>();
  const fallbackPositions = [
    { x: 16, y: 24 }, { x: 14, y: 68 }, { x: 65, y: 14 },
    { x: 84, y: 44 }, { x: 80, y: 70 }, { x: 38, y: 14 },
  ];
  const layoutPositions = deterministicLayouts[surrounding.length];
  const graphItems = [
    {
      ...central,
      x: 50,
      y: 50,
      isCentral: true,
    },
    ...surrounding.map((n, idx) => {
      let position: { x: number; y: number };
      if (layoutPositions) {
        position = layoutPositions[idx] ?? { x: 50, y: 50 };
      } else {
        const slot = graphSemanticSlot(n.displayLabel, n.type);
        const slotIndex = usedSlots.get(slot) ?? 0;
        usedSlots.set(slot, slotIndex + 1);
        position = semanticPositions[slot][slotIndex] ?? fallbackPositions[idx] ?? { x: 50, y: 50 };
      }
      return {
        ...n,
        x: position.x,
        y: position.y,
        isCentral: false,
      };
    }),
  ];
  const graphItemIds = new Set(graphItems.map(n => n.id).filter(Boolean));
  const byId = new Map(graphItems.filter(n => n.id).map(n => [n.id!, n]));
  // Cluster halos: group non-central nodes by tone for system-map layer
  const toneGroups = new Map<Tone, Array<{ x: number; y: number }>>();
  for (const n of graphItems.filter(n => !n.isCentral)) {
    const grp = toneGroups.get(n.tone) ?? [];
    grp.push({ x: n.x, y: n.y });
    toneGroups.set(n.tone, grp);
  }
  const visibleEdges = edges.filter(e => e.from && e.to && graphItemIds.has(e.from) && graphItemIds.has(e.to));
  const sortedEdges = [...visibleEdges].sort((a, b) => {
    const aCentral = a.from === centralId || a.to === centralId ? 1 : 0;
    const bCentral = b.from === centralId || b.to === centralId ? 1 : 0;
    if (aCentral !== bCentral) return bCentral - aCentral;
    return (b.strength ?? 0) - (a.strength ?? 0);
  });
  const visualEdges = sortedEdges.slice(0, 7).map((edge) => ({ ...edge, type: resolveGraphEdgeType(edge.type, edge.strength) }));
  // Only render nodes that are connected to at least one edge (isolated nodes are confusing)
  const connectedNodeIds = new Set<string>([
    ...(centralId ? [centralId] : []),
    ...visualEdges.flatMap(e => [e.from, e.to]).filter((id): id is string => Boolean(id)),
  ]);
  const renderedGraphItems = graphItems.filter(n => n.isCentral || !n.id || connectedNodeIds.has(n.id));
  const displayEdges = sortedEdges.slice(0, edgeLimit).map((edge) => ({ ...edge, type: resolveGraphEdgeType(edge.type, edge.strength) }));
  const defaultLegend = [
    { type: 'hard', label: 'Жёсткая связь', description: 'срабатывает быстро' },
    { type: 'normal', label: 'Обычная', description: 'поддерживает паттерн' },
    { type: 'soft', label: 'Ослабленная', description: 'проявляется не всегда' },
    { type: 'choice_available', label: 'Есть выбор', description: 'можно ослаблять' },
    { type: 'choice_blocked', label: 'Выбора нет', description: 'как автоматизм' },
  ];
  const rawLegend = legend.length > 0 ? legend : defaultLegend;
  const legendItems = rawLegend.filter((item, idx) => rawLegend.findIndex(x => (x.type ?? 'normal') === (item.type ?? 'normal')) === idx);
  const allReadRows = howToRead.length > 0
    ? howToRead.map((item, idx) => {
        const edgeRef = displayEdges[idx] as typeof displayEdges[0] | undefined;
        const fromNode = edgeRef?.from ? byId.get(edgeRef.from) : undefined;
        const toNode = edgeRef?.to ? byId.get(edgeRef.to) : undefined;
        const rawTitle = item.title ?? `Связь ${idx + 1}`;
        const needsHumanize = rawTitle.includes('→') || rawTitle.includes('->');
        const humanTitle = (needsHumanize && fromNode && toNode && edgeRef)
          ? buildHumanEdgeTitle(fromNode.displayLabel, toNode.displayLabel, resolveGraphEdgeType(edgeRef.type, edgeRef.strength), item.description ?? edgeRef.explanation)
          : rawTitle;
        return {
          title: humanTitle,
          description: needsHumanize ? null : item.description,
          iconNode: graphItems[idx + 1] ?? graphItems[0],
          edgeRef,
        };
      })
    : displayEdges.map((edge, idx) => {
        const from = edge.from ? byId.get(edge.from) : undefined;
        const to = edge.to ? byId.get(edge.to) : undefined;
        const resolvedType = resolveGraphEdgeType(edge.type, edge.strength);
        return {
          title: buildHumanEdgeTitle(from?.displayLabel ?? 'Тема', to?.displayLabel ?? 'Тема', resolvedType, edge.explanation ?? edge.label),
          description: null,
          iconNode: from ?? graphItems[idx + 1] ?? graphItems[0],
          edgeRef: edge as typeof displayEdges[0],
        };
      });
  const readRows = allReadRows.slice(0, 4);
  const hiddenReadRows = allReadRows.slice(4);

  return (
    <div style={{
      border: '1px solid rgba(126, 101, 73, 0.13)',
      borderRadius: VS.r.xl,
      overflow: 'hidden',
      background: '#fffdf8',
      boxShadow: VS.shadow.panel,
    }}>
      <div style={{
        position: 'relative',
        minHeight: 440,
        height: 'clamp(440px, 112vw, 510px)',
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse 66% 54% at 50% 52%, rgba(223,112,95,0.15), transparent 64%), radial-gradient(circle at 18% 28%, rgba(232,168,76,0.14), transparent 36%), radial-gradient(circle at 76% 30%, rgba(145,120,223,0.12), transparent 36%), radial-gradient(circle at 72% 76%, rgba(143,200,173,0.11), transparent 36%), linear-gradient(145deg, #fffaf2 0%, #fbf6ee 55%, #f7f0e8 100%)',
      }} className="mlm-causal-graph-panel">
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.36, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="mlm-graph-dot-grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="0.48" fill="rgba(141,112,82,0.28)" />
            </pattern>
            <radialGradient id="mlm-graph-dot-fade" cx="50%" cy="50%" r="52%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="55%" stopColor="white" stopOpacity="0.78" />
              <stop offset="80%" stopColor="white" stopOpacity="0.18" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="mlm-graph-dot-mask">
              <rect width="100" height="100" fill="url(#mlm-graph-dot-fade)" />
            </mask>
          </defs>
          <rect width="100" height="100" fill="url(#mlm-graph-dot-grid)" mask="url(#mlm-graph-dot-mask)" />
        </svg>
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="mlm-causal-edge-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.38" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {(['hard', 'normal', 'soft', 'choice_available', 'choice_blocked'] as const).map((type) => {
              const style = graphEdgeStyle(type);
              return (
                <marker key={type} id={`mlm-causal-arrow-${type}`} markerWidth={3.5} markerHeight={2.8} refX={3.2} refY={1.4} orient="auto" markerUnits="strokeWidth">
                  <path d="M0.4,0.2 L3.2,1.4 L0.4,2.6 Z" fill={style.color} opacity={Math.min(1, style.opacity + 0.22)} />
                </marker>
              );
            })}
          </defs>
          {visualEdges.map((e, i) => {
            const from = e.from ? byId.get(e.from) : undefined;
            const to   = e.to   ? byId.get(e.to)   : undefined;
            if (!from || !to) return null;
            const resolvedType = resolveGraphEdgeType(e.type, e.strength);
            const style = graphEdgeStyle(resolvedType);
            const strength = e.strength ?? 0.55;
            const sw = style.strokeWidth + Math.max(0, strength - 0.5) * 0.06;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const fromRadius = from.isCentral ? 14.0 : 8.4;
            const toRadius = to.isCentral ? 14.2 : 8.6;
            const startX = from.x + (dx / len) * fromRadius;
            const startY = from.y + (dy / len) * fromRadius;
            const endX = to.x - (dx / len) * toRadius;
            const endY = to.y - (dy / len) * toRadius;
            // Proportional curvature capped at 4.5 SVG units — prevents large U-shaped arcs
            const curveFraction = resolvedType === 'soft' ? 0.09 : from.isCentral || to.isCentral ? 0.08 : 0.11;
            const baseCurve = Math.min(len * curveFraction, 4.5);
            const curveSide = i % 2 === 0 ? 1 : -1;
            const perpX = -(dy / len) * baseCurve * curveSide;
            const perpY = (dx / len) * baseCurve * curveSide;
            const cx1 = startX + (endX - startX) * 0.35 + perpX;
            const cy1 = startY + (endY - startY) * 0.35 + perpY;
            const cx2 = startX + (endX - startX) * 0.65 + perpX;
            const cy2 = startY + (endY - startY) * 0.65 + perpY;
            const useGlow = false;
            const pathD = `M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`;
            const humanEdgeTitle = buildHumanEdgeTitle(from.displayLabel, to.displayLabel, resolvedType, e.explanation ?? e.label);
            const handleEdgeTap = onEdgeClick ? () => onEdgeClick({
              type: 'graph-edge',
              eyebrow: 'Связь',
              title: humanEdgeTitle,
              tone: (resolvedType === 'hard' || resolvedType === 'choice_blocked') ? 'red' : resolvedType === 'choice_available' ? 'green' : resolvedType === 'soft' ? 'yellow' : 'purple',
              edgeType: resolvedType,
              strength: e.strength,
              explanation: has(e.explanation) ? e.explanation : `Это означает, что ${from.displayLabel.toLowerCase()} может запускать или усиливать ${to.displayLabel.toLowerCase()}. Это не приговор, а гипотеза по материалу.`,
              note: 'Связь показывает предполагаемую динамику по этому материалу.',
            }) : undefined;
            return (
              <g key={i}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={style.color}
                  strokeWidth={sw}
                  strokeOpacity={style.opacity}
                  strokeDasharray={style.dasharray}
                  strokeLinecap="butt"
                  filter={useGlow ? 'url(#mlm-causal-edge-glow)' : undefined}
                  markerEnd={style.marker ? `url(#mlm-causal-arrow-${resolvedType})` : undefined}
                />
                {handleEdgeTap && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={20}
                    strokeLinecap="round"
                    style={{ cursor: 'pointer' }}
                    onClick={handleEdgeTap}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Subtle cluster halos — system map layer */}
        {Array.from(toneGroups.entries()).map(([tone, positions]) => {
          if (positions.length < 2) return null;
          const cx = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
          const cy = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;
          const pal = graphNodePalette(tone);
          return (
            <div key={`cluster-halo-${tone}`} style={{
              position: 'absolute', left: `${cx}%`, top: `${cy}%`,
              width: 170, height: 130,
              transform: 'translate(-50%, -50%)',
              borderRadius: '55% 50% 60% 45% / 50% 60% 45% 55%',
              background: `radial-gradient(ellipse, rgba(${pal.glow},0.07) 0%, rgba(${pal.glow},0.03) 58%, transparent 82%)`,
              filter: 'blur(18px)',
              pointerEvents: 'none',
              zIndex: 1,
            }} />
          );
        })}

        {/* Per-node glow blobs — renders behind nodes */}
        {renderedGraphItems.map((n, i) => {
          const palette = graphNodePalette(n.tone);
          const sz = n.isCentral ? 116 : Math.max(62, Math.min(82, 62 + Math.round((n.intensity ?? 0.55) * 22)));
          const blobMul = n.isCentral ? 3.0 : 2.2;
          const alpha = n.isCentral ? '0.14' : '0.09';
          return (
            <div key={`blob-${n.id ?? i}`} style={{
              position: 'absolute', left: `${n.x}%`, top: `${n.y}%`,
              width: sz * blobMul, height: sz * blobMul,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${palette.glow},${alpha}) 0%, rgba(${palette.glow},${parseFloat(alpha) * 0.45}) 45%, transparent 72%)`,
              filter: 'blur(20px)',
              zIndex: 2,
              pointerEvents: 'none',
            }} />
          );
        })}

        {renderedGraphItems.map((n, i) => {
          const sz = n.isCentral ? 116 : Math.max(62, Math.min(82, 62 + Math.round((n.intensity ?? 0.55) * 22)));
          const palette = graphNodePalette(n.tone);
          const label = getShortLabel(n.displayLabel);
          const iconColor = n.isCentral ? '#fffaf2' : `${palette.deep}e6`;
          const centralChip = has(n.type) ? nodeTypeLabel(n.type) || 'главная тема' : 'главная тема';
          const handleNodeClick = onNodeClick ? () => {
            const outgoing = visualEdges.filter(e => e.from === n.id && e.to && byId.has(e.to)).slice(0, 3);
            const incoming = visualEdges.filter(e => e.to === n.id && e.from && byId.has(e.from)).slice(0, 3);
            const rows = [
              ...incoming.map(e => ({ label: `← ${byId.get(e.from!)?.displayLabel ?? e.from ?? ''}`, text: has(e.explanation) ? e.explanation : edgeTypeDescription(e.type) })),
              ...outgoing.map(e => ({ label: `→ ${byId.get(e.to!)?.displayLabel ?? e.to ?? ''}`, text: has(e.explanation) ? e.explanation : edgeTypeDescription(e.type) })),
            ].filter(r => r.label.length > 2);
            const nodeEvidence = activeNodes.find(an => an.id === n.id)?.evidence ?? [];
            const nodeLower = (n.displayLabel ?? '').toLowerCase();
            const nodeWhatItMeans = nodeLower.includes('контрол') || nodeLower.includes('защит')
              ? 'Эта тема отражает защитную реакцию — попытку управлять ситуацией, чтобы снизить тревогу.'
              : nodeLower.includes('вина') || nodeLower.includes('отдых')
                ? 'Эта тема связана с внутренним напряжением вокруг разрешения или запрета на что-то важное.'
                : nodeLower.includes('ценность') || nodeLower.includes('убежд')
                  ? 'Это убеждение или ценность, которое автоматически запускает поведение и оценку ситуации.'
                  : nodeLower.includes('тело') || nodeLower.includes('телес') || nodeLower.includes('перегрев')
                    ? 'Здесь паттерн проявляется через тело — усталость, напряжение, физическую реакцию.'
                    : 'Это повторяющаяся тема, которая участвует в общей цепочке паттерна.';
            const graphNodeRows = [
              ...rows,
              { label: 'Что это значит', text: nodeWhatItMeans },
            ].filter(r => has(r.text));
            onNodeClick({
              type: 'graph-node',
              eyebrow: 'Тема',
              title: n.displayLabel,
              tone: n.tone,
              percent: n.intensity,
              description: n.description,
              badge: n.isCentral ? 'Главная тема' : (has(n.type) ? nodeTypeLabel(n.type) || null : null),
              rows: graphNodeRows.length > 0 ? graphNodeRows : undefined,
              evidence: nodeEvidence.slice(0, 3),
              note: 'Это повторяющаяся тема, которая проявляется в материале.',
            });
          } : undefined;
          return (
            <div
              key={n.id ?? i}
              className="mlm-graph-node"
              title={n.displayLabel}
              aria-label={handleNodeClick ? `Открыть подробности узла: ${n.displayLabel}` : n.displayLabel}
              role={handleNodeClick ? 'button' : undefined}
              tabIndex={handleNodeClick ? 0 : undefined}
              onClick={handleNodeClick}
              onKeyDown={handleNodeClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeClick(); } } : undefined}
              style={{
                position: 'absolute', left: `${n.x}%`, top: `${n.y}%`,
                width: sz, height: sz,
                transform: 'translate(-50%, -50%)', borderRadius: '50%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '0.45rem', zIndex: 4,
                cursor: handleNodeClick ? 'pointer' : 'default',
                border: n.isCentral ? `1.5px solid rgba(255,250,242,0.80)` : `1px solid rgba(255,250,240,0.65)`,
                boxShadow: n.isCentral
                  ? `0 8px 22px rgba(191,81,71,0.13), 0 0 0 5px rgba(223,112,95,0.08), 0 0 0 12px rgba(223,112,95,0.03), inset 0 1px 0 rgba(255,255,255,0.20)`
                  : `0 5px 14px rgba(${palette.glow},0.09), 0 0 0 3px rgba(${palette.glow},0.05), inset 0 1px 0 rgba(255,255,255,0.16)`,
                background: n.isCentral
                  ? 'radial-gradient(circle at 38% 28%, rgba(255,255,255,0.18), transparent 38%), linear-gradient(148deg, #f0a091 0%, #dc7060 55%, #bf5147 100%)'
                  : `radial-gradient(circle at 38% 28%, rgba(255,255,255,0.22), transparent 38%), linear-gradient(145deg, ${palette.light} 0%, ${palette.base} 58%, ${palette.deep} 100%)`,
                color: '#2b241f',
              }}
            >
              {n.isCentral && (
                <span style={{
                  position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                  padding: '0.15rem 0.52rem', borderRadius: 999,
                  background: 'rgba(255,250,244,0.92)', border: '1px solid rgba(189,79,69,0.24)',
                  color: '#8a4e40', fontSize: '0.55rem', fontWeight: 760,
                  whiteSpace: 'nowrap', textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                  boxShadow: '0 1px 4px rgba(180,70,60,0.10)',
                }}>
                  {centralChip}
                </span>
              )}
              <span style={{ display: 'inline-flex', marginBottom: n.isCentral ? '0.28rem' : '0.16rem', color: iconColor }}>
                <GraphIcon kind={graphIconKind(n.displayLabel, n.type)} color={iconColor} size={n.isCentral ? 22 : 17} />
              </span>
              <strong style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: n.isCentral ? '0.77rem' : '0.67rem',
                lineHeight: 1.14,
                color: n.isCentral ? '#fffaf4' : palette.text,
                textShadow: n.isCentral ? '0 1px 3px rgba(75,39,29,0.22)' : '0 1px 1px rgba(255,255,255,0.18)',
                maxWidth: n.isCentral ? 94 : 74,
                fontWeight: n.isCentral ? 730 : 700,
              }}>
                {label}
              </strong>
              <span style={{
                display: 'block',
                fontSize: n.isCentral ? '0.65rem' : '0.62rem',
                fontWeight: 800,
                color: n.isCentral ? 'rgba(255,255,255,0.94)' : `${palette.text}e0`,
                marginTop: '0.12rem',
              }}>
                {fmtPct(n.intensity)}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '0.72rem 0.88rem 0.68rem',
        borderTop: '1px solid rgba(228,216,204,0.8)',
        background: 'rgba(255,251,246,0.62)',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.55rem 1.0rem',
          alignItems: 'flex-start',
        }}>
          {legendItems.slice(0, 5).map((item, index) => {
            const type = item.type ?? 'normal';
            const isNodeIndicator = type === 'choice_available' || type === 'choice_blocked';
            const isSoft = type === 'soft';
            const label = item.label ?? edgeTypeLabel(type);
            const desc = item.description ?? edgeTypeDescription(type);
            const edgeSt = graphEdgeStyle(type);
            return (
              <div key={`${type}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.14rem', minWidth: 0 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.38rem', whiteSpace: 'nowrap' }}>
                  {isNodeIndicator ? (
                    <span style={{
                      width: 11, height: 11,
                      borderRadius: '50%',
                      border: `1.5px solid ${edgeSt.color}`,
                      opacity: edgeSt.opacity,
                      flexShrink: 0,
                      display: 'inline-block',
                    }} />
                  ) : (
                    <span style={{
                      display: 'inline-block',
                      width: 22, height: 0,
                      borderTop: `${type === 'hard' ? 2 : type === 'normal' ? 1.5 : 1}px ${isSoft ? 'dashed' : 'solid'} ${edgeSt.color}`,
                      opacity: edgeSt.opacity,
                      flexShrink: 0,
                    }} />
                  )}
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4e4842', lineHeight: 1.2 }}>{label}</span>
                </span>
                {has(desc) && <span style={{ fontSize: '0.59rem', color: '#a09690', lineHeight: 1.25, paddingLeft: isNodeIndicator ? 19 : 30 }}>{desc}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {readRows.length > 0 && (
        <div style={{ padding: '0.85rem 1rem 0.9rem' }}>
          <SmallLabel>Ключевые связи</SmallLabel>
          <div style={{ marginTop: '0.42rem', display: 'flex', flexDirection: 'column', gap: '0.38rem' }}>
            {readRows.slice(0, 3).map((row, index) => {
              const e = row.edgeRef;
              const resolvedType = e ? resolveGraphEdgeType(e.type, e.strength) : 'normal';
              const fromNode2 = e && e.from ? byId.get(e.from) : undefined;
              const toNode2 = e && e.to ? byId.get(e.to) : undefined;
              const handleRowClick = (onEdgeClick && e && e.from && e.to && byId.has(e.from) && byId.has(e.to)) ? () => {
                const edgeExpl = has(e.explanation) ? e.explanation
                  : (fromNode2 && toNode2)
                    ? `Это означает, что ${fromNode2.displayLabel.toLowerCase()} может запускать или усиливать ${toNode2.displayLabel.toLowerCase()}. Это не приговор, а гипотеза по материалу.`
                    : null;
                onEdgeClick({
                  type: 'graph-edge',
                  eyebrow: 'Связь',
                  title: row.title,
                  tone: (resolvedType === 'hard' || resolvedType === 'choice_blocked') ? 'red' : resolvedType === 'choice_available' ? 'green' : resolvedType === 'soft' ? 'yellow' : 'purple',
                  edgeType: resolvedType,
                  strength: e.strength,
                  explanation: edgeExpl,
                  note: 'Связь показывает предполагаемую динамику по этому материалу.',
                });
              } : undefined;
              const edgeSt = graphEdgeStyle(resolvedType);
              return (
                <div
                  key={index}
                  className="mlm-graph-edge-row"
                  onClick={handleRowClick}
                  role={handleRowClick ? 'button' : undefined}
                  tabIndex={handleRowClick ? 0 : undefined}
                  onKeyDown={handleRowClick ? (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); handleRowClick(); } } : undefined}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    padding: '0.62rem 0.75rem', borderRadius: 14,
                    background: 'rgba(255,252,246,0.8)', border: '1px solid rgba(228,216,204,0.5)',
                    cursor: handleRowClick ? 'pointer' : 'default',
                  }}
                >
                  <span style={{ display: 'inline-block', marginTop: 6, flexShrink: 0, width: 20, height: 0, borderTop: `2px ${resolvedType === 'soft' ? 'dashed' : 'solid'} ${edgeSt.color}`, opacity: edgeSt.opacity }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 650, color: '#2d261f', lineHeight: 1.3 }}>{row.title}</span>
                    {has(row.description) && <span style={{ display: 'block', fontSize: '0.72rem', color: '#7d746b', lineHeight: 1.45, marginTop: 2 }}>{softClampText(row.description, 100) ?? row.description}</span>}
                  </span>
                  {handleRowClick && <span style={{ flexShrink: 0, fontSize: '10px', color: '#b0a898', marginTop: 4 }}>→</span>}
                </div>
              );
            })}
          </div>
          {(readRows.length > 3 || hiddenReadRows.length > 0) && (
            <DisclosurePanel summary={`Показать все ${allReadRows.length} связи`} tone="beige">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {allReadRows.slice(3).map((row, index) => (
                  <div key={`all-row-${index}`} style={{ fontSize: '0.78rem', color: '#665c53', lineHeight: 1.48, padding: '0.2rem 0' }}>
                    <strong style={{ color: '#2d261f', fontWeight: 650 }}>{row.title}</strong>
                    {has(row.description) && <span> — {row.description}</span>}
                  </div>
                ))}
              </div>
            </DisclosurePanel>
          )}
        </div>
      )}

    </div>
  );
}

// ── Section components ────────────────────────────────────────────────────────

function mapOverheatLabel(label: string | null | undefined): string | null {
  if (!has(label)) return null;
  const lower = label.toLowerCase().trim();
  if (lower === 'high') return 'Высокая активность';
  if (lower === 'medium') return 'Средняя активность';
  if (lower === 'low') return 'Низкая активность';
  return label;
}

function OverheatTile({ report, activeNodes }: { report: MindloomReportV2; activeNodes: MindloomReportV2Node[] }) {
  const snap = report.snapshot;
  const rawLabel = snap?.main_overheat?.label ?? report.processing_dashboard.priority ?? getStrongestNode(activeNodes)?.label ?? getStrongestZone(report)?.label;
  const overheatLabel = mapOverheatLabel(rawLabel);
  const overheatScore = snap?.main_overheat?.score ?? report.processing_dashboard.overheat_level ?? getStrongestNode(activeNodes)?.intensity ?? getStrongestZone(report)?.intensity;
  const overheatExplanation = snap?.main_overheat?.explanation ?? report.target.short_explanation ?? getStrongestNode(activeNodes)?.description;
  if (overheatScore == null && !has(overheatLabel)) return null;
  const pct = clampInt(overheatScore);
  return (
    <section style={{ paddingInline: '1.25rem' }}>
      <div style={{ borderRadius: VS.r.xl, overflow: 'hidden', background: 'linear-gradient(135deg, #fff9f7 0%, #fff3ef 100%)', border: '1px solid rgba(228,111,97,0.12)', boxShadow: VS.shadow.card }}>
        <div style={{ padding: '1.1rem 1.2rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <MLIcon name="heat" tone="red" size={15} />
            <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: '#a87068' }}>Самый заметный паттерн</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div>
              {has(overheatLabel) && <div style={{ fontSize: 'clamp(16px, 4.5vw, 22px)', fontWeight: 660, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#2e1c18' }}>{overheatLabel}</div>}
              {overheatScore != null && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 4 }}>
                  <span style={{ fontSize: 30, lineHeight: 1, fontWeight: 680, color: '#c8706a' }}>{pct}</span>
                  <span style={{ fontSize: 13, fontWeight: 680, color: '#c8706a' }}>%</span>
                  <span style={{ fontSize: 11, color: '#a89090', marginLeft: 4, fontWeight: 500 }}>— насколько сильно тема проявилась в материале</span>
                </div>
              )}
            </div>
          </div>
          {overheatScore != null && (
            <div style={{ marginTop: '0.65rem', height: 4, borderRadius: 999, background: 'rgba(228,111,97,0.10)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #f2b8ae, #c8706a)' }} />
            </div>
          )}
          {has(overheatExplanation) && (
            <p style={{ margin: '0.55rem 0 0', fontSize: '12.5px', lineHeight: 1.58, color: '#8a6860' }}>{sanitizeUserText(softClampText(overheatExplanation, 160)) ?? sanitizeUserText(overheatExplanation)}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroSection({ report, createdAt }: { report: MindloomReportV2; createdAt: string }) {
  const rawTitle = report.snapshot?.key_pattern ?? report.hero.title ?? 'Отчёт Mindloom';
  const title = sanitizeUserText(rawTitle) ?? rawTitle;
  const subtitle = report.snapshot?.short_explanation ?? report.hero.main_insight ?? report.hero.one_sentence_summary;
  const activeCount = report.active_nodes.filter(n => n.label || n.description || n.id).length;

  return (
    <header style={{ paddingInline: '1.25rem' }}>
      <div style={{
        position: 'relative',
        padding: '1.55rem 1.35rem 1.3rem',
        background: 'linear-gradient(155deg, #fffef9 0%, #fbf6ed 60%, #f5f0e8 100%)',
        border: '1px solid rgba(118,92,68,0.11)',
        borderRadius: VS.r.hero,
        boxShadow: '0 4px 18px rgba(70,53,35,0.052), 0 14px 44px rgba(70,53,35,0.048)',
        overflow: 'hidden',
        transform: 'translateZ(0)',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,101,90,0.12), rgba(127,104,217,0.06) 50%, transparent 70%)', filter: 'blur(6px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -86, left: -52, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(104,169,141,0.12), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '0.32rem 0.8rem', borderRadius: 999, background: '#fff', border: '1px solid rgba(118,92,68,0.14)', fontSize: 11, fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: '#e46f61', display: 'inline-block' }} />
              Mindloom
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase', fontWeight: 760, color: '#7d746b' }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: '#e46f61', display: 'inline-block' }} />
              отчёт
            </div>
          </div>

          <div style={{ marginTop: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, color: '#9a6c5e' }}>Ключевой паттерн</span>
          </div>

          <h1 style={{ margin: '0.5rem 0 0.65rem', fontSize: 'clamp(26px, 7.5vw, 36px)', lineHeight: 1.1, fontWeight: 720, letterSpacing: '-0.02em', color: '#201d1b' }}>
            {accentHeroTitle(title)}
          </h1>

          {has(subtitle) && (
            <p style={{ margin: '0 0 0.75rem', fontSize: '14.5px', lineHeight: 1.55, color: '#7d746b' }}>
              {sanitizeUserText(subtitle)}
            </p>
          )}

          <div style={{ marginBottom: '0.9rem', borderRadius: 14, padding: '0.75rem 0.95rem', background: 'rgba(255,255,255,0.58)', border: '1px solid rgba(118,92,68,0.11)' }}>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#4a4038' }}>
              Это психологический аналитический отчёт Mindloom по вашему материалу. Это не медицинская справка, не диагноз и не замена специалиста. Ниже — гипотеза о том, какой повторяющийся паттерн заметен, где он проявляется и с чего можно начать.
            </p>
            <p style={{ margin: '0.45rem 0 0', fontSize: '11.5px', lineHeight: 1.55, color: '#8a8077' }}>
              Читайте сверху вниз: сначала — главный паттерн, затем — почему он повторяется, в конце — маленькие шаги.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => document.getElementById('mlm-evidence-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                title="Перейти к основаниям отчёта"
                className="mlm-interactive-card"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '0.5rem 0.85rem', borderRadius: VS.r.row,
                  background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(118,92,68,0.15)',
                  cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#201d1b',
                }}
              >
                <span style={{ color: '#7d746b' }}>На чём основан отчёт</span>
                <span style={{ color: '#9d8f84', fontSize: 10 }}>↓</span>
              </button>
            )}
          </div>

          {(has(report.participant.name) || has(createdAt)) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.65rem' }}>
              {has(report.participant.name) && (
                <span style={{ fontSize: 10, color: '#a09690', fontWeight: 600 }}>{report.participant.name}</span>
              )}
              {has(report.participant.name) && has(createdAt) && <span style={{ fontSize: 10, color: '#c8bfb8' }}>·</span>}
              <span style={{ fontSize: 10, color: '#a09690' }}>{fmtDate(createdAt)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HeatmapSection({ heatmap, activeNodes, graphNodes, keyPhrases }: {
  heatmap: MindloomReportV2['heatmap'];
  activeNodes: MindloomReportV2Node[];
  graphNodes?: MindloomReportV2GraphNode[];
  keyPhrases?: string[];
}) {
  const [selectedNode, setSelectedNode] = useState<DetailSheetState | null>(null);
  return (
    <SectionShell
      icon="heat"
      title="Что звучит сильнее всего"
      intro="Карта показывает, какие темы выражены сильнее других и какими фразами они подтверждаются."
    >
      <p style={{ margin: '0 0 0.6rem', fontSize: '12px', color: '#8a8077', lineHeight: 1.5 }}>
        Нажмите на тему — увидите, какими фразами и выводами она подтверждается.
      </p>
      <NeuroHeatmapCanvasFirst zones={heatmap.zones} nodes={activeNodes} heatmap={heatmap} onNodeClick={setSelectedNode} activeNodesRef={activeNodes} graphNodesRef={graphNodes} keyPhrasesRef={keyPhrases} />
      <ReportDetailSheet state={selectedNode} onClose={() => setSelectedNode(null)} />
    </SectionShell>
  );
}

function NodeGraphSection({ nodeGraph, activeNodes }: {
  nodeGraph: MindloomReportV2['node_graph'];
  activeNodes: MindloomReportV2Node[];
}) {
  const [selectedDetail, setSelectedDetail] = useState<DetailSheetState | null>(null);
  return (
    <SectionShell
      icon="network"
      title={humanizeGraphTitle(nodeGraph.title)}
      intro="Этот блок показывает возможные связи между темами: что может усиливать другое и где появляется повторяющийся цикл."
    >
      <p style={{ margin: '0 0 0.6rem', fontSize: '12px', color: '#8a8077', lineHeight: 1.5 }}>
        Нажмите на тему или связь — увидите короткое объяснение.
      </p>
      {has(nodeGraph.description) && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.87rem', color: '#5a5450', lineHeight: 1.65 }}>{sanitizeUserText(nodeGraph.description) ?? nodeGraph.description}</p>
      )}
      <NeuroNodeGraph
        graphNodes={nodeGraph.nodes}
        activeNodes={activeNodes}
        edges={nodeGraph.edges}
        centralNodeId={nodeGraph.central_node_id}
        legend={nodeGraph.legend}
        howToRead={nodeGraph.how_to_read}
        edgeLimit={4}
        onNodeClick={setSelectedDetail}
        onEdgeClick={setSelectedDetail}
      />
      <ReportDetailSheet state={selectedDetail} onClose={() => setSelectedDetail(null)} />
    </SectionShell>
  );
}

function TrajectorySection({ trajectory }: { trajectory: MindloomReportV2['trajectory'] }) {
  const hasCycle = trajectory.cycle.length > 0;
  const hasExtra = has(trajectory.blocking_point) || has(trajectory.possible_exit);
  if (!hasCycle && !hasExtra) return null;

  return (
    <SectionShell title="Цикл паттерна" icon="cycle" intro="Здесь показано, как паттерн может запускаться снова: с чего начинается, чем продолжается и где можно выйти из цикла.">

      {hasCycle && (
        <SharedPanel padding="1.08rem 1rem">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: hasExtra ? '0.9rem' : '0' }}>
          {trajectory.cycle.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.7rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: '#ece8ff', color: '#5244a8', fontSize: '0.68rem', fontWeight: 900,
                }}>{i + 1}</span>
                {i < trajectory.cycle.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: '#ddd4e8', minHeight: 16, margin: '0.25rem 0' }} />
                )}
              </div>
              <p style={{ margin: '0.35rem 0', paddingBottom: i < trajectory.cycle.length - 1 ? '0.2rem' : '0', fontSize: '0.9rem', color: '#2e2820', lineHeight: 1.6 }}>
                {sanitizeUserText(step) ?? step}
              </p>
            </div>
          ))}
        </div>
        </SharedPanel>
      )}

      {hasExtra && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.75rem' }}>
          {has(trajectory.blocking_point) && <BentoTile tone="red" padding="1rem 1rem">
            <MLIcon name="warning" tone="red" size={16} />
            <div style={{ marginTop: '0.6rem', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#a8392c' }}>Точка блокировки</div>
            <div style={{ marginTop: 5, fontSize: '12.5px', lineHeight: 1.55 }}>{sanitizeUserText(trajectory.blocking_point) ?? trajectory.blocking_point}</div>
          </BentoTile>}
          {has(trajectory.possible_exit) && <BentoTile tone="green" padding="1rem 1rem">
            <MLIcon name="compass" tone="green" size={16} />
            <div style={{ marginTop: '0.6rem', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#3f6e5a' }}>Возможный выход</div>
            <div style={{ marginTop: 5, fontSize: '12.5px', lineHeight: 1.55 }}>{sanitizeUserText(trajectory.possible_exit) ?? trajectory.possible_exit}</div>
          </BentoTile>}
        </div>
      )}
    </SectionShell>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

function EvidenceLayerSectionExact({ report, activeNodes, onOpen }: {
  report: MindloomReportV2;
  activeNodes: MindloomReportV2Node[];
  onOpen?: (s: DetailSheetState) => void;
}) {
  const hyps = report.hypothesis_table.filter(h => has(h.hypothesis));
  if (activeNodes.length === 0 && hyps.length === 0) return null;
  const visibleNodes = activeNodes.slice(0, 4);
  const hiddenNodes = activeNodes.slice(4);
  const sortedHyps = [...hyps].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  const visibleHyps = sortedHyps.slice(0, 1);
  const hiddenHyps = sortedHyps.slice(1);
  const nodeById = new Map(activeNodes.filter(n => n.id).map(n => [n.id!, n]));
  const metrics = [
    { value: activeNodes.length, label: activeNodes.length === 1 ? 'ключевая тема' : activeNodes.length < 5 ? 'ключевые темы' : 'ключевых тем', tone: 'purple' as const, color: '#5244a8' },
    { value: hyps.length, label: hyps.length === 1 ? 'гипотеза' : hyps.length < 5 ? 'гипотезы' : 'гипотез', tone: 'yellow' as const, color: '#c98a30' },
    { value: report.speech_layer.key_phrases.length, label: report.speech_layer.key_phrases.length === 1 ? 'фрагмент речи' : report.speech_layer.key_phrases.length < 5 ? 'фрагмента речи' : 'фрагментов речи', tone: 'green' as const, color: '#38967c' },
  ].filter(item => item.value > 0);

  return (
    <SectionShell title="На чём основаны выводы" icon="eye" id="mlm-evidence-section" intro="Этот блок нужен для проверки отчёта: здесь видно, какие темы, гипотезы и фразы лежат в основе выводов.">
      {metrics.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))`, gap: '0.5rem', marginBottom: '0.5rem' }}>
            {metrics.map((item) => (
              <BentoTile key={item.label} tone={item.tone} padding="0.82rem 0.6rem">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</div>
                  <div style={{ marginTop: '0.22rem', fontSize: '0.64rem', lineHeight: 1.35, color: '#7d746b' }}>{item.label}</div>
                </div>
              </BentoTile>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.14rem', padding: '0.55rem 0.7rem', borderRadius: 12, background: 'rgba(255,252,246,0.7)', border: '1px solid rgba(118,92,68,0.09)', marginBottom: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.5, color: '#8a8077' }}><strong style={{ color: '#5244a8', fontWeight: 700 }}>Ключевые темы</strong> — повторяющиеся темы из материала.</p>
            <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.5, color: '#8a8077' }}><strong style={{ color: '#c98a30', fontWeight: 700 }}>Гипотеза</strong> — возможное объяснение, которое отчёт предлагает проверить.</p>
            <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.5, color: '#8a8077' }}><strong style={{ color: '#38967c', fontWeight: 700 }}>Фрагменты речи</strong> — конкретные цитаты, на которые опирается вывод.</p>
          </div>
        </>
      )}
      {visibleNodes.length > 0 && (
        <SharedPanel padding="1.05rem 1rem">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ fontSize: '0.67rem', fontWeight: 760, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7d746b' }}>
              Ключевые темы
            </div>
            {activeNodes.length > 4 && (
              <div style={{ fontSize: '0.66rem', color: '#a09690' }}>
                Показаны самые активные из {activeNodes.length}
              </div>
            )}
          </div>
          {visibleNodes.map((node, i) => {
            const tone = toneFromColor(node.color);
            const hex = toneHex(tone !== 'gray' ? tone : 'purple');
            const handleNodeOpen = onOpen ? () => onOpen({
              type: 'evidence-node',
              eyebrow: 'Основания отчёта',
              title: node.label ?? node.id ?? `Тема ${i + 1}`,
              tone: tone !== 'gray' ? tone : 'purple',
              percent: node.intensity,
              description: node.description,
              badge: has(node.type) ? nodeTypeLabel(node.type) || null : null,
              evidence: node.evidence.slice(0, 4),
              note: 'Тема — повторяющийся элемент, который проявляется в материале.',
            }) : undefined;
            return (
              <div key={node.id ?? i}>
                <div
                  className={handleNodeOpen ? 'mlm-clickable-row' : undefined}
                  style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem 0', cursor: handleNodeOpen ? 'pointer' : 'default' }}
                  onClick={handleNodeOpen}
                  role={handleNodeOpen ? 'button' : undefined}
                  tabIndex={handleNodeOpen ? 0 : undefined}
                  onKeyDown={handleNodeOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeOpen(); } } : undefined}
                  aria-label={handleNodeOpen ? `Открыть подробности: ${node.label ?? `Тема ${i + 1}`}` : undefined}
                >
                  <div style={{ width: 28, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', margin: '0 auto', background: `${hex}18`, color: hex, fontSize: 11, fontWeight: 740 }}>{i + 1}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, lineHeight: 1.28 }}>{node.label ?? node.id ?? `Тема ${i + 1}`}</div>
                      <div style={{ fontSize: '13px', fontWeight: 740, color: hex, flexShrink: 0 }}>{fmtPct(node.intensity)}</div>
                    </div>
                    <div style={{ marginTop: '0.35rem', height: 4, borderRadius: 999, background: '#f1e8de', overflow: 'hidden' }}>
                      <div style={{ width: `${clampInt(node.intensity)}%`, height: '100%', borderRadius: 999, background: hex }} />
                    </div>
                    {has(node.description) && <div style={{ marginTop: '0.45rem', fontSize: '12.5px', color: '#5d564f', lineHeight: 1.6 }}>{sanitizeUserText(node.description) ?? node.description}</div>}
                    {node.evidence.slice(0, 2).map((ev, ei) => <QuoteRow key={ei} text={ev} />)}
                    {(() => {
                      const extraEv = node.evidence.slice(2);
                      if (extraEv.length === 0) return null;
                      return (
                        <DisclosurePanel summary={`Показать ещё ${extraEv.length}`} tone="beige">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.3rem' }}>
                            {extraEv.map((ev, ei) => <QuoteRow key={ei} text={ev} />)}
                          </div>
                        </DisclosurePanel>
                      );
                    })()}
                  </div>
                </div>
                {i < visibleNodes.length - 1 && <DottedDivider margin="0" />}
              </div>
            );
          })}
        </SharedPanel>
      )}
      {(hiddenNodes.length > 0 || hiddenHyps.length > 0) && (
        <DisclosurePanel summary={`Показать все темы${hiddenNodes.length > 0 ? ` (ещё ${hiddenNodes.length})` : ''}`} tone="beige">
          {hiddenNodes.length > 0 && (
            <SharedPanel padding="0.85rem 1rem">
              {hiddenNodes.map((node, i) => {
                const nodeTone = toneFromColor(node.color);
                const nodeHex = toneHex(nodeTone !== 'gray' ? nodeTone : 'purple');
                return (
                  <div key={node.id ?? `hidden-node-${i}`}>
                    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0' }}>
                      <div style={{ width: 28, flexShrink: 0, textAlign: 'center' }}>
                        <div style={{ width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', margin: '0 auto', background: `${nodeHex}18`, color: nodeHex, fontSize: 11, fontWeight: 740 }}>{visibleNodes.length + i + 1}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, lineHeight: 1.28 }}>{node.label ?? node.id ?? `Тема ${i + 5}`}</div>
                          <div style={{ fontSize: '13px', fontWeight: 740, color: nodeHex, flexShrink: 0 }}>{fmtPct(node.intensity)}</div>
                        </div>
                        <div style={{ marginTop: '0.32rem', height: 4, borderRadius: 999, background: '#f1e8de', overflow: 'hidden' }}>
                          <div style={{ width: `${clampInt(node.intensity)}%`, height: '100%', borderRadius: 999, background: nodeHex }} />
                        </div>
                        {has(node.description) && <div style={{ marginTop: '0.4rem', fontSize: '12px', color: '#5d564f', lineHeight: 1.58 }}>{node.description}</div>}
                      </div>
                    </div>
                    {i < hiddenNodes.length - 1 && <DottedDivider margin="0" />}
                  </div>
                );
              })}
            </SharedPanel>
          )}
          {hiddenHyps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {hiddenHyps.map((hyp, i) => {
                const relatedNode = hyp.node_id ? nodeById.get(hyp.node_id) : undefined;
                return (
                  <div key={`hidden-hyp-${i}`} style={{ borderRadius: 18, border: '1px solid rgba(228,166,52,0.18)', background: '#fff7df', padding: '0.72rem 0.85rem' }}>
                    <div style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#45331c' }}>{hyp.hypothesis}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                      {relatedNode?.label && <Chip tone="yellow">{relatedNode.label}</Chip>}
                      {typeof hyp.confidence === 'number' && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7a6020' }}>{fmtPct(hyp.confidence)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DisclosurePanel>
      )}
      {visibleHyps.length > 0 && (
        <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ marginBottom: '0.25rem', fontSize: '0.67rem', fontWeight: 760, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7d746b' }}>
            Почему мы так думаем
          </div>
          {visibleHyps.map((hyp, i) => {
            const relatedNode = hyp.node_id ? nodeById.get(hyp.node_id) : undefined;
            return (
              <div key={i} style={{ background: '#fff7df', border: '1px solid rgba(228,166,52,0.18)', borderRadius: 22, padding: '0.9rem 1rem' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 650, color: '#2a1e08', lineHeight: 1.55 }}>{sanitizeUserText(hyp.hypothesis) ?? hyp.hypothesis}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center', marginTop: '0.45rem' }}>
                  {relatedNode?.label && <Chip tone="yellow">{relatedNode.label}</Chip>}
                  {typeof hyp.confidence === 'number' && <span style={{ fontSize: '0.74rem', color: '#7a6020', fontWeight: 650 }}>уверенность {fmtPct(hyp.confidence)}</span>}
                </div>
                {hyp.evidence.slice(0, 1).map((ev, ei) => <QuoteRow key={ei} text={ev} />)}
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

function LayersSectionExact({ layers, onOpen }: { layers: MindloomReportV2['mindloom_layers']; onOpen?: (s: DetailSheetState) => void }) {
  const visible = [...layers].sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0)).slice(0, 5);
  const hidden = [...layers].sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0)).slice(5);
  return (
    <SectionShell title="На каких уровнях это заметно" icon="layers" intro="Здесь показано, где паттерн проявляется сильнее: в мыслях, реакциях тела, потребностях или поведении.">
      <SharedPanel padding="1.05rem 1rem">
        {visible.map((layer, i) => {
          const quote = layer.evidence[0] ?? layer.manifestation ?? layer.description;
          const tone = i === 0 ? 'blue' : i === 1 ? 'yellow' : i === 2 ? 'red' : i === 3 ? 'purple' : 'green';
          const color = toneHex(tone);
          const layerLower = (layer.layer ?? '').toLowerCase();
          const layerFallbackWhy = layerLower.includes('потреб') || layerLower.includes('need') || layerLower.includes('unmet')
            ? 'Этот уровень показывает, какая потребность может стоять под напряжением.'
            : layerLower.includes('защит') || layerLower.includes('defense') || layerLower.includes('protect')
              ? 'Этот уровень показывает защитную реакцию — и какой ценой она обходится.'
              : layerLower.includes('тело') || layerLower.includes('телес') || layerLower.includes('somatic') || layerLower.includes('body')
                ? 'Этот уровень показывает, где паттерн проявляется через тело — напряжение, усталость, физические реакции.'
                : layerLower.includes('убежд') || layerLower.includes('belief')
                  ? 'Это убеждение, которое продолжает поддерживать паттерн.'
                  : layerLower.includes('повед') || layerLower.includes('behavior')
                    ? 'Поведенческий уровень: реакция, которая закрепилась и запускается автоматически.'
                    : 'Этот уровень показывает, где паттерн проявляется заметнее всего.';
          const allEvidence = layer.evidence.filter(e => has(e));
          const observeHint = layerLower.includes('потреб') || layerLower.includes('need') || layerLower.includes('unmet')
            ? 'Когда появляется напряжение — задайте себе вопрос: «Какая потребность сейчас не удовлетворена?»'
            : layerLower.includes('защит') || layerLower.includes('defense') || layerLower.includes('protect')
              ? 'Замечайте моменты включения контроля или избегания — это первый сигнал активации слоя.'
              : layerLower.includes('тело') || layerLower.includes('телес') || layerLower.includes('somatic') || layerLower.includes('body')
                ? 'Обращайте внимание на телесные ощущения — напряжение, усталость, зажатость — как первый сигнал.'
                : layerLower.includes('убежд') || layerLower.includes('belief')
                  ? 'Замечайте автоматические мысли — они срабатывают раньше, чем вы успеваете осознать.'
                  : 'Замечайте привычную реакцию, которая включается автоматически в похожих ситуациях.';
          const sheetRows: Array<{ label: string; text?: string | null }> = [];
          sheetRows.push({ label: 'Что это значит', text: layerFallbackWhy });
          if (has(layer.manifestation) && layer.manifestation !== layer.description) {
            sheetRows.push({ label: 'Как проявляется', text: layer.manifestation });
          }
          sheetRows.push({ label: 'На что обратить внимание', text: observeHint });
          const handleLayerOpen = onOpen ? () => onOpen({
            type: 'layer',
            eyebrow: 'Уровень проявления',
            title: layer.layer ?? `Уровень ${i + 1}`,
            tone,
            percent: layer.intensity,
            description: has(layer.description) ? layer.description : null,
            rows: sheetRows,
            evidence: allEvidence.slice(0, 3),
            note: 'Здесь видно, на каком уровне паттерн проявляется сильнее. Это может подсказать, с чего начать мягкий сдвиг.',
          }) : undefined;
          return (
            <div key={i}>
              <div
                className={handleLayerOpen ? 'mlm-clickable-row' : undefined}
                style={{ display: 'flex', gap: '0.75rem', padding: '0.92rem 0', cursor: handleLayerOpen ? 'pointer' : 'default' }}
                onClick={handleLayerOpen}
                role={handleLayerOpen ? 'button' : undefined}
                tabIndex={handleLayerOpen ? 0 : undefined}
                onKeyDown={handleLayerOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLayerOpen(); } } : undefined}
                aria-label={handleLayerOpen ? `Открыть подробности: ${layer.layer ?? `Уровень ${i + 1}`}` : undefined}
              >
                <div style={{ width: 28, flexShrink: 0, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 740, color: '#7d746b' }}>{String(i + 1)}</div>
                  <div style={{ width: 28, height: 28, borderRadius: 10, display: 'grid', placeItems: 'center', marginTop: 4, background: `${color}14` }}>
                    <MLIcon name={i === 0 ? 'shield' : i === 1 ? 'target' : i === 2 ? 'warning' : i === 3 ? 'cycle' : 'body'} tone={tone} size={14} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '13.5px', lineHeight: 1.3, color: '#1e1a16' }}>{layer.layer ?? `Уровень ${i + 1}`}</strong>
                    <span style={{ fontSize: '13px', fontWeight: 740, color }}>{fmtPct(layer.intensity)}</span>
                  </div>
                  <div style={{ marginTop: '0.35rem', height: 4, borderRadius: 999, background: '#f1e8de', overflow: 'hidden' }}>
                    <div style={{ width: `${clampInt(layer.intensity)}%`, height: '100%', borderRadius: 999, background: color }} />
                  </div>
                  {has(quote) && <div style={{ marginTop: '0.35rem', fontSize: '11.5px', fontStyle: 'italic', color: '#7d746b', lineHeight: 1.55 }}>{`«${sanitizeUserText(quote) ?? quote}»`}</div>}
                  {handleLayerOpen && <span style={{ display: 'inline-block', marginTop: '0.28rem', fontSize: '0.62rem', color: '#c0b8b0', fontWeight: 600, letterSpacing: '0.04em' }}>подробнее →</span>}
                </div>
              </div>
              {i < visible.length - 1 && <DottedDivider margin="0" />}
            </div>
          );
        })}
        {hidden.length > 0 && (
          <DisclosurePanel summary={`Ещё ${hidden.length}`} tone="blue">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {hidden.map((layer, index) => (
                <div key={`hidden-layer-${index}`} style={{ padding: '0.1rem 0.2rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.82rem', lineHeight: 1.35 }}>{layer.layer ?? `Уровень ${index + visible.length + 1}`}</strong>
                  {has(layer.description) && <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', lineHeight: 1.52, color: '#665c53' }}>{layer.description}</p>}
                </div>
              ))}
            </div>
          </DisclosurePanel>
        )}
      </SharedPanel>
    </SectionShell>
  );
}

function MarkersSectionExact({ markers, onOpen }: { markers: MindloomReportV2['transformation_markers']; onOpen?: (s: DetailSheetState) => void }) {
  const visible = markers.slice(0, 4);
  const hidden = markers.slice(4);
  return (
    <SectionShell title="Признаки сдвига" icon="check" intro="Этот блок показывает маленькие признаки, по которым можно заметить, что паттерн начинает ослабевать.">
      <SharedPanel padding="1.05rem 1rem">
        {visible.map((item, i) => {
          const hasSheetContent = has(item.description) || has(item.shift_signal) || has(item.marker);
          const markerSheetRows: Array<{ label: string; text?: string | null }> = [];
          markerSheetRows.push({
            label: 'Почему важно',
            text: 'Наблюдение за маркером помогает замечать реальные маленькие сдвиги — до того, как произойдёт большое изменение.',
          });
          if (has(item.shift_signal)) {
            markerSheetRows.push({ label: 'Первый сигнал изменения', text: item.shift_signal });
          }
          markerSheetRows.push({
            label: 'Как замечать в течение дня',
            text: 'Выберите 1–2 ситуации за день и проверьте: проявляется ли этот маркер. Даже автоматическая реакция — уже наблюдение.',
          });
          const handleMarkerOpen = (onOpen && hasSheetContent) ? () => onOpen({
            type: 'marker',
            eyebrow: 'Признак изменения',
            title: item.marker ?? `Признак ${i + 1}`,
            tone: has(item.shift_signal) ? 'green' : 'blue',
            description: has(item.description) ? item.description : null,
            rows: markerSheetRows,
            note: 'Если вы замечаете этот сигнал раньше, чем действуете автоматически, связь уже начинает ослабляться.',
          }) : undefined;
          return (
            <div key={i}>
              <div
                className={handleMarkerOpen ? 'mlm-clickable-row' : undefined}
                style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.86rem 0', cursor: handleMarkerOpen ? 'pointer' : 'default' }}
                onClick={handleMarkerOpen}
                role={handleMarkerOpen ? 'button' : undefined}
                tabIndex={handleMarkerOpen ? 0 : undefined}
                onKeyDown={handleMarkerOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMarkerOpen(); } } : undefined}
                aria-label={handleMarkerOpen ? `Открыть подробности: ${item.marker ?? `Признак ${i + 1}`}` : undefined}
              >
                <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 10, background: has(item.shift_signal) ? '#edf9f3' : '#edf6ff', border: `1px solid ${has(item.shift_signal) ? 'rgba(104,169,141,0.25)' : 'rgba(74,149,211,0.22)'}`, display: 'grid', placeItems: 'center', marginTop: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 760, color: has(item.shift_signal) ? '#3f6e5a' : '#326ea6' }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 650, lineHeight: 1.35, color: '#1e1a16' }}>{item.marker ?? `Признак ${i + 1}`}</div>
                  {has(item.shift_signal) && <div style={{ marginTop: '0.3rem', fontSize: '11.5px', color: '#3f6e5a', lineHeight: 1.45 }}>{sanitizeUserText(softClampText(item.shift_signal, 80)) ?? sanitizeUserText(item.shift_signal) ?? item.shift_signal}</div>}
                </div>
                {handleMarkerOpen && <span style={{ flexShrink: 0, fontSize: 10, color: '#b0a898', marginTop: 6 }}>→</span>}
              </div>
              {i < visible.length - 1 && <DottedDivider margin="0" />}
            </div>
          );
        })}
        {hidden.length > 0 && (
          <DisclosurePanel summary={`Ещё ${hidden.length}`} tone="green">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {hidden.map((item, index) => (
                <div key={`hidden-marker-${index}`} style={{ padding: '0.15rem 0.2rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.82rem', lineHeight: 1.35 }}>{item.marker ?? `Признак ${index + visible.length + 1}`}</strong>
                  {has(item.description) && <p style={{ margin: '0.18rem 0 0', fontSize: '0.78rem', lineHeight: 1.52, color: '#665c53' }}>{item.description}</p>}
                </div>
              ))}
            </div>
          </DisclosurePanel>
        )}
      </SharedPanel>
    </SectionShell>
  );
}

function PracticesSectionExact({ practices, activeNodes }: {
  practices: MindloomReportV2['recommended_practices'];
  activeNodes: MindloomReportV2Node[];
}) {
  const visible = practices.slice(0, 3);
  const hidden = practices.slice(3);
  const tones = [
    { tone: 'green' as const, bg: 'linear-gradient(135deg, #eef9f4, transparent)', border: 'rgba(104,169,141,0.20)' },
    { tone: 'blue' as const, bg: 'linear-gradient(135deg, #eef7ff, transparent)', border: 'rgba(74,149,211,0.18)' },
    { tone: 'purple' as const, bg: 'linear-gradient(135deg, #f4f2ff, transparent)', border: 'rgba(127,104,217,0.18)' },
  ];
  return (
    <SectionShell title={visible.length > 0 ? 'Три практики на неделю' : 'С чего начать'} icon="practice" intro="Выберите одну практику. Задача — не изменить всё сразу, а мягко проверить один новый способ действия.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {visible.map((item, i) => {
          const t = tones[i % tones.length];
          const targetLabel = item.target_node ? (activeNodes.find(n => n.id === item.target_node)?.label ?? item.target_node) : null;
          return (
            <div key={i} style={{ borderRadius: VS.r.xl, overflow: 'hidden', background: '#fffdf8', border: `1px solid ${t.border}`, boxShadow: VS.shadow.panel }}>
              <div style={{ padding: '1rem 1rem 0.9rem', background: t.bg }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 16, display: 'grid', placeItems: 'center', flexShrink: 0, background: 'rgba(255,253,248,0.7)', border: `1px solid ${t.border}` }}>
                    <MLIcon name="practice" tone={t.tone} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: toneSurface(t.tone).deep }}>Практика {i + 1}</div>
                    {has(item.title) && <div style={{ marginTop: 4, fontSize: '17px', fontWeight: 720, lineHeight: 1.18, letterSpacing: '-0.02em' }}>{item.title}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.7rem' }}>
                  {targetLabel && <Chip tone={t.tone}>{targetLabel}</Chip>}
                  {has(item.layer) && <Chip tone={t.tone}>{item.layer}</Chip>}
                  {has(item.frequency) && <Chip tone="beige">{item.frequency}</Chip>}
                </div>
              </div>
              <div style={{ padding: '0 1rem 1rem' }}>
                {has(item.purpose) && (
                  <div style={{ padding: '0.82rem 0', borderTop: '1px solid rgba(118,92,68,0.14)' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: toneSurface(t.tone).deep }}>Цель</div>
                    <div style={{ marginTop: 4, fontSize: '13px', lineHeight: 1.58, color: '#2e2820' }}>{sanitizeUserText(item.purpose) ?? item.purpose}</div>
                  </div>
                )}
                {has(item.shift_signal) && (
                  <div style={{ marginTop: '0.3rem', borderRadius: 16, padding: '0.75rem 0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: '#edf9f3', border: '1px solid rgba(104,169,141,0.22)' }}>
                    <MLIcon name="check" tone="green" size={14} />
                    <div>
                      <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: '#3f6e5a' }}>Как узнать, что работает</div>
                      <div style={{ marginTop: 4, fontSize: '13px', fontWeight: 650, lineHeight: 1.5, color: '#2f5746' }}>{sanitizeUserText(item.shift_signal) ?? item.shift_signal}</div>
                    </div>
                  </div>
                )}
                {(has(item.how_to_do) || item.observe.length > 0) && (
                  <div style={{ borderTop: '1px solid rgba(118,92,68,0.12)', paddingTop: '0.65rem', marginTop: '0.1rem' }}>
                    {has(item.how_to_do) && (
                      <div style={{ paddingBottom: item.observe.length > 0 ? '0.65rem' : 0 }}>
                        <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: toneSurface(t.tone).deep }}>Как делать</div>
                        <div style={{ marginTop: 4, fontSize: '13px', lineHeight: 1.58, color: '#2e2820' }}>{sanitizeUserText(item.how_to_do) ?? item.how_to_do}</div>
                      </div>
                    )}
                    {item.observe.length > 0 && (
                      <div style={{ paddingTop: has(item.how_to_do) ? '0.65rem' : 0, borderTop: has(item.how_to_do) ? '1px solid rgba(118,92,68,0.12)' : 'none' }}>
                        <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: toneSurface(t.tone).deep }}>На что обращать внимание</div>
                        <div style={{ marginTop: 4, fontSize: '13px', lineHeight: 1.58, color: '#2e2820' }}>{item.observe.map(o => sanitizeUserText(o) ?? o).join(' ')}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {hidden.length > 0 && (
          <DisclosurePanel summary={`Показать ещё ${hidden.length} практики`} tone="green">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {hidden.map((item, index) => (
                <div key={`hidden-practice-${index}`} style={{ padding: '0.1rem 0.2rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.82rem', lineHeight: 1.35 }}>{item.title ?? `Практика ${index + visible.length + 1}`}</strong>
                  {has(item.purpose) && <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', lineHeight: 1.52, color: '#665c53' }}>{item.purpose}</p>}
                </div>
              ))}
            </div>
          </DisclosurePanel>
        )}
      </div>
    </SectionShell>
  );
}

function DisclaimerSectionExact({ text }: { text?: string | null }) {
  const content = has(text) ? text : 'Это автоматический аналитический отчёт Mindloom на основе предоставленного материала. Он не является медицинским диагнозом и не заменяет консультацию специалиста.';
  return (
    <section style={{ paddingInline: '1.25rem', marginTop: '0.2rem' }}>
      <div style={{ borderRadius: VS.r.md, padding: '0.95rem 1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', border: '1px solid rgba(118,92,68,0.12)', background: 'transparent' }}>
        <MLIcon name="info" tone="beige" size={14} />
        <div style={{ fontSize: '11.5px', lineHeight: 1.65, color: '#7d746b' }}>{content}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1.35rem', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.24em', fontWeight: 700, color: '#7d746b' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: '#e46f61', display: 'inline-block' }} />
        Mindloom · аналитический отчёт
      </div>
    </section>
  );
}

export function ReportV2Dashboard({ report, createdAt }: {
  report: MindloomReportV2;
  createdAt: string;
}) {
  const [detailSheet, setDetailSheet] = useState<DetailSheetState | null>(null);
  const openSheet = useCallback((s: DetailSheetState) => setDetailSheet(s), []);
  const closeSheet = useCallback(() => setDetailSheet(null), []);

  const activeNodes = [...report.active_nodes]
    .filter(n => n.label || n.description || n.id)
    .sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0));

  const layers  = report.mindloom_layers.filter(l => l.layer || l.description || l.manifestation);
  const markers = report.transformation_markers.filter(m => m.marker || m.description || m.shift_signal);
  const practices = report.recommended_practices.filter(p => p.title || p.purpose || p.how_to_do);
  const keyPhrases = collectSpeechPhrases(report);
  const directPhrases = collectDirectPhrases(report);
  const analyticalThemes = collectAnalyticalThemes(report);
  const snapshotData = report.snapshot ?? buildSnapshotFallback(report, activeNodes);
  const protectedNeedData = report.protected_need ?? buildProtectedNeedFallback(report, activeNodes, layers);
  const phraseMicroscopeData = report.phrase_microscope ?? buildPhraseMicroscopeFallback(report, activeNodes);
  const honestTranslationData = report.honest_translation?.items.length ? report.honest_translation : buildHonestTranslationFallback(report, phraseMicroscopeData);

  return (
    <article style={{
      display: 'flex', flexDirection: 'column', gap: '1.5rem',
      fontFamily: '"Manrope", "Segoe UI", system-ui, Arial, sans-serif',
      color: '#1e1a16', overflowWrap: 'normal', wordBreak: 'normal',
    }}>
      {/* Mobile report CSS */}
      <style>{`
        @media (max-width: 640px) {
          /* Heatmap info cards: [active|scale] on row1, [focus full-width] on row2 */
          .mlm-heatmap-info-grid { grid-template-columns: 1fr 1fr !important; }
          .mlm-heatmap-info-active { grid-column: 1 !important; grid-row: 1 !important; }
          .mlm-heatmap-info-scale { grid-column: 2 !important; grid-row: 1 !important; }
          .mlm-heatmap-info-focus { grid-column: 1 / -1 !important; grid-row: 2 !important; }
          /* HonestTranslation: stack label above text */
          .mlm-translation-row { flex-direction: column !important; gap: 0.3rem !important; }
          .mlm-translation-label { margin-top: 0 !important; }
        }
        @media (max-width: 500px) {
          .mlm-causal-graph-panel { height: 400px !important; min-height: 400px !important; }
          .mlm-heatmap-canvas { height: 380px !important; }
          .mlm-heatmap-bento { grid-template-columns: 1fr !important; }
          .mlm-heatmap-focus { align-items: flex-start !important; flex-direction: column !important; }
          .mlm-heatmap-canvas-fix { min-height: 500px !important; height: 520px !important; }
          .mlm-heatmap-focus-fix { align-items: flex-start !important; flex-direction: column !important; }
          /* Heatmap info cards: collapse all 3 to single column */
          .mlm-heatmap-info-grid { grid-template-columns: 1fr !important; }
          .mlm-heatmap-info-active, .mlm-heatmap-info-scale, .mlm-heatmap-info-focus { grid-column: 1 !important; grid-row: auto !important; }
        }
        @media (max-width: 420px) {
          .mlm-translation-grid { grid-template-columns: 1fr !important; }
          .mlm-causal-graph-panel { height: 380px !important; min-height: 380px !important; }
          .mlm-heatmap-canvas { height: 370px !important; }
          .mlm-heat-node strong { max-width: 84px !important; font-size: 0.66rem !important; }
          .mlm-heatmap-canvas-fix { min-height: 490px !important; height: 490px !important; }
          .mlm-heat-node-fix { width: 80px !important; }
          .mlm-heat-label-fix { width: 80px !important; max-width: 80px !important; font-size: 10.5px !important; }
        }
        .mlm-heat-node > div {
          animation: mlmHeatPulse 5.8s ease-in-out infinite;
        }
        .mlm-heat-orb-fix {
          animation: mlmHeatPulse 6.2s ease-in-out infinite;
        }
        @keyframes mlmHeatPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.025); }
        }
        .mlm-heat-node-fix[role="button"]:hover .mlm-heat-orb-fix,
        .mlm-heat-node-fix[role="button"]:focus-visible .mlm-heat-orb-fix {
          animation-name: none;
          transform: scale(1.055);
          transition: transform 180ms ease-out;
        }
        .mlm-heat-node-fix[role="button"]:active .mlm-heat-orb-fix {
          animation-name: none;
          transform: scale(0.96);
          transition: transform 100ms ease-out;
        }
        .mlm-heat-node-fix[role="button"]:focus-visible {
          outline: 2px solid rgba(220,180,140,0.70);
          outline-offset: 5px;
          border-radius: 50%;
        }
        .mlm-graph-node[role="button"] {
          transition: transform 180ms ease-out;
        }
        .mlm-graph-node[role="button"]:hover {
          transform: translate(-50%, -50%) scale(1.055) !important;
        }
        .mlm-graph-node[role="button"]:active {
          transform: translate(-50%, -50%) scale(0.96) !important;
        }
        .mlm-graph-node[role="button"]:focus-visible {
          outline: 2px solid rgba(220,180,140,0.70);
          outline-offset: 4px;
        }
        .mlm-graph-edge-row[role="button"] {
          transition: background 150ms ease-out;
        }
        .mlm-graph-edge-row[role="button"]:hover {
          background: rgba(255,247,236,0.98) !important;
          border-color: rgba(215,198,178,0.70) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .mlm-heat-node > div { animation: none !important; }
          .mlm-heat-orb-fix { animation: none !important; }
          .mlm-heat-node-fix[role="button"]:hover .mlm-heat-orb-fix,
          .mlm-heat-node-fix[role="button"]:focus-visible .mlm-heat-orb-fix,
          .mlm-heat-node-fix[role="button"]:active .mlm-heat-orb-fix { transform: none !important; transition: none !important; }
          .mlm-graph-node[role="button"]:hover,
          .mlm-graph-node[role="button"]:active { transform: translate(-50%, -50%) !important; transition: none !important; }
          .mlm-graph-edge-row[role="button"] { transition: none !important; }
          .mlm-interactive-card, .mlm-clickable-row, .mlm-helptip-btn { transition: none !important; }
          .mlm-interactive-card:hover { transform: none !important; box-shadow: none !important; }
          .mlm-clickable-row:hover { transform: none !important; box-shadow: none !important; }
          .mlm-helptip-btn:hover { transform: none !important; }
          .mlm-chip-float { transition: none !important; }
          .mlm-chip-float:hover { transform: none !important; box-shadow: none !important; }
        }
        /* Interactive card/button lift */
        .mlm-interactive-card {
          transition: transform 160ms ease-out, box-shadow 160ms ease-out, border-color 160ms ease-out;
        }
        .mlm-interactive-card:hover {
          transform: translateY(-2px) scale(1.016);
          box-shadow: 0 4px 14px rgba(70,53,35,0.13), 0 1px 4px rgba(70,53,35,0.08) !important;
        }
        .mlm-interactive-card:active {
          transform: translateY(0) scale(0.984) !important;
          transition-duration: 70ms !important;
        }
        .mlm-interactive-card:focus-visible {
          outline: 2px solid rgba(220,180,140,0.80);
          outline-offset: 3px;
        }
        /* Clickable row warm hover */
        .mlm-clickable-row {
          transition: background 130ms ease-out, border-color 130ms ease-out, box-shadow 130ms ease-out;
        }
        .mlm-clickable-row:hover {
          background: rgba(255,246,234,0.98) !important;
          border-color: rgba(195,178,155,0.65) !important;
          box-shadow: inset 0 0 0 1px rgba(195,178,155,0.25) !important;
        }
        .mlm-clickable-row:focus-visible {
          outline: 2px solid rgba(220,180,140,0.70);
          outline-offset: 2px;
        }
        /* HelpTip soft hover */
        .mlm-helptip-btn {
          transition: background 120ms ease-out, border-color 120ms ease-out, transform 120ms ease-out;
        }
        .mlm-helptip-btn:hover {
          background: rgba(220,210,196,0.82) !important;
          border-color: rgba(118,92,68,0.28) !important;
          transform: scale(1.12);
        }
        /* Speech Cloud floating chip hover */
        .mlm-chip-float {
          transition: transform 150ms ease-out, box-shadow 150ms ease-out;
        }
        .mlm-chip-float:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 14px rgba(0,0,0,0.10) !important;
        }
      `}</style>

      {/* 1 — Hero */}
      <HeroSection report={report} createdAt={createdAt} />

      {/* 1b — Overheat tile (moved out of Hero) */}
      <OverheatTile report={report} activeNodes={activeNodes} />

      {/* 2 — Snapshot */}
      {snapshotData && <SnapshotSectionExact snap={snapshotData} />}

      {/* 3 — How to read (now a sheet triggered from Hero button) */}

      {/* 4 — Growth blocker */}
      <GrowthBlockerSectionExact report={report} />

      {/* 5 — Protected need */}
      {protectedNeedData && <ProtectedNeedSectionExact pn={protectedNeedData} />}

      {/* 6 — Phrase microscope */}
      <PhraseMicroscopeSectionExact pm={phraseMicroscopeData ?? undefined} />

      {/* 7 — Honest translation */}
      {honestTranslationData && <HonestTranslationSectionExact ht={honestTranslationData} />}

      {/* 8 — Key phrases / speech cloud */}
      <MindloomSpeechCloud phrases={directPhrases} analyticalThemes={analyticalThemes} centralMeaning={phraseMicroscopeData?.summary ?? report.hero.title ?? null} />

      {/* 9 — Heatmap */}
      <HeatmapSection heatmap={report.heatmap} activeNodes={activeNodes} graphNodes={report.node_graph.nodes} keyPhrases={keyPhrases} />

      {/* 10 — Node graph */}
      <NodeGraphSection nodeGraph={report.node_graph} activeNodes={activeNodes} />

      {/* 11 — Evidence layer */}
      <EvidenceLayerSectionExact report={report} activeNodes={activeNodes} onOpen={openSheet} />

      {/* 12 — Trajectory */}
      <TrajectorySection trajectory={report.trajectory} />

      {/* 13 — Layers */}
      {layers.length > 0 && <LayersSectionExact layers={layers} onOpen={openSheet} />}

      {/* 14 — Markers */}
      {markers.length > 0 && <MarkersSectionExact markers={markers} onOpen={openSheet} />}

      {/* 15 — Practices */}
      {practices.length > 0 && <PracticesSectionExact practices={practices} activeNodes={activeNodes} />}

      {/* Feedback — disabled (no backend; feedback_config.enabled always false) */}
      {false && report.feedback_config?.enabled === true && (
        <section style={{ background: '#fffefb', border: '1px solid #e8ddd0', borderRadius: 24, padding: '1.25rem 1.35rem', boxShadow: '0 2px 16px rgba(50,38,24,0.07)', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.75rem', fontWeight: 600, fontSize: '0.95rem', color: '#1e1a16' }}>
            {report.feedback_config?.positive_label ?? 'Отчёт полезен'}
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            <button type="button" style={{ padding: '0.5rem 1.5rem', borderRadius: 999, border: '1px solid #b8e0cc', background: '#f0faf4', color: '#287858', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
              {report.feedback_config?.positive_label ?? 'Да'}
            </button>
            <button type="button" style={{ padding: '0.5rem 1.5rem', borderRadius: 999, border: '1px solid #f0cec0', background: '#fff4f1', color: '#904038', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
              {report.feedback_config?.negative_label ?? 'Нет'}
            </button>
          </div>
        </section>
      )}

      {/* 16 — Disclaimer */}
      <DisclaimerSectionExact text={report.disclaimer} />

      {/* Detail sheet (portal-free, fixed position) */}
      <ReportDetailSheet state={detailSheet} onClose={closeSheet} />

      {/* Footer */}
      <footer style={{ textAlign: 'center', paddingTop: '0.75rem', borderTop: '1px solid #e8ddd0' }}>
        <p style={{ margin: 0, fontSize: '0.7rem', color: '#c0b8b0' }}>
          Mindloom · аналитический отчёт
        </p>
      </footer>
    </article>
  );
}
