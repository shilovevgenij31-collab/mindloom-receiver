# Patch 4B — Mobile-first Public Report

## Direction

The public v2 report was restructured from a wide desktop dashboard into a **mobile-first, single-column narrative report**.

**Mobile-first** here means: the report is designed as a mobile product first. On desktop it renders centered in a ~560px shell — no wide grids, no sidebar, no desktop-specific layout.

The report maintains full neuropsychological depth: patterns, nodes, protection mechanisms, speech analysis, layers, practices. The structure is just more readable in sequential mobile form.

## Desktop behaviour

On desktop, the page.tsx outer container is `maxWidth: 560px, margin: 0 auto`. The report content centers naturally, looks like a premium mobile report displayed in a browser frame. No special desktop-only CSS is needed.

## Section order (Patch 4B)

1. Hero
2. Snapshot — Главное за 30 секунд (Patch 4A field)
3. How to read — Как пользоваться отчётом (Patch 4A field)
4. Что блокирует рост (target + mechanism + desired_state)
5. Protected need — Потребность под защитой (Patch 4A field)
6. Phrase microscope — Фраза под микроскопом (Patch 4A field)
7. Honest translation — Как сказано / Как честно (Patch 4A field)
8. Heatmap — Тепловая карта (extended with scale/callouts/why_it_matters)
9. Node graph — Граф связей (extended with legend/how_to_read/edge type+explanation)
10. Trajectory — Цикл воспроизведения
11. Layers — Слои обработки
12. Markers — Что отслеживать
13. Practices — Что делать
14. Feedback — only if `feedback_config.enabled === true`
15. Disclaimer

## New Patch 4A fields now rendered

| Field | Section | Notes |
|---|---|---|
| `snapshot` | §2 | key_pattern as large card, three_signals as numbered list, main_overheat + first_step as bento 2-col |
| `how_to_read` | §3 | Numbered vertical stepper |
| `protected_need` | §5 | leading_need, named/strategy_gets/sacrificed as tag groups, interpretation as callout |
| `phrase_microscope` | §6 | Big quote card, fragment breakdown rows, summary callout |
| `honest_translation` | §7 | Before/after grid per item, explanation below |
| `heatmap.title/description` | §8 | Shown above visualization |
| `heatmap.scale[]` | §8 | How-to-read scale legend above visualization |
| `heatmap.callouts[]` | §8 | Callout cards below zone list |
| `heatmap.zones[].why_it_matters` | §8 | Italic note inside each zone card |
| `node_graph.title/description` | §9 | Shown above visualization |
| `node_graph.central_node_id` | §9 | Central node gets ring/glow highlight in SVG graph |
| `node_graph.legend[]` | §9 | Edge type legend below graph |
| `node_graph.how_to_read[]` | §9 | How-to-read cards below legend |
| `node_graph.edges[].type` | §9 | Chip on each edge row (hard/normal/soft/choice_available/choice_blocked) |
| `node_graph.edges[].explanation` | §9 | Italic text in edge card |
| `node_graph.nodes[].description` | §9 | Passed to graph node title |

## Backward compatibility

Old v2 payloads without Patch 4A fields: all new sections (`snapshot`, `how_to_read`, etc.) check for null and simply don't render. No crash, no empty placeholder. The existing sections (heatmap, graph, trajectory, layers, markers, practices) render as before.

## Tooltips / help explanations

`HelpTip` component: small `?` circle that toggles a dark popover on tap/click. Used on:
- Heatmap section title
- Node graph section title
- Layers section title
- Growth blocker section title (центральный узел)

## Hero title logic

If `snapshot.key_pattern` is present → used as `<h1>` title (overrides `hero.title`).  
If `snapshot.short_explanation` is present → used as subtitle (overrides `hero.main_insight`).

## Phrase microscope fallback

If `phrase_microscope` is null but `speech_layer.key_phrases` has items → renders a compact "Ключевые фразы" chip row instead.

## Graph/heatmap final redesign deferred

The visualization panels (thermal blob heatmap, SVG node graph) are **not** fully redesigned in Patch 4B. They are adapted into the mobile shell and enriched with new explanatory elements, but the visual redesign is deferred:
- Heatmap visual redesign → **Patch 4E**
- Node graph visual redesign → **Patch 4D**

## No diary/session/dynamics

No diary, no sessions, no dynamics, no user accounts — not added in Patch 4B.

## Legacy renderer untouched

`page.tsx` legacy path (`ReportStructured`, v1/rich/fixed_blocks renderer) is unchanged. The `pageMaxWidth: 720` for legacy reports is unchanged.

## Files changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — full rewrite, mobile-first
- `app/r/[publicToken]/page.tsx` — `pageMaxWidth` for v2 changed from `1280` to `560`
- `docs/patch-4b-mobile-first-report.md` — this file

## What to visually test

1. Open a v2 extended report (with `snapshot`, `phrase_microscope`, etc.) — all new sections should render
2. Open an old v2 report (without new fields) — no crash, no empty sections
3. Open a v1/rich/fixed_blocks report — legacy renderer unchanged
4. Mobile 390px viewport — no horizontal overflow, no tiny text
5. Desktop — report centered at ~560px, not stretched to full width
6. Tap `?` tooltip — popover appears, tap again to close
7. Heatmap: zone cards show `why_it_matters` if present
8. Node graph: edge cards show type chip + explanation if present
9. `feedback_config.enabled: false` — feedback section not shown

## Patch 4C suggestion

Add active_nodes evidence section (condensed) and hypothesis_table back into the new mobile layout, possibly merged into a "Supporting Evidence" section after the node graph.
