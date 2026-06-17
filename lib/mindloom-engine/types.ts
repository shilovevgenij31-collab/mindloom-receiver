// Mindloom Lite Engine — типы данных для adapter layer.
// Не использует Anthropic API напрямую. Данные поступают из engine Марии.

// ── Primitive helpers ────────────────────────────────────────────────────────

export type Band = 'green' | 'yellow' | 'white' | 'abstained';

export type NodeFamily =
  | 'unmet_need'
  | 'emotional_somatic_reaction'
  | 'defense'
  | 'behavior_and_speech'
  | 'core_belief'
  | 'secondary_gain'
  | 'compensatory_belief'
  | 'hidden_value'
  | 'contact_regime'
  | 'trauma_imprint'
  | 'subpersonality'
  | 'internalized_program'
  | 'worldview_block'
  | 'paradigm';

export type EdgeTau =
  | 'evocation'
  | 'consolidation'
  | 'masking'
  | 'compensation'
  | 'transmission'
  | 'expression'
  | 'generalization';

// ── Engine output sub-types ──────────────────────────────────────────────────

export interface EngineCard {
  id: string;
  title: string;
  confidence_band: Band;
  body: string;
  source_fields: string[];
}

export interface EngineLadderLevel {
  code: string;
  value: string | null;
  confidence: number;
  band: Band;
  earned: boolean;
}

export interface EngineDiffProfile {
  schema_version?: string;
  unit_id: string;
  unit_type?: string;
  levels: EngineLadderLevel[];
  parameters: Record<string, number>;
  indices: Record<string, number>;
  gates: Record<string, { requires: string[]; met: boolean }>;
  jumps: Array<{ level: string; missing_support: string[]; note: string }>;
  border: {
    solid_up_to: string;
    hedged_through: string;
    reconstruction_from: string | null;
  };
  provenance?: string;
}

export interface EngineNodeEvidence {
  input_id: string;
  span: string | null;
  date?: string | null;
}

export interface EngineGraphNode {
  node_id: string;
  family: NodeFamily;
  subnode: string | null;
  display_label: string | null;
  activation: number;
  confidence: number;
  valence: 'distress' | 'protection' | 'adaptation' | 'aspiration';
  occurrences: number;
  first_seen: string;
  last_seen: string;
  visible: 'yes' | 'careful' | 'no';
  evidence?: EngineNodeEvidence[];
  need_id?: string;
  f4?: string;
}

export interface EngineGraphEdge {
  edge_id: string;
  from: string;
  to: string;
  tau: EdgeTau;
  morphism?: string;
  weight: number;
  confidence: number;
  occurrences: number;
  evidence?: Array<{ input_id: string }>;
  first_seen?: string;
  last_seen?: string;
}

export interface EngineGraphHypothesis {
  rank: number;
  active_nodes: string[];
  strongest_links: Array<{ from: string; to: string; tau: string; weight: number }>;
  ambiguity_flags: string[];
  follow_up_questions: string[];
}

export interface EngineGraph {
  graph_spec: string;
  user_id: string;
  ontology_version?: string;
  nodes: EngineGraphNode[];
  edges: EngineGraphEdge[];
  snapshots?: unknown[];
  ranked_hypotheses?: EngineGraphHypothesis[];
  versions?: unknown;
}

export interface EngineAttentionLevel {
  code: string;
  attention: number;
  earned: boolean;
}

export interface EngineAttention {
  kind: string;
  n_snapshots: number;
  preliminary: boolean;
  path: {
    levels: EngineAttentionLevel[];
    skipped: string[];
  };
  blind: Array<{ text: string; confidence: number }>;
  aggregate_available: boolean;
}

export interface EngineField {
  allowed: string[];
  costly: string[];
  blocked: string[];
  openness: number;
  speaker: number;
  addressee: number;
}

export interface EngineMarkerEvidence {
  segment_id: string;
  quote: string;
  span?: [number, number];
}

