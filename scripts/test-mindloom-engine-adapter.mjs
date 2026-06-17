/**
 * Test script for the Mindloom Engine adapter layer.
 * Mirrors the TypeScript logic from lib/mindloom-engine/ in pure JS so it runs
 * without tsx or ts-node. Output: artifacts/report-v2-from-engine-mock.json
 *
 * Run: node scripts/test-mindloom-engine-adapter.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Load mock ─────────────────────────────────────────────────────────────────

const mockPath = join(ROOT, 'lib', 'mindloom-engine', 'mock-engine-output.json');
const engine = JSON.parse(readFileSync(mockPath, 'utf8'));

// ── Feedback block registry ────────────────────────────────────────────────────

const FEEDBACK_BLOCKS = [
  { block_id: 'main_pattern',    block_title: 'Самый заметный паттерн',        enabled: true },
  { block_id: 'speech_cloud',    block_title: 'Что повторяется в речи',         enabled: true },
  { block_id: 'where_visible',   block_title: 'Где это видно',                  enabled: true },
  { block_id: 'what_protects',   block_title: 'Что паттерн может защищать',     enabled: true },
  { block_id: 'attention_route', block_title: 'Маршрут внимания',               enabled: true },
  { block_id: 'attention_blind', block_title: 'Что внимание пропускает',        enabled: true },
  { block_id: 'graph',           block_title: 'Как темы усиливают друг друга',  enabled: true },
  { block_id: 'business_impact', block_title: 'Бизнес-влияние',                 enabled: false },
  { block_id: 'practices',       block_title: 'Практики — маленькие шаги',      enabled: true },
];

function getFeedback(blockId) {
  return FEEDBACK_BLOCKS.find((b) => b.block_id === blockId) ?? null;
}

function mkBlock(shown, blockId, data, reason) {
  const fb = blockId ? getFeedback(blockId) : null;
  return {
    shown,
    ...(data !== undefined ? { data } : {}),
    ...(fb ? { feedback: fb } : {}),
    ...(reason ? { reason } : {}),
  };
}

// ── Normalize ─────────────────────────────────────────────────────────────────

function labelOf(nodes, nodeId) {
  return nodes.find((n) => n.node_id === nodeId)?.display_label ?? nodeId;
}

function dominantBand(bands) {
  const counts = { green: 0, yellow: 0, white: 0 };
  for (const b of bands) { if (b in counts) counts[b]++; }
  if (counts.green >= counts.yellow && counts.green >= counts.white) return 'green';
  if (counts.yellow >= counts.white) return 'yellow';
  return 'white';
}

function stripMd(text) {
  return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\n+/g, ' ').trim();
}

function normalize(eng) {
  const nodes = eng.graph?.nodes ?? [];
  const edges = eng.graph?.edges ?? [];
  const cards = eng.cards?.cards ?? [];

  // main_pattern
  const contactRegime = nodes.find((n) => n.family === 'contact_regime' && n.visible === 'yes');
  const topDefenses = nodes
    .filter((n) => n.family === 'defense' && n.visible === 'yes')
    .sort((a, b) => b.activation - a.activation)
    .slice(0, 3);
  const contactModeCard = cards.find((c) => c.id === 'contact_mode');
  const topConfidence = topDefenses[0]?.confidence ?? 0;
  const topDefenseBand = topConfidence >= 0.7 ? 'green' : topConfidence >= 0.4 ? 'yellow' : 'white';

  // speech_markers
  const speech_markers = (eng.markers?.markers ?? []).map((m) => ({
    cue: m.cue,
    meaning: m.meaning,
    occurrences: m.occurrences,
    quote: m.evidence?.[0]?.quote ?? '',
  }));

  // evidence_quotes
  const evidence_quotes = nodes
    .filter((n) => n.visible !== 'no' && n.evidence?.length > 0)
    .flatMap((n) =>
      n.evidence
        .filter((e) => e.span?.trim())
        .slice(0, 1)
        .map((e) => ({ quote: e.span, node_id: n.node_id }))
    )
    .slice(0, 6);

  // attention_route
  let attention_route;
  if (eng.attention_route?.segments?.length > 0) {
    const firstSeg = eng.attention_route.segments[0];
    attention_route = {
      path: firstSeg.steps.map((s) => ({ level: s.key, attention: 0, earned: true, description: s.value })),
      skipped: [],
      n_snapshots: 1,
      preliminary: true,
    };
  } else if (eng.attention) {
    // Build desc map from diff
    const descMap = {};
    for (const prof of eng.diff ?? []) {
      for (const lv of prof.levels) {
        if (lv.value && !descMap[lv.code]) descMap[lv.code] = lv.value;
      }
    }
    attention_route = {
      path: eng.attention.path.levels.map((l) => ({
        level: l.code,
        attention: l.attention,
        earned: l.earned,
        description: descMap[l.code] ?? null,
      })),
      skipped: eng.attention.path.skipped,
      n_snapshots: eng.attention.n_snapshots,
      preliminary: eng.attention.preliminary,
    };
  } else {
    attention_route = { path: [], skipped: [], n_snapshots: 0, preliminary: true };
  }

  // blind_spots
  const blind_spots = [
    ...(eng.attention?.blind ?? []).map((b) => ({ text: b.text, confidence: b.confidence, source: 'attention' })),
    ...cards.filter((c) => c.id === 'blind_spot').map((c) => ({
      text: c.body,
      confidence: c.confidence_band === 'green' ? 0.8 : c.confidence_band === 'yellow' ? 0.6 : 0.4,
      source: 'cards',
    })),
  ];

  // graph
  const top_nodes = nodes
    .filter((n) => n.visible !== 'no')
    .sort((a, b) => b.activation - a.activation)
    .slice(0, 10)
    .map((n) => ({ node_id: n.node_id, display_label: n.display_label ?? n.node_id, family: n.family, activation: n.activation, valence: n.valence, f4: n.f4 }));

  const key_edges = edges
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, 6)
    .map((e) => ({ from_id: e.from, to_id: e.to, from_label: labelOf(nodes, e.from), to_label: labelOf(nodes, e.to), tau: e.tau, weight: e.weight }));

  const topHyp = eng.graph?.ranked_hypotheses?.[0];
  const ranked_pattern = topHyp
    ? topHyp.active_nodes.map((id) => labelOf(nodes, id)).join(' → ')
    : top_nodes.slice(0, 3).map((n) => n.display_label).join(' → ');

  const graph = {
    top_nodes, key_edges,
    ranked_pattern,
    ambiguity_note: topHyp?.ambiguity_flags?.[0] ?? '',
    follow_up: topHyp?.follow_up_questions ?? [],
  };

  // needs
  const unmet = nodes.filter((n) => n.family === 'unmet_need' && n.visible !== 'no')
    .map((n) => ({ label: n.display_label ?? n.node_id, activation: n.activation, need_id: n.need_id }));
  const activeNeedCard = cards.find((c) => c.id === 'active_need');
  const protected_needs = activeNeedCard?.body.trim()
    ? [{ label: stripMd(activeNeedCard.body), activation: 0.5 }]
    : [];

  // protections
  const defenseNodes = nodes.filter((n) => n.family === 'defense' && n.visible !== 'no');
  const protections = defenseNodes.map((d) => {
    const maskEdge = edges.find((e) => e.from === d.node_id && e.tau === 'masking');
    const evocEdge = edges.find((e) => e.to === d.node_id && e.tau === 'evocation');
    return {
      defense_label: d.display_label ?? d.node_id,
      masks_label: maskEdge ? labelOf(nodes, maskEdge.to) : null,
      evoked_by: evocEdge ? labelOf(nodes, evocEdge.from) : null,
      f4: d.f4,
      evidence_quote: d.evidence?.[0]?.span ?? null,
    };
  });

  // field
  const field = {
    allowed: eng.field?.allowed ?? [],
    costly: eng.field?.costly ?? [],
    blocked: eng.field?.blocked ?? [],
    openness: eng.field?.openness ?? 0,
    speaker_agency: eng.field?.speaker ?? 0,
  };

  // practices
  const practices = [
    ...cards.filter((c) => c.id === 'try_this').map((c) => ({ text: c.body, source: 'try_this' })),
    ...(eng.transition_map?.replacements ?? []).filter((r) => r.relevant).map((r) => ({ text: `${r.old} → ${r.new}`, source: 'transition_map' })),
  ];

  // semantic_map
  const semantic_map = eng.semantic_map ? {
    charged_concepts: eng.semantic_map.concepts.filter((c) => c.valence === 'charged').map((c) => ({ label: c.label, state: c.state })),
    collapse_score: eng.semantic_map.collapse_score,
    affordances: eng.semantic_map.affordances.map((a) => ({ from: a.from, to: a.to, rationale: a.rationale })),
    care_flag: eng.semantic_map.care_flag,
  } : null;

  // dynamics / self_portrait
  const dynamics = eng.dynamics?.shown === true ? {
    shown: true,
    regime_summary: eng.dynamics.regime_trajectory.summary,
    shift_signals: eng.dynamics.regime_trajectory.transitions.map((t) => ({ from_folk: t.from_folk, to_folk: t.to_folk, valence: t.valence })),
    recurring_blind_spots: eng.dynamics.recurring_blind_spots,
    adaptivity: eng.dynamics.adaptivity.masking_weakening,
  } : null;

  const self_portrait = eng.self_portrait?.shown === true ? {
    shown: true,
    frames: eng.self_portrait.frequent_frames.map((f) => ({ frame: f.frame, rate: f.rate, signal: f.signal ?? '' })),
    jumps: eng.self_portrait.signature_jumps.map((j) => ({ from: j.from, to: j.to, lever: j.lever ?? '' })),
    triggers: eng.self_portrait.triggers.map((t) => ({ cue: t.cue, leads_to: t.leads_to })),
  } : null;

  // meta
  const n_segments = eng.diff?.length ?? eng.meta?.n_segments ?? 0;
  const has_dynamics = dynamics !== null;
  const has_self_portrait = self_portrait !== null;
  const care_flag = eng.semantic_map?.care_flag ?? false;
  const is_first_session = !has_dynamics && !has_self_portrait;
  const session_type = is_first_session ? 'first' : 'returning';
  const allBands = (eng.diff ?? []).flatMap((d) => d.levels.filter((l) => l.earned).map((l) => l.band));
  const confidence_summary = dominantBand(allBands);

  return {
    source: 'mindloom_lite_engine',
    engine_version: eng.cards?.schema_version ?? 'lite.cards.v0.1',
    engine_input_id: eng.input_id,
    session_type,
    main_pattern: {
      regime_folk: contactRegime?.display_label ?? 'Режим контакта',
      top_defense_labels: topDefenses.map((n) => n.display_label ?? n.node_id),
      contact_mode_text: contactModeCard?.body ?? '',
      confidence_band: topDefenseBand,
    },
    speech_markers, evidence_quotes, attention_route, blind_spots, graph,
    needs: { protected: protected_needs, unmet },
    protections, field, practices,
    business_signals: null, semantic_map, dynamics, self_portrait,
    meta: { input_id: eng.input_id, n_segments, confidence_summary, is_first_session, has_dynamics, has_self_portrait, care_flag },
  };
}

// ── Map to ReportV2 ───────────────────────────────────────────────────────────

function mapToReportV2(n) {
  const isFirst = n.session_type === 'first';
  const hasMarkers = n.speech_markers.length > 0;
  const hasBlindSpots = n.blind_spots.length > 0;
  const hasPractices = n.practices.length > 0;

  const topDefense = n.main_pattern.top_defense_labels[0] ?? '';
  const headlineText = n.main_pattern.contact_mode_text
    ? stripMd(n.main_pattern.contact_mode_text).slice(0, 200)
    : n.main_pattern.regime_folk;

  const l7Earned = n.attention_route.path.some((p) => p.level === 'L7' && p.earned);

  function confNote(band, first) {
    const sn = first ? 'Первая сессия — только предварительная картина.' : '';
    const bn = band === 'green' ? 'Уверенность: высокая.'
      : band === 'yellow' ? 'Уверенность: средняя — гипотеза, требует подтверждения.'
      : 'Уверенность: низкая — наблюдение, не интерпретация.';
    return [sn, bn].filter(Boolean).join(' ');
  }

  const unmetNeeds = n.needs.unmet.map((nd) => nd.label);
  const cycleDesc = n.main_pattern.top_defense_labels.length > 0 && unmetNeeds.length > 0
    ? `${n.main_pattern.top_defense_labels.join(' + ')} → скрывает → ${unmetNeeds.join(', ')}`
    : null;

  return {
    report_version: 'v2',
    source: 'mindloom_lite_engine',
    engine_input_id: n.engine_input_id,
    session_type: n.session_type,

    hero: mkBlock(true, 'main_pattern', {
      regime_label: n.main_pattern.regime_folk,
      top_defenses: n.main_pattern.top_defense_labels,
      headline_text: headlineText,
      confidence_band: n.main_pattern.confidence_band,
    }),

    disclaimer: mkBlock(true, null, {
      n_sessions: isFirst ? 1 : n.attention_route.n_snapshots,
      confidence_note: confNote(n.meta.confidence_summary, isFirst),
      l7_earned: l7Earned,
    }),

    speech_cloud: mkBlock(
      hasMarkers || (n.self_portrait?.frames?.length ?? 0) > 0,
      'speech_cloud',
      { markers: n.speech_markers, frequent_frames: n.self_portrait?.frames ?? [] },
      hasMarkers ? undefined : 'Маркеры не обнаружены в первой сессии'
    ),

    main_pattern: mkBlock(
      !!n.main_pattern.contact_mode_text,
      'main_pattern',
      { contact_mode_text: n.main_pattern.contact_mode_text, confidence_band: n.main_pattern.confidence_band }
    ),

    heatmap: mkBlock(false, null, { segments: [] }, 'Тепловая карта — будет доступна с реальными данными из engine (diff.indices)'),

    evidence: mkBlock(n.evidence_quotes.length > 0, 'where_visible', { quotes: n.evidence_quotes }),

    protection_support: mkBlock(n.protections.length > 0, 'what_protects', {
      items: n.protections.map((p) => ({ defense_label: p.defense_label, evoked_by: p.evoked_by, confidence: p.f4 ? `f4:${p.f4}` : 'single-session' })),
    }),

    protection_purpose: mkBlock(n.protections.length > 0, 'what_protects', {
      items: n.protections.map((p) => ({ defense_label: p.defense_label, masks: p.masks_label, quote: p.evidence_quote })),
    }),

    phrases_meaning: mkBlock(false, null, { segments: [] }, 'Маршрут фраз доступен только с полным attention_route из engine'),

    graph: mkBlock(n.graph.top_nodes.length > 0, 'graph', {
      nodes: n.graph.top_nodes,
      edges: n.graph.key_edges,
      top_pattern: n.graph.ranked_pattern,
    }),

    attention_route: mkBlock(n.attention_route.path.length > 0, 'attention_route', { path: n.attention_route.path }),

    blind_spots: mkBlock(hasBlindSpots, 'attention_blind', { items: n.blind_spots }),

    pattern_cycle: mkBlock(
      cycleDesc !== null,
      null,
      cycleDesc ? { description: cycleDesc, based_on: topDefense } : { description: '', based_on: '' }
    ),

    levels_visible: mkBlock(false, null, { segments: [] }, 'Карта уровней будет заполнена с реальными diff данными из engine'),

    evidence_basis: mkBlock(n.evidence_quotes.length > 0, null, { quotes: n.evidence_quotes }),

    shift_signals: mkBlock(
      !isFirst && n.dynamics !== null,
      null,
      n.dynamics ? { signals: n.dynamics.shift_signals, adaptivity: n.dynamics.adaptivity } : { signals: [], adaptivity: '' },
      isFirst ? 'Первая сессия — динамика недоступна (нужно ≥3 эпизодов)' : undefined
    ),

    practices: mkBlock(hasPractices, 'practices', { items: n.practices }, hasPractices ? undefined : 'Практики не найдены'),

    business_impact: mkBlock(false, 'business_impact', null, 'Бизнес-анализ требует дополнительного prompt layer — не входит в MVP'),

    meta: {
      n_sessions: isFirst ? 1 : n.attention_route.n_snapshots,
      has_dynamics: n.meta.has_dynamics,
      has_self_portrait: n.meta.has_self_portrait,
      care_flag: n.meta.care_flag,
      confidence_summary: n.meta.confidence_summary,
      generated_at: new Date().toISOString(),
    },
  };
}

// ── Run ───────────────────────────────────────────────────────────────────────

const normalized = normalize(engine);
const report = mapToReportV2(normalized);

mkdirSync(join(ROOT, 'artifacts'), { recursive: true });
const outPath = join(ROOT, 'artifacts', 'report-v2-from-engine-mock.json');
writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

// ── Summary ───────────────────────────────────────────────────────────────────

const blocks = Object.entries(report).filter(([k, v]) =>
  k !== 'meta' && k !== 'report_version' && k !== 'source' &&
  k !== 'engine_input_id' && k !== 'session_type' &&
  v !== null && typeof v === 'object' && 'shown' in v
);

const shown = blocks.filter(([, v]) => v.shown).map(([k]) => k);
const hidden = blocks.filter(([, v]) => !v.shown).map(([k]) => k);
const feedbackEnabled = blocks.filter(([, v]) => v.feedback?.enabled).map(([k]) => k);

console.log('');
console.log('✅ Adapter OK');
console.log(`   engine_input_id : ${report.engine_input_id}`);
console.log(`   session_type    : ${report.session_type}`);
console.log(`   confidence      : ${report.meta.confidence_summary}`);
console.log(`   n_segments      : ${normalized.meta.n_segments}`);
console.log('');
console.log(`SHOWN  (${shown.length}): ${shown.join(', ')}`);
console.log(`HIDDEN (${hidden.length}): ${hidden.join(', ')}`);
console.log(`FEEDBACK ENABLED (${feedbackEnabled.length}): ${feedbackEnabled.join(', ')}`);
console.log('');
console.log(`Output: ${outPath}`);
console.log('');
