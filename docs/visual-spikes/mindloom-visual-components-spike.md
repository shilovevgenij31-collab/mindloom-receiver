# Patch 4P — Visual Components Research Spike

**Статус:** Research-only. Ничего не внедрено. Ждёт одобрения.  
**Файлы:** только `docs/visual-spikes/` — production code не тронут.

---

## Что изучено

1. Текущая реализация графа в `ReportV2Dashboard.tsx`
2. Четыре open-source библиотеки для graph visualization
3. Три подхода к speech cloud без библиотек
4. Bundlephobia данные и SSR-риски
5. Read-only mode конфигурации для каждой библиотеки

---

## Часть 1 — Research: Граф / Node Graph

### Текущая реализация (что есть)

- **Layout:** фиксированные percentage-координаты `left: ${n.x}%` / `top: ${n.y}%` (нет автолейаута)
- **Edges:** SVG cubic Bezier curves, вычисленные вручную
- **Nodes:** `position: absolute` HTML divs с radial-gradient фоном
- **Edge types:** hard / normal / soft / choice_available / choice_blocked — все реализованы
- **Interaction:** click/keyboard работает, portals-based sheets — починены в fix-4

**Проблемы текущей реализации:**
- Координаты nodes задаются вручную в normalizer — при 7+ узлах начинается overlap
- Нет автоматического radial layout: при разных данных узлы могут перекрываться
- Нет коллизий/отталкивания узлов

---

### Кандидат 1: @xyflow/react (React Flow v12)

**Репозиторий:** https://github.com/xyflow/xyflow  
**Docs:** https://reactflow.dev

| Параметр | Оценка |
|---|---|
| 5–8 узлов | ✓ Идеально — библиотека оптимальна для малых графов |
| Read-only мод | ✓ `nodesDraggable={false}` `nodesConnectable={false}` `elementsSelectable={false}` `panOnDrag={false}` `zoomOnScroll={false}` `zoomOnPinch={false}` |
| Custom bubble nodes | ✓ Полный React JSX — любой дизайн через `nodeTypes` prop |
| Custom curved/dashed edges | ✓ `edgeTypes` — custom SVG path с любым стилем |
| 5 типов рёбер | ✓ Разные `edgeTypes` для hard/normal/soft/ca/cb |
| Click по nodes и edges | ✓ `onNodeClick` / `onEdgeClick` callbacks |
| Mobile 390px | △ Нужно отключить pan/zoom, добавить `fitView` |
| SSR / Next.js 14 | ✓ v12 добавил полноценный SSR support |
| Bundle gzip | ~140 kB (наибольший минус) |
| Сложность внедрения | 🟡 2–3 дня — новый компонент рядом со старым |
| Риск сломать renderer | 🟢 Минимальный — изолированный компонент |
| Lovable-style визуал | ✓ Custom nodes = любой Mindloom-стиль |

**Read-only конфиг:**
```tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodesDraggable={false}
  nodesConnectable={false}
  elementsSelectable={false}
  panOnDrag={false}
  zoomOnScroll={false}
  zoomOnPinch={false}
  zoomOnDoubleClick={false}
  connectOnClick={false}
  fitView
  proOptions={{ hideAttribution: true }}
>
  {/* NO: Controls, MiniMap, Background — не добавлять */}
</ReactFlow>
```

**Install (НЕ запускать до одобрения):**
```bash
npm install @xyflow/react
```

**SSR safe import:**
```tsx
import dynamic from 'next/dynamic';
const CausalGraph = dynamic(() => import('./CausalGraph'), { ssr: false });
```

**Ссылки:**
- Custom nodes: https://reactflow.dev/examples/nodes/custom-node
- Custom edges: https://reactflow.dev/examples/edges/custom-edge
- SSR: https://reactflow.dev/learn/troubleshooting/migrate-to-v12

---

### Кандидат 2: Cytoscape.js + react-cytoscapejs

**Репозиторий:** https://github.com/plotly/react-cytoscapejs  
**Docs:** https://js.cytoscape.org

| Параметр | Оценка |
|---|---|
| 5–8 узлов | ✓ Работает |
| Read-only мод | △ Нужна кастомная настройка через `userZoomingEnabled: false` |
| Custom bubble nodes | ✗ Canvas-based — нет HTML custom nodes, только CSS-стили |
| Custom edges | ✓ Через `cy.style()` — цвет, dash, стрелки |
| Mobile | ✓ Хорошая поддержка |
| SSR | △ Нужен `dynamic import` |
| Bundle gzip | ~180 kB (cytoscape ~140 + react-cytoscapejs ~40) |
| Сложность | 🔴 Высокая — специфичная модель данных, непривычный API |
| Lovable-style визуал | △ Canvas — сложно получить pixel-perfect bubble дизайн |

