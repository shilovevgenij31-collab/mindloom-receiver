# Patch 4Q-fix-1 — Map Visual Polish

## Goal

Make Heatmap and Graph look like system/data maps, not decorative widgets.
Not touched: Speech Cloud, all other sections, backend, API, schema, DB, auth, deploy.

---

## Graph fixes

### 1. Edge style — thinner, more data-like

`graphEdgeStyle()` values reduced ~25%:

| Type | Before sw / opacity | After sw / opacity |
|---|---|---|
| hard | 0.82 / 0.80 | 0.62 / 0.72 |
| normal | 0.62 / 0.64 | 0.46 / 0.54 |
| choice_blocked | 0.68 / 0.74 | 0.50 / 0.62 |
| soft | 0.40 / 0.46 | 0.30 / 0.38 |
| choice_available | 0.46 / 0.56 | 0.34 / 0.44 |

Colors slightly more muted: hard `#d4534a → #b84840`, normal `#8466cc → #6656a8`, etc.

### 2. Arrowheads — sharper and smaller

`markerWidth/Height: 4×4 → 3.5×2.8`; narrower path `M0.4,0.2 L3.2,1.4 L0.4,2.6 Z` — clean triangle, not chunky blob.

### 3. Edge routing — proportional curvature, capped

**Before:** fixed `baseCurve = 8` → large U-shaped arcs on long edges.

**After:** `baseCurve = min(len × fraction, 4.5)` — short edges are nearly straight, long edges stay within 4.5 SVG units of perpendicular offset. No more worm/U-arc.

### 4. Edge glow — removed

`useGlow = false` for all edge types. Edges no longer have a blur halo.

### 5. Layout — causal flow (left → center → right)

Central node moved to y=50 (exact center).

Semantic positions tightened for cleaner columns:
- `belief` — left (x≈16–20): root beliefs
- `trigger` — left-bottom (x≈14–20): triggers
- `support` — top-right (x≈65–78): secondary gain
- `pattern` — right (x≈76–84): behavioral outputs
- `body` — right-bottom (x≈64–80): somatic

### 6. Background — quieter dot grid

Opacity: `0.60 → 0.36`, dot radius: `0.65 → 0.48`, fill alpha: `0.40 → 0.28`.
Grid is now a barely-visible structural hint, not a visual event.

### 7. Node visual — less glossy

Border thinner (`2px → 1.5px central`, `1.5px → 1px satellite`).
Box-shadow rings reduced in opacity/spread.

---

## Heatmap fixes

### 1. Thermal fields — stronger

`blobMul`: `4.6/5.2 → 5.4/6.2` — wider spread.
Gradient: alpha floor `0.40 → 0.52`, blur `22px → 28px`.
Background node field alpha: `0.22+n×0.18 → 0.30+n×0.22`, ellipse wider.

### 2. Neural lines — fewer, thinner, more subtle

Max spokes: `5 → 4`, total max lines: `6 → 4`.
Stroke: `1.5 → 1.0`, color: `rgba(255,255,255,0.86) → rgba(255,255,255,0.60)`.
Junction dots: `r=3.5 → r=2.2`.
Node center accent dots removed.
Glow filter `stdDeviation: 2.4 → 1.8`.

### 3. Hex texture — more refined

Opacity: `0.88 → 0.68`, stroke `0.95 → 0.78`, alpha `0.68 → 0.52`.
Gradient fade starts softer.

### 4. Node orbs — less button-like

Wide aura: multiplier `3.4 → 2.8`, gradient alpha reduced.
Orb border: `2px solid rgba(255,255,255,0.92) → 1.5px solid rgba(255,255,255,0.75)`.
Ring shadows reduced.

### 5. "Что показывает" text — no clipping

If `focusText.length > 82`: replaced with clean fixed summary instead of mid-word ellipsis.

---

## Preserved

- All click → DetailSheet handlers (node click, edge click, info open)
- HeatmapInfoSheet, ReportDetailSheet, HowToReadSheet portals
- dashed edge `strokeLinecap="butt"` (no worm re-introduction)
- Speech Cloud, all other sections — untouched

---

## Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  35.1 kB (First Load 122 kB)
```

---

## What to verify manually

- Graph: no U-shaped/worm arcs; arrows small and sharp; dot grid subtle
- Graph: left column reads as causes, right as effects
- Graph node click → opens detail sheet
- Graph edge click → opens detail sheet
- Heatmap: colored thermal zones overlap softly under nodes
- Heatmap: hex grid visible but doesn't overpower labels
- Heatmap: "Что показывает" card text is clean, no mid-word cut
- No horizontal overflow at 390px
- No red runtime error toast
