# Patch 4L — Causal Graph Visualization Redesign

## What Changed

Only `NeuroNodeGraph` and its graph-specific helper functions were modified. No other section, schema, API, DB, normalizer, legacy renderer, admin UI, or report flow was touched.

### Files changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — targeted edits to causal graph rendering only
- `docs/patch-4l-causal-graph-visualization-redesign.md` — this file

---

## Changes in Detail

### 1. `graphEdgeStyle` — visually distinct edge types

Stroke widths increased and differentiated per edge type so hard vs normal vs soft are clearly distinguishable on screen.

| Type | Stroke (before) | Stroke (after) | Color |
|------|----------------|----------------|-------|
| hard | 1.16 SVG | 1.78 SVG | coral #d4534a |
| choice_blocked | 1.02 SVG | 1.52 SVG | coral #cf6256 |
| normal | 0.88 SVG | 1.12 SVG | violet #8466cc |
| soft | 0.64 SVG | 0.72 SVG | amber #c4923e |
| choice_available | 0.76 SVG | 0.82 SVG | green #5aa882 |

At ~4px per SVG unit on mobile:
- hard: ~7.1px (was ~4.6px)
- normal: ~4.5px (was ~3.5px)
- soft: ~2.9px dashed (was ~2.6px)

`soft` type no longer renders an arrowhead marker (`marker: false`), making dashed weak connections visually distinct from solid-marker connections.

---

### 2. Arrowhead markers — larger, proportional, per-type sizing

Changed from `markerWidth="6"` with `markerUnits="strokeWidth"` (default) to `markerUnits="userSpaceOnUse"` with explicit SVG-unit sizing.

| Type | markerWidth (before) | markerWidth (after) |
|------|---------------------|---------------------|
| hard / choice_blocked | 6 × strokeWidth | 3.2 SVG units (~12.5px) |
| normal / choice_available | 6 × strokeWidth | 2.6 SVG units (~10.1px) |

Arrowhead path scaled to exactly fill the marker viewport, keeping proportional triangles.

---

### 3. Edge glow filter

Added `<filter id="mlm-causal-edge-glow">` with `feGaussianBlur stdDeviation="0.9"` merged with the original for a subtle glow effect. Applied to hard, choice_blocked, and normal edges only — soft/dashed edges remain clean.

---

### 4. Edge trimming radii — fixed endpoint positioning

Previous radii (9.8/10.2 for central, 6.1/6.3 for surrounding) were too small for the actual node sizes, causing edges to visually enter nodes. Corrected to match actual SVG-space node radii.

| Endpoint | Radius (before) | Radius (after) |
|----------|----------------|----------------|
| fromRadius (central) | 9.8 | 14.0 |
| toRadius (central) | 10.2 | 14.2 |
| fromRadius (surrounding) | 6.1 | 8.4 |
| toRadius (surrounding) | 6.3 | 8.6 |

Central node is 116px = 58px radius = ~14.9 SVG units at 390px viewport. Radii now stop edges at the actual node edge.

---

### 5. Canvas background — enhanced with central glow

Added a large elliptical radial gradient centered at the central node position (50%, 52%):

```
radial-gradient(ellipse 66% 54% at 50% 52%, rgba(223,112,95,0.15), transparent 64%)
```

This creates a warm coral halo behind the central node, reinforcing its dominance on the canvas.

Canvas height changed from fixed `430px` to `clamp(420px, 108vw, 480px)` — slightly taller on most mobiles, responsive.

---

### 6. Per-node glow blobs

Added a first rendering pass before the node orbs that renders blurred radial-gradient blobs behind each node:

```
central:      size × 3.6, blur 20px, alpha 0.20
surrounding:  size × 2.8, blur 20px, alpha 0.13
```

This creates a soft thermal-field effect under each node, similar to the heatmap patch (4K), making the canvas look like a connected system rather than floating bubbles on white.

---

### 7. Central node — prominence improvements

