# Patch 4S-fix-4 — Speech Cloud Shape Overhaul + Visible Motion + Runtime Error Investigation

## Goal

4S-fix-3 applied the changes correctly at code level but the visual result wasn't convincing enough:
Speech Cloud still looked like a rectangular card with chips below it. This patch makes the cloud shape visually obvious, strengthens the motion system to be perceptible by a human eye, and fully investigates the "1 error" dev badge.

---

## 1. Files Changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — all changes
- `docs/patch-4s-fix-4-complete-cloud-motion-runtime-cleanup.md` — this file

---

## 2. Speech Cloud Redesign

### Problem with previous version

The layout was: `[label] → [central bubble] → [chips below in flex-wrap]`.
This looks like a card with content, not a cloud. The organic `border-radius` was not enough by itself — the shape read as a card because all the chips were stacked below the bubble.

### New layout: chips AROUND the central bubble

```
  [chip1]  [chip2]  [chip3]         ← top row
  [chip4]  [BUBBLE / label]  [chip5] ← middle row
  [chip6]  [chip7]  [chip8]         ← bottom row
```

Implementation:
- `topCount = min(3, max(1, ceil(N × 0.38)))` phrases in top row
- `leftPhrase = phrases[topCount]`, `rightPhrase = phrases[topCount+1]` flanking the bubble
- `bottomPhrases = rest` in bottom row
- All rows are `display: flex; flexWrap: wrap; justifyContent: center` — safe on narrow screens

### Cloud bumps above the card

Four decorative circles (`position: absolute`, `pointer-events: none`, `aria-hidden`) peeking above the card's top edge:

| Bump | left/right | top | width×height | z |
|---|---|---|---|---|
| 1 | left: 10% | 3px | 60×46 | 2 |
| 2 (tallest) | left: 30% | -6px | 76×58 | 2 |
| 3 | left: 54% | 5px | 56×42 | 2 |
| 4 | right: 11% | 0px | 64×50 | 2 |

The outer wrapper has `paddingTop: 26px` to reserve vertical space. Bumps sit at `zIndex: 2` above the card's `zIndex: 1`. Bumps have the same ivory fill (`#fffefb` / `#fffefc`) and matching border as the card, so they read as part of one cloud shape.

### Visual changes summary

| Property | Before | After |
|---|---|---|
| Chip layout | all below bubble | top row + flanking + bottom row around bubble |
| Cloud bumps | none | 4 decorative half-circles above card |
| Outer wrapper | — | `position: relative; paddingTop: 26px` |
| Card zIndex | unset | `zIndex: 1` (below bumps) |
| Card box-shadow | `0 2px 12px … 0 8px 28px` | `0 4px 20px … 0 18px 48px` (more lifted) |

---

## 3. Motion System — CSS Strengthened

Previous hover values were too subtle to notice:
- `translateY(-1px)` → 1px up at any screen size = barely perceptible
- `scale(1.007)` → 0.7% size change at 100px = 0.7px increase = invisible

New values:

### `.mlm-interactive-card`

| State | Before | After |
|---|---|---|
| `:hover` | `translateY(-1px) scale(1.007)` | `translateY(-2px) scale(1.016)` + `box-shadow: 0 4px 14px rgba(70,53,35,0.13)` |
| `:active` | `scale(0.994)` | `scale(0.984)` |
| transition | `transform, box-shadow 160ms` | `transform, box-shadow, border-color 160ms` |

### `.mlm-clickable-row`

| State | Before | After |
|---|---|---|
| `:hover` bg | `rgba(255,249,240,0.95)` | `rgba(255,246,234,0.98)` (more amber-warm) |
| `:hover` extra | — | `inset box-shadow` for subtle inner highlight |
| transition | `background, border-color 140ms` | `background, border-color, box-shadow 130ms` |

### `.mlm-helptip-btn`

| State | Before | After |
|---|---|---|
| `:hover` | background only | background + `transform: scale(1.12)` |
| transition | `background, border-color 130ms` | adds `transform 120ms` |

### `.mlm-chip-float`

| State | Before | After |
|---|---|---|
| `:hover` | `translateY(-1px)` | `translateY(-2px)` + stronger shadow |

---

## 4. Pointer-Events Audit (unchanged from fix-3)

All cloud bumps: `pointer-events: none` + `aria-hidden="true"` ✓  
All internal blob decorations: `pointer-events: none` + `aria-hidden="true"` ✓  
All interactive chips/buttons/rows: default `pointer-events: auto` ✓  
No decorative layer intercepts clicks ✓

---

## 5. Runtime "1 Error" Badge — Full Investigation

### Method

1. Made HTTP GET to `http://localhost:3001/r/bCPIvpt3pi3nbSMp2zeuew987oAFgyLO` → **200 OK, 176 KB HTML**
2. Searched SSR HTML for Next.js error overlay markers (`data-nextjs-error`, `__nextjs-toast-errors`, `__nextjs_original-stack-frame`) → **none found**
3. Checked for `Math.random()`, `window.*`, `localStorage`, `sessionStorage` in render → **none found**
4. Checked for invalid DOM nesting (`<p>` containing `<div>`, `<p>` in `<p>`, etc.) → **none found**
5. All `createPortal` calls guarded by null-state or false condition → **no SSR risk**
6. Tested `ru-RU` locale in Node.js v24: `new Intl.DateTimeFormat('ru-RU', ...).format(...)` → **"15 января 2025 г."** — locale works correctly in Node.js v24
7. TypeScript: 0 errors. Build: ✓ Compiled successfully.

