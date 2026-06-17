import type { BlockFeedbackMeta } from './types';

export const REPORT_FEEDBACK_BLOCKS: BlockFeedbackMeta[] = [
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

export function getFeedbackMeta(blockId: string): BlockFeedbackMeta | null {
  return REPORT_FEEDBACK_BLOCKS.find((b) => b.block_id === blockId) ?? null;
}