export interface EngineObservedMarker {
  cue: string;
  meaning: string;
  leads_to: string;
  occurrences: number;
  evidence: EngineMarkerEvidence[];
}

export interface EngineMarkers {
  schema_version?: string;
  markers: EngineObservedMarker[];
}

export interface EngineSemanticConcept {
  id: string;
  label: string;
  degree?: number;
  in_degree_charged?: number;
  valence?: 'neutral' | 'charged';
  state: 'collapsed' | 'funnel' | 'normal';
}

export interface EngineSemanticLink {
  from: string;
  to: string;
  type: 'equals' | 'causes' | 'requires' | 'excludes' | 'part_of';
  rigid?: boolean;
  valence?: string;
  label?: string;
}

export interface EngineAffordance {
  from: string;
  to: string;
  rationale: string;
  affects_choice: string;
}

export interface EngineSemanticMap {
  schema_version?: string;
  concepts: EngineSemanticConcept[];
  links: EngineSemanticLink[];
  collapse_score: number;
  affordances: EngineAffordance[];
  care_flag: boolean;
}

export interface EngineTMNode {
  key: string;
  n: number;
  ru: string;
  deep: boolean;
  family?: string;
  evidenced: boolean;
  label?: string;
  strength?: number;
}

export interface EngineTMTransition {
  id: string;
  from: string;
  to: string;
  morphism?: string;
  ru: string;
  does?: string;
  active: boolean;
}

export interface EngineTMLoop {
  id: string;
  ru: string;
  type?: string;
  desc?: string;
  break?: string;
  from: string;
  to: string;
  active: boolean;
}

export interface EngineTransitionMap {
  schema_version?: string;
  n_evidenced: number;
  n_total: number;
  nodes: EngineTMNode[];
  transitions: EngineTMTransition[];
  loops?: EngineTMLoop[];
  replacements?: Array<{ old: string; new: string; phrase: string; relevant: boolean }>;
}

export interface EngineARStep {
  key: string;
  ru: string;
  value: string;
  status: 'ok' | 'approx' | 'v2';
}

export interface EngineARFork {
  old: string;
  new: string;
  phrase: string;
  why: string;
}

export interface EngineARSegment {
  segment_id?: string;
  quote: string;
  steps: EngineARStep[];
  fork: EngineARFork;
}

export interface EngineAttentionRoute {
  schema_version?: string;
  n_segments: number;
  segments: EngineARSegment[];
  loops: Array<{ ru: string; desc?: string; break?: string }>;
}

export interface EngineDynamics {
  schema_version?: string;
  shown: boolean;
  n_snapshots: number;
  period?: string;
  regime_trajectory: {
    sequence: Array<{ date: string; input_id: string; regime: string | null; regime_folk: string }>;
    transitions: Array<{
      from: string; to: string;
      from_folk: string; to_folk: string;
      known: boolean;
      valence: string;
    }>;
    summary: string;
  };
  new_needs: Array<{ key: string; first_seen: string }>;
  recurring_blind_spots: Array<{ text: string; occurrences: number }>;
  adaptivity: { masking_weakening: string };
}

export interface EngineSelfPortrait {
  schema_version?: string;
  n_snapshots: number;
  shown: boolean;
  frequent_frames: Array<{
    frame: string;
    occurrences: number;
    rate: number;
    linked_function?: string;
    signal?: string;
    signal_meaning?: string;
    function_note?: string;
    preliminary?: boolean;
  }>;
  signature_jumps: Array<{
    from?: string;
    to: string;
    skips?: string[];
    occurrences: number;
    rate: number;
    lever?: string;
    function_note?: string;
    preliminary?: boolean;
  }>;
  triggers: Array<{
    cue: string;
    leads_to: string;
    occurrences: number;
    rate: number;
    function_note?: string;
    preliminary?: boolean;
  }>;
}