**Вывод: не рекомендуем.** Canvas-based рендеринг не позволяет сделать custom React JSX nodes. Mindloom требует кастомного bubble дизайна с иконками, процентами, glow-эффектами — это невозможно в Cytoscape без серьёзного хака.

---

### Кандидат 3: Sigma.js + @react-sigma

**Репозиторий:** https://github.com/jacomyal/sigma.js  
**Docs:** https://www.sigmajs.org/docs/

| Параметр | Оценка |
|---|---|
| 5–8 узлов | ✗ Библиотека создана для тысяч узлов — overkill |
| Read-only мод | ✓ По умолчанию |
| Custom bubble nodes | ✗ WebGL — кастомные HTML nodes невозможны |
| Custom edges | △ WebGL — ограниченная кастомизация |
| SSR | ✗ WebGL = только client |
| Bundle gzip | ~120 kB sigma + ~60 kB graphology = ~180 kB total |
| Сложность | 🔴 Очень высокая — graphology data model, WebGL programs |
| Lovable-style визуал | ✗ Не предназначен для дизайнерских UI-графов |

**Вывод: не рекомендуем.** WebGL не позволяет использовать React компоненты как узлы. Избыточно для 5–8 узлов. Сложная модель данных (graphology).

---

### Кандидат 4: react-force-graph (D3 force)

**Репозиторий:** https://github.com/vasturiano/react-force-graph  
**Docs:** https://github.com/vasturiano/react-force-graph

| Параметр | Оценка |
|---|---|
| 5–8 узлов | △ Работает, но nodes постоянно "двигаются" до settle |
| Read-only мод | △ Нужно отключить `enableNodeDrag`, `enableZoomInteraction` |
| Custom bubble nodes | △ `nodeCanvasObject` — только canvas рисование |
| Mobile | △ Canvas |
| SSR | ✗ Canvas = только client |
| Bundle gzip | ~90 kB |
| Сложность | 🟡 Средняя — но force simulation нестабильна для малых графов |
| Lovable-style визуал | △ Canvas ограничивает дизайн |

**Вывод: не рекомендуем.** Force-directed layout для психологической карты неуместен — узлы "прыгают" при загрузке. Психологический граф должен быть статичным и предсказуемым. Canvas не даёт нужный pixel-perfect дизайн.

---

### Вывод по графу

**Рекомендация: @xyflow/react (React Flow v12)**

React Flow — единственная библиотека, которая даёт:
1. Полностью кастомные React-компоненты как узлы (bubble дизайн, иконки, проценты)
2. Кастомные SVG edges с любым стилем
3. SSR support в v12
4. Надёжный read-only режим
5. Минимальный риск для renderer (изолированный компонент)

**Альтернатива (без новых зависимостей):** улучшить текущий Pure SVG renderer, добавив:
- Radial layout algorithm с автоматическим размещением узлов по кругу
- Collision detection (overlap prevention)
- Это 0 kB зависимостей и минимальный риск

Если bundle size (140 kB) неприемлем — улучшаем текущий SVG подход.

---

## Часть 2 — Research: Speech Cloud

Пользователь хочет дизайнерский speech cloud — не wordcloud-алгоритм, а визуальный объект:
- Форма облака / органического пузыря
- Внутри: центральная фраза + chips
- Всё HTML — не картинка
- Mobile-адаптивный

### Вариант 1: CSS Cloud Shape

**Техника:** `border-radius: 52px` + два `::pseudo-element` bump'а  
**Зависимости:** нет  

```css
.cloud {
  background: #fff;
  border-radius: 52px;
  position: relative;
}
.cloud::before {
  content: '';
  position: absolute;
  width: 110px; height: 85px;
  border-radius: 50%;
  background: #fff;
  top: -46px; left: 22%;
}
.cloud::after {
  content: '';
  position: absolute;
  width: 72px; height: 58px;
  border-radius: 50%;
  background: #fff;
  top: -34px; left: 52%;
}
```

| | |
|---|---|
| Плюсы | 0 зависимостей, SSR-safe, CSS floating animation, mobile |
| Минусы | Только 2 bumps (::before, ::after), форма не полностью органична |
| Сложность | 🟢 Low |
| Mobile risk | 🟢 Минимальный |

---

