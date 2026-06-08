export const FIXED_BLOCK_KEYS = [
  'main_insight',
  'executive_summary',
  'core_pattern',
  'emotional_map',
  'strengths_resources',
  'limitations_risks',
  'defenses_distortions',
  'growth_vector',
  'practical_recommendations',
  'reflection_practice',
] as const;

export type FixedBlockKey = (typeof FIXED_BLOCK_KEYS)[number];

export interface PracticeItem {
  title?: string;
  description?: string;
  steps?: string[];
}

export interface FixedBlock {
  title?: string;
  text?: string;
  markers?: string[];
  quotes?: string[];
  recommendations?: string[];
  items?: Array<Record<string, unknown>>;
  steps?: string[];
  questions?: string[];
  practice?: PracticeItem;
}

export type FixedBlocks = Record<FixedBlockKey, FixedBlock | null>;

export interface NormalizedBlock {
  id?: string;
  title?: string;
  text?: string;
  quotes?: string[];
  recommendations?: string[];
}

export interface NormalizedLayer {
  name?: string;
  description?: string;
}

export interface RichSummary {
  core_pattern?: string;
  dominant_conflict?: string;
  main_compensation?: string;
  risk?: string;
}

export interface MindloomReportV2Meta {
  schema_version: '2.0';
  language?: string | null;
  analysis_type?: string | null;
}

export interface MindloomReportV2Node {
  id?: string;
  label?: string;
  type?: string;
  intensity?: number | null;
  confidence?: number | null;
  color?: string;
  description?: string;
  evidence: string[];
  connected_to: string[];
}

export interface MindloomReportV2HeatmapLegendItem {
  color?: string;
  meaning?: string;
}

export interface MindloomReportV2HeatmapZone {
  id?: string;
  label?: string;
  intensity?: number | null;
  color?: string;
  description?: string;
  why_it_matters?: string;
  related_node_ids: string[];
}

export interface MindloomReportV2GraphNode {
  id?: string;
  label?: string;
  type?: string;
  intensity?: number | null;
  description?: string;
}

export interface MindloomReportV2GraphEdge {
  from?: string;
  to?: string;
  label?: string;
  type?: string;
  strength?: number | null;
  explanation?: string;
}

export interface MindloomReportV2Hypothesis {
  node_id?: string;
  hypothesis?: string;
  confidence?: number | null;
  evidence: string[];
}

export interface MindloomReportV2Layer {
  layer?: string;
  description?: string;
  manifestation?: string;
  intensity?: number | null;
  evidence: string[];
}

export interface MindloomReportV2TransformationMarker {
  marker?: string;
  description?: string;
  shift_signal?: string;
}

export interface MindloomReportV2Practice {
  title?: string;
  target_node?: string;
  layer?: string;
  purpose?: string;
  frequency?: string;
  how_to_do?: string;
  observe: string[];
  shift_signal?: string;
}

export interface MindloomReportV2HeatmapScale {
  label?: string;
  range?: string;
  description?: string;
}

export interface MindloomReportV2HeatmapCallout {
  title?: string;
  text?: string;
}

export interface MindloomReportV2GraphLegendItem {
  label?: string;
  type?: string;
  description?: string;
}

export interface MindloomReportV2GraphHowToReadItem {
  title?: string;
  description?: string;
}

export interface MindloomReportV2SnapshotOverheat {
  label?: string;
  score?: number | null;
  explanation?: string;
}

export interface MindloomReportV2Snapshot {
  key_pattern?: string | null;
  short_explanation?: string | null;
  three_signals: string[];
  main_overheat: MindloomReportV2SnapshotOverheat | null;
  first_step?: string | null;
}

export interface MindloomReportV2HowToReadStep {
  title?: string;
  description?: string;
}

export interface MindloomReportV2HowToRead {
  title?: string | null;
  steps: MindloomReportV2HowToReadStep[];
}

export interface MindloomReportV2PhraseFragment {
  text?: string;
  meaning?: string;
  pattern?: string;
  explanation?: string;
}

export interface MindloomReportV2PhraseMicroscope {
  title?: string | null;
  quote?: string | null;
  why_this_quote?: string | null;
  fragments: MindloomReportV2PhraseFragment[];
  summary?: string | null;
}

export interface MindloomReportV2HonestTranslationItem {
  as_said?: string;
  more_honest?: string;
  explanation?: string;
}

