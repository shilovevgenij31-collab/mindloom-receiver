import type {
  NormalizedMindloomAnalysis,
  ReportV2PayloadFromEngine,
  ReportV2Block,
  NormalizedAttentionLevel,
  NormalizedEvidenceQuote,
  NormalizedBlindSpot,
  NormalizedSpeechMarker,
  NormalizedGraphNode,
  NormalizedGraphEdge,
  NormalizedPractice,
} from './types';
import { getFeedbackMeta } from './feedback-blocks';

// ── Helper: typed block builder ───────────────────────────────────────────────

function block<T>(
  shown: boolean,
  blockId: string | null,
  data?: T,
  reason?: string
): ReportV2Block<T> {
  const fb = blockId ? getFeedbackMeta(blockId) : null;
  return {
    shown,
    ...(data !== undefined ? { data } : {}),
    ...(fb ? { feedback: fb } : {}),
    ...(reason ? { reason } : {}),
  } as ReportV2Block<T>;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function mapNormalizedToReportV2(
  n: NormalizedMindloomAnalysis
): ReportV2PayloadFromEngine {
  const isFirst = n.session_type === 'first';
  const hasPractices = n.practices.length > 0;
  const hasMarkers = n.speech_markers.length > 0;
  const hasBlindSpots = n.blind_spots.length > 0;

  // ── hero ──────────────────────────────────────────────────────────────────

  const topDefense = n.main_pattern.top_defense_labels[0] ?? '';
  const headlineText = n.main_pattern.contact_mode_text
    ? stripMarkdown(n.main_pattern.contact_mode_text).slice(0, 200)
    : n.main_pattern.regime_folk;

  const hero = block(
    true,
    'main_pattern',
    {
      regime_label: n.main_pattern.regime_folk,
      top_defenses: n.main_pattern.top_defense_labels,
      headline_text: headlineText,
      confidence_band: n.main_pattern.confidence_band,
    }
  );

  // ── disclaimer ────────────────────────────────────────────────────────────

  const l7Earned = n.attention_route.path.some(
    (p) => p.level === 'L7' && p.earned
  );
  const confidenceNote = buildConfidenceNote(n.meta.confidence_summary, isFirst);

  const disclaimer = block(
    true,
    null,
    {
      n_sessions: isFirst ? 1 : n.attention_route.n_snapshots,
      confidence_note: confidenceNote,
      l7_earned: l7Earned,
    }
  );

  // ── speech_cloud ─────────────────────────────────────────────────────────

  const frames = n.self_portrait?.frames ?? [];
  const speech_cloud = block(
    hasMarkers || frames.length > 0,
    'speech_cloud',
    {
      markers: n.speech_markers as NormalizedSpeechMarker[],
      frequent_frames: frames.map((f) => ({ frame: f.frame, rate: f.rate, signal: f.signal })),
    },
    hasMarkers ? undefined : 'Маркеры не обнаружены в первой сессии'
  );

  // ── main_pattern ──────────────────────────────────────────────────────────

  const main_pattern = block(
    !!n.main_pattern.contact_mode_text,
    'main_pattern',
    {
      contact_mode_text: n.main_pattern.contact_mode_text,
      confidence_band: n.main_pattern.confidence_band,
    }
  );

  // ── heatmap ───────────────────────────────────────────────────────────────
  // Build from diff profiles (pressure_index, attention from attention_route)

  const attentionByLevel: Record<string, number> = {};
  for (const lv of n.attention_route.path) {
    attentionByLevel[lv.level] = lv.attention;
  }

  const heatmap = block(
    false,
    null,
    {
      segments: [] as Array<{
        segment_id: string;
        pressure_index: number;
        attention_score: number;
        top_defense: string;
      }>,
    },
    'Тепловая карта — будет доступна с реальными данными из engine (diff.indices)'
  );

  // ── evidence ──────────────────────────────────────────────────────────────

  const evidence = block(
    n.evidence_quotes.length > 0,
    'where_visible',
    { quotes: n.evidence_quotes as NormalizedEvidenceQuote[] }
  );

  // ── protection_support ────────────────────────────────────────────────────

  const protSupportItems = n.protections.map((p) => ({
    defense_label: p.defense_label,
    evoked_by: p.evoked_by,
    confidence: p.f4 ? `f4:${p.f4}` : 'single-session',
  }));

  const protection_support = block(
    n.protections.length > 0,
    'what_protects',
    { items: protSupportItems }
  );

  // ── protection_purpose ────────────────────────────────────────────────────

  const protPurposeItems = n.protections.map((p) => ({
    defense_label: p.defense_label,
    masks: p.masks_label,
    quote: p.evidence_quote,
  }));

  const protection_purpose = block(
    n.protections.length > 0,
    'what_protects',
    { items: protPurposeItems }
  );

  // ── phrases_meaning ───────────────────────────────────────────────────────
  // Comes from attention_route.segments (fork data)

  const phrases_meaning = block(
    false,
    null,
    {
      segments: [] as Array<{
        quote: string;
        steps: Array<{ level: string; description: string }>;
        fork_old: string;
        fork_new: string;
      }>,
    },
    'Маршрут фраз доступен только с полным attention_route из engine'
  );

  // ── graph ─────────────────────────────────────────────────────────────────

  const graph = block(
    n.graph.top_nodes.length > 0,
    'graph',
    {
      nodes: n.graph.top_nodes as NormalizedGraphNode[],
      edges: n.graph.key_edges as NormalizedGraphEdge[],
      top_pattern: n.graph.ranked_pattern,
    }
  );

  // ── attention_route ───────────────────────────────────────────────────────

  const attention_route = block(
    n.attention_route.path.length > 0,
    'attention_route',
    { path: n.attention_route.path as NormalizedAttentionLevel[] }
  );

  // ── blind_spots ───────────────────────────────────────────────────────────

  const blind_spots = block(
    hasBlindSpots,
    'attention_blind',
    { items: n.blind_spots as NormalizedBlindSpot[] }
  );

  // ── pattern_cycle ─────────────────────────────────────────────────────────

  const cycleDesc = buildPatternCycleDescription(n);

  const pattern_cycle = block(
    cycleDesc !== null,
    null,
    cycleDesc
      ? { description: cycleDesc, based_on: topDefense }
      : { description: '', based_on: '' }
  );

  // ── levels_visible ────────────────────────────────────────────────────────

  const levels_visible = block(
    false,
    null,
    {
      segments: [] as Array<{
        segment_id: string;
        solid_up_to: string;
        hedged_through: string;
        reconstruction_from: string | null;
        l7_earned: boolean;
      }>,
    },
    'Карта уровней будет заполнена с реальными diff данными из engine'
  );

  // ── evidence_basis ────────────────────────────────────────────────────────

  const evidence_basis = block(
    n.evidence_quotes.length > 0,
    null,
    { quotes: n.evidence_quotes as NormalizedEvidenceQuote[] }
  );

  // ── shift_signals ─────────────────────────────────────────────────────────

  const shift_signals = block(
    !isFirst && n.dynamics !== null,
    null,
    n.dynamics
      ? {
          signals: n.dynamics.shift_signals,
          adaptivity: n.dynamics.adaptivity,
        }
      : { signals: [], adaptivity: '' },
    isFirst ? 'Первая сессия — динамика недоступна (нужно ≥3 эпизодов)' : undefined
  );

  // ── practices ─────────────────────────────────────────────────────────────

  const practices = block(
    hasPractices,
    'practices',
    { items: n.practices as NormalizedPractice[] },
    hasPractices ? undefined : 'Практики не найдены'
  );

  // ── business_impact ───────────────────────────────────────────────────────
  // Always hidden — requires additional prompt layer not in MVP

  const business_impact = block<null>(
    false,
    'business_impact',
    null,
    'Бизнес-анализ требует дополнительного prompt layer — не входит в MVP'
  );

  // ── meta ──────────────────────────────────────────────────────────────────

  const meta = {
    n_sessions: isFirst ? 1 : n.attention_route.n_snapshots,
    has_dynamics: n.meta.has_dynamics,
    has_self_portrait: n.meta.has_self_portrait,
    care_flag: n.meta.care_flag,
    confidence_summary: n.meta.confidence_summary,
    generated_at: new Date().toISOString(),
  };

  return {
    report_version: 'v2',
    source: 'mindloom_lite_engine',
    engine_input_id: n.engine_input_id,
    session_type: n.session_type,
    hero,
    disclaimer,
    speech_cloud,
    main_pattern,
    heatmap,
    evidence,
    protection_support,
    protection_purpose,
    phrases_meaning,
    graph,
    attention_route,
    blind_spots,
    pattern_cycle,
    levels_visible,
    evidence_basis,
    shift_signals,
    practices,
    business_impact,
    meta,
  };
}

// ── Private helpers ───────────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\n+/g, ' ').trim();
}

function buildConfidenceNote(band: string, isFirst: boolean): string {
  const sessionNote = isFirst
    ? 'Первая сессия — только предварительная картина.'
    : '';

  const bandNote =
    band === 'green'
      ? 'Уверенность: высокая.'
      : band === 'yellow'
      ? 'Уверенность: средняя — гипотеза, требует подтверждения.'
      : 'Уверенность: низкая — наблюдение, не интерпретация.';

  return [sessionNote, bandNote].filter(Boolean).join(' ');
}

function buildPatternCycleDescription(n: NormalizedMindloomAnalysis): string | null {
  const defenses = n.main_pattern.top_defense_labels;
  if (defenses.length === 0) return null;

  const unmetNeeds = n.needs.unmet.map((nd) => nd.label);
  if (unmetNeeds.length === 0) return null;

  return `${defenses.join(' + ')} → скрывает → ${unmetNeeds.join(', ')}`;
}
