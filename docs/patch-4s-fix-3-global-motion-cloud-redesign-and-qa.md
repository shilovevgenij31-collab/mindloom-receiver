# Patch 4S-fix-3 — Global Motion System + Speech Cloud Redesign + QA Pass

## Goal

Build on 4S-fix-2 to close remaining motion gaps and redesign Speech Cloud as an organic white/ivory cloud with floating phrase chips.

---

## 1. Files Changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — all changes
- `docs/patch-4s-fix-3-global-motion-cloud-redesign-and-qa.md` — this file

---

## 2. Global Motion System

### Already present from 4S-fix-1 / 4S-fix-2 (unchanged)

| Element | Class |
|---|---|
| HelpTip `?` button | `mlm-helptip-btn` |
| Hero scroll chip | `mlm-interactive-card` |
| Hero "Как читать отчёт" | `mlm-interactive-card` |
| DisclosurePanel expand/collapse button | `mlm-interactive-card` |
| Heatmap "Как читать" button | `mlm-interactive-card` |
| Graph "Как читать" button | `mlm-interactive-card` |
| Layers clickable rows | `mlm-clickable-row` |
| Markers clickable rows | `mlm-clickable-row` |
| Heatmap node orbs | `mlm-graph-node` / `mlm-heat-node-fix` CSS |
| Graph nodes | `mlm-graph-node` CSS |
| Graph edge rows | `mlm-graph-edge-row` CSS |

### New in 4S-fix-3

| Element | Class | Notes |
|---|---|---|
| Evidence node clickable rows | `mlm-clickable-row` | Only when `handleNodeOpen` present |
| Speech Cloud expand button | `mlm-interactive-card` | Redesigned button style |
| Speech Cloud phrase chips | `mlm-chip-float` | Subtle float hover, not interactive-button affordance |

---

## 3. Speech Cloud Redesign

### Visual changes

| Property | Before | After |
|---|---|---|
| Border-radius | uniform `VS.r.xl` (28) | organic `28px 32px 26px 30px / 26px 28px 32px 28px` |
| Background | `linear-gradient(160deg, #fffdf8, #fbf5ec)` | `linear-gradient(155deg, #fffefc, #fdfaf5, #fbf6ee)` |
| Blob decorations | 1 centered glow | 3 positioned soft blobs (top-right, bottom-left, center) |
| Central bubble size | 136×136px | 148×148px |
| Central bubble shadow | none | `0 4px 16px rgba(127,104,217,0.11) + ring halos` |
| Chip style | pill, no shadow | pill + subtle box-shadow (floating effect) |
| Chip sizing | 14/12.5/11.5px by rank | 13.5/12/11px by rank |
| Expand button | `background: none; text-decoration: underline` | styled button with purple tint + `mlm-interactive-card` |

### Pointer-events safety

All three new decorative blob divs have `aria-hidden="true"` and `pointerEvents: 'none'`. The outer card container has `overflow: 'hidden'` to contain blobs. Interactive chips and buttons have default `pointer-events: auto`. No stacking issues.

### Generative stability

- `INITIAL = 8` visible phrases unchanged; `hiddenCount` expand logic unchanged
- Organic `border-radius` affects the card border only, not layout; content wraps normally
- Central bubble larger (148px vs 136px) but still centered in flex column; "Главный паттерн" label margin `1.55rem` preserved — no label/bubble overlap
- Phrase chips remain in `flex-wrap` normal flow; no absolute positioning; no clipping

### Mobile

- Cloud card does not have `overflow: hidden` on inner content — chips wrap freely below bubble
- Blob decorations are behind content (`zIndex: 0`) and clipped by the card's `overflow: hidden`
- Expand button centered and accessible on touch

---

## 4. Pointer-Events / Overlay Audit

No changes to overlay structure. All previous audit results from 4S-fix-2 still valid:

- All sheet portals conditional on open state ✓
- Graph dot-grid SVG: `pointerEvents: 'none'` ✓
- Graph edges SVG: `pointerEvents: 'none'` + `aria-hidden` ✓
- Heatmap grain/connection SVGs: `pointerEvents: 'none'` ✓
- New Speech Cloud blob divs: `pointerEvents: 'none'` + `aria-hidden` ✓
- No invisible full-page overlay ✓

---

## 5. Mobile / Responsive Audit

No new mobile regressions introduced:

- Speech Cloud: organic border-radius is CSS-only, doesn't affect layout. Chips flex-wrap works on all widths.
- Evidence rows: `mlm-clickable-row` only adds hover CSS — no layout change on touch.
- Chip hover CSS (`mlm-chip-float:hover`) is purely cosmetic — no layout shift, `translateY(-1px)` won't cause overflow since cards have space.
- Existing `@media (max-width: 500px)` and `@media (max-width: 420px)` blocks unchanged.

---

## 6. Generative Stability Audit

