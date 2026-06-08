# Patch 4P-fix-1 — Stabilize Speech Cloud + Graph Polish

## Что было сломано

### Speech Cloud
- **Root cause**: `overflow: 'hidden'` + `borderRadius: '52% 48% 55% 45% / 48% 55% 45% 52%'` на внешнем контейнере создавали oval/egg shape с clip-mask — весь контент обрезался по форме oval.
- Кнопка «Показать ещё N фраз» использовала `DisclosurePanel` с `width: 100%`, что внутри oval давало gigantic full-width кнопку с чёрной рамкой, сломанную по width.
- После раскрытия дополнительные фразы выходили за oval-границу и обрезались.

### Graph
- Контрольные точки кривых (`cx1`, `cx2`) вычислялись с разнонаправленным смещением `direction * 5` и `- direction * 5`, из-за чего обе точки тянули кривую в противоположные стороны → S-образные «червяки».
- `feGaussianBlur` glow-фильтр применялся на `hard`, `normal`, `choice_blocked` — слишком много blur, edges казались толстыми.

## Что исправлено

### Speech Cloud — `MindloomSpeechCloud`

**Полная замена структуры:**

- Убрано: `overflow: 'hidden'`, organic oval border-radius, position:absolute фразы.
- Внешний контейнер теперь: обычная card в стиле Mindloom (`borderRadius: 30`, `boxShadow`, gradient). Никакого clip.
- Декоративный background glow остался как `position: absolute`, `zIndex: 0`, `pointerEvents: none` — он не clip'ит контент.
- Центральный bubble вынесен в отдельный flex-блок выше фраз, в normal document flow.
- Все фразы — `flexWrap: wrap` в normal flow, `zIndex: 1`, не обрезаются.
- `DisclosurePanel` заменён на `useState(false)` + compact inline `button` (link-style, `background: none`, `textDecoration: underline`). Текст: `+ ещё N`.
- Анимация `mlmSpeechBreathe` и CSS `.mlm-speech-center` сохранены.

**До:** oval/egg обрезал текст + огромная full-width кнопка внутри oval.  
**После:** нормальная карточка, фразы в обычном потоке, disclosure — маленькая ссылка.

### Graph — `NeuroNodeGraph`

**Фикс контрольных точек:**

Старая формула:
```
cx1 = midX - (dy/len)*curve - direction*5  ← тянет влево
cx2 = midX - (dy/len)*(curve*0.45) + direction*5  ← тянет вправо → S-кривая
```

Новая формула:
```
perpX = -(dy/len) * baseCurve * curveSide
perpY = (dx/len) * baseCurve * curveSide
cx1 = startX + (endX-startX)*0.35 + perpX  ← оба на одной стороне → clean arc
cx2 = startX + (endX-startX)*0.65 + perpX
```

- Обе точки на одной стороне → чистая дуга, без S-shape.
- `baseCurve` снижен: soft `15→8`, central `9→6`, other `13→8` — менее агрессивные кривые.
- `useGlow` упрощён: только `hard` (было `hard || normal || choice_blocked`). Меньше blur → edges выглядят data-like.
- Убраны ненужные переменные `midX`, `midY`, `direction`.

### CSS

Удалена медиа-директива `.mlm-speech-cloud-wrap` — класс больше не используется.

## Runtime error — статус

Прямой доступ к browser console в этой сессии отсутствует. Статический анализ кода:

- `console.log/error/warn` — не найдены.
- Нет `document`/`window` в render без guard (все `createPortal` вызовы гарантированно только при `open === true`).
- Дублирующихся `key` не обнаружено.
- Hydration mismatch: все `useState` инициализируются детерминированно.
- `WebkitBoxOrient: 'vertical'` в graph nodes — pre-existing, не введено Patch 4P.

Наиболее вероятная причина до фикса: `overflow: hidden` на animated (transform: scale) child вызывал browser repaint warning, которое Next.js dev overlay показывал как "1 error". После убирания `overflow: hidden` с контейнера speech cloud — проверить, ушёл ли toast.

## QA checklist

Speech Cloud:
- [ ] Нет oval / egg shape
- [ ] Ничего не обрезается
- [ ] `+ ещё N` — маленькая ссылка, не огромная плашка
- [ ] После клика — фразы появляются ниже в той же карточке
- [ ] 390px — нет overflow, chips flex-wrap
- [ ] Central bubble анимируется (breathing)
- [ ] prefers-reduced-motion — анимация отключена

Graph:
- [ ] Edges — чистые дуги, без S-shape
- [ ] Нет «червяков» на dashed edges
- [ ] Click node → detail sheet
- [ ] Click edge → detail sheet
- [ ] Nodes не обрезаются по canvas
- [ ] Legend и «Ключевые связи» читаемы

General:
- [ ] No red runtime error toast
- [ ] No horizontal overflow
- [ ] HelpTip tooltips работают

## Typecheck / Build

```
npx tsc --noEmit  → 0 ошибок
npx next build    → ✓ Compiled successfully
/r/[publicToken]  35.1 kB (First Load 122 kB)
```
