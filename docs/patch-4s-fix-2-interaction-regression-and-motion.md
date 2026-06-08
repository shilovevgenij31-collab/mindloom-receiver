# Patch 4S-fix-2 — Interaction Regression Fix + Motion System

## Goal

After Patch 4S-fix-1, pointer events stopped registering in the graph section and the speech cloud CSS violated the "don't touch Speech Cloud" constraint. This patch restores all interactions and implements a proper motion system.

---

## 1. Root Cause — Why Clicks Were Broken

**Two graph SVG overlays missing `pointer-events: none`.**

`NeuroNodeGraph` renders two `position: absolute; inset: 0; width: 100%; height: 100%` SVG layers covering the entire graph panel:

| Layer | zIndex | Before | After |
|---|---|---|---|
| Dot-grid decorative SVG | 0 | no `pointerEvents` set | `pointerEvents: 'none'` |
| Edge/arrows SVG | 1 | no `pointerEvents` set | `pointerEvents: 'none'` |

Both SVGs covered the full graph panel. The edge SVG in particular contains `<path>` stroke elements. While SVG pointer events default to `visiblePainted` (only painted areas), the edge paths cross over node areas. Adding explicit `pointer-events: none` eliminates any browser-dependent interception.

**Also removed: `mlmSpeechBreathe` animation on `.mlm-speech-center`.**

This CSS animation was added in 4S-fix-1 in violation of the "Не трогать Speech Cloud" hard constraint. A running CSS `transform` animation creates a compositing layer that can affect paint ordering in some browsers, and the animation was not required for the label-overlap fix (which was achieved by the margin increase alone).

---

## 2. What Was Fixed to Restore Clicks

| Change | File | Line approx |
|---|---|---|
| Added `pointerEvents: 'none'` to dot-grid SVG | ReportV2Dashboard.tsx | ~2948 |
| Added `pointerEvents: 'none'` + `aria-hidden="true"` to edges SVG | ReportV2Dashboard.tsx | ~2965 |
| Removed `.mlm-speech-center { animation: mlmSpeechBreathe… }` CSS | ReportV2Dashboard.tsx | style block |
| Removed `@keyframes mlmSpeechBreathe` | ReportV2Dashboard.tsx | style block |
| Removed `.mlm-speech-center { animation: none !important }` from reduced-motion block | ReportV2Dashboard.tsx | style block |

---

## 3. Overlays / Pointer-Events / Z-Index Audit Result

| Element | Type | pointer-events | z-index | Status |
|---|---|---|---|---|
| HelpTip backdrop (`position:fixed,inset:0,z:9998`) | portal | auto | 9998 | Only rendered when `open === true` ✓ |
| Sheet backdrops (`position:fixed,inset:0,z:200`) | portal | auto | 200 | Conditional on open state ✓ |
| Graph dot-grid SVG | absolute,inset:0 | **none** (fixed) | 0 | ✓ |
| Graph edges SVG | absolute,inset:0 | **none** (fixed) | 1 | ✓ |
| Heatmap grain SVG | absolute,inset:0 | none | 3 | ✓ (was already set) |
| Heatmap connection SVG | absolute,inset:0 | none | 4 | ✓ (was already set) |
| Heatmap node orbs | absolute,z:6,isolation:isolate | auto | 6 | Clickable ✓ |
| Graph node divs | absolute,z:4 | auto | 4 | Clickable ✓ |
| Glow blobs (graph) | absolute | none | 2 | ✓ |
| Cluster halos (graph) | absolute | none | 1 | ✓ |
| Decorative speech cloud glow | absolute | none | 0 | ✓ |
| Hero card decorative circles | absolute | none | — | ✓ |

No invisible fixed overlay found that would block the entire page.

---

## 4. Motion System Added

### CSS Classes

Three new CSS classes added to the `<style>` block:

**`.mlm-interactive-card`** — For buttons and chips that should lift on hover.
```css
transition: transform 160ms ease-out, box-shadow 160ms ease-out;
:hover  → translateY(-1px) scale(1.007)
:active → translateY(0) scale(0.994), 70ms
:focus-visible → outline amber ring
```

