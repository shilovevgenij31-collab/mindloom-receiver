# Patch 4Q-fix-2 — Heatmap Node-Centered + Graph Audit

## Root Issue

The full-canvas red/orange wash was caused by **bgNodeFields** — 7 CSS `radial-gradient` layers each spanning `ellipse 66% 56%` of the canvas, all stacked in the `background` property. With 3–4 high-intensity red/orange nodes, the overlapping large ellipses covered the entire canvas in warm color. Blue/purple/resource zones had no visual territory.

---

## Heatmap Changes

### 1. bgNodeFields — from large ellipses to tight per-node hints

**Before:** `ellipse 66% 56%` at each node, `alpha = 0.30 + intensity × 0.22` (up to 0.52)
**After:** `ellipse 22% 18%` at each node, `alpha = 0.07 + intensity × 0.07` (up to 0.14)

Each node now creates only a tight local color hint in the background canvas gradient. The thermal blob divs do all the visible color work instead.

### 2. Thermal blobs — smaller, softer

| Property | Before | After |
|---|---|---|
| blobMul high (≥0.9) | 6.2× | 4.2× |
| blobMul normal | 5.4× | 3.5× |
| blur | 28px | 22px |
| gradient floor alpha | 0.52 | 0.46 |
| gradient fade | transparent 78% | transparent 74% |

For a 70px node: blob was 378×378px (blur edge ~460px), now 245×245px (blur edge ~311px). Nodes spaced >30% of canvas apart now have visible ivory space between their color zones.

### 3. Hex texture — smaller cells, quieter

| Property | Before | After |
|---|---|---|
| Cell size | 18×15.6 | 10×8.67 |
| Opacity | 0.68 | 0.42 |
| Stroke alpha | 0.52 | 0.36 |
| Stroke width | 0.78 | 0.55 |

Hex grid is now a fine-grained structural underlay — not competing with node labels.

### 4. Neural lines — no floating dots, fewer lines

- **Removed:** junction dots at midpoints (white circles that looked like artifacts)
- **Reduced:** max lines 4 → 3
- **Reduced:** stroke `rgba(255,255,255,0.60)` → `rgba(255,255,255,0.28)`, strokeWidth `1.0` → `0.65`
- Lines still connect actual node centers via quadratic bezier

### 5. "Что показывает" fallback threshold

Threshold lowered from `> 82` to `> 70` chars, fallback text shortened to:
`'Показывает, какие зоны активированы сильнее всего и как они связаны.'`

---

## Graph Edge Type Audit

All 5 edge types verified in `graphEdgeStyle()`:

| Type | Color | Stroke | Style | Arrow |
|---|---|---|---|---|
| hard | #b84840 | 0.62 | solid | ✓ |
| normal (default) | #6656a8 | 0.46 | solid | ✓ |
| choice_blocked | #b05850 | 0.50 | solid | ✓ |
| soft | #a07c30 | 0.30 | dashed 2.5 5 | — |
| choice_available | #3d8c60 | 0.34 | dashed 2 5 | ✓ |

- `default` case catches any unknown type → `normal` style
- `resolveGraphEdgeType()` handles missing `type` with strength-based fallback
- `defaultLegend` covers all 5 types
- **No code changes needed in graph** — mapping is already stable

---

## Preserved

- All heatmap zone click → DetailSheet handlers
- Graph node click, graph edge click
- HeatmapInfoSheet, ReportDetailSheet, HowToReadSheet portals
- Speech Cloud — untouched
- All other sections — untouched

---

## Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  35 kB (First Load 122 kB)
```

---

## What to verify manually

- No full-canvas red/orange wash — ivory background visible between nodes
- Each node has its own distinct color zone: red clusters at top, amber/orange mid, blue/purple resource nodes readable
- Hex grid visible but fine and not distracting
- No floating white dots between nodes
- Connection lines (max 3) are subtle, barely visible
- "Что показывает" card: no mid-word clipping
- Graph: arrows, edge types, click interactions unchanged
- Mobile 390px: no horizontal overflow
- No red runtime error toast
