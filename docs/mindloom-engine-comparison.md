# Engine vs GPT comparison

Dev route: `/dev/engine-compare`

---

## Current mode

- **Fixture/mock comparison** — no Anthropic key required
- GPT source: `docs/examples/mindloom-v2-realistic-sample.json`
- Engine source: `lib/mindloom-engine/mock-engine-output.json` → normalize → map-to-report-v2

Both are processed at build time (`force-static`). No live engine calls needed.

---

## What this comparison can tell us

- **Block coverage** — which blocks are present/missing in each source
- **Structural gaps** — where engine mock produces no data (heatmap, business_impact, shift_signals)
- **Mapping gaps** — where engine data exists but isn't yet connected to a block (phrases_meaning, levels_visible)
- **Data type differences** — engine uses typed nodes/edges/steps; GPT uses free-text narratives

---

## What it cannot tell us yet

- **Real quality of live engine output** — mock data is simplified
- **Live analysis depth** — real engine output has denser graph, more segments, richer attention_route
- **Final architecture decision** — whether to use engine-only, GPT-only, or hybrid pipeline

---

## Key findings from mock comparison

| Area | GPT | Engine mock |
|---|---|---|
| Hero / main pattern | ✅ rich text | ✅ contact_regime label |
| Speech cloud | ✅ | ✅ from markers |
| Graph nodes / edges | ✅ typed | ✅ typed (same schema) |
| Attention route | ✅ narrative steps | ✅ structured steps |
| Attention blind spots | ✅ | ✅ |
| Practices | ✅ | ✅ from try_this cards |
| Heatmap | ✅ rich zones | ❌ requires real diff.indices |
| Business impact | ✅ | ❌ no engine equivalent |
| Pattern cycle | ✅ | ✅ derived from defenses + needs |
| Shift signals | ✅ | ❌ requires ≥3 sessions |
| target / mechanism / trajectory | ✅ narrative | ❌ null in engine pipeline |
| hypothesis_table | ✅ | ❌ not mapped yet |

---

## To run live comparison later

1. Set `ANTHROPIC_API_KEY` in engine `.env`:
   ```
   C:\Users\andre\Desktop\new loomm\repo\Mindloom_edagency-main\.env
   ```
2. Start engine:
   ```bash
   .venv/Scripts/uvicorn serve:app --port 8077
   ```
3. Run live analyze:
   ```bash
   node scripts/check-mindloom-engine-client.mjs --analyze
   ```
4. Save real output to `lib/mindloom-engine/real-engine-output-sample.json`
5. Update `app/dev/engine-compare/page.tsx` to load real fixture
6. Compare real engine output vs GPT report at `/dev/engine-compare`

---

## Files

| File | Purpose |
|---|---|
| `app/dev/engine-compare/page.tsx` | Dev route, loads data and runs comparison |
| `components/dev/EngineReportComparison.tsx` | UI component |
| `lib/mindloom-engine/compare-report-sources.ts` | Deterministic comparison utility |
| `docs/mindloom-engine-comparison.md` | This document |

Related: [mindloom-engine-client.md](mindloom-engine-client.md), [mindloom-lite-engine-runtime-audit.md](mindloom-lite-engine-runtime-audit.md)
