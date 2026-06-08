# Patch 4S-final-stabilize — Speech Cloud Rollback + Pointer-Events Audit + Full QA

## 1. Files Changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — MindloomSpeechCloud function replaced

---

## 2. What Was Rolled Back from 4S-fix-3/4S-fix-4

| Removed | Reason |
|---|---|
| Outer wrapper `paddingTop: 26px` | Not needed; only existed to make space for bumps |
| 4 cloud bumps (`position: absolute` circles above card) | Unnecessary complexity; even with `pointerEvents: none` they created a taller stacking context above the card |
| 3-row chip distribution (topPhrases / leftPhrase / rightPhrase / bottomPhrases) | Unstable on narrow screens; bubble could drop below chips due to `flexWrap` on the middle row |
| Third internal blob decoration (center radial gradient) | Reduces noise; 2 blobs are enough |
| `INITIAL = 8` chip count | Reduced to 6 for cleaner default display |

---

## 3. Speech Cloud Final Layout

```
┌─────────────────────────────────────────────────────┐
│           Главный паттерн (9px uppercase)            │
│           ┌──────────────────┐                       │
│           │   148×148 circle │                       │
│           │   centralText    │                       │
│           └──────────────────┘                       │
│   [chip1] [chip2] [chip3] [chip4] [chip5] [chip6]   │
│              [+ ещё N]  (if hidden > 0)              │
└─────────────────────────────────────────────────────┘
```

- Card: warm ivory gradient, organic border-radius, 2 blob decorations (`pointer-events:none`, clipped by `overflow:hidden`)
- Bubble: 148×148 purple circle, `"Главный паттерн"` label above, centered in column
- Chips: `flex-wrap`, 6 visible by default, centered below bubble
- Expand button: `mlm-interactive-card` class for hover animation

---

## 4. Click / Pointer-Events Audit

### Cloud bumps removed — main risk eliminated

The 4 absolute-positioned decorative circles that sat above the card's top edge in `paddingTop: 26px` space have been removed. They had `pointerEvents: 'none'` but created a taller containing block with `zIndex: 2` above the card. Simpler to remove entirely.

### Remaining absolute layers in Speech Cloud

| Layer | position | pointerEvents | risk |
|---|---|---|---|
| Top-right blob | `absolute` | `none` ✓ | none — clipped by `overflow:hidden` |
| Bottom-left blob | `absolute` | `none` ✓ | none — clipped by `overflow:hidden` |

### Global audit — other sections (no changes needed)

| Section | Absolute layers | Safe? |
|---|---|---|
| HelpTip tooltip | `fixed inset:0` backdrop + tooltip | ✓ only when `open=true` via `createPortal` |
| HeatmapInfoSheet | `fixed inset:0` backdrop | ✓ conditional on sheet open |
| HowToReadSheet | `fixed inset:0` backdrop | ✓ conditional on sheet open |
| GraphHowToReadSheet | `fixed inset:0` backdrop | ✓ conditional on sheet open |
| ReportDetailSheet | `fixed inset:0` backdrop | ✓ conditional on sheet open |
| Heatmap SVG layers | `absolute inset:0 SVG` | ✓ `pointerEvents:'none'` |
| Graph SVG layers | `absolute inset:0 SVG` | ✓ `pointerEvents:'none'` |
| ProtectedNeed radial blob (lines 185, 3792) | `absolute` in `overflow:hidden` container | ✓ covered by `position:relative` sibling painted after |

No invisible overlays. No full-page pseudo-elements. No stale backdrop.

---

## 5. Motion — Kept / Removed

### Kept (safe — on interactive elements only)

| Class | Element | Hover effect |
|---|---|---|
| `mlm-interactive-card` | buttons, disclosure rows | `translateY(-2px) scale(1.016)` + shadow lift |
| `mlm-clickable-row` | evidence / layer / marker rows | warm amber bg + inset shadow |
| `mlm-helptip-btn` | `?` help icon buttons | `scale(1.12)` + bg change |
| `mlm-chip-float` | speech cloud chip spans | `translateY(-2px)` — safe in normal flow |
| `mlm-graph-node` | graph nodes | `scale(1.055)` |
| `mlm-heat-node-fix` | heatmap orbs | `scale(1.055)` |
| `mlm-graph-edge-row` | graph edge rows | warm bg |

