# Patch 4O-fix-3 — Final UX Completion

## Что исправлено

### Heatmap

- Callout-блоки ("Самые активные зоны", "Что показывает карта", "Как читать") по-прежнему доступны только через sheet "Как читать карту" — в основном потоке их нет.
- Focus bar остался компактным.
- "Как читать" кнопка в heatmap visible flow сохранена.
- **Обогащены zone sheets**: при клике на зону теперь передаётся:
  - `description` из matching active node;
  - `evidence` из active_nodes + keyPhrases (до 4 цитат);
  - `rows` с "Почему важно" и "Связанные узлы" (resolved labels через connected_to → graphNodes);
  - Fallback description: "В материале эта зона связана с повторяющимся напряжением и поддерживает общий паттерн."

### Graph

- **Визуальное облегчение связей**:
  - Уменьшены strokeWidth: hard 1.78→1.05, normal 1.12→0.78, choice_blocked 1.52→0.88, soft 0.72→0.52, choice_available 0.82→0.60.
  - stdDeviation glow-фильтра: 0.9→0.38.
  - Strength-based boost: ×0.16→×0.06.
  - `strokeLinecap`: `"round"` для dashed, `"butt"` для solid edges — убирает blob-эффект на концах.
  - Arrowheads: переведены на `markerUnits="strokeWidth"` — масштабируются корректно, выглядят как стрелки а не блобы.

- **Человеческие фразы в "Ключевые связи"**:
  - Убраны технические `"A → B"` заголовки.
  - Добавлен хелпер `buildHumanEdgeTitle`: строит фразу по типу связи:
    - hard: "X автоматически запускает Y."
    - normal: "X усиливает Y."
    - soft: "X слабо связан с Y."
    - choice_available: "X влияет на Y — здесь может появляться пространство выбора."
    - choice_blocked: "X ведёт к Y — выбор здесь переживается как недоступный."
  - Если `explanation` есть — используется вместо шаблона.

- **Добавлен sheet "Как читать карту связей"** (`GraphHowToReadSheet`):
  - Объясняет: узлы, стрелки, толщина, типы связей (hard/normal/soft/choice_available/choice_blocked), расстояние.
  - Trigger-кнопка `"? Как читать"` рядом с описанием графа — soft pill style.
  - Управление: `useState(false)` в `NodeGraphSection`.

- **Edge sheets** обогащены:
  - title теперь использует `buildHumanEdgeTitle`.
  - `explanation`: если нет raw explanation — строится человеческая фраза "Это означает, что X может запускать Y."

- **Node sheets** обогащены:
  - Добавлена "Что это значит" строка в rows: type-based fallback по label (контроль/защита → "защитная реакция", ценность/убеждение → "убеждение которое запускает поведение", тело → "телесная проявленность" и т.д.)
  - Rows строятся как `[...existing_rows, { label: 'Что это значит', text: '...' }]`.

### Evidence

- Добавлен intro-текст после счётчиков:
  "Эта секция показывает, на какие узлы, гипотезы и речевые признаки опирается отчёт."
- Disclosure "Показать все узлы" — hidden nodes теперь отображаются в том же стиле что visible:
  - SharedPanel с numbered circle, label, percent, intensity bar, description.
  - DottedDivider между ними.

### Layers

- Layer sheets обогащены тремя обязательными rows:
  1. "Что это значит" — type-based fallback (потребность / защита / тело / убеждение / поведение).
  2. "Как проявляется" — `layer.manifestation` (если есть и отличается от description).
  3. "На что обратить внимание" — contextual hint по типу слоя.
- Evidence теперь передаётся полностью (до 3 цитат).
- `why` поле убрано из состояния — заменено на `rows`.

### Markers

- Marker sheets обогащены тремя обязательными rows:
  1. "Почему важно" — объяснение ценности наблюдения.
  2. "Маленький признак сдвига" — `item.shift_signal` (если есть).
  3. "Как замечать в течение дня" — практичный совет.
- `note`: "Если вы замечаете этот сигнал раньше, чем действуете автоматически, связь уже начинает ослабляться."
- Убрана зависимость от `hasSheetContent` с пустыми условиями — sheet открывается всегда при наличии любого маркерного контента.

### HonestTranslation

- Защита от дублей уже была реализована в patch-2 (проверка `item.explanation !== item.more_honest`). Не изменялась.

### Visual consistency

- Стрелка "Подробнее →" в layers сделана мягче: `0.62rem`, `#c0b8b0`, lowercase.
- Graph edge visual стал значительно чище.
- "Как читать" triggers в heatmap и graph имеют единый soft pill стиль.

## Что перенесено в sheets

| Данные | Где теперь |
|---|---|
| Heatmap: "Самые активные зоны" | HeatmapInfoSheet |
| Heatmap: "Что показывает карта" | HeatmapInfoSheet |
| Heatmap: "Как читать" | HeatmapInfoSheet |
| Graph: "Как читать граф" | GraphHowToReadSheet (new) |
| Layer: "Что это значит" | Layer sheet rows |
| Layer: "На что обратить внимание" | Layer sheet rows |
| Marker: "Почему важно" | Marker sheet rows |
| Marker: "Как замечать" | Marker sheet rows |

## Что не трогали

- Backend, API, DB, auth
- Docker/deploy, schema, normalizer
- Prompts, repair prompt
- Legacy renderer (`NeuroHeatmap`, `HeatmapInfographic`)
- Route branching, general data flow
- Practices, Trajectory, Snapshot, GrowthBlocker sections

## QA Checklist

- [ ] 390px mobile width — нет горизонтального overflow
- [ ] Нет undefined/null/NaN в rendered output
- [ ] Hero actions работают (scroll to evidence, "Как читать отчёт")
- [ ] Heatmap callouts убраны из visible flow
- [ ] Heatmap "Как читать карту" открывает HeatmapInfoSheet
- [ ] Heatmap zone click даёт description + evidence + related nodes
- [ ] "Как читать граф" кнопка открывает GraphHowToReadSheet
- [ ] Graph lines выглядят как аккуратные причинные линии, не черви
- [ ] Graph "Ключевые связи" написаны человеческими фразами без стрелок
- [ ] Graph node click показывает "Что это значит" в rows
- [ ] Graph edge click показывает человеческое объяснение
- [ ] Evidence intro текст виден
- [ ] "Показать все узлы" disclosure показывает карточки в том же стиле
- [ ] Layer sheet содержит 3 обязательных rows + evidence
- [ ] Marker sheet содержит 3 обязательных rows
- [ ] HonestTranslation без дублей
- [ ] TypeScript: 0 ошибок (`tsc --noEmit` exit 0)
- [ ] Build: success

## Build результаты

- TypeScript: **EXIT:0** (0 ошибок)
- Next.js build: **✓ Compiled successfully**
- Route `/r/[publicToken]`: 33.9 kB (First Load JS 121 kB)