export interface MindloomReportV2HonestTranslation {
  title?: string | null;
  items: MindloomReportV2HonestTranslationItem[];
}

export interface MindloomReportV2ProtectedNeed {
  title?: string | null;
  description?: string | null;
  named: string[];
  strategy_gets: string[];
  sacrificed: string[];
  leading_need?: string | null;
  interpretation?: string | null;
}

export interface MindloomReportV2FeedbackConfig {
  enabled: boolean;
  positive_label?: string | null;
  negative_label?: string | null;
}

export interface MindloomReportV2 {
  meta: MindloomReportV2Meta;
  participant: {
    name?: string | null;
  };
  source: {
    type?: string | null;
    material_volume?: string | null;
    source_summary?: string | null;
  };
  hero: {
    title?: string | null;
    main_insight?: string | null;
    one_sentence_summary?: string | null;
  };
  target: {
    growth_blocker?: string | null;
    central_knot?: string | null;
    core_pain?: string | null;
    short_explanation?: string | null;
  };
  desired_state: {
    explicit_request?: string | null;
    hidden_request?: string | null;
    future_state?: string | null;
  };
  mechanism: {
    protective_logic?: string | null;
    hidden_gain?: string | null;
    perceived_threat?: string | null;
    cost?: string | null;
  };
  speech_layer: {
    key_phrases: string[];
    speech_patterns: Array<{
      pattern?: string;
      description?: string;
      evidence: string[];
    }>;
  };
  active_nodes: MindloomReportV2Node[];
  heatmap: {
    title?: string | null;
    description?: string | null;
    scale: MindloomReportV2HeatmapScale[];
    legend: MindloomReportV2HeatmapLegendItem[];
    zones: MindloomReportV2HeatmapZone[];
    callouts: MindloomReportV2HeatmapCallout[];
  };
  node_graph: {
    title?: string | null;
    description?: string | null;
    central_node_id?: string | null;
    nodes: MindloomReportV2GraphNode[];
    edges: MindloomReportV2GraphEdge[];
    legend: MindloomReportV2GraphLegendItem[];
    how_to_read: MindloomReportV2GraphHowToReadItem[];
  };
  hypothesis_table: MindloomReportV2Hypothesis[];
  trajectory: {
    cycle: string[];
    blocking_point?: string | null;
    possible_exit?: string | null;
  };
  processing_dashboard: {
    active_nodes_count?: number | null;
    main_layer?: string | null;
    priority?: string | null;
    overheat_level?: number | null;
    resource_level?: number | null;
    markers_detected?: number | null;
  };
  mindloom_layers: MindloomReportV2Layer[];
  transformation_markers: MindloomReportV2TransformationMarker[];
  recommended_practices: MindloomReportV2Practice[];
  disclaimer?: string | null;
  snapshot?: MindloomReportV2Snapshot | null;
  how_to_read?: MindloomReportV2HowToRead | null;
  phrase_microscope?: MindloomReportV2PhraseMicroscope | null;
  honest_translation?: MindloomReportV2HonestTranslation | null;
  protected_need?: MindloomReportV2ProtectedNeed | null;
  feedback_config?: MindloomReportV2FeedbackConfig | null;
}

export interface NormalizedReport {
  format: 'v1' | 'rich' | 'fixed_blocks' | 'unknown';
  title: string | null;
  participantName: string | null;
  summaryText: string | null;
  summaryRich: RichSummary | null;
  blocks: NormalizedBlock[];
  markers: string[];
  layers: NormalizedLayer[];
  schemaVersion: string | null;
  sessionMeta: {
    language?: string;
    source?: string;
    version?: string;
    date?: string;
  } | null;
  // Fixed blocks (v2 format)
  fixedBlocks: FixedBlocks | null;
  // Rich-only sections
  emotionalMap: Array<Record<string, unknown>> | null;
  motives: Array<Record<string, unknown>> | null;
  forecast: Array<Record<string, unknown>> | null;
  reflectionQuestions: string[] | null;
  practice: Array<Record<string, unknown>> | null;
  mindloomNodes: Array<Record<string, unknown>> | null;
  nodeConflicts: Array<Record<string, unknown>> | null;
  semanticMarkers: Array<Record<string, unknown>> | null;
  resourceVsDeficit: Array<Record<string, unknown>> | null;
  rhetoricalPatterns: Array<Record<string, unknown>> | null;
  contextualAnalysis: Record<string, unknown> | null;
  rewrittenHonestText: string | null;
  attentionLevels: Array<Record<string, unknown>> | null;
}