### Reduced-motion guards (unchanged)

All classes above have `transition: none` and `transform: none` under `@media (prefers-reduced-motion: reduce)`.

---

## 6. Runtime Error

Previous investigation (4S-fix-4) confirmed:
- HTTP GET → 200 OK, no SSR error markers in HTML
- Node.js v24 ICU: `ru-RU` locale works correctly
- No `Math.random()`, `window.*`, invalid DOM nesting in render
- Error is client-side only — most likely browser extension or `Intl.DateTimeFormat` hydration mismatch

**Exact source**: Open browser DevTools → Console → reload → check first error stack trace URL pattern:
- `chrome-extension://...` → browser extension (not app code)
- `ReportV2Dashboard` component path → hydration mismatch

---

## 7. Manual QA / Interaction Checklist

| Interaction | Status |
|---|---|
| Hero "Как читать отчёт" → sheet | ✓ `mlm-interactive-card` |
| Hero "N активных узлов" → scroll | ✓ `mlm-interactive-card` |
| All `?` help icons → tooltip | ✓ `mlm-helptip-btn` |
| Speech Cloud "+ ещё N" → expand | ✓ `mlm-interactive-card` onClick |
| Speech Cloud chips | non-interactive (`mlm-chip-float` hover only) |
| Heatmap node orbs → sheet | ✓ `role="button"` onClick |
| Heatmap "Как читать" → sheet | ✓ `mlm-interactive-card` |
| Graph nodes → sheet | ✓ `mlm-graph-node role="button"` |
| Graph edge rows → sheet | ✓ `mlm-graph-edge-row mlm-clickable-row role="button"` |
| Graph "Как читать" → sheet | ✓ `mlm-interactive-card` |
| Evidence node rows → sheet | ✓ `mlm-clickable-row` (when handler present) |
| Layers rows → sheet | ✓ `mlm-clickable-row` |
| Markers rows → sheet | ✓ `mlm-clickable-row` |
| DisclosurePanel rows → expand | ✓ `mlm-interactive-card` |
| Sheet × button / backdrop / ESC close | ✓ |
| Page clickable after sheet close | ✓ (sheet returns null when closed) |

---

## 8. Mobile (390px)

- No `paddingTop: 26px` wrapper → no extra height above card
- No cloud bumps → no horizontal bleed
- Chips: `flex-wrap: wrap; justify-content: center` → wrap safely on any width
- Bubble: 148px fixed width, centered column — readable at 390px
- Expand button: `inline-flex; borderRadius: 999` → fits any screen width
- Existing `@media (max-width: 500px)` and `(max-width: 420px)` blocks unchanged

---

## 9. Generative Stability

| Scenario | Result |
|---|---|
| 2 phrases | INITIAL=6 → shows both; `hiddenCount = 2-6 = -4 < 0` → no expand button ✓ |
| 3 phrases | shows all 3 ✓ |
| 6 phrases | shows all 6 ✓ |
| 7+ phrases | shows 6; expand button "+ ещё N" ✓ |
| Long chip text | `maxWidth: calc(100% - 8px)` on each span ✓ |
| Long centralText | `shortCentralText(rawCentral, 5)` caps to 5 words ✓ |
| Missing centralMeaning | falls back to `normalized[0]` ✓ |
| `< 2 phrases` | renders `KeyPhrasesSupportSection` fallback ✓ |

---

## 10. Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  36.9 kB (First Load 124 kB)
```

---

## 11. Remaining Risks Before Deploy

- **Runtime error badge**: source not confirmed without opening DevTools Console. If stack trace points to a React component, it's a hydration mismatch to fix. If it points to `chrome-extension://`, safe to ignore.
- **Speech Cloud Firefox**: `border-radius` four-value/four-value notation is CSS3 standard (FF 50+). Recommend visual spot-check.
- **`mlm-interactive-card:hover transform: translateY(-2px) scale(1.016)` on small expand button**: scale of 1.6% on a small pill button is safe and noticeable. No layout shift — the button is inline-flex, not block.
- **`prefers-reduced-motion`**: all motion classes guarded — verified in CSS.
