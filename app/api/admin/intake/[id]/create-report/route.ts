import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { generatePublicToken } from '@/lib/auth';
import { getIntakeById, completeIntakeWithReport } from '@/lib/intake-repository';
import { createReport } from '@/lib/reports-repository';
import { cleanMindloomJsonInput } from '@/lib/clean-json-input';
import {
  FIXED_BLOCKS_REPAIR_PROMPT,
  validateMindloomReportQuality,
} from '@/lib/validate-report';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const intake = getIntakeById(id);
  if (!intake) {
    return NextResponse.json({ ok: false, error: 'Intake not found' }, { status: 404 });
  }

  if (intake.archived_at) {
    return NextResponse.json(
      { ok: false, error: 'Cannot create report from archived intake.' },
      { status: 409 }
    );
  }

  if (intake.status === 'completed' && intake.report_public_token) {
    const base = process.env.BASE_URL ?? 'http://localhost:3000';
    return NextResponse.json(
      {
        ok: false,
        error: 'Report already exists for this intake',
        report_url: `${base}/r/${intake.report_public_token}`,
      },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  const bodyObj =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const jsonText = bodyObj.mindloom_json_text;
  if (typeof jsonText !== 'string' || !jsonText.trim()) {
    return NextResponse.json({ ok: false, error: 'mindloom_json_text is required' }, { status: 400 });
  }

  const forceCreate = bodyObj.force_create === true;
  const cleaned = cleanMindloomJsonInput(jsonText);

  let mindloomPayload: unknown;
  try {
    mindloomPayload = JSON.parse(cleaned.cleaned);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'mindloom_json_text is not valid JSON — check for missing brackets or quotes',
        repair_prompt: FIXED_BLOCKS_REPAIR_PROMPT,
        cleaning_notes: cleaned.notes,
      },
      { status: 400 }
    );
  }

  if (!mindloomPayload || typeof mindloomPayload !== 'object' || Array.isArray(mindloomPayload)) {
    return NextResponse.json({ ok: false, error: 'mindloom_json_text must be a JSON object' }, { status: 400 });
  }

  // Quality validation is blocking on first submit; operator can explicitly force-create.
  const quality = validateMindloomReportQuality(mindloomPayload);

  if (!quality.ok && !forceCreate) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Report quality warnings',
        warnings: quality.warnings,
        repair_prompt: quality.repairPrompt,
        allow_force_create: true,
        cleaning_notes: cleaned.notes,
      },
      { status: 422 }
    );
  }

  try {
    const reportId = nanoid(21);
    const publicToken = generatePublicToken();

    const p = mindloomPayload as Record<string, unknown>;
    const session = p.session as Record<string, unknown> | undefined;
    const source = typeof session?.source === 'string' ? session.source : undefined;

    createReport({
      id: reportId,
      public_token: publicToken,
      raw_payload_json: JSON.stringify(mindloomPayload),
      source,
    });

    completeIntakeWithReport(id, reportId, publicToken);

    const base = process.env.BASE_URL ?? 'http://localhost:3000';
    const report_url = `${base}/r/${publicToken}`;

    return NextResponse.json(
      {
        ok: true,
        report_id: reportId,
        report_url,
        cleaning_notes: cleaned.notes,
        ...(quality.warnings.length > 0 && {
          warnings: quality.warnings,
          repair_prompt: quality.repairPrompt,
        }),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/admin/intake/[id]/create-report]', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
