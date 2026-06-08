# Patch 3e — Mindloom Report v2 Final Alignment Polish

## Files changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — targeted polish edits

---

## What changed

### 1. Hero badge simplified

**Before:** `Mindloom Report v2`
**After:** `Mindloom`

Footer schema version also removed from public UI — just shows `Mindloom`.

### 2. Overview layout: 2 + 1

**Before:** `repeat(3, minmax(0, 1fr))` — three equal columns; mechanism card (tallest) left empty space under the first two.

**After:** `repeat(2, minmax(0, 1fr))` with mechanism card getting `gridColumn: '1 / -1'`.

Desktop:
```
[ Что блокирует рост ][ Желаемое состояние ]
[ Механизм удержания — full width           ]
```

Mobile (≤700px): single column.

### 3. Heatmap: no internal scroll, zone cards below map

**Before:** side-by-side grid (map 1.6fr | cards 0.65fr) with `max-height: 440px; overflow-y: auto` on the card column.

**After:**
- `.ml-heatmap-wrap` has no `grid-template-columns` — map is full-width
- `.ml-heatmap-side` renamed to `.ml-heatmap-zones` — `repeat(3, minmax(0, 1fr))` grid below the map
- No `max-height`, no `overflow-y`
- Responsive: 2 columns at ≤1040px, 1 column at ≤700px
- 9 zones → 3×3 grid on desktop

Heatmap background cleaned up: blob opacities reduced from 0.13/0.11/0.10 to 0.07/0.06/0.06, background lightened to `#fefcf9 → #f9f4ee → #f5ede4`. Blob radial gradients in JS reduced from `${color}48/${color}22` to `${color}28/${color}12`.

### 4. Node graph: short labels inside circles

Added `getShortNodeLabel()` helper:
- Single-word labels → unchanged
- Multi-word labels → first word only (≤13 chars), truncated with `…` if longer

Graph node `<strong>` and heatmap node `<strong>` both use short labels. `title` attribute still shows full label for accessibility.

Node visual improved: stronger 3-stop gradient (`0% / 55% / 100%`), tighter border (`2.5px`, 90% white opacity), deeper box-shadow with inner highlight and bottom shadow.

### 5. Relation cards grid: 3×2

**Before:** `repeat(auto-fit, minmax(240px, 1fr))` — sometimes 4+2 or other uneven layouts.

**After:** `repeat(3, minmax(0, 1fr))` on desktop; 2 columns at ≤1040px; 1 column at ≤700px.

### 6. Active nodes grid: 3×2

**Before:** `repeat(auto-fill, minmax(230px, 1fr))` — could produce 5+1 or 4+2.

**After:** `repeat(3, minmax(0, 1fr))` on desktop; 2 columns at ≤1040px; 1 column at ≤700px.

### 7. Transformation markers grid: 3×2

**Before:** `repeat(auto-fit, minmax(240px, 1fr))` — could produce 4+2.

**After:** `repeat(3, minmax(0, 1fr))` on desktop; 2 columns at ≤1040px; 1 column at ≤700px.

Practices grid (`ml-practice-grid`) also aligned to `repeat(3, minmax(0, 1fr))`.

---

## What was NOT changed

- Schema v2 structure
- Prompt for Mindloom / repair prompt
- Create-report route / intake endpoint
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

---

## What to visually check before deploy

- Hero badge shows `Mindloom` (not `Mindloom Report v2`)
- Footer shows `Mindloom` only (no `schema 2.0`)
- Overview: two equal cards on top, mechanism card spans full width below
- Heatmap: warm ivory panel, no dark areas, no internal scroll on zone cards
- Heatmap zone cards appear below the map in a 3-column grid
- Heatmap: less pink/red haze — blobs are subtle, not dusty
- Nodes in heatmap show short labels (first word only for multi-word labels)
- Graph nodes show short labels, no ugly word breaks
- Graph nodes look premium: 3-stop gradient, clean glow ring
- Relation cards under graph are in 3×2 grid
- Active nodes in 3×2 grid (no 5+1 layout)
- Transformation markers in 3×2 grid (no 4+2 layout)
- Mobile 390px: no overflow, all grids collapse to 1 column
- Tablet ~768px: all grids are 2-column
- No diary / session / dynamics UI anywhere
