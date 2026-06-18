import type { MindloomEngineOutput } from './types';

// ── Config ────────────────────────────────────────────────────────────────────

export type MindloomEngineClientConfig = {
  baseUrl?: string;
  timeoutMs?: number;
};

export type MindloomEngineAnalyzeInput = {
  text: string;
  situation_summary?: string;
  relationship_type?: string;
  user_id?: string;
};

export type MindloomEngineHealthResponse = {
  status: string;
  version: string;
  has_api_key: boolean;
};

const DEFAULT_BASE_URL = 'http://localhost:8077';
const DEFAULT_TIMEOUT_MS = 60_000;

function resolveConfig(config?: MindloomEngineClientConfig) {
  return {
    baseUrl: (config?.baseUrl ?? process.env.MINDLOOM_ENGINE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, ''),
    timeoutMs: config?.timeoutMs ?? Number(process.env.MINDLOOM_ENGINE_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS),
  };
}

// ── Error type ────────────────────────────────────────────────────────────────

export type MindloomEngineErrorCode =
  | 'ENGINE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'INVALID_JSON'
  | 'ANALYZE_FAILED'
  | 'ANTHROPIC_KEY_MISSING';

export class MindloomEngineError extends Error {
  readonly code: MindloomEngineErrorCode;
  readonly status?: number;

  constructor(message: string, code: MindloomEngineErrorCode, status?: number) {
    super(message);
    this.name = 'MindloomEngineError';
    this.code = code;
    this.status = status;
  }
}

// ── Internal fetch with timeout ───────────────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── Health check ──────────────────────────────────────────────────────────────

export async function getMindloomEngineHealth(
  config?: MindloomEngineClientConfig
): Promise<MindloomEngineHealthResponse> {
  const { baseUrl, timeoutMs } = resolveConfig(config);
  const url = `${baseUrl}/api/health`;

  let res: Response;
  try {
    res = await fetchWithTimeout(url, {}, timeoutMs);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new MindloomEngineError(
        `Engine health check timed out after ${timeoutMs}ms (${baseUrl})`,
        'TIMEOUT'
      );
    }
    throw new MindloomEngineError(
      `Engine unavailable at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}`,
      'ENGINE_UNAVAILABLE'
    );
  }

  if (!res.ok) {
    throw new MindloomEngineError(
      `Engine health check returned HTTP ${res.status}`,
      'ANALYZE_FAILED',
      res.status
    );
  }

  try {
    return (await res.json()) as MindloomEngineHealthResponse;
  } catch {
    throw new MindloomEngineError('Engine returned invalid JSON for /api/health', 'INVALID_JSON');
  }
}

// ── Analyze ───────────────────────────────────────────────────────────────────

export async function analyzeWithMindloomEngine(
  input: MindloomEngineAnalyzeInput,
  config?: MindloomEngineClientConfig
): Promise<MindloomEngineOutput> {
  const { baseUrl, timeoutMs } = resolveConfig(config);
  const url = `${baseUrl}/api/analyze`;

  let res: Response;
  try {
    res = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      timeoutMs
    );
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new MindloomEngineError(
        `Engine analyze timed out after ${timeoutMs}ms — LLM call may take 30–60s (${baseUrl})`,
        'TIMEOUT'
      );
    }
    throw new MindloomEngineError(
      `Engine unavailable at ${baseUrl}: ${err instanceof Error ? err.message : String(err)}`,
      'ENGINE_UNAVAILABLE'
    );
  }

  if (!res.ok) {
    let body = '';
    try {
      body = await res.text();
    } catch {
      // ignore read error
    }

    if (
      res.status === 500 &&
      (body.includes('ANTHROPIC_API_KEY') || body.toLowerCase().includes('не задан'))
    ) {
      throw new MindloomEngineError(
        'Engine requires ANTHROPIC_API_KEY — add it to the engine .env file and restart',
        'ANTHROPIC_KEY_MISSING',
        500
      );
    }

    throw new MindloomEngineError(
      `Engine analyze failed with HTTP ${res.status}${body ? `: ${body.slice(0, 300)}` : ''}`,
      'ANALYZE_FAILED',
      res.status
    );
  }

  try {
    return (await res.json()) as MindloomEngineOutput;
  } catch {
    throw new MindloomEngineError('Engine returned invalid JSON for /api/analyze', 'INVALID_JSON');
  }
}