- Size increased from 114px to **116px**
- Chip label: changed from hardcoded "центральный" to dynamic `nodeTypeLabel(central.type) || 'ключевой драйвер'`
- Chip styling: stronger box shadow, slightly larger padding, better letter-spacing
- Box shadow: stronger glow rings — `0 0 0 9px` (was 8px), `0 0 0 26px` (was 22px)
- Added subtle "драйвер" type badge below the percent — helps identify the central node's role
- Font size: 0.77rem (was 0.75rem)

---

### 8. Surrounding nodes — better size formula

Changed from `64 + ival * 0.1` (which barely varied between 64 and 74) to:

```
Math.max(58, Math.min(76, 58 + Math.round((intensity ?? 0.55) * 22)))
```

Range: 58px (low intensity) → 76px (high intensity). Clearer size hierarchy.

---

### 9. Legend — flat inline style matching reference

Replaced chip/pill legend (bordered badges) with a flat horizontal row:

- Node-type indicators (choice_available, choice_blocked): colored circle outline
- Line-type indicators (hard, normal, soft): horizontal colored line, weight-matched to actual edge style
- No border, no background card, no pill shape
- Wraps cleanly on mobile
- Font size 0.70rem, muted warm color

---

### 10. Central node slot position

Central node moved from `x: 48, y: 50` → `x: 50, y: 52` — true center horizontally, slightly below vertical center to leave more space above for the top-area nodes (benefit/support).

---

### 11. CSS responsive height

| Breakpoint | Before | After |
|-----------|--------|-------|
| ≤ 500px | 390px | 400px, min-height 400px |
| ≤ 420px | 370px | 380px, min-height 380px |

---

## Data Source: Unchanged

The causal graph still reads:
- `report.node_graph.nodes` as primary source
- `report.node_graph.edges` with full type/strength/explanation fields
- `report.node_graph.central_node_id` for central node selection
- `report.node_graph.legend` for custom legend items (falls back to default)
- `report.node_graph.how_to_read` for "Как читать карту" rows
- `active_nodes` as complete fallback when `node_graph.nodes` is empty
- Semantic slot layout preserved (belief/trigger/support/pattern/body/extra)
- `graphSemanticSlot`, `graphNodeTone`, `graphIconKind` unchanged
- `getShortLabel`, `edgeTypeLabel`, `edgeTypeDescription` unchanged
- `resolveGraphEdgeType` unchanged

---

## What Was NOT Changed

- `NodeGraphSection` wrapper
- `graphSemanticSlot` slot positions and logic
- `graphNodePalette`, `graphNodeTone`, `graphIconKind`, `GraphIcon`
- `getShortLabel`, `edgeTypeLabel`, `edgeTypeDescription`, `resolveGraphEdgeType`
- `nodeTypeLabel` (reused for central chip)
- How-to-read row structure (data and layout unchanged)
- Footer disclaimer note
- All other sections: Hero, Snapshot, HowToRead, GrowthBlocker, ProtectedNeed, PhraseMicroscope, HonestTranslation, KeyPhrases, HeatmapSection, Evidence, Trajectory, Layers, Markers, Practices, Disclaimer
- Section order
- Legacy v1/rich/fixed_blocks renderer
- Schema, normalizer, API, DB, auth, Docker, Traefik, admin UI

---

## Visual QA Checklist

- [ ] Canvas renders as a warm ivory panel with a soft coral halo at center
- [ ] Central node (Гиперконтроль or similar) is clearly dominant — largest orb, strongest glow
- [ ] Surrounding nodes arranged semantically — causes left, gain/benefit top, pattern right, body lower-right
- [ ] Hard (coral/red) edges are visibly thicker than normal (violet) and soft (amber dashed) edges
- [ ] Arrowheads are visible and stop at the node edge (not inside the node)
- [ ] Soft/dashed edges have no arrowhead — distinct from solid connections
- [ ] Central chip shows "ключевой драйвер" or semantic type label
- [ ] "Как читать карту" rows render correctly — max 4 visible, overflow under disclosure
- [ ] Legend shows flat inline indicators: circles for choice types, lines for connection types
- [ ] Legend wraps correctly on 390px without overflow
- [ ] No other sections changed

---

## Tests Run

- `npx tsc --noEmit` → clean (no output)
- `npm run build` → clean, 11 pages, `/r/[publicToken]` 25.8 kB
