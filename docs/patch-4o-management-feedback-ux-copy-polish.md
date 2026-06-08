# Patch 4O — Management Feedback UX/Copy Polish

## Goal

Make the report more understandable for a regular user after management feedback:
1. Reduce duplication in the upper section
2. Add explanations for "why this block exists"
3. Address the user directly: "ваш паттерн", "ваша система", "в вашей речи"
4. Remove technical/redundant elements
5. Fix popover/HelpTip overflow on mobile
6. Remove false click affordances (arrows that led nowhere)
7. Keep current Lovable-style visual language

## Files Changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — all UX/copy changes
- `docs/patch-4o-management-feedback-ux-copy-polish.md` — this file

---

## Changes by Section

### Hero

- Added "Ключевой паттерн" eyebrow label above the main h1 title with a HelpTip explanation
- Removed the "тип / transcript" tile from the metrics row (was confusing, user doesn't understand what "тип" means)
- Removed "активных узлов" + "тип" vertical tile column — replaced with a compact inline count
- Removed language chip (only participant name + date remain)
- Moved the overheat metric out of Hero into its own OverheatTile section below Hero
- Fixed top-right corner artifact: reduced gradient blob size, added `transform: translateZ(0)` for proper compositing
- "отчёт" indicator moved inline in the top bar (no longer floating absolute over rounded corner)
- Added "Как читать отчёт" trigger button that opens a HowToRead bottom sheet

### Overheat Tile (new)

- New dedicated section between Hero and Snapshot
- Shows: "Главный перегрев" label, zone name, percent score, progress bar, explanation
- Clear HelpTip: "Перегрев — это условная сила проявления паттерна в вашем материале. Это не медицинская оценка и не диагноз..."
- Falls back gracefully to active_nodes / heatmap data if snapshot.main_overheat is absent
- Returns null if no overheat data available at all

### Snapshot ("Главное за 30 секунд" → "Что это значит для вас")

- Removed key_pattern block (now in Hero eyebrow)
- Removed main_overheat block (now in OverheatTile)
- Changed eyebrow from "Сводка" to "Как это проявляется"
- Changed title from "Главное за 30 секунд" to "Что это значит для вас"
- Renamed signals label from "Сигналы" to "Как это проявляется"
- Changed "Первый шаг" label to "Ваш первый шаг"
- Added explanatory footnote under first_step: "Этот шаг нужен не чтобы сразу всё исправить, а чтобы поймать момент, где паттерн включается автоматически."
- Section returns null if no signals and no first_step (avoids empty section)

### HowToRead (moved from main flow to sheet)

- HowToReadSectionExact no longer renders in the main report flow
- "Как читать отчёт" button in Hero triggers a bottom sheet (HowToReadSheet)
- Sheet uses same ESC/backdrop-close pattern as ReportDetailSheet
- Sheet includes an intro: "Отчёт не нужно читать как диагноз. Его лучше читать как карту..."
- Falls back to built-in steps via buildHowToReadFallback

### GrowthBlocker

- Eyebrow changed from "Блок роста" to "Где система застревает"
- Help text updated: now explains why the pattern repeats (anxiety reduction, hidden gain, cost)
- "Куда хочет система" → "Куда хочет ваша система"

### ProtectedNeed

- Section help text updated to mention "ваша внутренняя система"
- "Ведущая потребность" → "Ваша ведущая потребность"
- TagGroup label changes:
  - "Названо" → "Что слышно в вашей речи"
  - "Стратегия добывает" → "Что даёт эта стратегия"
  - "Приносится в жертву" → "Чем вы за это платите"
- Same changes applied to legacy ProtectedNeedSection (non-Exact version)

### PhraseMicroscope

- Removed the `→` arrow at the end of each fragment row (was falsely suggesting interactivity)
- Fragment rows now have distinct tinted backgrounds per row (coral/purple/amber) instead of flat dividers
- Rows use `alignItems: 'flex-start'` instead of center — better for multi-line text

### HonestTranslation

- Section title changed: fallback "Как сказано / Как честно" → "Что стоит за привычными формулировками"
- Section eyebrow: "Перевод" → "Что за словами"
- Card label "Как" → "Фраза"
- Card label "Честно" → "Что на самом деле"
- Help text updated to be more user-friendly

### KeyPhrases

- Eyebrow changed: "Речевые маркеры" → "Речевые маркеры паттерна"
- Title changed: "Ключевые фразы" → "Что слышно в вашей речи"
- Added intro text explaining the purpose of phrases
- Chips replaced with slightly more angular (borderRadius: 8) style instead of pill (borderRadius: 999)

### HelpTip (global fix)

- Tooltip now anchored to `right: 0` instead of `left: 50%, transform: -50%`
- This prevents right-edge overflow on mobile (tooltip no longer escapes the right side of screen)
- Width increased: `min(220px, ...)` → `min(260px, calc(100vw - 32px))`
- Added `wordBreak: 'normal', overflowWrap: 'break-word'`
- z-index raised from 30 to 40

### Heatmap

- Added instruction text below section title: "Нажмите на зону, чтобы увидеть, почему она активна..."
- Help text updated: mentions "вашего паттерна" and clarifies it's not a medical assessment
- Eyebrow simplified: "Тепловая карта узлов" → "Тепловая карта"
- Title simplified: "Карта активности нейронных зон" → "Карта активности"

### NodeGraph

- Added instruction text below section title: "Нажмите на узел или связь, чтобы увидеть подробное объяснение."
- Help text updated: explains nodes, arrows, line weight, spatial layout

### Evidence ("На чём основан отчёт")

- Added "Ключевые узлы" subheading above the visible nodes list
- Added "Почему мы так думаем" subheading above the visible hypotheses

### Markers ("Что отслеживать")

- Removed the MLIcon (check/eye) from left side — it conflicted visually with the number on the right
- Numbers are now on the LEFT in a small numbered badge (color-coded green/blue)
- Number removed from right side (was redundant with icon)
- Click only opens sheet if there is genuinely new content (shift_signal or description present)

---

## What Was NOT Changed

- Schema, normalizer, prompts, repair prompt
- API, DB, auth, Docker, Traefik, deploy config
- Legacy renderer (ReportStructured)
- Admin UI
- Route branching (v2 vs legacy)
- Overall 16-section order (HowToRead is now a sheet, not removed from data flow)
- Heatmap visual design (canvas, orbs, hex texture)
- Graph visual design (nodes, edges, SVG rendering)
- Trajectory section
- Practices section
- Disclaimer/Footer
- ReportDetailSheet (heatmap/graph/evidence/layer sheets unchanged)
- All existing CSS media queries

---

## Build / TypeScript

- `npx tsc --noEmit` → clean (no output) ✅
- `npm run build` → clean, 11 pages, `/r/[publicToken]` 29.7 kB ✅
  (grew from 28.5 kB by ~1.2 kB due to OverheatTile + HowToReadSheet components)

---

## Visual QA Checklist (manual before deploy)

- [ ] Hero has "Ключевой паттерн" label above h1
- [ ] Hero no longer shows "тип" or language chip
- [ ] Hero "Как читать отчёт" button opens bottom sheet with 4 steps + intro
- [ ] OverheatTile appears between Hero and Snapshot with zone name, %, bar, explanation
- [ ] OverheatTile HelpTip explains "не медицинская оценка"
- [ ] Snapshot no longer shows key_pattern or overheat (shows only signals + first step)
- [ ] Snapshot first step has explanatory footnote
- [ ] HowToRead NOT visible as a standalone section in the main flow
- [ ] GrowthBlocker eyebrow reads "ГДЕ СИСТЕМА ЗАСТРЕВАЕТ" → "Где система застревает"
- [ ] ProtectedNeed TagGroups: "Что слышно в вашей речи" / "Что даёт эта стратегия" / "Чем вы за это платите"
- [ ] HonestTranslation: "Фраза" / "Что на самом деле" labels visible
- [ ] KeyPhrases: intro text visible above chips; chips are slightly angular (not pill)
- [ ] PhraseMicroscope: no → arrows; rows have colored backgrounds
- [ ] HelpTip tooltip does NOT overflow right edge on 390px mobile
- [ ] Heatmap: instruction "Нажмите на зону..." visible above canvas
- [ ] NodeGraph: instruction "Нажмите на узел или связь..." visible above graph
- [ ] Evidence: "Ключевые узлы" subheading visible above node list
- [ ] Evidence: "Почему мы так думаем" subheading visible above hypothesis card
- [ ] Markers: numbered badge on LEFT (green/blue), no MLIcon check/eye on left
- [ ] No undefined/null/NaN anywhere in the report
- [ ] No horizontal overflow at 390px viewport width
- [ ] Heatmap node click still works → opens detail sheet
- [ ] Graph node/edge click still works → opens detail sheet
- [ ] Evidence node click still works → opens detail sheet
- [ ] Layers click still works → opens detail sheet
- [ ] ESC closes HowToRead sheet
- [ ] Backdrop click closes HowToRead sheet
- [ ] All other sections visually unchanged (Trajectory, Practices, Disclaimer)

---

## TODOs for Future Patches

1. **Word cloud for KeyPhrases** — explore visual word cloud with a central meaning phrase (e.g. "значимость = полезность") instead of simple chips
2. **Richer graph layout** — research open-source graph visualization library (e.g. Sigma.js, Cytoscape.js) for more semantic positioning
3. **Visual icons/illustrations for Practices** — small per-practice icons (diary, delegation map, phrase release) matching practice tone/title
4. **Richer onboarding** — possible multi-step onboarding animation for first-time report visitors
5. **Node graph legend** — consider making legend items clickable to highlight corresponding edges in SVG
