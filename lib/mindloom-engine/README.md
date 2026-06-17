# Mindloom Engine Adapter Layer

Isolated adapter: **Mindloom Lite Engine output → ReportV2PayloadFromEngine**

No Anthropic API key. No `/api/analyze` calls. No changes to existing report flow.

## Files

| File | Role |
|------|------|
| `types.ts` | TypeScript interfaces for engine output, normalized format, and ReportV2 payload |
| `mock-engine-output.json` | Representative mock: cards, diff, graph, attention, field, markers, semantic_map, transition_map, attention_route |
| `normalize.ts` | `normalizeMindloomEngineOutput(engine)` → `NormalizedMindloomAnalysis` |
| `feedback-blocks.ts` | 9 feedback block definitions + `getFeedbackMeta(blockId)` helper |
| `map-to-report-v2.ts` | `mapNormalizedToReportV2(normalized)` → `ReportV2PayloadFromEngine` |

## Pipeline

```
MindloomEngineOutput (engine JSON)
    ↓ normalizeMindloomEngineOutput()
NormalizedMindloomAnalysis (intermediate)
    ↓ mapNormalizedToReportV2()
ReportV2PayloadFromEngine (report blocks with shown: boolean)
```

## How to use with real engine output

Replace `mock-engine-output.json` with the actual JSON returned by the engine's
`/api/analyze` endpoint. The shape must match `MindloomEngineOutput` in `types.ts`.

```ts
import engineOutput from './real-engine-response.json';
import { normalizeMindloomEngineOutput } from './normalize';
import { mapNormalizedToReportV2 } from './map-to-report-v2';

const normalized = normalizeMindloomEngineOutput(engineOutput);
const report = mapNormalizedToReportV2(normalized);
```

## Blocks: shown / hidden logic

| Block | Shown when |
|-------|-----------|
| `hero` | Always |
| `disclaimer` | Always |
| `speech_cloud` | Markers or self-portrait frames present |
| `main_pattern` | `contact_mode` card present |
| `heatmap` | Hidden (needs real diff indices) |
| `evidence` | Node evidence quotes present |
| `protection_support` | Defense nodes present |
| `protection_purpose` | Defense nodes present |
| `phrases_meaning` | Hidden (needs full attention_route from engine) |
| `graph` | Graph nodes present |
| `attention_route` | Attention path present |
| `blind_spots` | Blind spots from attention or cards |
| `pattern_cycle` | Defense + unmet need nodes present |
| `levels_visible` | Hidden (needs real diff borders from engine) |
| `evidence_basis` | Evidence quotes present |
| `shift_signals` | Returning session with dynamics (≥3 episodes) |
| `practices` | `try_this` card or transition_map replacements |
| `business_impact` | **Always hidden** — requires additional prompt layer |

## Running the test script

```
node scripts/test-mindloom-engine-adapter.mjs
```

Output: `artifacts/report-v2-from-engine-mock.json`
