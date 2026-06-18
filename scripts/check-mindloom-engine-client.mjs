/**
 * Dev script — checks Mindloom Lite Engine connectivity.
 *
 * Usage:
 *   node scripts/check-mindloom-engine-client.mjs            # health check only
 *   node scripts/check-mindloom-engine-client.mjs --analyze  # health + analyze
 *
 * Env:
 *   MINDLOOM_ENGINE_URL       default: http://localhost:8077
 *   MINDLOOM_ENGINE_TIMEOUT_MS default: 60000
 */

const BASE_URL = (process.env.MINDLOOM_ENGINE_URL ?? 'http://localhost:8077').replace(/\/$/, '');
const TIMEOUT_MS = Number(process.env.MINDLOOM_ENGINE_TIMEOUT_MS ?? 60_000);
const RUN_ANALYZE = process.argv.includes('--analyze');

const TEST_TEXT =
  'Я стараюсь контролировать всё вокруг, иначе мне кажется, что всё развалится. ' +
  'Мне сложно просить о помощи — это ощущается как слабость. ' +
  'Если я остановлюсь, то потеряю что-то важное.';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

function ok(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`);
}

function fail(msg) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`);
}

function info(msg) {
  console.log(`\x1b[90m  ${msg}\x1b[0m`);
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

// ── Health check ──────────────────────────────────────────────────────────────

async function checkHealth() {
  section('Health check');
  info(`GET ${BASE_URL}/api/health`);

  let res;
  try {
    res = await fetchWithTimeout(`${BASE_URL}/api/health`, {}, Math.min(TIMEOUT_MS, 10_000));
  } catch (err) {
    if (err.name === 'AbortError') {
      fail(`Health check timed out after 10s`);
      fail(`Engine is not responding at ${BASE_URL}`);
      return false;
    }
    fail(`Engine unavailable: ${err.message}`);
    info(`Start engine: cd "C:\\Users\\andre\\Desktop\\new loomm\\repo\\Mindloom_edagency-main"`);
    info(`             .venv/Scripts/uvicorn serve:app --port 8077`);
    return false;
  }

  if (!res.ok) {
    fail(`HTTP ${res.status}`);
    return false;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    fail('Invalid JSON response');
    return false;
  }

  ok(`status: ${data.status}`);
  info(`version: ${data.version}`);
  info(`has_api_key: ${data.has_api_key}`);

  if (!data.has_api_key) {
    info(`No ANTHROPIC_API_KEY in engine — /api/analyze will fail`);
    info(`Add key to: C:\\Users\\andre\\Desktop\\new loomm\\repo\\Mindloom_edagency-main\\.env`);
  }

  return true;
}

// ── Analyze ───────────────────────────────────────────────────────────────────

async function checkAnalyze() {
  section('Analyze check');
  info(`POST ${BASE_URL}/api/analyze`);
  info(`text: "${TEST_TEXT.slice(0, 80)}..."`);
  info(`(this may take 30–60s — two LLM calls)`);

  let res;
  try {
    res = await fetchWithTimeout(
      `${BASE_URL}/api/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: TEST_TEXT, user_id: 'dev-check' }),
      },
      TIMEOUT_MS
    );
  } catch (err) {
    if (err.name === 'AbortError') {
      fail(`Analyze timed out after ${TIMEOUT_MS}ms`);
      return false;
    }
    fail(`Engine unavailable: ${err.message}`);
    return false;
  }

  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch {}

    if (res.status === 500 && (body.includes('ANTHROPIC_API_KEY') || body.includes('не задан'))) {
      fail(`HTTP 500 — ANTHROPIC_API_KEY missing in engine`);
      info(`Add ANTHROPIC_API_KEY=sk-ant-... to:`);
      info(`  C:\\Users\\andre\\Desktop\\new loomm\\repo\\Mindloom_edagency-main\\.env`);
      info(`Then restart engine: .venv/Scripts/uvicorn serve:app --port 8077`);
      return false;
    }

    fail(`HTTP ${res.status}: ${body.slice(0, 300)}`);
    return false;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    fail('Invalid JSON response from analyze');
    return false;
  }

  ok(`Analyze succeeded`);
  info(`input_id: ${data.input_id}`);
  info(`meta.cost_usd: ${data.meta?.cost_usd ?? 'n/a'}`);
  info(`meta.llm_calls: ${data.meta?.llm_calls ?? 'n/a'}`);
  info(`meta.report_model: ${data.meta?.report_model ?? 'n/a'}`);
  info(`graph.nodes: ${data.graph?.nodes?.length ?? 0}`);
  info(`graph.edges: ${data.graph?.edges?.length ?? 0}`);
  info(`markers: ${data.markers?.markers?.length ?? 0}`);
  info(`attention_route.segments: ${data.attention_route?.segments?.length ?? 0}`);
  info(`attention_route.version: ${data.attention_route?.version ?? 'n/a'}`);
  info(`cards.cards: ${data.cards?.cards?.length ?? 0}`);

  return true;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\x1b[1mMindloom Engine client check\x1b[0m`);
  info(`base url: ${BASE_URL}`);
  info(`timeout: ${TIMEOUT_MS}ms`);

  const healthOk = await checkHealth();

  if (!healthOk) {
    console.log(`\n\x1b[33mEngine not available — skipping remaining checks\x1b[0m`);
    process.exit(1);
  }

  if (RUN_ANALYZE) {
    const analyzeOk = await checkAnalyze();
    if (!analyzeOk) {
      console.log(`\n\x1b[33mAnalyze check failed (see above)\x1b[0m`);
      process.exit(1);
    }
  } else {
    info(`\nSkipping analyze (pass --analyze to run)`);
  }

  console.log(`\n\x1b[32mDone\x1b[0m`);
}

main().catch((err) => {
  console.error(`\nUnexpected error: ${err.message}`);
  process.exit(1);
});