export interface EngineMeta {
  schema_version?: string;
  ontology_version?: string;
  model?: string;
  prompt_version?: string;
  input_id?: string;
  language?: string;
  n_segments?: number;
  analysis_time?: number;
}

// ── Main engine output type ──────────────────────────────────────────────────

export interface MindloomEngineOutput {
  input_id: string;
  input_text?: string;

  // Mandatory
  cards: {
    schema_version?: string;
    input_id?: string;
    cards: EngineCard[];
  };
  diff: EngineDiffProfile[];
  graph: EngineGraph;

  // Optional
  attention?: EngineAttention;
  field?: EngineField;
  markers?: EngineMarkers;
  semantic_map?: EngineSemanticMap;
  transition_map?: EngineTransitionMap;
  attention_route?: EngineAttentionRoute;
  dynamics?: EngineDynamics;
  self_portrait?: EngineSelfPortrait;
  meta?: EngineMeta;
}

// ── Normalized intermediate format ───────────────────────────────────────────

export interface NormalizedSpeechMarker {
  cue: string;
  meaning: string;
  occurrences: number;
  quote: string;
}

export interface NormalizedEvidenceQuote {
  quote: string;
  node_id?: string;
  segment_id?: string;
}

export interface NormalizedAttentionLevel {
  level: string;
  attention: number;
  earned: boolean;
  description: string | null;
}

export interface NormalizedAttentionRoute {
  path: NormalizedAttentionLevel[];
  skipped: string[];
  n_snapshots: number;
  preliminary: boolean;
}

export interface NormalizedBlindSpot {
  text: string;
  confidence: number;
  source: 'attention' | 'cards';
}

export interface NormalizedGraphNode {
  node_id: string;
  display_label: string;
  family: string;
  activation: number;
  valence: string;
  f4?: string;
}

export interface NormalizedGraphEdge {
  from_id: string;
  to_id: string;
  from_label: string;
  to_label: string;
  tau: string;
  weight: number;
}

export interface NormalizedGraph {
  top_nodes: NormalizedGraphNode[];
  key_edges: NormalizedGraphEdge[];
  ranked_pattern: string;
  ambiguity_note: string;
  follow_up: string[];
}

export interface NormalizedNeed {
  label: string;
  activation: number;
  need_id?: string;
}

export interface NormalizedProtection {
  defense_label: string;
  masks_label: string | null;
  evoked_by: string | null;
  f4?: string;
  evidence_quote: string | null;
}

export interface NormalizedField {
  allowed: string[];
  costly: string[];
  blocked: string[];
  openness: number;
  speaker_agency: number;
}

export interface NormalizedPractice {
  text: string;
  source: 'try_this' | 'transition_map';
}

export interface NormalizedSemanticMap {
  charged_concepts: Array<{ label: string; state: string }>;
  collapse_score: number;
  affordances: Array<{ from: string; to: string; rationale: string }>;
  care_flag: boolean;
}

export interface NormalizedDynamics {
  shown: boolean;
  regime_summary: string;
  shift_signals: Array<{ from_folk: string; to_folk: string; valence: string }>;
  recurring_blind_spots: Array<{ text: string; occurrences: number }>;
  adaptivity: string;
}

export interface NormalizedSelfPortrait {
  shown: boolean;
  frames: Array<{ frame: string; rate: number; signal: string }>;
  jumps: Array<{ from?: string; to: string; lever: string }>;
  triggers: Array<{ cue: string; leads_to: string }>;
}

export interface NormalizedMindloomAnalysis {
  source: 'mindloom_lite_engine';
  engine_version: string;
  engine_input_id: string;
  session_type: 'first' | 'returning';

  main_pattern: {
    regime_folk: string;
    top_defense_labels: string[];
    contact_mode_text: string;
    confidence_band: Band;
  };

