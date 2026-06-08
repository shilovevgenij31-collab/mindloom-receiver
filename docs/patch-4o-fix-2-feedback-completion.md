# Patch 4O-fix-2 — Visual Regression Fix & UX Completion (Phase 2)

**File:** `app/r/[publicToken]/ReportV2Dashboard.tsx`  
**Build:** ✅ clean (`npm run build`, `tsc --noEmit`)  
**Bundle delta:** `/r/[publicToken]` 30.3 kB → 31.4 kB

---

## Summary

Continued UX and visual polish after Patch 4O-fix. Addresses remaining items from the feedback spec: Evidence inline disclosure, KeyPhrases word-cloud layout, and global visual softening.

---

## Changes

### 1. SectionHead — HelpTip inline (no wrap)

`h2` uses `flexWrap: 'nowrap'` + title in `<span style={{ flex: '1 1 auto' }}>` so the `?` button never wraps to a new line regardless of title length.

---

### 2. Hero — unified button styles + softened visuals

- "активных узлов" chip unified with the "Как читать отчёт" button (same padding, radius)
- Name + date moved to plain text under the buttons (`fontSize: 10, color: '#a09690'`) — no chip borders
- Hero gradient softened: `#fffef9 → #fbf6ed → #f5f0e8` (pure warm ivory, no purple tinge)
- Decorative blob overlays reduced to 12% opacity from 18–20%
- `h1` font size reduced from `clamp(28px, 8vw, 38px)` to `clamp(26px, 7.5vw, 36px)`, weight 760 → 720
- "Ключевой паттерн" eyebrow: weight 760 → 700, color `#a8392c` → `#9a6c5e` (muted warm brown)
- `accentHeroTitle` gradient: `#e46f61 → #c0463a` → `#c9655a → #a84038` (less vivid)

---

### 3. Overheat — clearer percent explanation

Added inline annotation after the percent display:  
`"— условная сила проявления в вашем материале"` (11px muted text)

HelpTip updated: now explains this is not a diagnosis, percent = how actively the pattern manifested.

---

### 4. HonestTranslation — deduplication

`explanation` only shown if it differs from `more_honest` (both strict equality and case-insensitive comparison).

---

### 5. Heatmap — HeatmapInfoSheet with trigger button

- Insight rows and scale moved out of inline canvas to a new `HeatmapInfoSheet` bottom sheet component
- Canvas bottom strip: focus callout text + "? Как читать" trigger button
- `HeatmapSection` manages `infoOpen` state, renders sheet conditionally

---

### 6. NodeGraph — compact "Ключевые связи"

Replaced full "Как читать карту" rows with a compact panel showing max 3 edge rows.  
Each row: edge-type indicator line (solid/dashed) + title + truncated description.  
Remaining edges in `DisclosurePanel "Показать все N связей"`.

---

### 7. Layers — richer sheet with semantic fallbacks

Sheet always opens if `onOpen` is provided. Falls back to semantic text based on layer name:
- Contains "потреб/need/unmet" → unmet needs explanation
- Contains "защит/defense/protec" → defense mechanism explanation
- Contains "трав/wound/pain" → wound/pain layer explanation
- Contains "ресурс/resourc" → resource/strength explanation
- Default → activation pattern explanation

---

### 8. Markers — cleaner rows + richer sheet

Row shows only title + truncated `shift_signal` (80 chars max).  
Row only clickable when `description` or `shift_signal` is present.  
Sheet includes description + shift signal with "Признак сдвига" label + generic advisory text.

---

### 9. Evidence — inline quote disclosure

- First quote shown inline per node card
- Remaining quotes in `DisclosurePanel "Показать цитаты (N)"` inside the card
- Added counter label "Показаны самые активные из N" when `activeNodes.length > 4`

---

### 10. KeyPhrases — word-cloud visual hierarchy

Removed hardcoded descriptive paragraph.  
Phrases now render with varying visual weight:
- Index 0: `fontSize: 14, fontWeight: 680, opacity: 1`
- Index 1: `fontSize: 13, fontWeight: 630, opacity: 0.97`
- Index 2: `fontSize: 12, fontWeight: 580, opacity: 0.92`
- Index 3+: `fontSize: 11, fontWeight: 520, opacity: 0.78`

First 3 phrases use slightly deeper background (`#eeebff` vs `#f4f2ff`).

---

### 11. Global visual — soften typography + surface system

- Hero gradient: pure warm ivory, no purple tinge at end
- Hero box shadow: `0 18px 50px` → `0 12px 40px`, opacity 0.07 → 0.06
- Hero border: 0.14 → 0.11 opacity
- Hero blobs: 18–20% → 12% opacity, slightly more blur
- `h1` font weight 760 → 720, size slightly reduced
- "Ключевой паттерн" eyebrow: warm brown muted tone instead of vivid red
- `accentHeroTitle` gradient: less saturated warm red

---

## What was NOT changed

- Backend, API routes, DB schema, auth middleware
- Normalizer / prompts
- Legacy renderer (`ReportStructured`, `ReportV2`)
- Any deployment config (Docker, Vercel, env)
- Report saving logic
- Any existing data flow or route branching
