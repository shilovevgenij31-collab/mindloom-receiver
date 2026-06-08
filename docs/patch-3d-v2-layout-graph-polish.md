# Patch 3d — Mindloom Report v2 Layout & Graph Polish

## Files changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — targeted visual improvements

---

## Problems fixed

### 1. Giant blank spaces in 2-column layouts

**Before:** Evidence (Active Nodes | Speech), Processing | Layers, Markers | Practices all used `ml-grid-2`. When one side was much taller, the shorter side left a huge empty column.

**Fix — all heavy sections are now full-width:**
- Active Nodes → full-width with auto-fill 3-col node grid (`minmax(230px, 1fr)`)
- Speech Evidence → full-width below active nodes (hidden if empty)
- Processing Dashboard → full-width with 2-col inner detail (`ml-proc-detail`)
- Layers → full-width section below processing
- Markers → full-width compact auto-fit grid
- Practices → full-width section below markers

Only the trajectory blocking/exit pair and overview remain 2-col, since both sides are short and balanced.

### 2. Dark alien heatmap panel

**Before:** `linear-gradient(145deg, #1e1c1a 0%, #2e2a26 50%, ...)` — dark cyber panel.

**Fix:** Light neural map background:
```
linear-gradient(150deg, #fdfbf8 0%, #f6f0e8 60%, #f2ebe0 100%)
```
with soft colored radial blobs at 10–13% opacity instead of 22–30%. Grid overlay now uses `rgba(60,44,28,0.04)` (warm dark) instead of white. Border added: `1px solid #e4d8cc`. Result: warm ivory panel that feels like the rest of the report.

The node circles retain their colored fills (red/purple/green gradient), so they remain clearly visible and "glowing" against the light background. White text inside nodes is preserved with a subtle drop-shadow.

### 3. Node graph — straight harsh lines → smooth curves

**Before:** `<line x1 y1 x2 y2>` — straight lines crossing each other looking chaotic.

**Fix:** `<path d="M x1 y1 Q mx my x2 y2">` — quadratic Bézier curves. Control point pulled 8 units above the midpoint. Result: gentle arcs that separate visually even when crossing.

### 4. Practices target_node resolved to human label

**Before:** practices chips showed raw `target_node` id (e.g. `defense_hypercontrol`).

**Fix:** looks up `activeNodes.find(n => n.id === item.target_node)?.label` — shows human-readable label if available, falls back to id only if not found.

### 5. Active node grid density

**Before:** fixed 2-column, creating pairs of cards.

**Fix:** `auto-fill minmax(230px, 1fr)` — fills row naturally based on viewport. At 1200px typically 3 cards/row, at 700px 2, at mobile 1.

---

## Layout structure (final)

1. Hero — full-width 2-col (content + meta card)
2. Overview — 3-col (Target / Desired State / Mechanism)
3. Heatmap — full-width, map + side legend
4. Node Graph — full-width, circular nodes + SVG curves + edge grid
5. Active Nodes — full-width auto-fill grid
6. Speech Evidence — full-width (conditional, hidden if empty)
7. Hypotheses — full-width auto-fit (conditional)
8. Trajectory — full-width chain
9. Processing Dashboard — full-width with 2-col inner (labels | bars)
10. Layers — full-width stack (conditional)
11. Markers — full-width auto-fit (conditional)
12. Practices — full-width auto-fit (conditional)
13. Disclaimer

---

## Mobile layout

- Single column everywhere
- `ml-proc-detail` collapses to single column at ≤700px
- Node grid: `minmax(200px, 1fr)` at ≤1040px
- Heatmap map: `min-height: 350px`, nodes clamped at 56×56px
- Graph: SVG+columns hidden, nodes become pill cards

---

## What was NOT changed

- Schema v2 structure
- Prompt for Mindloom / repair prompt
- Create-report route
- API / OpenAPI / DB schema
- Admin UI
- Auth / env / secrets
- Docker / Traefik
- Legacy v1 / rich / fixed_blocks renderer
- Raw JSON never exposed publicly
- No diary / session history / dynamics

---

## Typecheck / Build

Both `npm run typecheck` and `npm run build` pass with no errors.