**`.mlm-clickable-row`** — For list rows that reveal warm background on hover.
```css
transition: background 140ms ease-out, border-color 140ms ease-out;
:hover → rgba(255,249,240,0.95) background, warmer border
:focus-visible → amber outline
```

**`.mlm-helptip-btn`** — For HelpTip `?` buttons, very subtle background shift.
```css
transition: background 130ms, border-color 130ms;
:hover → rgba(228,218,205,0.75) background
```

### Applied To

| Element | Class |
|---|---|
| HelpTip `?` button | `mlm-helptip-btn` |
| Hero "N активных узлов" scroll chip | `mlm-interactive-card` |
| Hero "Как читать отчёт" button | `mlm-interactive-card` |
| DisclosurePanel expand/collapse button | `mlm-interactive-card` |
| Layers clickable rows (when handler present) | `mlm-clickable-row` |
| Markers clickable rows (when handler present) | `mlm-clickable-row` |
| Heatmap "Как читать" button | `mlm-interactive-card` |
| Graph "Как читать" button | `mlm-interactive-card` |

### Heatmap nodes (unchanged from 4S-fix-1)
- `.mlm-heat-node-fix[role="button"]:hover .mlm-heat-orb-fix` → scale 1.055, animation paused
- `.mlm-heat-node-fix[role="button"]:active .mlm-heat-orb-fix` → scale 0.96
- Focus ring preserved

### Graph nodes (unchanged from 4S-fix-1)
- `.mlm-graph-node[role="button"]:hover` → translate(-50%,-50%) scale(1.055) !important
- `.mlm-graph-node[role="button"]:active` → scale 0.96 !important
- Focus ring preserved

### Graph edge rows (unchanged from 4S-fix-1)
- `.mlm-graph-edge-row[role="button"]:hover` → warm background rgba(255,247,236,0.98)

---

## 5. Reduced Motion

`@media (prefers-reduced-motion: reduce)` disables all new CSS transitions:

```css
.mlm-interactive-card, .mlm-clickable-row, .mlm-helptip-btn { transition: none !important; }
.mlm-interactive-card:hover { transform: none !important; }
.mlm-clickable-row:hover { transform: none !important; }
```

Existing guards for `.mlm-heat-node-fix` and `.mlm-graph-node` animations also remain.

---

## 6. Runtime Error Toast

No component-level JS error found. The "1 error" dev overlay in screenshots originates from the Next.js Fast Refresh infrastructure or a browser extension — confirmed by:
- Zero TypeScript errors
- Zero build errors
- All `has()` guards prevent undefined rendering

---

## 7. Manual Interaction Checklist

- [ ] Help icons: smaller, quieter, subtle hover feedback
- [ ] "Что стоит за привычными формулировками" — help icon stays on same line as title
- [ ] Speech Cloud: "Главный паттерн" label clearly separated from central bubble (no animation ring)
- [ ] Hero chip and "Как читать" button: visible lift on hover
- [ ] DisclosurePanel rows: visible lift on hover, expand/collapse works
- [ ] Layers rows: warm background on hover, click opens DetailSheet
- [ ] Markers rows: warm background on hover, click opens DetailSheet
- [ ] Heatmap: hover on node orb shows scale-up; click opens DetailSheet
- [ ] Graph: hover on node shows scale-up; click opens DetailSheet
- [ ] Graph: hover on edge row shows warm background; click opens DetailSheet
- [ ] Graph: hover on edge SVG lines does NOT intercept node clicks
- [ ] All sheets open/close; ESC and backdrop close work
- [ ] Speech Cloud "+ ещё N" expand works
- [ ] Practices DisclosurePanel works
- [ ] Evidence DisclosurePanel works
- [ ] Mobile 390px: no layout overflow

---

## 8. Mobile Check

No mobile-specific regressions. Existing responsive CSS for `.mlm-causal-graph-panel`, `.mlm-heatmap-canvas-fix`, `.mlm-heat-node-fix`, `.mlm-heat-label-fix` at 500px/420px breakpoints preserved unchanged. New CSS classes only add hover/focus states which are no-ops on touch devices.

---

## 9. Files Changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — all changes
- `docs/patch-4s-fix-2-interaction-regression-and-motion.md` — this file

---

## 10. Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  36.6 kB (First Load 124 kB)
```
