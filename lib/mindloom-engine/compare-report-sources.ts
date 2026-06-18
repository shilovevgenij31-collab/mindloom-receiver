import type { MindloomReportV2 } from '@/lib/normalize-report';
import type { ReportV2PayloadFromEngine } from './types';
import {
  ENGINE_REPORT_BLOCK_REGISTRY,
  type EngineReportBlockId,
} from './report-block-registry';

// ── Public types ──────────────────────────────────────────────────────────────

export type BlockPresence = 'present' | 'missing' | 'hidden' | 'dev_only';

export interface BlockComparisonEntry {
  id: EngineReportBlockId;
  order: number;
  title: string;
  registryStatus: 'visible' | 'hidden' | 'dev_only';
  gpt: BlockPresence;
  engine: BlockPresence;
  note?: string;
}

export interface ReportSourceComparison {
  blockCoverage: BlockComparisonEntry[];
  gptOnlyBlocks: string[];
  engineOnlyBlocks: string[];
  sharedBlocks: string[];
  missingInEngine: string[];
  missingInGpt: string[];
  qualitativeNotes: Array<{ area: string; note: string }>;
  summary: {
    totalVisible: number;
    presentInBoth: number;
    presentInGptOnly: number;
    presentInEngineOnly: number;
    missingInBoth: number;
  };
}

// ── Engine block presence ─────────────────────────────────────────────────────

function getEngineBlock(
  payload: ReportV2PayloadFromEngine,
  id: EngineReportBlockId
): { shown: boolean } | null {
  switch (id) {
    case 'hero': return payload.hero;
    case 'disclaimer': return payload.disclaimer;
    case 'speech_cloud': return payload.speech_cloud;
    case 'main_pattern': return payload.main_pattern;
    case 'where_visible': return payload.evidence;
    case 'pattern_support': return payload.protection_support;
    case 'pattern_protection': return payload.protection_purpose;
    case 'phrases_meaning': return payload.phrases_meaning;
    case 'heatmap': return payload.heatmap;
    case 'graph': return payload.graph;
    case 'attention_route': return payload.attention_route;
    case 'attention_blind': return payload.blind_spots;
    case 'pattern_cycle': return payload.pattern_cycle;
    case 'evidence_basis': return payload.evidence_basis;
    case 'practices': return payload.practices;
    case 'business_impact': return payload.business_impact;
    case 'levels_visible': return payload.levels_visible;
    case 'shift_signals': return payload.shift_signals;
    case 'phrase_microscope':
    case 'feedback':
    case 'debug_summary':
      return null;
    default: return null;
  }
}

function engineBlockPresence(
  payload: ReportV2PayloadFromEngine,
  id: EngineReportBlockId,
  registryStatus: 'visible' | 'hidden' | 'dev_only'
): BlockPresence {
  if (registryStatus === 'dev_only') return 'dev_only';
  if (registryStatus === 'hidden') {
    // Still check if engine has data even for hidden blocks
    const block = getEngineBlock(payload, id);
    if (block?.shown) return 'present';
    return 'hidden';
  }
  const block = getEngineBlock(payload, id);
  if (!block) return 'missing';
  return block.shown ? 'present' : 'missing';
}

// ── GPT block presence ────────────────────────────────────────────────────────

function gptBlockPresence(
  report: MindloomReportV2,
  id: EngineReportBlockId,
  registryStatus: 'visible' | 'hidden' | 'dev_only'
): BlockPresence {
  if (registryStatus === 'dev_only') return 'dev_only';

  switch (id) {
    case 'hero':
      return report.hero.title || report.hero.main_insight ? 'present' : 'missing';
    case 'disclaimer':
      return 'present';
    case 'speech_cloud':
      return report.speech_layer.key_phrases.length > 0 ||
        report.speech_layer.speech_patterns.length > 0
        ? 'present'
        : 'missing';
    case 'main_pattern':
      // GPT hero.title serves as main_pattern label
      return report.hero.title ? 'present' : 'missing';
    case 'where_visible':
      return report.active_nodes.length > 0 ? 'present' : 'missing';
    case 'pattern_support':
      return report.mechanism.protective_logic ? 'present' : 'missing';
    case 'pattern_protection':
      return report.mechanism.hidden_gain || report.mechanism.perceived_threat
        ? 'present'
        : 'missing';
    case 'phrase_microscope':
      return (report.phrase_microscope?.fragments?.length ?? 0) > 0 ? 'present' : 'missing';
    case 'phrases_meaning':
      return 'missing';
    case 'heatmap':
      return report.heatmap.zones.length > 0 ? 'present' : 'missing';
    case 'graph':
      return report.node_graph.nodes.length > 0 ? 'present' : 'missing';
    case 'attention_route':
      return (report.attention_route?.steps?.length ?? 0) > 0 ? 'present' : 'missing';
    case 'attention_blind':
      return (report.attention_blind?.items?.length ?? 0) > 0 ? 'present' : 'missing';
    case 'business_impact':
      return (report.business_impact?.areas?.length ?? 0) > 0 ? 'present' : 'missing';
    case 'pattern_cycle':
      return report.trajectory.cycle.length > 0 ? 'present' : 'missing';
    case 'evidence_basis':
      return report.hypothesis_table.length > 0 ? 'present' : 'missing';
    case 'levels_visible':
      return 'missing';
    case 'shift_signals':
      return report.transformation_markers.length > 0 ? 'present' : 'missing';
    case 'practices':
      return report.recommended_practices.length > 0 ? 'present' : 'missing';
    case 'feedback':
      return report.feedback_config?.enabled ? 'present' : 'missing';
    case 'debug_summary':
      return 'dev_only';
    default:
      return 'missing';
  }
}

