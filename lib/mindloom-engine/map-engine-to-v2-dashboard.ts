import type { ReportV2PayloadFromEngine } from './types';
import type { MindloomReportV2 } from '@/lib/normalize-report';

function valenceToColor(valence: string): string {
  if (valence === 'distress') return 'red';
  if (valence === 'protection') return 'purple';
  if (valence === 'adaptation') return 'yellow';
  if (valence === 'aspiration') return 'green';
  return 'gray';
}

function tauToEdgeType(tau: string): string {
  if (tau === 'evocation' || tau === 'consolidation') return 'hard';
  if (tau === 'masking') return 'choice_blocked';
  if (tau === 'compensation' || tau === 'generalization') return 'soft';
  return 'normal';
}

export function mapEnginePayloadToMindloomV2(
  payload: ReportV2PayloadFromEngine,
): MindloomReportV2 {
  const hero = payload.hero.data;
  const speechCloud = payload.speech_cloud.data;
  const graph = payload.graph.data;
  const attentionRoute = payload.attention_route.data;
  const blindSpots = payload.blind_spots.data;
  const patternCycle = payload.pattern_cycle.data;
  const practices = payload.practices.data;
  const disclaimer = payload.disclaimer.data;

  const keyPhrases = (speechCloud?.markers ?? []).map((m) => m.cue).filter(Boolean);

  const speechPatterns = (speechCloud?.markers ?? []).map((m) => ({
    pattern: m.cue,
    description: m.meaning,
    evidence: m.quote ? [m.quote] : [],
  }));

  const activeNodes = (graph?.nodes ?? []).map((n) => ({
    id: n.node_id,
    label: n.display_label,
    type: n.family,
    intensity: n.activation,
    confidence: null as number | null,
    color: valenceToColor(n.valence),
    description: undefined as string | undefined,
    evidence: [] as string[],
    connected_to: [] as string[],
  }));

  const graphNodes = (graph?.nodes ?? []).map((n) => ({
    id: n.node_id,
    label: n.display_label,
    type: n.family,
    intensity: n.activation,
    description: undefined as string | undefined,
  }));

  const graphEdges = (graph?.edges ?? []).map((e) => ({
    from: e.from_label,
    to: e.to_label,
    label: e.tau,
    type: tauToEdgeType(e.tau),
    strength: e.weight,
    explanation: undefined as string | undefined,
  }));

  const attentionSteps = (attentionRoute?.path ?? [])
    .map((level) => ({ label: level.level, text: level.description ?? '' }))
    .filter((s) => s.label || s.text);

  const blindItems = (blindSpots?.items ?? []).map((spot) => ({
    title: '',
    text: spot.text,
  }));

  const cycle = patternCycle?.description ? [patternCycle.description] : [];

  const recommendedPractices = (practices?.items ?? []).map((p) => ({
    title: p.text,
    how_to_do: p.text,
    observe: [] as string[],
  }));

  return {
    meta: {
      schema_version: '2.0',
      language: 'ru',
      analysis_type: 'mindloom_lite_engine',
    },
    participant: { name: null },
    source: {
      type: 'mindloom_lite_engine',
      material_volume: null,
      source_summary: null,
    },
    hero: {
      title: hero?.regime_label ?? null,
      main_insight: hero?.headline_text ?? null,
      one_sentence_summary: disclaimer?.confidence_note ?? null,
    },
    target: {
      growth_blocker: null,
      central_knot: null,
      core_pain: null,
      short_explanation: null,
    },
    desired_state: {
      explicit_request: null,
      hidden_request: null,
      future_state: null,
    },
    mechanism: {
      protective_logic: null,
      hidden_gain: null,
      perceived_threat: null,
      cost: null,
    },
    speech_layer: {
      key_phrases: keyPhrases,
      speech_patterns: speechPatterns,
    },
    active_nodes: activeNodes,
    heatmap: {
      title: null,
      description: null,
      scale: [],
      legend: [],
      zones: [],
      callouts: [],
    },
    node_graph: {
      title: graph?.top_pattern ?? null,
      description: null,
      central_node_id: null,
      nodes: graphNodes,
      edges: graphEdges,
      legend: [],
      how_to_read: [],
    },
    hypothesis_table: [],
    trajectory: {
      cycle,
      blocking_point: null,
      possible_exit: null,
    },
    processing_dashboard: {
      active_nodes_count: graph?.nodes.length ?? null,
      main_layer: null,
      priority: null,
      overheat_level: null,
      resource_level: null,
      markers_detected: speechCloud?.markers.length ?? null,
    },
    mindloom_layers: [],
    transformation_markers: [],
    recommended_practices: recommendedPractices,
    disclaimer: null,
    attention_route:
      attentionSteps.length > 0
        ? { title: 'Маршрут внимания', intro: null, steps: attentionSteps }
        : null,
    attention_blind:
      blindItems.length > 0
        ? { title: 'Что внимание может пропускать', intro: null, items: blindItems }
        : null,
    business_impact: null,
    snapshot: null,
    how_to_read: null,
    phrase_microscope: null,
    honest_translation: null,
    protected_need: null,
    feedback_config: null,
  };
}
