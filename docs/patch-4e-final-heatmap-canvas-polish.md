# Patch 4E Final - Heatmap Canvas Only

Scope:
- Only the visual heatmap canvas inside `app/r/[publicToken]/ReportV2Dashboard.tsx`.

Changed:
- Strengthened canvas-only dedupe with semantic display groups such as `control`, `body`, `guilt_rest`, `value`, `pattern`, and `resource`.
- Reduced visible canvas nodes to a less crowded semantic set.
- Replaced clustered placement with wider slot layouts for 5, 6, and 7 displayed nodes.
- Reduced node sizes and kept percent inside / label below.
- Added per-node thermal field blobs behind rendered nodes.
- Increased canvas height and strengthened the panoramic heat-field feel.
- Increased hex texture visibility and reinforced neural connection lines/dots.

Not changed:
- Lower activity scale strip.
- Insight rows.
- Focus bar.
- Other report sections.
- Causal graph.
- Schema, prompt, repair prompt, normalizer, API, DB, admin, auth, deploy flow, legacy renderer.

Validation:
- `npm run typecheck`
- `npm run build` outside sandbox when Next.js worker spawning hits `spawn EPERM`

Manual QA:
- Compare only the map canvas against the reference.
- Check `390px` width for spacing, label readability, no duplicate semantic nodes, visible hex grid, visible heat fields, and no overflow.
