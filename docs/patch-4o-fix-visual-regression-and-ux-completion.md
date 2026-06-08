# Patch 4O-fix — Visual Regression Fix & UX Completion

**File:** `app/r/[publicToken]/ReportV2Dashboard.tsx`  
**Build:** ✅ clean (`npm run build`, `tsc --noEmit`)  
**Bundle delta:** `/r/[publicToken]` 29.7 kB → 30.3 kB

---

## Summary

Patch 4O introduced UX improvements (new labels, sections, HelpTips, buttons) but caused visual degradation. This patch preserves all logic changes from 4O and fixes the regressions.

---

## Changes

### 1. HelpTip — portal-based overlay (CRITICAL)

**Problem:** Tooltip was clipped by `overflow: hidden` + `transform: translateZ(0)` in HeroSection. The `transform` creates a new stacking context, making `position: fixed` children still constrained within the ancestor.

**Fix:** `createPortal(overlay, document.body)` renders the tooltip outside the React tree's DOM position entirely. Overlay is a dark bottom sheet (fixed, `zIndex: 9999`) with a backdrop click-to-dismiss layer and an `×` close button. Keyboard `Escape` also closes.

**New import added:**
```tsx
import { createPortal } from 'react-dom';
```

---

### 2. SectionShell — optional `id` prop

Added `id?: string` prop to `SectionShell` so sections can receive anchor IDs for scroll navigation.

---

### 3. Evidence section — scroll anchor

Evidence section gets `id="mlm-evidence-section"` for the Hero chip to scroll to.

---

### 4. Hero "активных узлов" chip — interactive

Changed from a decorative `<div>` to a `<button>` that scrolls smoothly to `#mlm-evidence-section` on click.

---

### 5. OverheatTile — softened visuals

Reduced aggressiveness of the red color scheme:
- Background: `#fff5f2 → #ffeee9` (was `#fff0ec → #ffe4dc`)
- Border opacity: `0.18` (was `0.28`)
- Number color: `#d9695d` at 34px (was `#e46f61` at 38px)
- Bar gradient: `#f0b0a4 → #d9695d`

---

### 6. SnapshotSectionExact — label fix

`Как это проявляется` → `Три ключевых сигнала`

---

### 7. TagGroup — long text handling

Added detection: if any item is longer than 22 characters, switch from round chips to a column list with bullet dots. Prevents text like "Мне нужно постоянно доказывать свою ценность" from being jammed into a round chip.

---

### 8. KeyPhrasesSupportSection — centralMeaning strip

Added `centralMeaning?: string | null` prop. When present, renders a purple-tinted box at the top labeled "Главный речевой паттерн". Render call passes `phraseMicroscopeData?.summary ?? report.hero.title ?? null`.

---

### 9. Heatmap focus callout — removed non-functional button

Removed the `Подробнее →` span from `HeatmapCanvasFirst`. The component has no `onFocusClick` prop and the button had no handler. Now the callout is a clean single-row info strip with a leaf icon.

---

### 10. GrowthBlockerSectionExact — label fix

`Что человек хочет` → `Куда стремится ваша система` (per requirement: use "вы/ваша система", not "человек").

---

### 11. LayersSectionExact — conditional sheet clickability

Layers now only open a detail sheet if there is genuinely extra content beyond what's shown inline:
- `manifestation` that differs from `description` and the inline quote
- Additional evidence items (beyond the first)
- `description` that differs from the inline quote

Sheet content is enriched: `explanation` shows manifestation with "Проявление:" prefix, `evidence` array shows additional evidence quotes.

---

### 12. NodeGraph readRows — no raw IDs in titles

Changed edge title fallback from `edge.from ?? 'Узел'` to `from?.displayLabel ?? from?.label ?? 'Узел'`. Raw node ID strings no longer appear as edge titles when `displayLabel` is unavailable.

---

## What was NOT changed

- Backend, API routes, DB schema, auth middleware
- Normalizer / prompts
- Legacy renderer (`ReportRenderer`)
- Any deployment config (Docker, Vercel, env)
- Report saving logic