// ── Notes per block ───────────────────────────────────────────────────────────

const BLOCK_NOTES: Partial<Record<EngineReportBlockId, string>> = {
  main_pattern:
    'Engine main_pattern maps from contact_regime node; GPT uses a free-text title in hero.',
  heatmap:
    'Engine heatmap requires diff.indices — available in real engine output, not in mock.',
  phrases_meaning:
    'Engine has attention_route.segments but these are not yet mapped to a phrases_meaning block.',
  phrase_microscope:
    'phrase_microscope is a GPT-only format — no equivalent in engine pipeline.',
  levels_visible:
    'Engine diff.border/levels data exists but is not yet mapped to a visible block.',
  shift_signals:
    'Engine dynamics require ≥3 sessions — absent in mock (first session only).',
  business_impact:
    'Engine does not produce business_impact — requires an additional prompt layer on top of engine output.',
  attention_route:
    'Both sources provide attention route steps. Engine uses structured segments; GPT uses narrative steps.',
};

// ── Main export ───────────────────────────────────────────────────────────────

export function compareReportSources(
  gptReport: MindloomReportV2,
  enginePayload: ReportV2PayloadFromEngine
): ReportSourceComparison {
  const blockCoverage: BlockComparisonEntry[] = ENGINE_REPORT_BLOCK_REGISTRY.map((def) => {
    const gpt = gptBlockPresence(gptReport, def.id, def.status);
    const engine = engineBlockPresence(enginePayload, def.id, def.status);

    const defaultNote =
      gpt === 'present' && engine === 'missing'
        ? 'Present in GPT, missing from engine mock.'
        : engine === 'present' && gpt === 'missing'
        ? 'Structured engine data present, no equivalent in GPT format.'
        : undefined;

    const note = BLOCK_NOTES[def.id] ?? defaultNote;

    return {
      id: def.id,
      order: def.order,
      title: def.title,
      registryStatus: def.status,
      gpt,
      engine,
      note,
    };
  });

  const visibleBlocks = blockCoverage.filter((b) => b.registryStatus === 'visible');
  const sharedBlocks = visibleBlocks
    .filter((b) => b.gpt === 'present' && b.engine === 'present')
    .map((b) => b.id);
  const gptOnlyBlocks = visibleBlocks
    .filter((b) => b.gpt === 'present' && b.engine !== 'present')
    .map((b) => b.id);
  const engineOnlyBlocks = visibleBlocks
    .filter((b) => b.engine === 'present' && b.gpt !== 'present')
    .map((b) => b.id);
  const missingInEngine = visibleBlocks
    .filter((b) => b.gpt === 'present' && b.engine === 'missing')
    .map((b) => b.id);
  const missingInGpt = visibleBlocks
    .filter((b) => b.engine === 'present' && b.gpt === 'missing')
    .map((b) => b.id);

  const qualitativeNotes: Array<{ area: string; note: string }> = [
    {
      area: 'Structured data',
      note: 'Engine provides typed graph nodes/edges, attention path, and speech markers. GPT uses free-text narrative for the same concepts.',
    },
    {
      area: 'Narrative quality',
      note: 'GPT report populates target, mechanism, and trajectory with human-facing explanations — engine mock leaves these null.',
    },
    {
      area: 'Business impact',
      note: 'GPT production reports include business_impact. Engine pipeline does not produce this block without an additional prompt layer.',
    },
    {
      area: 'Heatmap',
      note: 'GPT heatmap has rich zones; engine version requires real diff.indices from a live analyze call.',
    },
    {
      area: 'Attention route',
      note: 'Both sources provide attention data. Engine: structured segments with step keys. GPT: narrative steps. Both render the same block.',
    },
  ];

  const totalVisible = visibleBlocks.length;
  const presentInBoth = sharedBlocks.length;
  const presentInGptOnly = gptOnlyBlocks.length;
  const presentInEngineOnly = engineOnlyBlocks.length;
  const missingInBoth = visibleBlocks.filter(
    (b) => b.gpt === 'missing' && b.engine === 'missing'
  ).length;

  return {
    blockCoverage,
    gptOnlyBlocks,
    engineOnlyBlocks,
    sharedBlocks,
    missingInEngine,
    missingInGpt,
    qualitativeNotes,
    summary: {
      totalVisible,
      presentInBoth,
      presentInGptOnly,
      presentInEngineOnly,
      missingInBoth,
    },
  };
}