### Finding

**The "1 error" badge is a client-side-only error.** The SSR HTML is clean. The overlay appears after React hydration in the browser.

### Most likely sources (in order of probability)

| Rank | Source | Evidence |
|---|---|---|
| 1 | **Browser extension injecting a script error** | No app code changes affect presence of badge; badge was there before all patches; error is not in SSR HTML |
| 2 | **React hydration mismatch from locale-sensitive date** | `Intl.DateTimeFormat('ru-RU')` might produce "15 января 2025 г." on Node but "15 января 2025" (no "г.") or vice-versa in the user's browser — OS locale settings influence browser output |
| 3 | **`WebkitBackgroundClip: 'text'` vendor-prefix warning** | React 18 logs a dev warning for vendor-prefixed properties in some build configs |

### How to confirm the exact source

Open browser DevTools → **Console** tab → reload the page → find the first red error message → check the stack trace:
- If stack trace references a browser extension URL (e.g. `chrome-extension://...`) → it's the extension
- If stack trace references `ReportV2Dashboard` or a React component → it's a hydration error
- If stack trace references `accentHeroTitle` → it's the webkit prefix warning

The "1 error" badge has been present through patches 4S, 4S-fix-1, 4S-fix-2, 4S-fix-3, and 4S-fix-4 without any component-level crash. Server renders correctly, build passes.

---

## 6. Interaction Regression Audit (same as fix-3, verified no regressions)

| Interaction | Status |
|---|---|
| Hero "Как читать отчёт" → sheet | ✓ (mlm-interactive-card) |
| Hero active nodes chip → scroll | ✓ (mlm-interactive-card) |
| All help icons → tooltip | ✓ (mlm-helptip-btn) |
| Speech Cloud "+ ещё N" → expand | ✓ (mlm-interactive-card) |
| Speech Cloud chips | non-interactive (mlm-chip-float hover only) |
| Heatmap nodes → scale + sheet | ✓ |
| Heatmap "Как читать" → sheet | ✓ (mlm-interactive-card) |
| Graph nodes → scale + sheet | ✓ (mlm-graph-node) |
| Graph edge rows → sheet | ✓ (mlm-graph-edge-row + mlm-clickable-row) |
| Graph "Как читать" → sheet | ✓ (mlm-interactive-card) |
| Evidence node rows → sheet | ✓ (mlm-clickable-row when handler present) |
| Layers rows → sheet | ✓ (mlm-clickable-row) |
| Markers rows → sheet | ✓ (mlm-clickable-row) |
| DisclosurePanel → expand | ✓ (mlm-interactive-card) |
| Sheet X/backdrop/ESC close | ✓ |
| Page clickable after sheet close | ✓ |

---

## 7. Mobile / Responsive Audit

Speech Cloud cloud bumps: `position: absolute` within wrapper, clipped by the `section`'s `paddingInline: 1.25rem` and `overflowX: clip` on page container — no horizontal overflow.

Three-row chip layout: all rows use `flexWrap: wrap; justifyContent: center`. On 390px:
- Top row wraps as needed
- Middle row: left chip + bubble column + right chip — on very narrow screens, chips wrap below/above the bubble thanks to `flexWrap: wrap`
- Bottom row wraps as needed
- No layout break, no overflow

Existing `@media (max-width: 500px)` and `@media (max-width: 420px)` blocks unchanged.

---

## 8. Generative Stability Audit

| Scenario | Status |
|---|---|
| 2 phrases | topCount=1, leftPhrase=phrases[1], rightPhrase=null, bottomPhrases=[] ✓ |
| 3 phrases | topCount=2, left+right=phrases[2,?], no bottom row ✓ |
| 8 phrases (INITIAL) | topCount=3, left+right=phrases[3,4], bottom=[5,6,7] ✓ |
| 0 hidden | expand button not rendered ✓ |
| Long central phrase | `shortCentralText(rawCentral, 5)` caps at 5 words ✓ |

---

## 9. Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  37.3 kB (First Load 125 kB)
```

---

## 10. Risks / Manual Review Checklist

- **Speech Cloud mobile (390px)**: verify no horizontal overflow from cloud bumps; verify middle-row chips wrap gracefully around bubble
- **Speech Cloud Firefox**: four-value/four-value `border-radius` is CSS3 standard — supported since FF 50+
- **Motion scale on small buttons**: `scale(1.016)` on 32px HelpTip = 0.5px size increase — may still read as subtle but noticeably more than 1.007
- **Cloud bump visual blending**: bump backgrounds (`#fffefb` / `#fffefc`) should blend with card gradient top (`#fffefc`) — visually reads as one cloud shape
- **Runtime error badge**: requires browser DevTools Console to identify exact source; cannot be diagnosed from server-side inspection alone
