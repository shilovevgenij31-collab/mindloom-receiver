# Mindloom Lite Engine runtime audit

Date: 2026-06-18

## Paths

- Receiver: `C:\Users\andre\Desktop\mindloom`
- Engine: `C:\Users\andre\Desktop\new loomm\repo\Mindloom_edagency-main`

---

## How to start engine

**Backend (FastAPI/Python):**
```bash
cd "C:\Users\andre\Desktop\new loomm\repo\Mindloom_edagency-main"
python -m venv .venv                          # one-time
.venv/Scripts/pip install -r requirements.txt # one-time
.venv/Scripts/pip install pytest              # one-time, for tests
.venv/Scripts/uvicorn serve:app --port 8077   # start server
```

**Frontend (Next.js, optional):**
```bash
cd frontend
npm install
npm run dev  # → http://localhost:3100
```

Frontend can run without backend using built-in fixture examples (button "Показать пример").

---

## Environment requirements

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | **YES** for `/api/analyze` | `RuntimeError` without it; read from `.env` or env var |
| `MLITE_ANALYSIS_MODEL` | No | Default: `claude-haiku-4-5` |
| `MLITE_REPORT_MODEL` | No | Default: `claude-haiku-4-5` |
| `MLITE_REPORT_MODEL_STRONG` | No | Default: `claude-sonnet-4-6` |
| `MLITE_DB_PATH` | No | Default: `data/db/mlite.db` |

`.env.example` is in the repo root. Create `.env` with actual key for live runs.

---

## Health check

```
GET http://localhost:8077/api/health
→ {"status":"ok","version":"0.1.0","has_api_key":false}
```

Status: **OK** (confirmed locally, key not present = `has_api_key: false`).

---

## Analyze endpoint

**Path:** `POST /api/analyze`

**Request shape:**
```json
{
  "text": "string (required)",
  "situation_summary": "string (optional)",
  "relationship_type": "string (optional)",
  "user_id": "string (optional, default: 'anon')"
}
```

**Response shape:**
```json
{
  "input_id": "in_<sha1>",
  "input_text": "...",
  "cards": { "schema_version": "lite.cards.v0.1", "input_id": "...", "cards": [...] },
  "diff": [ { "unit_id": "s1", "levels": [...], "parameters": {...}, "indices": {...}, "border": {...} } ],
  "graph": { "graph_spec": "lite.graph.v0.1", "nodes": [...], "edges": [...], "snapshots": [...], "ranked_hypotheses": [...] },
  "field": { "allowed": [...], "costly": [...], "blocked": [...], "openness": 0.25, "speaker": 0.4, "addressee": 0.6 },
  "attention": { "kind": "attention_path", "path": { "levels": [...], "skipped": [...] }, "blind": [...] },
  "self_portrait": { "shown": false, ... },
  "markers": { "schema_version": "lite.markers.v0.1", "markers": [...] },
  "dynamics": { "shown": false, ... },
  "transition_map": { "schema_version": "lite.tm.v0.1", "nodes": [...], "transitions": [...], "loops": [...] },
  "attention_route": { "schema_version": "lite.attention_route.v0.1", "version": "v1", "n_segments": N, "segments": [...], "loops": [...] },
  "semantic_map": { "concepts": [...], "links": [...], "collapse_score": 0.85, "affordances": [...], "care_flag": false },
  "meta": { "cost_usd": 0.13, "llm_calls": 2, "report_model": "claude-haiku-4-5", "rejected": [], "analysis_id": 1 }
}
```

---

## Anthropic key requirement

- **Required:** YES — `LLMClient.__post_init__` raises `RuntimeError("ANTHROPIC_API_KEY не задан")` immediately when key is absent.
- **Error without key:** `HTTP 500 Internal Server Error` (no JSON, just text).
- **Mock mode:** None — no bypass available.
- **Tests without key:** 125 deterministic tests pass; 17 skipped (those call LLM).
- **Cost per run:** ~$0.13–0.15 (Haiku analyze + Sonnet/Haiku report).

---

## Fixtures / tests

- **Location:** `frontend/public/fixtures/` — `graph.json`, `attention.json`, `cards.json`, `diff.json`, `field.json`, `self_portrait.json`, `semantic_map.json`, `dynamics.json`
- **Tests:** `tests/` — 125 passed, 17 skipped (LLM), 5 warnings (utcnow deprecation)
- **Run:** `.venv/Scripts/python -m pytest tests/ -q`
- All deterministic tests green without API key.