function toArr(val: unknown): unknown[] {
  return Array.isArray(val) ? val : [];
}

function toStrArr(val: unknown): string[] {
  return toArr(val).filter((v): v is string => typeof v === 'string' && v.length > 0);
}

function asStr(val: unknown): string | undefined {
  return typeof val === 'string' && val.length > 0 ? val : undefined;
}

function asStrNull(val: unknown): string | null {
  return typeof val === 'string' && val.length > 0 ? val : null;
}

function toObj(val: unknown): Record<string, unknown> {
  return val && typeof val === 'object' && !Array.isArray(val)
    ? (val as Record<string, unknown>)
    : {};
}

function toObjArr(val: unknown): Array<Record<string, unknown>> | null {
  const arr = toArr(val);
  if (arr.length === 0) return null;
  return arr.map((item) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? (item as Record<string, unknown>)
      : { value: String(item) }
  );
}

function asNum(val: unknown): number | undefined {
  return typeof val === 'number' && Number.isFinite(val) ? val : undefined;
}

function clamp01(val: unknown): number | null {
  const num = asNum(val);
  if (num === undefined) return null;
  if (num < 0) return 0;
  if (num > 1) return 1;
  return num;
}

function mapStringList(val: unknown): string[] {
  return toArr(val)
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === 'object' && !Array.isArray(val);
}

function detectFormat(p: Record<string, unknown>): 'v1' | 'rich' | 'fixed_blocks' | 'unknown' {
  // Check schema_version first — fixed_blocks also has a report field, so must check before v1
  if (p.schema_version === 'mindloom_report_v2_fixed_blocks') {
    return 'fixed_blocks';
  }
  if ('report' in p && p.report && typeof p.report === 'object' && !Array.isArray(p.report)) {
    return 'v1';
  }
  if (
    'segments' in p ||
    'emotional_map' in p ||
    'motives' in p ||
    'mindloom_nodes' in p ||
    'forecast' in p ||
    'reflection_questions' in p ||
    ('summary' in p &&
      p.summary !== null &&
      typeof p.summary === 'object' &&
      !Array.isArray(p.summary))
  ) {
    return 'rich';
  }
  return 'unknown';
}

function normalizeV1(p: Record<string, unknown>): NormalizedReport {
  const report = toObj(p.report);
  const participant = toObj(p.participant);
  const session = toObj(p.session);
  const meta = toObj(p.meta);

  const markers: string[] = toArr(report.markers)
    .map((m) => {
      if (typeof m === 'string') return m;
      if (typeof m === 'object' && m !== null) {
        const mo = m as Record<string, unknown>;
        const label = asStr(mo.label) ?? asStr(mo.key) ?? '';
        const value = asStr(mo.value);
        return value ? `${label}: ${value}` : label;
      }
      return '';
    })
    .filter(Boolean);

  const blocks: NormalizedBlock[] = toArr(report.blocks).map((b) => {
    const bo = toObj(b);
    return {
      id: asStr(bo.id),
      title: asStr(bo.title),
      text: asStr(bo.text),
      quotes: toStrArr(bo.quotes),
      recommendations: toStrArr(bo.recommendations),
    };
  });

  const layers: NormalizedLayer[] = toArr(report.layers).map((l) => {
    const lo = toObj(l);
    return { name: asStr(lo.name), description: asStr(lo.description) };
  });

  const hasSession = Object.keys(session).length > 0;

  return {
    format: 'v1',
    title: asStrNull(report.title),
    participantName: asStrNull(participant.name),
    summaryText: asStrNull(report.summary),
    summaryRich: null,
    blocks,
    markers,
    layers,
    schemaVersion: asStrNull(meta.schema_version),
    sessionMeta: hasSession
      ? {
          language: asStr(session.language),
          source: asStr(session.source),
          version: asStr(session.version),
          date: asStr(session.date),
        }
      : null,
    fixedBlocks: null,
    emotionalMap: null,
    motives: null,
    forecast: null,
    reflectionQuestions: null,
    practice: null,
    mindloomNodes: null,
    nodeConflicts: null,
    semanticMarkers: null,
    resourceVsDeficit: null,
    rhetoricalPatterns: null,
    contextualAnalysis: null,
    rewrittenHonestText: null,
    attentionLevels: null,
  };
}

