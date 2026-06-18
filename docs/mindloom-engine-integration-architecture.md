# Mindloom Engine Integration Architecture

Date: 2026-06-18

Related: [mindloom-engine-client.md](mindloom-engine-client.md) · [mindloom-engine-comparison.md](mindloom-engine-comparison.md) · [mindloom-lite-engine-runtime-audit.md](mindloom-lite-engine-runtime-audit.md)

---

## 1. Current status

| Component | State |
|---|---|
| Report V2 production | Stable. `ReportV2Dashboard` renders correctly. |
| GPT/admin generation | Works. Current production flow. |
| Engine client | Exists (`lib/mindloom-engine/client.ts`). Not connected to production. |
| Engine health check | Works without Anthropic key (`GET /api/health`). |
| Engine analyze | Requires `ANTHROPIC_API_KEY` in engine `.env`. No mock mode. |
| Dev comparison | Works without key (`/dev/engine-compare`, fixture/mock data). |
| Engine → Report V2 pipeline | Built: normalize → map-to-report-v2 → map-engine-to-v2-dashboard. Not wired to admin flow. |

Nothing in this document changes production. The integration plan below is forward-looking only.

---

## 2. What engine gives us

Engine covers the structural analysis layer — data that requires deterministic computation on the text, not LLM narrative generation.

| Block | Source field(s) | Notes |
|---|---|---|
| `hero` | `cards.cards`, `graph.nodes`, `contact_regime` node | Main pattern label + headline |
| `disclaimer` | `diff`, `meta`, `dynamics.n_snapshots` | Confidence band + session count |
| `speech_cloud` | `markers.markers`, `self_portrait.frequent_frames` | Speech markers with evidence quotes |
| `main_pattern` | `cards.cards`, `graph.ranked_hypotheses` | Contact mode text + confidence |
| `where_visible` | `graph.nodes[].evidence`, `cards.cards[].body` | Evidence quotes per node |
| `pattern_support` | `graph.edges`, `graph.nodes` | What maintains the pattern |
| `pattern_protection` | `graph.edges`, `graph.nodes[].evidence` | What the pattern protects against |
| `graph` | `graph.nodes`, `graph.edges`, `ranked_hypotheses` | Full typed graph |
| `attention_route` | `attention.path`, `attention_route.segments` | Structured attention path |
| `attention_blind` | `attention.blind`, `cards.cards` | Blind spots with confidence |
| `pattern_cycle` | `transition_map.loops`, defenses + needs | Derived description string |
| `practices` | `cards.cards`, `semantic_map.affordances` | try_this cards |
| `evidence_basis` | `graph.nodes[].evidence`, `markers.markers[].evidence` | Evidence for conclusions |

**Engine strengths:** graph (nodes/edges/hypotheses), attention route, semantic map, speech markers, pattern mechanics, evidence. These are typed structured data that GPT format approximates with free text.

---

## 3. What engine does not give us yet

### Requires additional data or sessions

| Block | Why missing | Path to resolution |
|---|---|---|
| `heatmap` | Needs `diff.indices` from a real analyze call — mock has no indices | Available in live engine output; mapping exists in `map-to-report-v2.ts` but `shown: false` until real data |
| `shift_signals` | Needs `dynamics` output — only available with ≥3 sessions | Will appear naturally after multiple sessions; no code change needed |
| `levels_visible` | `diff.border`/`diff.levels` exist but not yet mapped to a visible block | Requires mapping work, not blocked by key |

### Requires a separate GPT enrichment layer

| Block | Why | What's needed |
|---|---|---|
| `business_impact` | Engine does not produce business context analysis | GPT prompt over engine graph + intake context |
| `phrases_meaning` | `attention_route.segments` exist but the block mapping is not yet built | Additional mapping from fork data to phrase-level meaning |
| `phrase_microscope` | GPT-specific format with no structural engine equivalent | GPT-only block; may always require separate prompt |

### Narrative fields always requiring GPT

Engine produces typed structural data. The following fields in `MindloomReportV2` are always null in engine output — they require a human-facing LLM layer:

- `target` (growth_blocker, central_knot, core_pain, short_explanation)
- `desired_state` (explicit_request, hidden_request, future_state)
- `mechanism` (protective_logic, hidden_gain, perceived_threat, cost)
- `heatmap.zones` (descriptive zone labels)
- `hypothesis_table`
- `transformation_markers`

This is expected and by design. Engine is an analysis base, not a narrative generator.

---

## 4. Proposed architecture

The key principle: engine is optional and additive. Current GPT generation is not replaced — it becomes a fallback and enrichment layer.