| Scenario | Status |
|---|---|
| 0 active nodes | EvidenceLayerSectionExact returns null ✓ |
| Evidence rows with no handler | `className={handleNodeOpen ? 'mlm-clickable-row' : undefined}` — no class applied ✓ |
| 1 speech phrase | Falls back to `KeyPhrasesSupportSection` (< 2 phrases threshold) ✓ |
| 0 hidden phrases | Expand button not rendered (`hiddenCount <= 0`) ✓ |
| Long central phrase | `shortCentralText(rawCentral, 5)` caps to 5 words ✓ |
| 8+ chips | INITIAL=8 limit unchanged ✓ |
| Long chip text | `maxWidth: 'calc(100% - 8px)'` on each chip ✓ |

---

## 7. Manual QA / QI Checklist

### Clicks
- [ ] Hero "Как читать отчёт" → opens sheet
- [ ] Hero "N активных узлов" → smooth scroll
- [ ] All help icons (?) → tooltip opens/closes
- [ ] Speech Cloud "+ ещё N" → expands phrases
- [ ] Speech Cloud chips → no unexpected click behavior (non-interactive)
- [ ] Heatmap node orbs → scale hover + click opens sheet
- [ ] Heatmap "Как читать" → opens sheet
- [ ] Graph nodes → scale hover + click opens sheet
- [ ] Graph edge lines → click opens sheet
- [ ] Graph edge rows → warm hover + click opens sheet
- [ ] Graph "Как читать" → opens sheet
- [ ] Evidence node rows → warm hover + click opens sheet
- [ ] Layers rows → warm hover + click opens sheet
- [ ] Markers rows → warm hover + click opens sheet
- [ ] DisclosurePanel rows (Показать цитаты, Показать ещё, etc.) → hover + expand works

### Sheets
- [ ] Open / close by × button
- [ ] Close by backdrop click
- [ ] Close by ESC
- [ ] Page remains interactive after sheet close

### Motion
- [ ] `mlm-interactive-card`: lift on hover, squeeze on active, focus ring
- [ ] `mlm-clickable-row`: warm background on hover, focus ring
- [ ] `mlm-chip-float`: subtle translateY(-1px) on hover
- [ ] Speech Cloud expand button: lift + color on hover
- [ ] Heatmap nodes: scale 1.055 on hover, animation pauses
- [ ] Graph nodes: scale 1.055 on hover
- [ ] Graph edge rows: warm background on hover
- [ ] No layout shift on any hover
- [ ] No jank, no aggressive animation

### Speech Cloud visual
- [ ] Looks like a cloud (organic border-radius, soft blob background)
- [ ] Central bubble prominent, "Главный паттерн" label clearly above it (no overlap)
- [ ] Chips look elevated/floating (subtle shadows)
- [ ] Semantic colors on chips (red, yellow, green, blue, purple)
- [ ] "+ ещё N" button has purple tint, visible interaction feedback
- [ ] After expansion, all chips visible in flex wrap

### Mobile (390px)
- [ ] No horizontal overflow
- [ ] Speech Cloud chips wrap below bubble
- [ ] Central bubble readable
- [ ] Help icons stay on heading line
- [ ] Heatmap/graph usable

### Runtime
- [ ] No new JS errors in dev console
- [ ] "1 error" toast, if present, is Next.js dev overlay (external) — not component error

---

## 8. Reduced Motion

`@media (prefers-reduced-motion: reduce)` now disables:
- All heat node animations ✓ (from 4S-fix-1)
- All graph node/edge transitions ✓ (from 4S-fix-1)
- `.mlm-interactive-card` transitions ✓ (from 4S-fix-2)
- `.mlm-clickable-row` transitions ✓ (from 4S-fix-2)
- `.mlm-helptip-btn` transitions ✓ (from 4S-fix-2)
- `.mlm-chip-float` transitions ✓ (new in 4S-fix-3)

---

## 9. Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  36.9 kB (First Load 124 kB)
```

---

## 10. Risks / What Still Needs Manual Review

- **Speech Cloud organic shape on Firefox**: CSS `border-radius` shorthand with `/` notation (four-value / four-value) is standard CSS3, supported since Firefox 50+. Visual test on Firefox recommended.
- **Speech Cloud blob containment**: Three absolute blob divs are clipped by `overflow: hidden` on the card. Verify no visible artefacts at card edges on mobile.
- **Speech Cloud central bubble size increase** (136 → 148px): The "Главный паттерн" label spacing is preserved (`margin-bottom: 1.55rem`). Verify no overlap on short central phrases that would push the bubble top.
- **Evidence rows motion**: The new `mlm-clickable-row` on evidence rows changes background on hover. Verify it doesn't conflict with the `SharedPanel` background behind the rows.
- **Practices section**: `PracticesSectionExact` practice cards are not interactive (no click handlers) — correctly have no motion class applied. If a future spec adds click-to-sheet on practices, add `mlm-interactive-card` then.
