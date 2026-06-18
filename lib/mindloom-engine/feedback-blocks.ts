import type { BlockFeedbackMeta } from './types';
import { getFeedbackEnabledEngineReportBlocks } from './report-block-registry';

export const REPORT_FEEDBACK_BLOCKS: BlockFeedbackMeta[] = getFeedbackEnabledEngineReportBlocks().map((block) => ({
  block_id: block.id,
  block_title: block.title,
  enabled: block.feedbackEnabled,
}));

export function getFeedbackMeta(blockId: string): BlockFeedbackMeta | null {
  return REPORT_FEEDBACK_BLOCKS.find((block) => block.block_id === blockId) ?? null;
}
