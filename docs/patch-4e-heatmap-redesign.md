# Patch 4E - Heatmap Activity Map Redesign

Scope: public v2 dashboard heatmap section only.

Changed:
- Replaced the rendered heatmap card stack with a single premium infographic module inside `ReportV2Dashboard.tsx`.
- Added a light warm canvas with layered thermal fields, inline SVG hex texture, and subtle neural connection lines/dots.
- Added deterministic semantic node placement for control, value, body, pattern, resource, guilt, and fallback zones.
- Added soft heat-orb node styling with percent labels, ivory rings, glow, and normalized semantic palettes.
- Added compact activity scale, three explanation tiles, compact remaining-zone chips, and a bottom focus bar.
- Added mobile CSS for 390px/420px shells and reduced-motion handling for node pulse animation.

Data behavior:
- Uses normalized `heatmap.zones`, `heatmap.scale`, `heatmap.callouts`, and `active_nodes`.
- Sorts zones by intensity and renders top zones on the canvas.
- Falls back to default scale/callouts when extended heatmap fields are absent.
- Renders a safe empty state when no zones/nodes are available.

Not changed:
- Schema, prompt, repair prompt, normalizer, API, DB, admin, auth, deploy flow.
- Legacy renderers.
- Causal graph and evidence sections.
- Public route branching.

Validation:
- `npm run typecheck` passed.
- `npm run build` passed when run outside the sandbox because Next.js worker spawning hits sandbox `spawn EPERM`.
- Local public route check returned HTTP 200.

Visual QA note:
- In-app Browser backend `iab` was unavailable in this session, so screenshot comparison against the reference still needs manual/browser verification.
