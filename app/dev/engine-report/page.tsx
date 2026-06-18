import { EngineReportPreview } from '@/components/dev/EngineReportPreview';
import mockEngineOutput from '@/lib/mindloom-engine/mock-engine-output.json';
import { normalizeMindloomEngineOutput } from '@/lib/mindloom-engine/normalize';
import { mapNormalizedToReportV2 } from '@/lib/mindloom-engine/map-to-report-v2';
import type { MindloomEngineOutput } from '@/lib/mindloom-engine/types';

export const dynamic = 'force-static';

export default function EngineReportDevPage() {
  const rawEngine = mockEngineOutput as MindloomEngineOutput;
  const normalized = normalizeMindloomEngineOutput(rawEngine);
  const report = mapNormalizedToReportV2(normalized);

  return <EngineReportPreview report={report} rawEngineOutput={rawEngine} normalized={normalized} />;
}
