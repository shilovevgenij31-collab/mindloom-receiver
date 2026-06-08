# Patch 4Q — Heatmap + NodeGraph Visual Rebuild

## Scope

Targeted visual improvements to `HeatmapCanvasFirst` and `NeuroNodeGraph` in `app/r/[publicToken]/ReportV2Dashboard.tsx`.

**Not touched:** Speech Cloud, all other report sections, backend, API, schema, DB, auth, deploy.

---

## Heatmap (`HeatmapCanvasFirst`)

### 1. Dynamic neural connections

**Before:** 6 hardcoded `<path>` SVG segments at fixed 7-node coordinates — didn't adapt when fewer nodes were displayed.

**After:** Paths computed from the actual `positioned[]` array at render time:
- Hub-and-spoke from the highest-intensity node (index 0) to each of the next 4.
- 1–2 peripheral connections between non-hub neighbours (for 4+ and 5+ node counts).
- Junction dots placed at path midpoints.
- Small accent circles at each node center.
- All computed via a IIFE inside JSX; quadratic bezier for slight organic curve.

### 2. Below-canvas 3-card layout

**Before:** One "scale" card (4-column grid) + one "focus + how-to-read" row — visually unbalanced, focus strip felt misplaced.

**After:** 3 equal-width cards in a `grid-template-columns: repeat(3, 1fr)` row:

| Card | Content |
|---|---|
| **Самые активные** | Top 3 nodes sorted by intensity, dot + label + % per row; overflow chips if >7 total zones |
| **Что показывает** | `heatmap.description` text, clamped to 100 chars |
| **Шкала активности** | 2-column 2×2 color-dot legend + compact "Как читать" trigger button |

Overflow nodes (beyond the 7 shown on canvas) rendered as small chips below the card row instead of inline in the scale card.

---

## Graph (`NeuroNodeGraph`)

### 1. Semantic positions — better left/right split

**Before:** `support` (resources) was at x=54 — almost at center; nodes clustered on the left.

**After:** Clearer left-column (causes) vs right-column (effects) split:

```
belief  → 18 / 22   left  — deep causes / values
trigger → 16 / 22   left-bottom — triggers
support → 76 / 86   right-top — resources / gains
pattern → 86 / 78   right — behavioral outputs
body    → 80 / 60   right-bottom — somatic
extra   → 42 / 36 / 86  flexible
```

Central node stays at x=50, y=52.

### 2. Canvas height

`clamp(420px, 108vw, 480px)` → `clamp(440px, 112vw, 510px)` — slightly taller for a more spacious analytical map feel.

### 3. Background texture — dot grid

**Before:** 3 decorative SVG wavy paths (too organic, blended into the node blobs).

**After:** Subtle dot-grid pattern with radial fade mask — system-map / schematic feel that visually differentiates the graph from the heatmap hex texture.

### 4. Satellite node size

Min size raised from `max(58, …)` → `max(62, …)`, max from `76` → `82` — slightly larger orbs that better accommodate labels.

### 5. Intensity label

`fontSize: '0.57rem', fontWeight: 760` → `fontSize: '0.62rem', fontWeight: 800` for satellite nodes — number is now readable at a glance.

### 6. Label max-width

Satellite node label `maxWidth` widened from `66` → `74` to fit the larger orb without overflow.

---

## What was preserved

- All click handlers → `onNodeClick` / `onEdgeClick` → `DetailSheetState`
- HeatmapInfoSheet, ReportDetailSheet, HowToReadSheet portals
- `HeatmapInfoSheet` trigger (onInfoOpen) now lives in the "Шкала" card button
- S-curve fix and glow-only-for-hard from Patch 4P-fix-1
- Speech Cloud — untouched
- All other report sections — untouched
- No new dependencies
- No backend / schema / prompt changes

---

## Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  35.1 kB (First Load 122 kB)
```