function normalizeRich(p: Record<string, unknown>): NormalizedReport {
  let summaryText: string | null = null;
  let summaryRich: RichSummary | null = null;

  if (typeof p.summary === 'string') {
    summaryText = p.summary;
  } else if (p.summary && typeof p.summary === 'object' && !Array.isArray(p.summary)) {
    const s = p.summary as Record<string, unknown>;
    const hasKnown =
      typeof s.core_pattern === 'string' ||
      typeof s.dominant_conflict === 'string' ||
      typeof s.main_compensation === 'string' ||
      typeof s.risk === 'string';
    if (hasKnown) {
      summaryRich = {
        core_pattern: asStr(s.core_pattern),
        dominant_conflict: asStr(s.dominant_conflict),
        main_compensation: asStr(s.main_compensation),
        risk: asStr(s.risk),
      };
    } else {
      const firstStr = Object.values(s).find((v): v is string => typeof v === 'string');
      summaryText = firstStr ?? null;
    }
  }

  const blocks: NormalizedBlock[] = toArr(p.segments).map((seg) => {
    const s = toObj(seg);
    return {
      id: asStr(s.id),
      title: asStr(s.title),
      text: asStr(s.text),
      quotes: toStrArr(s.quotes),
      recommendations: toStrArr(s.recommendations),
    };
  });

  const markers: string[] = toArr(p.semantic_markers)
    .map((m) => {
      if (typeof m === 'string') return m;
      if (typeof m === 'object' && m !== null) {
        const mo = m as Record<string, unknown>;
        return asStr(mo.marker) ?? asStr(mo.name) ?? '';
      }
      return '';
    })
    .filter(Boolean);

  const contextualAnalysis =
    p.contextual_analysis &&
    typeof p.contextual_analysis === 'object' &&
    !Array.isArray(p.contextual_analysis)
      ? (p.contextual_analysis as Record<string, unknown>)
      : null;

  const reflectionQuestions = toStrArr(p.reflection_questions);

  const meta = toObj(p.meta);
  const schemaVersion = asStrNull(p.schema) ?? asStrNull(meta.schema_version);

  return {
    format: 'rich',
    title: asStrNull(p.title),
    participantName: null,
    summaryText,
    summaryRich,
    blocks,
    markers,
    layers: [],
    schemaVersion,
    sessionMeta: null,
    fixedBlocks: null,
    emotionalMap: toObjArr(p.emotional_map),
    motives: toObjArr(p.motives),
    forecast: toObjArr(p.forecast),
    reflectionQuestions: reflectionQuestions.length > 0 ? reflectionQuestions : null,
    practice: toObjArr(p.practice),
    mindloomNodes: toObjArr(p.mindloom_nodes),
    nodeConflicts: toObjArr(p.node_conflicts),
    semanticMarkers: toObjArr(p.semantic_markers),
    resourceVsDeficit: toObjArr(p.resource_vs_deficit),
    rhetoricalPatterns: toObjArr(p.rhetorical_patterns),
    contextualAnalysis,
    rewrittenHonestText: asStrNull(p.rewritten_honest_text),
    attentionLevels: toObjArr(p.attention_levels),
  };
}

