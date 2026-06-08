import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { verifyBearerToken, generatePublicToken } from '@/lib/auth';
import { createReport } from '@/lib/reports-repository';

export async function POST(req: NextRequest) {
  if (!verifyBearerToken(req.headers.get('authorization'))) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ ok: false, error: 'Body must be a JSON object' }, { status: 400 });
  }

  try {
    const id = nanoid(21);
    const public_token = generatePublicToken();
    const p = payload as Record<string, unknown>;
    const session = p.session as Record<string, unknown> | undefined;
    const source = typeof session?.source === 'string' ? session.source : undefined;

    createReport({
      id,
      public_token,
      raw_payload_json: JSON.stringify(payload),
      source,
    });

    const base = process.env.BASE_URL ?? 'http://localhost:3000';
    const report_url = `${base}/r/${public_token}`;

    return NextResponse.json({ ok: true, report_id: id, report_url }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/mindloom/reports]', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