```
intake text
    │
    ├─── [if MINDLOOM_ENGINE_ENABLED + mode != off]
    │         │
    │         ▼
    │    POST /api/analyze  (Mindloom Lite Engine)
    │         │
    │         ├── error / timeout / key missing
    │         │         │
    │         │         ▼
    │         │    log warning → skip engine → continue GPT flow
    │         │
    │         ▼
    │    MindloomEngineOutput (raw JSON)
    │         │
    │         ▼
    │    normalizeMindloomEngineOutput()
    │         │
    │         ▼
    │    mapNormalizedToReportV2()  →  ReportV2PayloadFromEngine
    │         │
    │         ▼
    │    [shadow mode] store raw + normalized output internally
    │    [primary mode] pass engine payload to GPT enrichment layer
    │
    ├─── GPT enrichment layer
    │         │
    │         ▼
    │    fills: target, mechanism, desired_state, business_impact,
    │           heatmap zones, hypothesis_table, narrative copy
    │         │
    │         ▼
    │    merge engine structural data + GPT narrative
    │
    ▼
validate / repair MindloomReportV2 JSON
    │
    ▼
save report → public ReportV2Dashboard
```

**Important:** engine output never directly replaces current GPT generation in one step. The safe path is shadow first.

---

## 5. Feature flags and env

Add to receiver `.env` (never required — all have safe defaults):

```env
# Engine connection
MINDLOOM_ENGINE_URL=http://localhost:8077
MINDLOOM_ENGINE_TIMEOUT_MS=60000

# Integration mode
MINDLOOM_ENGINE_ENABLED=false
MINDLOOM_ENGINE_MODE=off
```

### Modes

| Mode | Behavior |
|---|---|
| `off` (default) | Engine is never called. Current GPT generation runs unchanged. |
| `shadow` | Engine is called in parallel with GPT generation. Raw + normalized output is stored internally. Public report is still created by current GPT flow. No user-facing change. |
| `primary` | Engine output is used as the structural base. GPT enrichment layer fills narrative fields and missing blocks. Public report is engine-derived. |

**Recommendation:** deploy `shadow` first. Collect real engine output for multiple sessions. Evaluate quality against GPT output via `/dev/engine-compare` with real fixtures. Only switch to `primary` after validation.

`primary` mode should not be enabled without:
1. Real engine fixtures from ≥5 real sessions
2. GPT enrichment prompt written and tested
3. Comparison showing acceptable quality on all visible blocks

---

## 6. Fallback behavior

User-facing fallback is silent: report generation continues through the current GPT-only flow. The user sees no error and no degraded experience.

Internally, the engine failure must be recorded as a warning/log/metadata event for QA and debugging — so we know why the engine was skipped and can diagnose patterns (e.g., key missing, timeout spikes, schema drift).

```
Engine unavailable (connection refused / DNS):
  → internal: warn ENGINE_UNAVAILABLE
  → continue: current GPT-only flow

Engine timeout (> MINDLOOM_ENGINE_TIMEOUT_MS):
  → internal: warn TIMEOUT with elapsed_ms
  → continue: current GPT-only flow

Engine returns invalid JSON:
  → internal: warn INVALID_JSON with raw body excerpt
  → continue: current GPT-only flow

Engine returns HTTP 500 with ANTHROPIC_API_KEY error:
  → internal: warn ANTHROPIC_KEY_MISSING
  → continue: current GPT-only flow (do NOT expose error to user)

Engine returns unexpected schema (normalization fails):
  → internal: warn NORMALIZE_FAILED with error message
  → continue: current GPT-only flow
```

Fallback must be automatic — no admin action needed when engine is unavailable. The client already throws typed `MindloomEngineError` with `.code` — the caller catches it, records the failure reason, and switches to fallback without re-throwing.

In `shadow` mode, a failed engine call is a no-op: the public report is created normally. In `primary` mode, a failed engine call triggers automatic fallback to GPT-only flow, and the fallback reason is recorded in internal metadata.

---

## 7. Data contract

### Engine structural fields (pass through to report)

These come from engine and should not be re-generated by GPT:

| Field | Engine source |
|---|---|
| `graph.nodes`, `graph.edges` | `graph.nodes`, `graph.edges` |
| `attention_route.path` | `attention.path.levels` |
| `attention_route.segments` | `attention_route.segments` |
| `speech_markers` | `markers.markers` |
| `blind_spots` | `attention.blind` |
| `practices` | `cards.cards` (try_this category) |
| `evidence_quotes` | `graph.nodes[].evidence`, `markers.markers[].evidence` |
| `pattern_cycle` | derived from `transition_map.loops` + `graph` |
| `semantic_map` | `semantic_map.concepts`, `links`, `affordances` |
| `transition_map` | `transition_map.nodes`, `transitions`, `loops` |
| `field` | `field.allowed`, `costly`, `blocked`, `openness` |

### GPT enrichment fields (always GPT-generated, never replaced by engine)