### Вариант 2: SVG Organic Blob + HTML Chips

**Техника:** `<svg>` с `<path>` как background blob, HTML chips поверх через `position: relative`  
**Зависимости:** нет  

```jsx
<div style={{ position: 'relative' }}>
  <svg aria-hidden="true" viewBox="0 0 420 300">
    <path d="M 75,58 C 105,22 195,14 285,42 ..." fill="#fffbf4" />
  </svg>
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
    {/* chips */}
  </div>
</div>
```

| | |
|---|---|
| Плюсы | Органичная форма, полный контроль, chips = обычный HTML (a11y) |
| Минусы | SVG path — ручная работа, много chips → overflow из blob |
| Сложность | 🟡 Medium |
| Mobile risk | 🟡 Средний — нужна доработка для responsive blob |

---

### Вариант 3: Soft Card-Cloud Hybrid (Рекомендуется)

**Техника:** Скруглённая карточка (`border-radius: 28px`) + абсолютно позиционированные `div`-bumps сверху  
**Зависимости:** нет  

```jsx
<div style={{ position: 'relative', paddingTop: '28px' }}>
  {/* bumps */}
  <div style={{ position: 'absolute', top: '-22px', left: 0, right: 0, display: 'flex', justifyContent: 'space-around' }}>
    <div style={{ width: 76, height: 60, borderRadius: '50%', background: '#fff', boxShadow: '...' }} />
    {/* etc */}
  </div>
  {/* card body */}
  <div style={{ background: '#fff', borderRadius: 28, padding: '2rem' }}>
    <div>значимость = полезность</div>
    {/* chips */}
  </div>
</div>
```

| | |
|---|---|
| Плюсы | Максимально адаптивный, любое кол-во chips, работает на 390px, no deps |
| Минусы | Менее "облачный" вид, bumps требуют z-index аккуратности |
| Сложность | 🟢 Low |
| Mobile risk | 🟢 Минимальный |

---

### Вывод по Speech Cloud

**Рекомендация: Вариант 3 (Card-Cloud Hybrid)**

Для production: Вариант 3 — максимально надёжный, предсказуемый на mobile, без зависимостей. Если важна органичность формы — Вариант 2 с SVG blob, но нужна дополнительная работа по responsive-адаптации.

**Вариант 1** хорош для быстрого MVP — 2 bumps дают неплохой cloud-вид при минимальных усилиях.

---

## Часть 3 — Визуальный прототип

### Файл

`docs/visual-spikes/mindloom-graph-cloud-prototype.html`

### Как открыть

Открыть файл в браузере: **File → Open** или перетащить файл в Chrome/Safari/Firefox.  
Не требует сервера, не требует Node.js, не подключён к приложению.

### Что содержит прототип

**Вкладка "Граф связей":**
- 7 узлов: Гиперконтроль (central), Ценность, Вина за отдых, Перегрузка, Тело, Выгода, Поддержка
- 6 рёбер: hard × 2, normal × 2, soft × 1, choice_available × 1
- 3 layout варианта: Радиальный / Потоковый / Орбитальный
- Click по узлу или ребру → tooltip с объяснением
- Легенда всех типов рёбер

**Вкладка "Speech Cloud":**
- Вариант 1: CSS Cloud Shape
- Вариант 2: SVG Organic Blob
- Вариант 3: Soft Card-Cloud Hybrid (рекомендуется)
- Pros/cons для каждого

**Вкладка "Сравнение библиотек":**
- Таблица: @xyflow/react vs Cytoscape.js vs Sigma.js vs react-force-graph vs Pure SVG
- Recommendation box с планом внедрения

---

## Часть 4 — Ссылки / Референсы

### React Flow
- Custom nodes: https://reactflow.dev/examples/nodes/custom-node — что брать: шаблон кастомного компонента узла
- Custom edges: https://reactflow.dev/examples/edges/custom-edge — что брать: SVG path кастомного ребра
- Read-only: https://reactflow.dev/api-reference/react-flow — props для отключения всей интерактивности редактора
- SSR: https://reactflow.dev/learn/troubleshooting/migrate-to-v12 — как работает SSR в v12

### Cytoscape.js
- Docs: https://js.cytoscape.org — не подходит: canvas-based, нет HTML custom nodes
- react-cytoscapejs: https://github.com/plotly/react-cytoscapejs — последнее обновление 2022, заброшен

### Sigma.js
- Docs: https://www.sigmajs.org/docs/ — не подходит: WebGL, для тысяч узлов
- Demo: https://www.sigmajs.org/demo — полезно для reference крупных knowledge graphs

