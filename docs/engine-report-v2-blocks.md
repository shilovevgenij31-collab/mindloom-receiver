# Engine Report V2 Blocks

## Зачем нужен registry

Registry фиксирует единый typed-источник для порядка блоков, visible/hidden/dev-only статусов, feedback metadata и причин скрытия. Он нужен для dev preview сейчас и для следующих этапов 2D и 2E без правок production route.

## Порядок блоков

1. hero — Ключевой паттерн
2. disclaimer — Границы интерпретации
3. speech_cloud — Что повторяется в речи
4. main_pattern — Самый заметный паттерн
5. where_visible — Как проявляется паттерн
6. pattern_support — Что может поддерживать паттерн
7. pattern_protection — Что паттерн может защищать
8. phrase_microscope — Что слышно в этой фразе
9. phrases_meaning — Фразы и возможный смысл
10. heatmap — Что звучит сильнее всего
11. graph — Как темы усиливают друг друга
12. attention_route — Маршрут внимания
13. attention_blind — Что внимание может пропускать
14. business_impact — Как это может влиять на решения и работу
15. pattern_cycle — Цикл паттерна
16. evidence_basis — На чём основаны выводы
17. levels_visible — На каких уровнях это заметно
18. shift_signals — Признаки сдвига
19. practices — Маленькие шаги на неделю
20. feedback — Обратная связь по блокам
21. debug_summary — Debug summary

## Visible сейчас

- hero
- disclaimer
- speech_cloud
- main_pattern
- where_visible
- pattern_support
- pattern_protection
- graph
- attention_route
- attention_blind
- pattern_cycle
- evidence_basis
- practices

## Hidden сейчас

- phrase_microscope: requires_phrase_segments
- phrases_meaning: requires_phrase_segments
- heatmap: requires_diff_indices
- business_impact: requires_business_prompt_layer
- levels_visible: requires_level_mapping
- shift_signals: requires_previous_session_or_shift_markers
- feedback: requires_feedback_api

## Feedback-ready blocks

- speech_cloud
- main_pattern
- where_visible
- pattern_protection
- graph
- attention_route
- attention_blind
- practices

## Legacy aliases

Some old adapter payload keys are still supported as aliases, but public/report/feedback/Postgres metadata should use canonical registry ids only.

- `evidence` → `where_visible`
- `protection_purpose` → `pattern_protection`
- `blind_spots` → `attention_blind`

Canonical ids are used for feedback block slots and future Postgres storage. Legacy ids must not be used as primary external ids — they exist only as an internal alias map in the registry. Future Postgres should save canonical ids only.

## Что будет в 2D

2D использует registry как базу для UI-слоя: порядок, названия, placeholders для hidden блоков и аккуратную подачу feedback-ready состояний.

## Что будет в 2E

2E использует registry как базу для block-level feedback flow: slots по block_id, dev payload и подготовка к отдельной feedback API интеграции.