| Field | Notes |
|---|---|
| `target` | growth_blocker, central_knot, core_pain, short_explanation |
| `mechanism` | protective_logic, hidden_gain, perceived_threat, cost |
| `desired_state` | explicit_request, hidden_request, future_state |
| `business_impact` | requires separate prompt over engine graph + intake |
| `heatmap.zones` | zone labels and descriptions (diff.indices gives raw scores) |
| `hypothesis_table` | interpretive hypotheses, not engine-computed |
| `transformation_markers` | session-level shift markers |
| `phrase_microscope` | GPT-specific block format |

In `primary` mode, the GPT enrichment prompt would receive: engine `ReportV2PayloadFromEngine` JSON + original intake text + relationship context. It fills only the fields listed above, not the structural ones.

---

## 8. Admin flow (future)

When engine integration is enabled:

```
POST /api/generate-report (admin action)

1. Save intake to DB (no change from current)
2. If MINDLOOM_ENGINE_ENABLED && mode != off:
   a. Call engine: analyzeWithMindloomEngine(input)
   b. On error: log + set engine_result = null
   c. On success: store raw engine output as engine_raw (internal, not public)
   d. Normalize: normalizeMindloomEngineOutput(raw)
   e. Map: mapNormalizedToReportV2(normalized) → enginePayload
   f. Store normalized payload as engine_normalized (internal)
3. If mode == shadow:
   - Generate report via current GPT flow (unchanged)
   - Public report = GPT output
   - engine_raw + engine_normalized stored for QA
4. If mode == primary && engine_result != null:
   - Run GPT enrichment prompt with enginePayload + intake text
   - Merge: engine structural + GPT narrative = MindloomReportV2
   - Validate/repair merged report
   - Public report = merged output
5. If mode == primary && engine_result == null (fallback):
   - Generate report via current GPT flow
   - Log: ENGINE_PRIMARY_FALLBACK
6. Save public report (no change)
```

**Notes:**
- `engine_raw` and `engine_normalized` are internal fields — never exposed in public `/r/[publicToken]` response.
- `debug_summary` block (dev_only in registry) can show engine meta in admin preview.
- Raw engine output contains `meta.cost_usd`, `meta.analysis_id` — useful for internal cost tracking.

---

## 9. What to do when Anthropic key appears

Sequential steps — do not skip ahead to primary mode.

**Step 1 — validate engine works:**
```bash
# In engine project
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
.venv/Scripts/uvicorn serve:app --port 8077
node scripts/check-mindloom-engine-client.mjs
# Should show: has_api_key: true
```

**Step 2 — run real analyze on 2–3 test inputs:**
```bash
node scripts/check-mindloom-engine-client.mjs --analyze
```

Check: `meta.cost_usd`, node count, segment count, `attention_route.segments` quality.

**Step 3 — save real engine fixtures:**

Save raw response to `lib/mindloom-engine/real-engine-output-sample.json`.

**Step 4 — run comparison with real fixture:**

Update `app/dev/engine-compare/page.tsx` to load `real-engine-output-sample.json`. Open `/dev/engine-compare`. Check which blocks are now present (especially `heatmap`).

**Step 5 — evaluate:**
- Are `attention_route` segments richer than mock?
- Is `heatmap` now populated?
- How does graph quality compare to GPT?

**Step 6 — decide shadow vs primary:**

If quality is acceptable on ≥12 of 14 visible blocks → enable `shadow` mode. Run for several real sessions. Compare stored engine output vs GPT output. Only then consider `primary`.

---

## 10. Next implementation patches

| Patch | Scope | Prerequisite |
|---|---|---|
| **3F** — real engine fixture | Save real `/api/analyze` response; update `/dev/engine-compare` to use it | `ANTHROPIC_API_KEY` in engine env |
| **3G** — shadow mode call | Add optional engine call in admin generation (behind `MINDLOOM_ENGINE_MODE=shadow`); store raw output | 3F done; real fixture confirms schema |
| **3H** — store engine output | DB columns for `engine_raw`, `engine_normalized`; admin preview shows engine meta | 3G done |
| **3I** — GPT enrichment prompt | Write enrichment prompt that fills narrative fields over engine base; test on real fixtures | 3F done; alignment on which fields to enrich |
| **3J** — primary mode experiment | Enable `primary` for a test session; compare public report quality vs GPT-only | 3G + 3H done; enrichment prompt validated |

Patches are independent enough to do in order. Do not attempt 3G before 3F: without a real fixture, shadow mode code has no validated schema to write against.

---

## Out of scope (this document)

- No changes to `ReportV2Dashboard`
- No changes to `/r/[publicToken]`
- No changes to current admin generation
- No Telegram/Postgres changes
- No deploy, no push

Engine integration in production (3G+) requires explicit instruction and verification of each patch on localhost before commit.
