# Patch 4Q-fix-3 — Heatmap Connected Neural Map

## Goal

Restore the feeling of a connected neural activity map — not isolated orbs, but zones linked inside one system. Retain node-centered thermal approach (no full-canvas wash). Fix hex texture scale, strengthen connections, sculpt thermal fields into 2-layer glow.

---

## 1. Thermal Fields — 2-Layer Glow

Single blur div → split into outer soft wash + inner dense glow per node.

### Outer soft wash
| Property | Value |
|---|---|
| outerMul (intensity ≥ 0.9) | 4.2× |
| outerMul (normal) | 3.5× |
| Blur | 28px |
| Gradient peak alpha | 0.18 |
| Gradient stops | 0% 0.18 → 40% 0.10 → 64% 0.04 → 82% transparent |

Creates a wide ambient halo around each node. Alpha is low enough that even 3 overlapping high-intensity nodes don't produce a wash (peak combined ~0.36, but rapidly decaying).

### Inner dense glow
| Property | Value |
|---|---|
| innerMul (intensity ≥ 0.9) | 2.8× |
| innerMul (normal) | 2.3× |
| Blur | 12px |
| Gradient peak alpha | 0.50 |
| Gradient stops | 0% 0.50 → 36% 0.32 → 58% 0.12 → 76% transparent |

Concentrated bright core that gives each node its own thermal identity. Tightly scoped — only the nearest few pixels overlap between adjacent nodes.

---

## 2. Connection Network — Full Hub-and-Spoke + Two-Pass

Previously: 3 lines at opacity 0.28, almost invisible.  
Now: up to 7 connections, two rendering passes.

### Topology
- Spoke from positioned[0] (highest intensity) to ALL remaining nodes (up to 6)
- Peripheral: positioned[1]↔positioned[3] (if ≥4 nodes)
- Peripheral: positioned[2]↔positioned[5] (if ≥6 nodes)
- Maximum 7 total connections shown

### Curve quality
Proper normalized perpendicular curvature (not unnormalized Δ × 0.04):
```
curve = min(len × 0.10, 6.0)  // proportional, capped
side = i % 2 === 0 ? +1 : -1  // alternating sides
cx = midX - (dy/len) × curve × side
cy = midY + (dx/len) × curve × side
```

### Two-pass rendering
**Glow pass** (below): `stroke rgba(255,255,255,0.24)`, `strokeWidth 2.4`, blur filter `stdDeviation 2.2` → creates soft luminous halo around each wire
**Crisp wire pass** (above): `stroke rgba(255,255,255,0.54)`, `strokeWidth 0.72`, `vectorEffect="non-scaling-stroke"` → sharp readable thread through the glow

---

## 3. Hex Texture — Mid-Size, Premium Feel

| Property | Before (fix-2) | After (fix-3) |
|---|---|---|
| Cell size | 10×8.67 | 14×12.12 |
| Opacity | 0.42 | 0.52 |
| Stroke alpha | 0.36 | 0.44 |
| Stroke width | 0.55 | 0.68 |
| Gradient fade center | 90% opaque | 95% opaque |
| Gradient fade breakpoints | 0% 0.90, 52% 0.80, 78% 0.25 | 0% 0.95, 40% 0.82, 70% 0.30 |

Mid-size cells read as a fine textured fabric — visible but not dominant. Tighter center fade creates a premium vignette effect.

---

## 4. Background Node Fields — Slightly Stronger

| Property | Before (fix-2) | After (fix-3) |
|---|---|---|
| Ellipse size | 22% × 18% | 28% × 22% |
| Alpha | 0.07 + intensity × 0.07 | 0.09 + intensity × 0.09 |
| Max alpha | ~0.14 | ~0.18 |

Slight ambient warmth per node color family in the background canvas layer.

---

## 5. Graph Edge Type Audit — No Changes Needed

All 5 types stable from patch 4Q-fix-1/fix-2:
- `hard` / `normal` / `soft` / `choice_available` / `choice_blocked` — all mapped
- `default` fallback → `normal`
- `resolveGraphEdgeType()` handles missing type via strength
- `defaultLegend` covers all types

---

## Preserved

- All heatmap zone click → DetailSheet handlers
- Graph node click, graph edge click, HowToReadSheet, HeatmapInfoSheet portals
- Speech Cloud — untouched
- All other sections — untouched
- No new dependencies

---

## Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  35.2 kB (First Load 122 kB)
```

---

## Manual Verification Checklist

- Thermal zones clearly centered on each node
- Inner glow creates concentrated hot centers; outer wash creates soft territory
- Red cluster at top (high-intensity nodes) reads as a system cluster, not a wash
- Blue/purple nodes (lower-right area) have their own distinct thermal zones
- Connection lines visible between all nodes (hub-spoke pattern)
- Lines have soft glow halo + crisp wire — look intentional, not random
- No floating midpoint dots
- Hex grid visible, fine-grained, not competing with labels
- Cards below: no text clipping, clean typography
- Graph: arrows, edge types, clicks unchanged
- Mobile 390px: no overflow, nodes readable
- No red runtime error toast