function normalizeFixedBlocks(p: Record<string, unknown>): NormalizedReport {
  const report = toObj(p.report);
  const rawBlocks = toObj(report.blocks);
  const participant = toObj(p.participant);
  const source = toObj(p.source);

  const fixedBlocks = {} as FixedBlocks;
  for (const key of FIXED_BLOCK_KEYS) {
    const b = toObj(rawBlocks[key]);
    if (Object.keys(b).length === 0) {
      fixedBlocks[key] = null;
    } else {
      const rawPractice = b.practice;
      const practice =
        rawPractice && typeof rawPractice === 'object' && !Array.isArray(rawPractice)
          ? (rawPractice as Record<string, unknown>)
          : null;
      fixedBlocks[key] = {
        title: asStr(b.title),
        text: asStr(b.text),
        markers: toStrArr(b.markers),
        quotes: toStrArr(b.quotes),
        recommendations: toStrArr(b.recommendations),
        items: toObjArr(b.items) ?? [],
        steps: toStrArr(b.steps),
        questions: toStrArr(b.questions),
        practice: practice
          ? {
              title: asStr(practice.title),
              description: asStr(practice.description),
              steps: toStrArr(practice.steps),
            }
          : undefined,
      };
    }
  }

  const globalMarkers: string[] = toArr(report.global_markers)
    .map((m: unknown) => {
      if (typeof m === 'string') return m;
      if (typeof m === 'object' && m !== null) {
        const mo = m as Record<string, unknown>;
        const label = asStr(mo.label) ?? asStr(mo.key) ?? '';
        const value = asStr(mo.value);
        return value ? `${label}: ${value}` : label;
      }
      return '';
    })
    .filter(Boolean);

  return {
    format: 'fixed_blocks',
    title: asStrNull(report.title),
    participantName: asStrNull(participant.name),
    summaryText: asStrNull(source.source_summary),
    summaryRich: null,
    blocks: [],
    markers: globalMarkers,
    layers: [],
    schemaVersion: asStrNull(p.schema_version),
    sessionMeta: {
      language: asStr(source.language),
      source: asStr(source.type),
    },
    fixedBlocks,
    emotionalMap: null,
    motives: null,
    forecast: null,
    reflectionQuestions: null,
    practice: null,
    mindloomNodes: null,
    nodeConflicts: null,
    semanticMarkers: null,
    resourceVsDeficit: null,
    rhetoricalPatterns: null,
    contextualAnalysis: null,
    rewrittenHonestText: null,
    attentionLevels: null,
  };
}

export function isMindloomReportV2(payload: unknown): payload is Record<string, unknown> {
  if (!isRecord(payload)) return false;
  const meta = toObj(payload.meta);
  return meta.schema_version === '2.0';
}

