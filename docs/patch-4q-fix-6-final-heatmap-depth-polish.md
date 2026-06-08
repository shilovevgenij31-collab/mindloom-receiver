# Patch 4Q-fix-6 — Final Heatmap Neural Depth Polish

## Problem

After 4Q-fix-5 removed the honeycomb texture, the map became visually clean but too empty — no neural depth, surface too soft, connections barely visible.

---

## Changes

### 1. Outer Thermal — tighten red fog

| Property | Before | After |
|---|---|---|
| Multiplier (intensity ≥ 0.88) | 5.8× | 4.8× |
| Multiplier (normal) | 4.6× | 4.2× |
| Blur | 44px | 38px |
| Peak alpha | 0.13 | 0.14 |

High-intensity red nodes had a very large ambient halo. Reducing the multiplier pulls the outer fog closer to each node, preventing the "empty red mist floating above the canvas" effect.

---

### 2. Micro-grain dots — stronger + irregular

| Property | Before | After |
|---|---|---|
| Pattern id | ml-grain-fx5 | ml-grain-fx6 |
| Primary dot r | 0.40 | 0.52 |
| Primary dot alpha | 0.26 | 0.38 |
| Secondary dots | none | r=0.30 at pattern corners (alpha 0.18) |
| Rect opacity | 0.55 | 0.72 |
| Radial fade center | 0.88 | 0.92 |

**Secondary dots** are placed at the 4 corners of each pattern tile (x:0,y:0 and x:3.8,y:3.8), so they appear as smaller sub-dots between the primary dots. This breaks the regularity and creates a slightly irregular warm grain without looking like a grid.

At desktop scale (~26px primary spacing, ~13px secondary spacing), this reads as a warm textured surface — not uniform, not cyber.

---

### 3. Organic fiber mesh — 8 lines, stronger

| Property | Before | After |
|---|---|---|
| Lines total | 6 | 8 |
| Per-line opacity | 0.046–0.058 | 0.066–0.082 |
| Stroke color | rgba(190,158,118,0.85) | rgba(188,155,115,0.88) |

5 horizontal sweeps (y ≈ 14, 30, 46, 63, 79) + 3 vertical flows (x ≈ 20, 48, 78).
Each line is an alternating-direction S-curve. At 7-8% opacity they are individually barely visible but collectively give the "scan layer / tissue fibers" depth.

---

### 4. Connection network — more visible

| Property | Before | After |
|---|---|---|
| Glow stroke alpha | 0.22 | 0.30 |
| Glow strokeWidth | 2.8 | 3.2 |
| Glow stdDeviation | 2.4 | 2.6 |
| Crisp wire alpha | 0.52 | 0.64 |
| Crisp wire strokeWidth | 0.78 | 0.86 |

Lines are now clearly visible on light ivory areas of the canvas while remaining delicate — not a harsh white web.

---

### 5. Junction dots — stronger relay feel

| Property | Before | After |
|---|---|---|
| Glow dot r | 2.2 | 2.6 |
| Glow dot alpha | 0.50 | 0.62 |
| Glow stdDeviation | 1.0 | 1.2 |
| Core dot r | 1.2 | 1.45 |
| Core dot alpha | 0.90 | 0.92 |

Slightly larger and brighter — each dot now reads clearly as a neural relay point on its connection path.

---

### 6. Node wide aura — better thermal integration

| Property | Before | After |
|---|---|---|
| Multiplier | 2.6× | 2.8× |
| Blur | 12px | 14px |
| Peak alpha | 0.28 | 0.32 |

The node's own aura now extends slightly further and blends more smoothly with the surrounding thermal field, reducing the "button floating on background" separation.

---

## Unchanged

- Middle thermal field (mul 3.3/2.8, blur 18px, alpha 0.38)
- Inner hot core (mul 1.9, blur 8px, alpha 0.62)
- Connection topology (semantic hub-spoke)
- Node orb styling
- Graph — untouched
- Speech Cloud — untouched
- All sheets / portals / click handlers

---

## Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  35.8 kB (First Load 123 kB)
```

---

## Manual Verification Checklist

- [ ] No honeycomb / beehive visible
- [ ] Micro-grain texture subtly visible in central canvas area
- [ ] Secondary dots create slight irregularity (not a perfect grid)
- [ ] Organic fiber lines add depth — barely visible individually, but canvas feels textured
- [ ] Connection lines clearly visible between nodes on light areas
- [ ] Junction dots readable as relay points on lines
- [ ] Red/orange nodes: outer ambient halo contained closer to each node (no floating mist)
- [ ] Blue and purple zones remain distinct
- [ ] Nodes feel embedded in the thermal surface, not floating on top
- [ ] Labels readable
- [ ] Heatmap zone click opens DetailSheet ✓
- [ ] Graph unchanged ✓
- [ ] Speech cloud unchanged ✓
- [ ] Mobile 390px: no overflow
- [ ] No red runtime error toast
