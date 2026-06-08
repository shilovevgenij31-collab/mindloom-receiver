import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/lib/auth';
import { createIntake } from '@/lib/intake-repository';

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
    const intake = createIntake(payload);
    const base = process.env.BASE_URL ?? 'http://localhost:3000';
    const admin_url = `${base}/admin/intake/${intake.id}`;
    return NextResponse.json({ ok: true, intake_id: intake.id, admin_url }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/mindloom/intake]', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
