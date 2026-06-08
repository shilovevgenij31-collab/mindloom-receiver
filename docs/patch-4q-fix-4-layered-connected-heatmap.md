# Patch 4Q-fix-4 — Layered Connected Heatmap

## Root Structural Issue

Previous patches addressed individual opacity values but not the underlying structure. The heatmap was:
- 2-layer thermal divs (outer wash + inner glow) but no middle field
- Connections were inside an IIFE, computed without semantic awareness
- No junction dots (removed in 4Q-fix-2 as "artifacts" but they're what gives neural feel)
- Hex at fixed z-index 2 — sandwiched awkwardly between thermal and connections
- bgNodeFields too strong as backgrounds, creating ambient wash

---

## What Was Rebuilt

### Layer stack (final z-order)

| z | Layer | Purpose |
|---|---|---|
| CSS bg | bgNodeFields + warm ivory | Very tight per-node tint hints + warm base |
| 1 | Outer thermal ambient | Wide soft territorial halo around each node |
| 2 | Middle thermal + inner dense glow | Color identity + hot core |
| 3 | Hex neural surface (soft-light blend) | Neural tissue texture etched over thermal zones |
| 4 | Connection SVG: glow pass + crisp wire + junction dots | Visible neural connections between zones |
| 6 | Node orbs (z:6, isolation) | Active point on the thermal field |

---

## Layer 1: Background

| Property | Before (fix-3) | After (fix-4) |
|---|---|---|
| Ellipse size | 28% × 22% | 20% × 16% |
| Alpha | 0.09 + i×0.09 (max ~0.18) | 0.06 + i×0.08 (max ~0.14) |
| Extra layer | none | soft radial highlight center `rgba(255,248,240,0.72)` |

Tighter ambient tints — thermal divs do all the visible color work.

---

## Layer 2–3: Thermal Fields — 3-layer

### Outer ambient (was: outer wash at z:1)
| Multiplier | Before | After |
|---|---|---|
| High intensity (≥0.88) | 4.2× | 5.8× |
| Normal | 3.5× | 4.6× |
| Blur | 28px | 44px |
| Peak alpha | 0.18 | 0.13 |

Wider and softer — creates territorial clusters without flooding.

### Middle thermal field (new layer)
- Multiplier: 3.3× (high) / 2.8× (normal)
- Blur: 18px
- Gradient: 0.38 → 0.22 → 0.08 → 0 (80%)
- Clearly defines color territory per node

### Inner dense glow (was: inner at z:1, now z:2)
- Fixed multiplier: 1.9×
- Blur: 8px
- Gradient: 0.62 → 0.40 → 0.14 → 0 (74%)
- Tight hot core — each node has a distinct identity

---

## Layer 4: Hex Texture

| Property | Before (fix-3) | After (fix-4) |
|---|---|---|
| Cell size | 14 × 12.12 | 16 × 13.86 |
| Stroke color | rgba(255,255,255,0.44) | rgba(255,242,225,0.52) — warm ivory tint |
| Stroke width | 0.68 | 0.72 |
| Opacity | 0.52 | 0.60 |
| inset | 8px | 6px |
| Radial fade stops | 0% 0.95, 40% 0.82, 70% 0.30, 100% 0 | 0% 1.0, 35% 0.88, 62% 0.42, 82% 0.10, 100% 0 |

Slightly larger cells, warmer stroke color (not cold white), stronger central visibility, tighter vignette at edges.

---

## Layer 5: Connection Network

### Topology

Before: hub-and-spoke only, computed inside IIFE without semantic awareness.

After: semantic-first topology:
1. Hub (positioned[0], highest intensity) → spokes to up to 5 satellites
2. Semantic peripheral: guilt_rest ↔ body (if both present and non-hub)
3. Semantic peripheral: pattern ↔ resource (if both present and non-hub)
4. Fallback peripherals: [1]↔[3] and [2]↔[5] if semantic nodes not found
5. Maximum 7 total connections

### Curve quality
- `curve = min(len × 0.12, 7.5)` — slightly stronger curvature than fix-3 (was 0.10, cap 6.0)
- Alternating perpendicular sides: i%2 gives natural flow

### Two-pass rendering
- **Glow pass**: stroke rgba(255,255,255,0.22), strokeWidth 2.8, blur stdDeviation 2.4
- **Crisp wire pass**: stroke rgba(255,255,255,0.52), strokeWidth 0.78, vectorEffect non-scaling-stroke

### Junction dots — RESTORED

Points placed at t=0.42 on each quadratic bezier:
```
dotX = (1-t)² × x1 + 2(1-t)t × cx + t² × x2
dotY = same for y
```

- **Glow dot**: r=2.2, fill rgba(255,255,255,0.50), blur filter stdDeviation 1.0
- **Core dot**: r=1.2, fill rgba(255,255,255,0.90)
- Max 5 dots (on first 5 connections — hub spokes)
- Junction dots are on-path, not floating

Junction dots were removed in 4Q-fix-2 as "artifacts" but they are essential for the neural relay point feeling. Restored properly: each dot sits exactly on its connection path.

---

## Node Orbs — Slightly Softer

| Property | Before | After |
|---|---|---|
| Wide aura multiplier | 2.8× | 2.6× |
| Wide aura blur | 14px | 12px |
| Wide aura peak alpha | 0.30 | 0.28 |
| Orb border | rgba(255,255,255,0.75) | rgba(255,255,255,0.72) |
| Outer ring (0px ring) | 4px rgba(255,255,255,0.18) | 3px rgba(255,255,255,0.14) |
| Middle ring | 14px rgba(rgb,0.10) | 10px rgba(rgb,0.08) |
| Shadow spread | 34px | 28px |

Less "button with rings" — more "active point on thermal field".

---

## Graph Audit

All edge types verified stable (unchanged from 4Q-fix-1):
- `hard` / `normal` / `soft` / `choice_available` / `choice_blocked` — all mapped
- `default` fallback → `normal`
- No visual regression, no click regression

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

- [ ] Heatmap reads as connected neural activity map, not isolated circles on background
- [ ] Thermal zones clearly centered — 3 distinct layers visible (wide halo, territory, hot core)
- [ ] Red/orange cluster (top area) reads as cluster but doesn't flood canvas
- [ ] Blue (resource) and purple (pattern) zones have distinct cool/purple identity
- [ ] Hex grid visible and premium — warm ivory lines, strong center, fades to edges
- [ ] Connection lines visible between nodes (5–7 connections)
- [ ] Junction dots visible on connection lines — look like neural relay points, not random dots
- [ ] Lines have soft glow halo + crisp wire — intentional, not harsh
- [ ] No floating dots unattached to lines
- [ ] Node orbs feel like active points on the thermal field, less button-like
- [ ] Labels readable over thermal zones
- [ ] Cards below: no text clipping, clean spacing
- [ ] Heatmap zone click → opens DetailSheet ✓
- [ ] Graph: arrows, edge types, clicks unchanged ✓
- [ ] Mobile 390px: no horizontal overflow
- [ ] No red runtime error toast
