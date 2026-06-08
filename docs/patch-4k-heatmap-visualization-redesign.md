# Patch 4K — Heatmap Visualization Redesign

## What Changed

Only `HeatmapSection` and its rendering helpers were modified. No other section, schema, API, DB, normalizer, legacy renderer, or route was touched.

### Files changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — targeted edits to heatmap rendering only
- `docs/patch-4k-heatmap-visualization-redesign.md` — this file

---

## Changes in Detail

### 1. `heatNodeSize` — larger orbs

Node orb sizes increased across all intensity tiers so they read as thermal zones, not small buttons.

| Intensity | Before | After |
|-----------|--------|-------|
| ≥ 92%     | 68 px  | 76 px |
| ≥ 86%     | 62 px  | 68 px |
| ≥ 76%     | 56 px  | 60 px |
| < 76%     | 52 px  | 54 px |

---

### 2. `HeatmapCanvasFirst` — canvas visual overhaul

#### Background: dynamic colour fields

The background is now computed from the actual positioned nodes instead of hardcoded positions. Each node contributes a `radial-gradient(ellipse …)` in its semantic colour, placed at its exact canvas coordinates. This makes the thermal fields follow the real data layout. A warm ivory `linear-gradient` base sits beneath all fields.

```
background = [
  ...positioned.map(pt => radial-gradient in pt.color at pt.pos),
  linear-gradient(150deg, ivory warm base)
]
```

Result: hot nodes produce red/coral regions, pattern nodes produce violet regions, resource nodes produce blue regions — organic and data-accurate.

#### Per-node thermal blobs

Each node emits a large blurred blob behind it to blend into the background field.

| Property | Before | After |
|----------|--------|-------|
| Blob multiplier (hot) | 4.1× | 5.2× |
| Blob multiplier (other) | 3.6× | 4.6× |
| Radial stop 1 opacity | 0.26 | 0.40 |
| Radial stop 2 opacity | 0.16 | 0.24 |
| Radial stop 3 opacity | 0.07 | 0.11 |
| Blur | 18 px | 22 px |

#### Node orbs: enhanced glow rings

```
// Before
border: '1.5px solid rgba(255,255,255,0.86)'
boxShadow: '0 0 0 5px rgba(255,255,255,0.22), 0 0 0 13px rgba(rgb,0.10), 0 12px 26px rgba(rgb,0.18), …'

// After
border: '2px solid rgba(255,255,255,0.92)'
boxShadow: '0 0 0 6px rgba(255,255,255,0.30), 0 0 0 18px rgba(rgb,0.14), 0 0 46px rgba(rgb,0.32), …'
```

The inner highlight changed from `inset 0 1px` to `inset 0 2px` and opacity 0.30 for a crisper highlight.

#### Percent font size: scales with orb

Font size is now `Math.max(16, Math.round(size * 0.255))` — so a 76 px orb gets ~19 px text, a 54 px orb gets 16 px text. Previously all orbs used a fixed 18 px.

#### Wide aura around each orb

```
// Before: size * 2.65, blur 13px, opacity stops 0.30/0.18/0.08
// After:  size * 3.4,  blur 17px, opacity stops 0.42/0.24/0.10
```

#### Hex texture: larger cells, extended fade

Hex cell changed from 16 × 13.8 to 18 × 15.6 (slightly larger, more visible at mobile widths). Stroke opacity increased from 0.58 to 0.68. The radial mask fade extended — the grid stays visible to 84% radius vs 74% previously, so edges of the canvas show more texture.

The second warm-tone hex overlay (`ml-heat-hex-warm-fix`) was removed — it was redundant noise.

#### Neural connections: proper SVG glow filter

Connections now use a real `<filter>` element with `feGaussianBlur + feMerge` instead of a CSS `drop-shadow`. Stroke opacity increased to 0.86 and width to 1.5. Junction dots increased from r=3 to r=3.5.

#### Canvas height

Adjusted from `clamp(500px, 128vw, 560px)` to `clamp(480px, 122vw, 540px)` — slightly more compact on large screens, same on mobile 390 px.

#### Label wrap width

Increased from 92 px to 96 px for both the container and label element. CSS override at `@media (max-width: 420px)` updated to 80 px accordingly.

---

## Data Source: Unchanged

The heatmap still reads:
- `report.heatmap.zones` as primary source
- `active_nodes` as fallback when zones are empty
- Semantic deduplication via `heatmapGroupKey`
- Top 7 nodes by intensity
- Deterministic slot layout (5 / 6 / 7 node layouts)
- Semantic priority assignment (control → top-center, value → top-right, body → left-middle, pattern → center-right, guilt_rest → bottom, resource → bottom-right)

No schema, normalizer, API, DB, or admin changes.

---

## What Was NOT Changed

- `HeatmapSection` wrapper
- `NeuroHeatmapCanvasFirst` (data adapter)
- `heatPalette`, `heatTone`, `heatToneLabel`, `shortHeatLabel`
- `heatmapGroupKey`, `heatSemanticType`, `normalizeHeatLabel`
- All other sections: Hero, Snapshot, HowToRead, GrowthBlocker, ProtectedNeed, PhraseMicroscope, HonestTranslation, KeyPhrases, NodeGraph, Evidence, Trajectory, Layers, Markers, Practices, Disclaimer
- Section order
- Legacy v1 / rich / fixed_blocks renderer
- CSS media queries (except `mlm-heat-node-fix` / `mlm-heat-label-fix` width: 78 → 80 px)
- `HeatmapInfographic` and `NeuroHeatmap` (old components, still present but not used in main flow)

---

## Visual QA Checklist

- [ ] Canvas renders as a rich thermal neural field — not flat coloured circles on white
- [ ] Background colour zones match node positions (hot nodes → red regions, pattern → violet, resource → blue)
- [ ] Hex texture is visible but soft; does not obscure node labels
- [ ] Neural connection lines are glowing white curves connecting node clusters
- [ ] Junction dots are bright white with visible glow
- [ ] Node orbs have two visible glow rings (ivory + colour), no hard button border
- [ ] Percent is white, centered, and stays inside the orb at all node sizes
- [ ] Labels are readable at 390 px — no horizontal overflow, no truncation
- [ ] All 7 nodes visible, no overlapping on canvas
- [ ] Summary strip, insight rows, focus callout render correctly below canvas
- [ ] v2 report with `heatmap.zones` → uses zones
- [ ] v2 report with no zones but `active_nodes` → fallback renders correctly
- [ ] v2 report with neither → empty-safe message ("Нет данных для построения карты")
- [ ] All other sections unchanged

---

## Tests Run

- `npx tsc --noEmit` → clean (no output)
- `npm run build` → clean, 11 pages, `/r/[publicToken]` 25.2 kB
