import { EngineReportComparison } from '@/components/dev/EngineReportComparison';
import gptSampleRaw from '@/docs/examples/mindloom-v2-realistic-sample.json';
import mockEngineOutput from '@/lib/mindloom-engine/mock-engine-output.json';
import { normalizeMindloomReportV2 } from '@/lib/normalize-report';
import { normalizeMindloomEngineOutput } from '@/lib/mindloom-engine/normalize';
import { mapNormalizedToReportV2 } from '@/lib/mindloom-engine/map-to-report-v2';
import { mapEnginePayloadToMindloomV2 } from '@/lib/mindloom-engine/map-engine-to-v2-dashboard';
import { compareReportSources } from '@/lib/mindloom-engine/compare-report-sources';
import type { MindloomEngineOutput } from '@/lib/mindloom-engine/types';

export const dynamic = 'force-static';

export default function EngineComparePage() {
  // GPT side: normalize raw JSON to MindloomReportV2
  const gptReport = normalizeMindloomReportV2(gptSampleRaw);
  if (!gptReport) throw new Error('Failed to normalize GPT sample — check mindloom-v2-realistic-sample.json');

  // Engine side: mock → normalize → map-to-v2 → map-to-dashboard
  const rawEngine = mockEngineOutput as MindloomEngineOutput;
  const normalized = normalizeMindloomEngineOutput(rawEngine);
  const enginePayload = mapNormalizedToReportV2(normalized);
  const engineReport = mapEnginePayloadToMindloomV2(enginePayload);

  // Comparison
  const comparison = compareReportSources(gptReport, enginePayload);

  return (
    <EngineReportComparison
      comparison={comparison}
      gptReport={gptReport}
      enginePayload={enginePayload}
      engineReport={engineReport}
    />
  );
}
