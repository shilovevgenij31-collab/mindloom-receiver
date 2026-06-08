# Patch 4B-fix — True Mobile Narrative Redesign

## Problem

Patch 4B changed the max-width to 560px but did not change the content architecture. The result was a desktop dashboard compressed into a narrow column: endless identical white cards, no visual rhythm, no narrative hierarchy.

## What Changed

### 1. Section gap

Article `gap` increased from `0.75rem` to `1.4rem`. Sections now feel like distinct narrative chapters rather than a single stream.

### 2. GrowthBlockerSection — full restructure

Before: 7–8 sequential `LBlock` cards (Что мешает расти / Центральный узел / Основная боль / Защитная логика / Скрытая выгода / Ощущаемая угроза / Цена / Явный запрос / Скрытый запрос / Будущее состояние).

After: 3 distinct visual blocks:
1. **Primary blocker** — large purple card with `growth_blocker` + `short_explanation`
2. **2-col row** — `central_knot` (amber) + `core_pain` (pink) side by side if both present
3. **Mechanism callout** — `protective_logic` as prose + `hidden_gain` / `perceived_threat` as inline pills
4. **Desired state** — green card with `explicit_request` + hidden/future as soft notes below

### 3. Heatmap zone cards — limited to top 4

`NeuroHeatmap` now accepts `displayLimit` prop (default 4). Only the top 4 zones by intensity are shown as full cards. Remaining zones appear as a compact chip row: "Также в карте: …".

### 4. Node graph edge cards — limited to top 4

`NeuroNodeGraph` now accepts `edgeLimit` prop (default 4). Edges are sorted by `strength` descending. Only the strongest 4 are shown as cards. Remaining count shown as "Ещё N связей в графе."

### 5. Layers — top 3 by intensity + summary

`LayersSection` sorts by intensity, shows top 3. Remaining layers appear as: "Также обнаружено N слоёв: название1, название2."

### 6. Markers — top 4 + summary

`MarkersSection` shows top 4 transformation markers. Remaining shown as: "Также отслеживать: marker1, marker2."

### 7. Practices — top 3 + summary

`PracticesSection` shows top 3 recommended practices. Remaining shown as: "Также рекомендовано: title1, title2."

### 8. HonestTranslation — top 3 items

`HonestTranslationSection` limits to first 3 items. With 2–3 items the before/after grid stays compact and readable.

### 9. NodeGraphSection legend — compact chips

Legend entries are now inline chips in a flex-wrap row instead of a column of text rows. Max 5 entries shown.

### 10. NodeGraphSection how_to_read — limited to 2 entries

Only the first 2 `how_to_read` items are shown to avoid over-explaining.

## What Was NOT Changed

- Schema, prompt, repair prompt, normalizer, API, DB
- Legacy renderer (`ReportStructured`, v1/rich/fixed_blocks)
- `page.tsx` routing and maxWidth (560px stays)
- Hero, Snapshot, HowToRead, ProtectedNeed, PhraseMicroscope sections — no changes
- Trajectory section — no changes
- The heatmap / graph visual panels themselves (full redesign deferred: Patch 4D/4E)
- All existing `HelpTip` tooltips
- All Patch 4A fields still rendered

## Volume control summary

| Section | Before | After |
|---|---|---|
| GrowthBlocker | 7–10 LBlock cards | 3 semantic blocks |
| Heatmap zones | all N cards | top 4 + chips |
| Graph edges | up to 8 cards | top 4 by strength |
| Layers | all N cards | top 3 by intensity |
| Markers | all N cards | top 4 |
| Practices | all N cards | top 3 |
| HonestTranslation | all N items | top 3 |

## Backward compatibility

All changes are runtime-safe. Sections still check null before rendering. Old v2 payloads without Patch 4A fields render correctly. Legacy v1/rich/fixed_blocks renderer is untouched.

## Files changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — 12 targeted edits
- `docs/patch-4b-fix-mobile-narrative.md` — this file

## Visual test checklist

1. Open v2 extended report — GrowthBlocker shows 3 clean blocks, not 10 cards
2. Heatmap section — max 4 zone cards visible, rest as chips below
3. Graph section — max 4 edge cards visible, rest as count note
4. Layers section — max 3 cards, rest as text note
5. Markers section — max 4 cards, rest as text note
6. Practices section — max 3 cards, rest as text note
7. HonestTranslation — max 3 items
8. Section gaps feel like distinct chapters, not a continuous stream
9. Mobile 390px — no horizontal overflow
10. Desktop — centered at ~560px, no wide dashboard
11. Old v2 payload (no Patch 4A fields) — no crash, no empty sections
12. Legacy v1 report — unchanged

## Patch 4C suggestion

Add `active_nodes` evidence section (condensed) and `hypothesis_table` back in new mobile layout as a compact "Доказательная база" section after the Node Graph.
