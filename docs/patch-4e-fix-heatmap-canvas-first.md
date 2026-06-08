# Patch 4E-fix - Heatmap Canvas-First Reference Match

Scope:
- Only the v2 public heatmap section in `app/r/[publicToken]/ReportV2Dashboard.tsx`.

What changed:
- Added a new canvas-first heatmap render path that prioritizes a large spacious map instead of dashboard-like lower cards.
- Added unique-zone deduplication by normalized label before rendering.
- Moved node labels below the circles and kept percentages inside the circles only.
- Increased canvas height and spread nodes across fixed semantic slots.
- Strengthened the hex texture and thermal background fields across the full canvas.
- Kept the lower area compact: one scale strip, three compact insight rows, one compact focus bar.

What remained untouched:
- Schema, prompt, repair prompt, normalizer, API, DB, admin, auth, deploy flow.
- Legacy renderers.
- Causal graph and the rest of the report.

Validation:
- Run `npm run typecheck`.
- Run `npm run build` outside sandbox if Next.js worker spawning hits `spawn EPERM`.

Manual QA:
- Compare against the reference for spacing, deduplication, compact lower area, and no overflow at 390px width.
