# Mindloom Engine Client

Server-side HTTP client for the Mindloom Lite Engine (Python/FastAPI).

See also: [mindloom-lite-engine-runtime-audit.md](mindloom-lite-engine-runtime-audit.md) · [mindloom-engine-integration-architecture.md](mindloom-engine-integration-architecture.md)

---

## Location

```
lib/mindloom-engine/client.ts
```

Server-side only. Do not import from client components or client bundles.

---

## Environment variables

| Variable | Default | Notes |
|---|---|---|
| `MINDLOOM_ENGINE_URL` | `http://localhost:8077` | Base URL of running engine |
| `MINDLOOM_ENGINE_TIMEOUT_MS` | `60000` | Timeout in ms — LLM calls take 30–60s |

Both are optional. Build and typecheck work without them.

---

## How to start the engine

```bash
cd "C:\Users\andre\Desktop\new loomm\repo\Mindloom_edagency-main"
.venv/Scripts/uvicorn serve:app --port 8077
```

One-time setup if `.venv` is missing:

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
```

---

## Check health

```bash
node scripts/check-mindloom-engine-client.mjs
```

Output when engine is running:

```
✓ status: ok
  version: 0.1.0
  has_api_key: false
```

Output when engine is not running:

```
✗ Engine unavailable: fetch failed
  Start engine: ...
```

---

## Check analyze

```bash
node scripts/check-mindloom-engine-client.mjs --analyze
```

Sends a short test text to `/api/analyze`. Requires `ANTHROPIC_API_KEY` in the engine `.env`.

If key is missing:

```
✗ HTTP 500 — ANTHROPIC_API_KEY missing in engine
  Add ANTHROPIC_API_KEY=sk-ant-... to:
    C:\Users\andre\Desktop\new loomm\repo\Mindloom_edagency-main\.env
  Then restart engine
```

If successful, prints `meta.cost_usd`, node/edge counts, etc.

---

## ANTHROPIC_API_KEY

`/api/analyze` always requires a key. There is no mock mode.

Cost per analyze call: ~$0.13–0.15 (Haiku analyze + Haiku/Sonnet report).

The key lives in the **engine** project, not in this receiver. The receiver never reads `ANTHROPIC_API_KEY`.

---

## 3C scope

3C adds the client and dev script only. The engine is **not** wired into the production admin flow.

Production report generation still uses GPT + the existing prompt chain. The engine client is available for future integration (3D+).

Not changed in 3C:
- `ReportV2Dashboard`
- `/r/[publicToken]` route
- Admin intake generation
- Telegram / Postgres
