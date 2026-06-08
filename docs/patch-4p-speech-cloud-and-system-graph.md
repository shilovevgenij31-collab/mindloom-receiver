# Patch 4P — Speech Cloud + System Graph Visual Direction

## Выбранное визуальное направление

### Graph: Системная карта паттерна
Взято от трёх референсов из moodboard:
- **Flourish Directional Edges**: тонкие чистые направленные связи, аккуратные arrowheads, ощущение data visualization
- **Kumu Bubble Stakeholder Map**: bubble-узлы, colour groups, node size = intensity
- **InfraNodus Brainstorm View**: кластеры и системность, смысловая карта

Сохранён Mindloom style: warm ivory background, coral/purple/amber/blue/green, mobile-first, не медицински пугающий.

### Speech Cloud: HealBubble Emotional Bubble Center
Взято от двух референсов:
- **HealBubble Emotional Bubble Center**: большой центральный эмоциональный bubble, мягкий therapeutic feeling, фразы/чипы вокруг центра
- **Organic Blob / Cloud**: мягкий cloud/blob background, не обычная прямоугольная карточка

---

## Что изменено в графе

### Edges (линии связей)
- `strokeWidth` уменьшен на ~22%: hard 1.05→0.82, normal 0.78→0.62, soft 0.52→0.40
- `strokeLinecap` изменён с `round` (у dashed) на `butt` — устраняет эффект "червячков"
- dasharray скорректирован: soft `4 5`→`3 5`, choice_available `3.5 5`→`2.5 4.5`

### Arrowheads (стрелки)
- `markerWidth/Height`: 5→4 (меньше, аккуратнее)
- `refX/refY`: `4.2/2.5`→`3.8/2` (точнее совпадает с кончиком линии)
- path: `M0.5,0.5 L4.5,2.5 L0.5,4.5`→`M0.5,0.5 L3.5,2 L0.5,3.5` (чище форма)
- opacity чуть выше (+0.16 вместо +0.08) — стрелки читаются

### Node glow
- blobMul: central 3.6→3.0, surrounding 2.8→2.2
- alpha: central 0.20→0.14, surrounding 0.13→0.09
- box-shadow outer rings уменьшены: central `9px + 26px`→`7px + 16px`, surrounding `6px`→`4px`

### Cluster halos (новое)
- Группировка non-central узлов по tone
- При 2+ узлах одного тона — органичный ellipse halo в центре группы
- Даёт "system map" feeling, ощущение кластеров
- zIndex: 1 (ниже glow blobs)
- filter: blur(18px), opacity: очень тихий (0.07→0.03→0)

### Legend
- Новые labels (более человеческие): "Жёсткая связь" / "Обычная" / "Ослабленная" / "Есть выбор" / "Выбора нет"
- Добавлены описания под каждым типом: "срабатывает быстро" / "поддерживает паттерн" / "проявляется не всегда" / "можно ослаблять" / "как автоматизм"
- Layout изменён на flex-wrap с 2-строчными item (label + description)

---

## Что изменено в Speech Cloud

### Компонент: MindloomSpeechCloud
Заменяет `KeyPhrasesSupportSection` в main render.
Fallback: если phrases < 2 — рендерит оригинальный `KeyPhrasesSupportSection`.

### Структура
- Outer container: organic blob border-radius `52% 48% 55% 45% / 48% 55% 45% 52%`
- Warm ivory gradient background
- На мобайле (≤500px): упрощается до `border-radius: 28px`

### Central bubble (`.mlm-speech-center`)
- 148×148px круг с lavender gradient
- CSS animation `mlmSpeechBreathe`: scale(1) → scale(1.04) за 5.5s
- box-shadow: три кольца разного radii с убывающей opacity
- Внутри: "Главный паттерн" label + centralText (max 5 слов из summary/title/first phrase)

### Phrase chips
- До 9 фраз видимо, остальные в disclosure
- Semantic color coding через `phraseSemantic()`:
  - coral/red: контроль, вина, страх, долг, запрет
  - amber: избегание, напряжение, перегрузка
  - green: ресурс, желание изменений, возможности
  - blue: тело, усталость, пауза, отдых
  - purple (default): убеждения, правила
- Размер чипов: первый (14px, 660w), 1-2 (12.5px, 620w), остальные (11.5px, 580w)

### Animations
- `.mlm-speech-center` — breathing 5.5s ease-in-out
- `@media (prefers-reduced-motion: reduce)` — анимации отключены

---

## Что НЕ трогали
- Структура отчёта и порядок секций
- Backend / API / DB / auth / schema / normalizer / prompts
- Route / deploy
- HeatmapSection
- Все interactions: click node → sheet, click edge → sheet, "Как читать граф" → sheet
- Portal/sheet system
- Keyboard activation
- Data flow и source данных

---

## QA Checklist

- [ ] Desktop: граф без overlap, читаемые labels
- [ ] Desktop: speech cloud с центральным bubble + чипами вокруг
- [ ] Mobile 390px: граф не выходит за экран
- [ ] Mobile 390px: speech cloud в облачном контейнере, flex-wrap chips
- [ ] Click graph node → detail sheet открывается
- [ ] Click graph edge → detail sheet открывается
- [ ] "Как читать граф" кнопка → открывает sheet (если есть)
- [ ] HelpTip в секции speech cloud работает
- [ ] Speech cloud: нет горизонтального overflow
- [ ] Graph: нет горизонтального overflow
- [ ] При < 2 фраз: fallback к старому chip layout
- [ ] Анимации: breathing плавная, не дёргает лэйаут
- [ ] prefers-reduced-motion: анимации отключены

---

## Typecheck / Build

```
npx tsc --noEmit  → 0 ошибок
npx next build    → ✓ Compiled successfully, 11/11 static pages
```

Route `/r/[publicToken]`: 35.1 kB (First Load 122 kB) — без регрессии.
