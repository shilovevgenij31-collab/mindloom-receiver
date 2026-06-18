export type EngineReportBlockId =
  | 'hero'
  | 'disclaimer'
  | 'speech_cloud'
  | 'main_pattern'
  | 'where_visible'
  | 'pattern_support'
  | 'pattern_protection'
  | 'phrase_microscope'
  | 'phrases_meaning'
  | 'heatmap'
  | 'graph'
  | 'attention_route'
  | 'attention_blind'
  | 'business_impact'
  | 'pattern_cycle'
  | 'evidence_basis'
  | 'levels_visible'
  | 'shift_signals'
  | 'practices'
  | 'feedback'
  | 'debug_summary';

export type EngineReportBlockStatus = 'visible' | 'hidden' | 'dev_only';

export interface EngineReportBlockDefinition {
  id: EngineReportBlockId;
  order: number;
  title: string;
  subtitle?: string;
  status: EngineReportBlockStatus;
  feedbackEnabled: boolean;
  sourceFields: string[];
  hiddenReason?: string;
  requires?: string[];
}

export const ENGINE_REPORT_BLOCK_REGISTRY: EngineReportBlockDefinition[] = [
  { id: 'hero', order: 1, title: 'Ключевой паттерн', status: 'visible', feedbackEnabled: false, sourceFields: ['cards.cards', 'graph.nodes', 'meta.input_id'] },
  { id: 'disclaimer', order: 2, title: 'Границы интерпретации', status: 'visible', feedbackEnabled: false, sourceFields: ['diff', 'meta.n_segments', 'dynamics.n_snapshots'] },
  { id: 'speech_cloud', order: 3, title: 'Что повторяется в речи', status: 'visible', feedbackEnabled: true, sourceFields: ['markers.markers', 'self_portrait.frequent_frames'] },
  { id: 'main_pattern', order: 4, title: 'Самый заметный паттерн', status: 'visible', feedbackEnabled: true, sourceFields: ['cards.cards', 'graph.ranked_hypotheses'] },
  { id: 'where_visible', order: 5, title: 'Как проявляется паттерн', status: 'visible', feedbackEnabled: true, sourceFields: ['graph.nodes[].evidence', 'cards.cards[].body'] },
  { id: 'pattern_support', order: 6, title: 'Что может поддерживать паттерн', status: 'visible', feedbackEnabled: false, sourceFields: ['graph.edges', 'graph.nodes', 'cards.cards'] },
  { id: 'pattern_protection', order: 7, title: 'Что паттерн может защищать', status: 'visible', feedbackEnabled: true, sourceFields: ['graph.edges', 'graph.nodes[].evidence'] },
  { id: 'phrase_microscope', order: 8, title: 'Что слышно в этой фразе', status: 'hidden', feedbackEnabled: false, sourceFields: ['attention_route.segments[].steps', 'markers.markers[].evidence'], hiddenReason: 'requires_phrase_segments', requires: ['phrase_segments'] },
  { id: 'phrases_meaning', order: 9, title: 'Фразы и возможный смысл', status: 'hidden', feedbackEnabled: false, sourceFields: ['transition_map.replacements', 'attention_route.segments'], hiddenReason: 'requires_phrase_segments', requires: ['phrase_segments'] },
  { id: 'heatmap', order: 10, title: 'Что звучит сильнее всего', status: 'hidden', feedbackEnabled: false, sourceFields: ['diff.indices', 'diff.parameters', 'cards.cards'], hiddenReason: 'requires_diff_indices', requires: ['diff_indices'] },
  { id: 'graph', order: 11, title: 'Как темы усиливают друг друга', subtitle: 'Одна тема может усиливать другую — это не диагноз, а гипотеза по материалу.', status: 'visible', feedbackEnabled: true, sourceFields: ['graph.nodes', 'graph.edges', 'graph.ranked_hypotheses'] },
  { id: 'attention_route', order: 12, title: 'Маршрут внимания', status: 'visible', feedbackEnabled: true, sourceFields: ['attention.path', 'attention_route.segments', 'attention_route.loops'] },
  { id: 'attention_blind', order: 13, title: 'Что внимание может пропускать', status: 'visible', feedbackEnabled: true, sourceFields: ['attention.blind', 'cards.cards'] },
  { id: 'business_impact', order: 14, title: 'Как это может влиять на решения и работу', status: 'visible', feedbackEnabled: false, sourceFields: ['business_impact.areas', 'business_impact.strengths', 'business_impact.risks'] },
  { id: 'pattern_cycle', order: 15, title: 'Цикл паттерна', status: 'visible', feedbackEnabled: false, sourceFields: ['transition_map.loops', 'transition_map.transitions'] },
  { id: 'evidence_basis', order: 16, title: 'На чём основаны выводы', status: 'visible', feedbackEnabled: false, sourceFields: ['graph.nodes[].evidence', 'markers.markers[].evidence', 'cards.cards[].source_fields'] },
  { id: 'levels_visible', order: 17, title: 'На каких уровнях это заметно', status: 'hidden', feedbackEnabled: false, sourceFields: ['diff.border', 'diff.levels', 'diff.gates'], hiddenReason: 'requires_level_mapping', requires: ['level_mapping'] },
  { id: 'shift_signals', order: 18, title: 'Признаки сдвига', status: 'hidden', feedbackEnabled: false, sourceFields: ['dynamics.regime_trajectory', 'dynamics.adaptivity'], hiddenReason: 'requires_previous_session_or_shift_markers', requires: ['previous_session', 'shift_markers'] },
  { id: 'practices', order: 19, title: 'Маленькие шаги на неделю', status: 'visible', feedbackEnabled: true, sourceFields: ['cards.cards', 'transition_map.loops', 'semantic_map.affordances'] },
  { id: 'feedback', order: 20, title: 'Обратная связь по блокам', status: 'hidden', feedbackEnabled: false, sourceFields: ['feedback.block_id', 'feedback.block_title', 'feedback.enabled'], hiddenReason: 'requires_feedback_api', requires: ['feedback_api'] },
  { id: 'debug_summary', order: 21, title: 'Debug summary', status: 'dev_only', feedbackEnabled: false, sourceFields: ['registry', 'report.meta', 'report.source'] },
];