### D3 / react-force-graph
- react-force-graph: https://github.com/vasturiano/react-force-graph — не подходит: force simulation нестабильна для малых психологических карт
- D3 force manual: https://d3js.org/d3-force — полезно для понимания физики, если хотим улучшить current SVG layout

### CSS Speech Cloud Examples
- freefrontend.com/css-speech-bubbles — коллекция CSS паттернов, полезно для вариантов
- Bubbly: https://projects.verou.me/bubbly/ — генератор CSS speech bubble хвостиков (не нужны, но reference)

---

## Часть 5 — Recommendation

### 1. Best graph option: @xyflow/react

**Почему:** единственный вариант с React-компонентами как узлами (bubble дизайн), SSR в v12, 5 типов рёбер, read-only mode.

**Install (НЕ запускать):**
```bash
npm install @xyflow/react
```

**Риски:**
- Bundle +140 kB gzip — единственный серьёзный минус
- CSS import нужен: `@xyflow/react/dist/style.css` или minimal base
- Нужен `dynamic` import для полной SSR-безопасности

**Implementation plan:**
1. Создать `app/r/[publicToken]/CausalGraph.tsx` — изолированный компонент
2. Определить custom node types для каждого типа узла
3. Определить custom edge types для 5 типов рёбер
4. Добавить `dynamic import` с `ssr: false` в NodeGraphSection
5. Запустить тесты, QA mobile

**Альтернатива без зависимостей:** улучшить текущий SVG с radial layout algorithm:
- Автоматическое кольцевое расположение по углу = `360° / n`
- Collision detection (отталкивание при overlap)
- Это 0 kB, минимальный риск — рекомендуется как первый шаг

---

### 2. Best speech cloud option: Вариант 3 (Card-Cloud Hybrid)

**Почему:** максимально адаптивный, работает на 390px mobile без изменений, любое кол-во chips, нет зависимостей, 0 bundle impact.

**Зависимости:** нет

**Implementation plan:**
1. Создать компонент `SpeechCloudSection` в `ReportV2Dashboard.tsx`
2. Props: `centralPhrase: string`, `chips: string[]`
3. Данные из: `report.phrase_microscope.quote` + `report.speech_layer.key_phrases`
4. Рядом со старым `TagGroup` или как замена — решить при одобрении

---

### 3. Suggested patches

**Вариант A (последовательно, минимальный риск):**
1. **Patch 4P-implement-speech-cloud** — только Card-Cloud Hybrid, нет зависимостей
2. **Patch 4Q-implement-react-flow-causal-graph** — React Flow, изолированный компонент

**Вариант B (улучшить без зависимостей):**
1. **Patch 4P-improve-svg-graph-layout** — radial auto-layout + collision detection для текущего SVG
2. **Patch 4P-implement-speech-cloud** — Card-Cloud Hybrid

Рекомендуем: **Вариант B сначала** — быстро, безопасно, 0 зависимостей. Потом решить, нужен ли React Flow.

---

### 4. Rollback strategy

Все новые компоненты создаются рядом со старыми. Старые остаются как fallback.

Feature flags в env (не добавлены — только предложение):
```
USE_EXPERIMENTAL_SPEECH_CLOUD=false   # Вариант 3 (Card-Cloud)
USE_EXPERIMENTAL_CAUSAL_FLOW=false    # React Flow graph
```

По умолчанию `false` → показывается текущая реализация.  
После QA одобрения → переключить на `true`.

Если что-то сломалось → вернуть flag на `false` без изменения кода.

---

## Часть 6 — Что НЕ было сделано

- Не установлены зависимости
- Не изменён `ReportV2Dashboard.tsx`
- Не изменён `package.json`
- Не внедрён ни один компонент
- Не сделан деплой
- Не сделан коммит
- Не создан standalone React prototype (нет npm в docs/)
- Скриншоты не созданы (открой HTML файл для визуализации)

---

## Итоговые выводы

| Вопрос | Ответ |
|---|---|
| Лучшая library для graph | @xyflow/react v12 |
| Лучший подход к speech cloud | Вариант 3: Card-Cloud Hybrid |
| Нужны ли зависимости для cloud | Нет |
| Нужны ли зависимости для graph | @xyflow/react (~140 kB) или улучшить текущий SVG |
| Можно ли сделать без новых deps | Да — улучшить SVG layout + Card-Cloud |
| Риск для production | Минимальный при изоляции компонентов |
| Rollback strategy | Старые компоненты как fallback + feature flags |
