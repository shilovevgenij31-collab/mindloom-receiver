import { NextRequest, NextResponse } from 'next/server';
import { archiveIntake } from '@/lib/intake-repository';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let reason: string | undefined;
  try {
    const body = await req.json();
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      const rawReason = (body as Record<string, unknown>).reason;
      reason = typeof rawReason === 'string' ? rawReason : undefined;
    }
  } catch {
    // Body is optional for archive actions.
  }

  const intake = archiveIntake(id, reason);
  if (!intake) {
    return NextResponse.json({ ok: false, error: 'Intake not found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    intake_id: intake.id,
    archived_at: intake.archived_at,
  });
}