const REGISTRY_BY_ID: Record<EngineReportBlockId, EngineReportBlockDefinition> = ENGINE_REPORT_BLOCK_REGISTRY.reduce((acc, block) => {
  acc[block.id] = block;
  return acc;
}, {} as Record<EngineReportBlockId, EngineReportBlockDefinition>);

export function getEngineReportBlockDefinition(id: EngineReportBlockId): EngineReportBlockDefinition {
  return REGISTRY_BY_ID[id];
}

export function getVisibleEngineReportBlocks(): EngineReportBlockDefinition[] {
  return ENGINE_REPORT_BLOCK_REGISTRY.filter((block) => block.status === 'visible');
}

export function getDevOnlyEngineReportBlocks(): EngineReportBlockDefinition[] {
  return ENGINE_REPORT_BLOCK_REGISTRY.filter((block) => block.status === 'dev_only');
}

export function getFeedbackEnabledEngineReportBlocks(): EngineReportBlockDefinition[] {
  return ENGINE_REPORT_BLOCK_REGISTRY.filter((block) => block.feedbackEnabled);
}

export function getHiddenEngineReportBlocks(): EngineReportBlockDefinition[] {
  return ENGINE_REPORT_BLOCK_REGISTRY.filter((block) => block.status === 'hidden');
}

export const ENGINE_REPORT_BLOCK_ALIASES = {
  evidence: 'where_visible',
  protection_purpose: 'pattern_protection',
  blind_spots: 'attention_blind',
} as const;

export function isEngineReportBlockId(id: string): id is EngineReportBlockId {
  return id in REGISTRY_BY_ID;
}

export function normalizeEngineReportBlockId(id: string): EngineReportBlockId | null {
  if (id in REGISTRY_BY_ID) return id as EngineReportBlockId;
  if (id in ENGINE_REPORT_BLOCK_ALIASES) {
    return ENGINE_REPORT_BLOCK_ALIASES[id as keyof typeof ENGINE_REPORT_BLOCK_ALIASES];
  }
  return null;
}