  speech_markers: NormalizedSpeechMarker[];
  evidence_quotes: NormalizedEvidenceQuote[];
  attention_route: NormalizedAttentionRoute;
  blind_spots: NormalizedBlindSpot[];
  graph: NormalizedGraph;
  needs: { protected: NormalizedNeed[]; unmet: NormalizedNeed[] };
  protections: NormalizedProtection[];
  field: NormalizedField;
  practices: NormalizedPractice[];
  business_signals: null;
  semantic_map: NormalizedSemanticMap | null;
  dynamics: NormalizedDynamics | null;
  self_portrait: NormalizedSelfPortrait | null;

  meta: {
    input_id: string;
    n_segments: number;
    confidence_summary: Band;
    is_first_session: boolean;
    has_dynamics: boolean;
    has_self_portrait: boolean;
    care_flag: boolean;
  };
}

// ── Report V2 payload shape ───────────────────────────────────────────────────

export interface BlockFeedbackMeta {
  block_id: string;
  block_title: string;
  enabled: boolean;
}

export interface ReportV2Block<T = unknown> {
  shown: boolean;
  data?: T;
  feedback?: BlockFeedbackMeta;
  reason?: string;
}

export interface ReportV2PayloadFromEngine {
  report_version: 'v2';
  source: 'mindloom_lite_engine';
  engine_input_id: string;
  session_type: 'first' | 'returning';

  hero: ReportV2Block<{
    regime_label: string;
    top_defenses: string[];
    headline_text: string;
    confidence_band: Band;
  }>;

  disclaimer: ReportV2Block<{
    n_sessions: number;
    confidence_note: string;
    l7_earned: boolean;
  }>;

  speech_cloud: ReportV2Block<{
    markers: NormalizedSpeechMarker[];
    frequent_frames: Array<{ frame: string; rate: number; signal: string }>;
  }>;

  main_pattern: ReportV2Block<{
    contact_mode_text: string;
    confidence_band: Band;
  }>;

  heatmap: ReportV2Block<{
    segments: Array<{
      segment_id: string;
      pressure_index: number;
      attention_score: number;
      top_defense: string;
    }>;
  }>;

  evidence: ReportV2Block<{
    quotes: NormalizedEvidenceQuote[];
  }>;

  protection_support: ReportV2Block<{
    items: Array<{
      defense_label: string;
      evoked_by: string | null;
      confidence: string;
    }>;
  }>;

  protection_purpose: ReportV2Block<{
    items: Array<{
      defense_label: string;
      masks: string | null;
      quote: string | null;
    }>;
  }>;

  phrases_meaning: ReportV2Block<{
    segments: Array<{
      quote: string;
      steps: Array<{ level: string; description: string }>;
      fork_old: string;
      fork_new: string;
    }>;
  }>;

  graph: ReportV2Block<{
    nodes: NormalizedGraphNode[];
    edges: NormalizedGraphEdge[];
    top_pattern: string;
  }>;

  attention_route: ReportV2Block<{
    path: NormalizedAttentionLevel[];
  }>;

  blind_spots: ReportV2Block<{
    items: NormalizedBlindSpot[];
  }>;

  pattern_cycle: ReportV2Block<{
    description: string;
    based_on: string;
  }>;

  levels_visible: ReportV2Block<{
    segments: Array<{
      segment_id: string;
      solid_up_to: string;
      hedged_through: string;
      reconstruction_from: string | null;
      l7_earned: boolean;
    }>;
  }>;

  evidence_basis: ReportV2Block<{
    quotes: NormalizedEvidenceQuote[];
  }>;

  shift_signals: ReportV2Block<{
    signals: Array<{ from_folk: string; to_folk: string; valence: string }>;
    adaptivity: string;
  }>;

  practices: ReportV2Block<{
    items: NormalizedPractice[];
  }>;

  business_impact: ReportV2Block<null>;

  meta: {
    n_sessions: number;
    has_dynamics: boolean;
    has_self_portrait: boolean;
    care_flag: boolean;
    confidence_summary: Band;
    generated_at: string;
  };
}
