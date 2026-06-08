import { NextRequest, NextResponse } from 'next/server';
import { archiveReport } from '@/lib/reports-repository';

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

  const report = archiveReport(id, reason);
  if (!report) {
    return NextResponse.json({ ok: false, error: 'Report not found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    report_id: report.id,
    archived_at: report.archived_at,
  });
}
