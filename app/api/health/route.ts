import { NextResponse } from 'next/server';
import { checkDbHealth } from '@/lib/reports-repository';

export async function GET() {
  const dbOk = checkDbHealth();
  return NextResponse.json(
    {
      ok: dbOk,
      db: dbOk ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      ...(dbOk ? {} : { error: 'Database unavailable' }),
    },
    { status: dbOk ? 200 : 503 }
  );
}