export function normalizeMindloomReportV2(payload: unknown): MindloomReportV2 | null {
  if (!isMindloomReportV2(payload)) return null;

  const p = payload as Record<string, unknown>;
  const participant = toObj(p.participant);
  const source = toObj(p.source);
  const hero = toObj(p.hero);
  const target = toObj(p.target);
  const desiredState = toObj(p.desired_state);
  const mechanism = toObj(p.mechanism);
  const speechLayer = toObj(p.speech_layer);
  const heatmap = toObj(p.heatmap);
  const nodeGraph = toObj(p.node_graph);
  const trajectory = toObj(p.trajectory);
  const processingDashboard = toObj(p.processing_dashboard);

  return {
    meta: {
      schema_version: '2.0',
      language: asStrNull(toObj(p.meta).language),
      analysis_type: asStrNull(toObj(p.meta).analysis_type),
    },
    participant: {
      name: asStrNull(participant.name),
    },
    source: {
      type: asStrNull(source.type),
      material_volume: asStrNull(source.material_volume),
      source_summary: asStrNull(source.source_summary),
    },
    hero: {
      title: asStrNull(hero.title),
      main_insight: asStrNull(hero.main_insight),
      one_sentence_summary: asStrNull(hero.one_sentence_summary),
    },
    target: {
      growth_blocker: asStrNull(target.growth_blocker),
      central_knot: asStrNull(target.central_knot),
      core_pain: asStrNull(target.core_pain),
      short_explanation: asStrNull(target.short_explanation),
    },
    desired_state: {
      explicit_request: asStrNull(desiredState.explicit_request),
      hidden_request: asStrNull(desiredState.hidden_request),
      future_state: asStrNull(desiredState.future_state),
    },
    mechanism: {
      protective_logic: asStrNull(mechanism.protective_logic),
      hidden_gain: asStrNull(mechanism.hidden_gain),
      perceived_threat: asStrNull(mechanism.perceived_threat),
      cost: asStrNull(mechanism.cost),
    },
    speech_layer: {
      key_phrases: mapStringList(speechLayer.key_phrases),
      speech_patterns: toArr(speechLayer.speech_patterns).map((item) => {
        const obj = toObj(item);
        return {
          pattern: asStr(obj.pattern),
          description: asStr(obj.description),
          evidence: mapStringList(obj.evidence),
        };
      }),
    },
    active_nodes: toArr(p.active_nodes).map((item) => {
      const obj = toObj(item);
      return {
        id: asStr(obj.id),
        label: asStr(obj.label),
        type: asStr(obj.type),
        intensity: clamp01(obj.intensity),
        confidence: clamp01(obj.confidence),
        color: asStr(obj.color),
        description: asStr(obj.description),
        evidence: mapStringList(obj.evidence),
        connected_to: mapStringList(obj.connected_to),
      };
    }),
    heatmap: {
      title: asStrNull(heatmap.title),
      description: asStrNull(heatmap.description),
      scale: toArr(heatmap.scale).map((item) => {
        const obj = toObj(item);
        return {
          label: asStr(obj.label),
          range: asStr(obj.range),
          description: asStr(obj.description),
        };
      }),
      legend: toArr(heatmap.legend).map((item) => {
        const obj = toObj(item);
        return {
          color: asStr(obj.color),
          meaning: asStr(obj.meaning),
        };
      }),
      zones: toArr(heatmap.zones).map((item) => {
        const obj = toObj(item);
        return {
          id: asStr(obj.id),
          label: asStr(obj.label),
          intensity: clamp01(obj.intensity),
          color: asStr(obj.color),
          description: asStr(obj.description),
          why_it_matters: asStr(obj.why_it_matters),
          related_node_ids: mapStringList(obj.related_node_ids),
        };
      }),
      callouts: toArr(heatmap.callouts).map((item) => {
        const obj = toObj(item);
        return {
          title: asStr(obj.title),
          text: asStr(obj.text),
        };
      }),
    },
    node_graph: {
      title: asStrNull(nodeGraph.title),
      description: asStrNull(nodeGraph.description),
      central_node_id: asStrNull(nodeGraph.central_node_id),
      nodes: toArr(nodeGraph.nodes).map((item) => {
        const obj = toObj(item);
        return {
          id: asStr(obj.id),
          label: asStr(obj.label),
          type: asStr(obj.type),
          intensity: clamp01(obj.intensity),
          description: asStr(obj.description),
        };
      }),
      edges: toArr(nodeGraph.edges).map((item) => {
        const obj = toObj(item);
        return {
          from: asStr(obj.from),
          to: asStr(obj.to),
          label: asStr(obj.label),
          type: asStr(obj.type),
          strength: clamp01(obj.strength),
          explanation: asStr(obj.explanation),
        };
      }),
      legend: toArr(nodeGraph.legend).map((item) => {
        const obj = toObj(item);
        return {
          label: asStr(obj.label),
          type: asStr(obj.type),
          description: asStr(obj.description),
        };
      }),
      how_to_read: toArr(nodeGraph.how_to_read).map((item) => {
        const obj = toObj(item);
        return {
          title: asStr(obj.title),
          description: asStr(obj.description),
        };
      }),
    },
    hypothesis_table: toArr(p.hypothesis_table).map((item) => {
      const obj = toObj(item);
      return {
        node_id: asStr(obj.node_id),
        hypothesis: asStr(obj.hypothesis),
        confidence: clamp01(obj.confidence),
        evidence: mapStringList(obj.evidence),
      };
    }),
    trajectory: {
      cycle: mapStringList(trajectory.cycle),
      blocking_point: asStrNull(trajectory.blocking_point),
      possible_exit: asStrNull(trajectory.possible_exit),
    },
    processing_dashboard: {
      active_nodes_count: asNum(processingDashboard.active_nodes_count) ?? null,
      main_layer: asStrNull(processingDashboard.main_layer),
      priority: asStrNull(processingDashboard.priority),
      overheat_level: clamp01(processingDashboard.overheat_level),
      resource_level: clamp01(processingDashboard.resource_level),
      markers_detected: asNum(processingDashboard.markers_detected) ?? null,
    },
    mindloom_layers: toArr(p.mindloom_layers).map((item) => {
      const obj = toObj(item);
      return {
        layer: asStr(obj.layer),
        description: asStr(obj.description),
        manifestation: asStr(obj.manifestation),
        intensity: clamp01(obj.intensity),
        evidence: mapStringList(obj.evidence),
      };
    }),
    transformation_markers: toArr(p.transformation_markers).map((item) => {
      const obj = toObj(item);
      return {
        marker: asStr(obj.marker),
        description: asStr(obj.description),
        shift_signal: asStr(obj.shift_signal),
      };
    }),
    recommended_practices: toArr(p.recommended_practices).map((item) => {
      const obj = toObj(item);
      return {
        title: asStr(obj.title),
        target_node: asStr(obj.target_node),
        layer: asStr(obj.layer),
        purpose: asStr(obj.purpose),
        frequency: asStr(obj.frequency),
        how_to_do: asStr(obj.how_to_do),
        observe: mapStringList(obj.observe),
        shift_signal: asStr(obj.shift_signal),
      };
    }),
    disclaimer: asStrNull(p.disclaimer),
    snapshot: (() => {
      const s = toObj(p.snapshot);
      if (!Object.keys(s).length) return null;
      const oh = toObj(s.main_overheat);
      return {
        key_pattern: asStrNull(s.key_pattern),
        short_explanation: asStrNull(s.short_explanation),
        three_signals: mapStringList(s.three_signals),
        main_overheat: Object.keys(oh).length
          ? { label: asStr(oh.label), score: clamp01(oh.score), explanation: asStr(oh.explanation) }
          : null,
        first_step: asStrNull(s.first_step),
      };
    })(),
    how_to_read: (() => {
      const h = toObj(p.how_to_read);
      if (!Object.keys(h).length) return null;
      return {
        title: asStrNull(h.title),
        steps: toArr(h.steps).map((item) => {
          const obj = toObj(item);
          return { title: asStr(obj.title), description: asStr(obj.description) };
        }),
      };
    })(),
    phrase_microscope: (() => {
      const pm = toObj(p.phrase_microscope);
      if (!Object.keys(pm).length) return null;
      return {
        title: asStrNull(pm.title),
        quote: asStrNull(pm.quote),
        why_this_quote: asStrNull(pm.why_this_quote),
        fragments: toArr(pm.fragments)
          .map((item) => {
            const obj = toObj(item);
            return {
              text: asStr(obj.text),
              meaning: asStr(obj.meaning),
              pattern: asStr(obj.pattern),
              explanation: asStr(obj.explanation),
            };
          })
          .filter((f) => !!f.text),
        summary: asStrNull(pm.summary),
      };
    })(),
    honest_translation: (() => {
      const ht = toObj(p.honest_translation);
      if (!Object.keys(ht).length) return null;
      return {
        title: asStrNull(ht.title),
        items: toArr(ht.items).map((item) => {
          const obj = toObj(item);
          return {
            as_said: asStr(obj.as_said),
            more_honest: asStr(obj.more_honest),
            explanation: asStr(obj.explanation),
          };
        }),
      };
    })(),
    protected_need: (() => {
      const pn = toObj(p.protected_need);
      if (!Object.keys(pn).length) return null;
      return {
        title: asStrNull(pn.title),
        description: asStrNull(pn.description),
        named: mapStringList(pn.named),
        strategy_gets: mapStringList(pn.strategy_gets),
        sacrificed: mapStringList(pn.sacrificed),
        leading_need: asStrNull(pn.leading_need),
        interpretation: asStrNull(pn.interpretation),
      };
    })(),
    feedback_config: (() => {
      const fc = toObj(p.feedback_config);
      if (!Object.keys(fc).length) return null;
      return {
        enabled: fc.enabled === true,
        positive_label: asStrNull(fc.positive_label),
        negative_label: asStrNull(fc.negative_label),
      };
    })(),
  };
}

const EMPTY: NormalizedReport = {
  format: 'unknown',
  title: null,
  participantName: null,
  summaryText: null,
  summaryRich: null,
  blocks: [],
  markers: [],
  layers: [],
  schemaVersion: null,
  sessionMeta: null,
  fixedBlocks: null,
  emotionalMap: null,
  motives: null,
  forecast: null,
  reflectionQuestions: null,
  practice: null,
  mindloomNodes: null,
  nodeConflicts: null,
  semanticMarkers: null,
  resourceVsDeficit: null,
  rhetoricalPatterns: null,
  contextualAnalysis: null,
  rewrittenHonestText: null,
  attentionLevels: null,
};

export function normalizeMindloomReport(payload: unknown): NormalizedReport {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return EMPTY;
  }
  const p = payload as Record<string, unknown>;
  const format = detectFormat(p);
  if (format === 'fixed_blocks') return normalizeFixedBlocks(p);
  if (format === 'v1') return normalizeV1(p);
  if (format === 'rich') return normalizeRich(p);
  return EMPTY;
}