---

## Output vs current adapter

### Matches (our types are correct):

| Field | Status |
|---|---|
| `graph.nodes[].node_id`, `family`, `activation`, `valence`, `display_label`, `visible` | ✅ match |
| `graph.edges[].from`, `to`, `tau`, `weight` | ✅ match |
| `graph.edges[]` uses node_id refs (not labels) — resolved in `normalize.ts` via `labelOf()` | ✅ handled |
| `markers.markers[].cue`, `meaning`, `occurrences`, `evidence[].quote` | ✅ match |
| `attention.path.levels[].code`, `attention`, `earned` | ✅ match |
| `attention.blind[].text`, `confidence` | ✅ match |
| `cards.cards[].id`, `title`, `confidence_band`, `body` | ✅ match |
| `field.allowed`, `costly`, `blocked`, `openness`, `speaker` | ✅ match |
| `semantic_map.concepts`, `links`, `collapse_score`, `affordances`, `care_flag` | ✅ match |
| `transition_map.nodes`, `transitions`, `loops`, `replacements` | ✅ match |
| `attention_route.segments[].quote`, `steps[].value`, `steps[].status`, `fork` | ✅ match |
| Node families (14 incl. `contact_regime`) | ✅ match |
| Edge tau values (7 types) | ✅ match |

### Mismatches / gaps to fix in 3C:

| Field | Issue | Impact |
|---|---|---|
| `meta` shape | Our `EngineMeta` expects `{model, prompt_version, n_segments, analysis_time}` — real serve returns `{cost_usd, llm_calls, report_model, rejected, analysis_id}` | Medium — `normalize.ts` uses `engine.meta?.n_segments` which will be `undefined` for real output; use `engine.diff?.length` fallback instead (already coded) |
| `attention_route.segments[].steps[].key` | Mock uses `L0`, `L3`, `L6`; real engine uses `event`, `figure`, `need`, `belief`, etc. | Low — `normalize.ts` uses `step.key` as label string only; works either way |
| `attention_route.version` | Field `"v1"` or `"v2"` not in `EngineAttentionRoute` type | Low — TypeScript ignores extra fields |
| `attention_route.segments[].forks[]` | Not in `EngineARSegment` type | Low — field present in real output, not typed |
| `attention_route.segments[].blocked_transitions[]` | Not in `EngineARSegment` type | Low — same |
| `attention_route.schema_version` | Mock says `"lite.ar.v0.1"`, real says `"lite.attention_route.v0.1"` | Cosmetic |
| `EngineMeta` type | Designed for pre-serve pipeline meta; real serve has different meta | Medium — update type for 3C |

### Fields NOT in engine output (confirmed absent, correctly null in our payload):

| Field | Notes |
|---|---|
| `business_impact` | Not produced by engine; correctly `shown: false` in adapter |
| `heatmap` as standalone block | `diff` has `pressure_index` per segment — `phrases_meaning` block uses this |

---

## Recommendation for 3C

**Prerequisites:**
1. Provide `ANTHROPIC_API_KEY` in `.env` of engine project
2. Run live `/api/analyze` with real test text
3. Save full real response to `lib/mindloom-engine/` as `real-engine-output-sample.json`

**Type fixes needed before wiring:**
1. Update `EngineMeta` to union or replace with real serve meta shape (`cost_usd`, `llm_calls`, `report_model`, `rejected`, `analysis_id`)
2. Add `version?: 'v1' | 'v2'` to `EngineAttentionRoute`
3. Add `forks?: EngineARForkV2[]` and `blocked_transitions?: string[]` to `EngineARSegment`

**Normalize fixes (low risk):**
- `n_segments` fallback to `engine.diff?.length` already coded — no change needed
- Step key format (`L0` vs `event`) handled gracefully — no change needed

**Integration approach for 3C:**
- Receiver calls engine at `http://engine-host:8077/api/analyze` via admin action
- Response shape already modeled in `MindloomEngineOutput`
- Normalize → map-to-report-v2 → mapEnginePayloadToMindloomV2 pipeline already built
- Only wiring needed: HTTP client call, error handling, response saving to DB

**Not needed in 3C:**
- No changes to `ReportV2Dashboard` (production render is complete)
- No changes to `/r/[publicToken]` route
- No schema migrations
