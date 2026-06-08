# Patch 4C — Evidence Layer / "Доказательная база"

## What Was Added

A new section **"Доказательная база"** (eyebrow: "Почему Mindloom так считает") is rendered at position 10, between the Node Graph and the Trajectory section.

## Where It Appears

Section order after Patch 4C:

| # | Section |
|---|---------|
| 1 | Hero |
| 2 | Snapshot |
| 3 | Как читать отчёт |
| 4 | Что блокирует рост |
| 5 | Потребность под защитой |
| 6 | Фраза под микроскопом |
| 7 | Как сказано / Как честно |
| 8 | Карта активности |
| 9 | Граф причинно-следственных связей |
| **10** | **Доказательная база** ← NEW |
| 11 | Цикл воспроизведения |
| 12 | Слои обработки |
| 13 | Что отслеживать |
| 14 | Что делать |
| 15 | Disclaimer |

## Fields Used

| Field | Used for |
|-------|---------|
| `active_nodes[].label` | Node card title |
| `active_nodes[].type` | Short chip (e.g. "Защита", "Убеждение") |
| `active_nodes[].intensity` | Bar + percentage |
| `active_nodes[].color` | Left border color on card |
| `active_nodes[].description` | Prose explanation below bar |
| `active_nodes[].evidence[]` | QuoteRow items (max 2 per node) |
| `active_nodes[].id` | Map key for hypothesis lookup |
| `hypothesis_table[].hypothesis` | Main hypothesis text |
| `hypothesis_table[].confidence` | Confidence percentage |
| `hypothesis_table[].node_id` | Resolved to node label via active_nodes map |
| `hypothesis_table[].evidence[]` | QuoteRow items (max 1 per hypothesis) |
| `speech_layer.key_phrases[]` | Count shown in summary strip |
| `node_graph.central_node_id` | If matches an active node, named in graph callout |

## Structure Inside the Section

1. **Summary strip** — purple card with 3 counters (nodes / hypotheses / речевые признаки). Only shows counts that are > 0.
2. **Ключевые узлы** — top 4 active nodes by intensity (pre-sorted in parent). Each card: numbered badge + label + type chip + intensity bar + description + up to 2 evidence quotes.
3. **Аналитические гипотезы** — top 3 hypotheses by confidence. Each: amber left-border callout with hypothesis text + related node chip (if resolved) + confidence % + 1 evidence quote.
4. **Как это связано с графом** — static amber callout explaining the relationship between active nodes and the graph. If `central_node_id` matches an active node, names it by label.

## Why Mobile Explainability, Not a Table

The old "Доказательная база" was a desktop table listing nodes in rows with confidence columns. This section instead:

- Uses narrative order: summary → nodes → hypotheses → graph connection
- Limits to top 4 nodes and top 3 hypotheses to avoid card-list fatigue
- Each node card tells its own story (description + evidence quotes)
- Hypotheses are callout-style blocks, not data rows
- No table, no grid, no horizontal scroll

## Volume Control

| Data | Shown |
|------|-------|
| active_nodes | top 4 by intensity |
| hypothesis_table | top 3 by confidence |
| evidence per node | max 2 QuoteRows |
| evidence per hypothesis | max 1 QuoteRow |

## Empty States

- `active_nodes` empty AND `hypothesis_table` empty → section not rendered
- Only `active_nodes` present → section renders nodes + graph callout, no hypothesis block
- Only `hypothesis_table` present → section renders hypotheses + graph callout, no nodes block
- Old v2 payload without Patch 4A/4C fields → no crash, section hidden

## What Was NOT Changed

- Schema, prompt, repair prompt, normalizer, API, DB
- Legacy renderer (v1/rich/fixed_blocks)
- `page.tsx` routing and maxWidth
- All existing sections, HelpTip tooltips, Patch 4A fields
- Heatmap / graph visual panels (full redesign still deferred: Patch 4D/4E)

## New Helper Function

`nodeTypeLabel(type?: string): string` — converts internal node type keys to short Russian labels for chips (e.g. `"defense"` → `"Защита"`, `"core_belief"` → `"Убеждение"`).

## Files Changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — `nodeTypeLabel` helper + `EvidenceLayerSection` component + section call at position 10
- `docs/patch-4c-evidence-layer.md` — this file

## Patch 4D Suggestion

Full SVG node graph visual redesign: improved node layout algorithm, better edge routing, central node emphasis, mobile-friendly touch interactions. The current graph panel is still the Patch 4B visualization.
