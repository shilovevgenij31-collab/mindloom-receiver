# Patch 4Q-fix-5 — Heatmap Neural Surface Texture

## Why Honeycomb Was Replaced

The hexagonal pattern used in 4Q-fix-2 through 4Q-fix-4 created a "beehive" visual reading:
- Regular hex cells at ~16 SVG units (≈112px on desktop) are too large — individual cells are clearly visible
- Hexagons are strongly associated with honeycombs — an undesired metaphor for a therapeutic visualization
- `soft-light` blend mode at opacity 0.60 made the pattern a dominant mid-layer element
- Result: background looked like a "decorative SVG pattern card", not a premium neural map

The connection network (lines + junction dots) already carries the "system/network" feeling. The background texture only needs to provide **surface depth** — not geometric structure.

---

## New Texture: Micro-Grain + Organic Mesh

Single SVG at `zIndex: 3`, `mixBlendMode: 'soft-light'`, full canvas coverage:

### Element 1: Micro-dot grain

```
pattern id: ml-grain-fx5
spacing: 3.5 × 3.5 SVG units
dot radius: 0.40 SVG units
dot color: rgba(172,140,105,0.26) — warm brown, low alpha
radial fade mask: 0% 0.88 → 40% 0.68 → 68% 0.22 → 86% 0.04 → 100% 0
rect opacity: 0.55
```

**On desktop (700px wide canvas):**
- 1 SVG unit ≈ 7px → dots every ~24px, radius ≈ 2.8px
- Reads as fine warm grain, NOT as a grid or beehive

**On mobile (390px wide):**
- 1 SVG unit ≈ 3.9px → dots every ~14px, radius ≈ 1.6px
- Even finer grain — excellent on small screens

The radial fade mask creates density variation: strong center, dissolves at edges. This follows the thermal field density naturally.

### Element 2: Faint organic mesh lines

6 very low-opacity SVG curves (opacity 0.046–0.058 each):

```
Horizontal sweeps: 4 lines at y≈21, 40, 58, 76
Vertical sweeps:   2 lines at x≈24, 72
```

Each uses cubic bezier with gentle S-curves and alternating direction. These look like:
- Scan lines from a medical/MRI image
- Neural tissue fibers under microscope
- Not grid, not honeycomb, not graph edges

At 5% opacity per line, they are barely perceptible individually but collectively add "scan depth" to the surface.

---

## What Changed vs 4Q-fix-4

| Element | Before (fix-4) | After (fix-5) |
|---|---|---|
| Texture type | Hex SVG pattern, 16×13.86 cells | Micro-dot grid, 3.5×3.5 spacing |
| Texture "reads as" | Honeycombs / soты | Warm grain / neural surface |
| SVG opacity | 0.60 | per-element (0.55 on dots) |
| Hex stroke | rgba(255,242,225,0.52) | Removed |
| Organic lines | None | 6 faint bezier curves at 4.6–5.8% opacity |
| SVG inset | 6px (partial coverage) | 0px (full canvas) |
| Blend mode | soft-light | soft-light (unchanged) |

---

## Connection Network Status

**Unchanged from 4Q-fix-4.** All elements retained:
- Hub-and-spoke topology (semantic-first: guilt↔body, pattern↔resource)
- Two-pass rendering: glow (rgba 0.22, width 2.8) + crisp wire (rgba 0.52, width 0.78)
- Junction dots at t=0.42 on bezier curves: glow (r=2.2) + core (r=1.2)
- Max 5 dots on hub spokes, max 7 total connections

---

## Thermal Field Status

**Unchanged from 4Q-fix-4.** 3-layer per node:
- Outer ambient: mul 5.8/4.6, blur 44px, alpha max 0.13
- Middle field: mul 3.3/2.8, blur 18px, alpha max 0.38
- Inner hot core: mul 1.9, blur 8px, alpha max 0.62

---

## Graph Audit

No changes. All edge types (`hard`, `normal`, `soft`, `choice_available`, `choice_blocked`) stable. No regression.

---

## Preserved

- All heatmap zone click → DetailSheet handlers
- Graph node click, graph edge click
- HeatmapInfoSheet, ReportDetailSheet, HowToReadSheet portals
- Speech Cloud — untouched
- All other sections — untouched
- No new dependencies

---

## Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  35.5 kB (First Load 123 kB)
```

---

## Manual Verification Checklist

- [ ] No honeycomb / beehive pattern visible in heatmap background
- [ ] Background feels like warm neural surface / fine grain
- [ ] Faint organic scan lines barely visible — add depth without structure
- [ ] Grain stronger in center, fades to edges
- [ ] Thermal zones local and distinct (no full red wash)
- [ ] Connection lines + junction dots visible and "neural"
- [ ] Blue/purple zones readable alongside red/orange
- [ ] Node labels crisp over the surface
- [ ] Heatmap zone click opens sheet ✓
- [ ] Graph unchanged ✓
- [ ] Speech cloud unchanged ✓
- [ ] Mobile 390px: no overflow, fine grain visible
- [ ] No red runtime error toast
