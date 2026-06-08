# Mindloom — Visual Reference Moodboard
## Patch 4P · Research Only · No code · No implementation

> Задача: найти сильные визуальные направления для future graph, nodes, и speech cloud.  
> Это не техническое сравнение — это только о том, **как это должно выглядеть**.

---

## Структура

- [Категория 1: Soft Bubble Causal Graph](#1-soft-bubble-causal-graph)
- [Категория 2: Premium Knowledge Graph](#2-premium-knowledge-graph)
- [Категория 3: Neural Heat / Node Map](#3-neural-heat--node-map)
- [Категория 4: Organic Speech Cloud / Phrase Cloud](#4-organic-speech-cloud--phrase-cloud)
- [Категория 5: Bento Explanatory Graph Cards](#5-bento-explanatory-graph-cards)
- [Финальные рекомендации](#финальные-рекомендации)

---

## 1. Soft Bubble Causal Graph

*Ключевое ощущение: органические пузыри, тёплые цвета, мягкие связи — не технический граф, а живая карта отношений.*

---

### REF-01 — Kumu.io Stakeholder Map

**URL:** https://kumu.io / https://www.kumu.io/UphamsImplementation/stakeholder-map

**Визуальное описание:**  
Круглые "пузырьки" разного размера на тёплом/нейтральном фоне. Узлы — это цветные круги, размер показывает вес. Связи — тонкие плавные линии, иногда с метками. Layout force-directed: узлы "плавают" и находят натуральное расположение. Цветовые группы обозначают категории. Общее ощущение — жизнеспособное, органичное, не корпоративное.

**Что взять для Mindloom:**
- Размер пузыря как visual proxy интенсивности узла
- Мягкая группировка по цвету (не жёсткая сетка)
- Ощущение "карты территории", а не "схемы архитектуры"
- Возможность нажать на пузырь → sidebar с деталями

**Подходит / Не подходит:**  
✓ Ощущение живой системы, не редактора  
✓ Тёплые цвета хорошо ложатся на Mindloom-палитру  
✗ Слишком много узлов в типичном примере — для 5–8 нужна адаптация  
✗ Технически: force-directed "прыгает", нужен static layout

**Риск реализации:** 🟡 Средний — visual style копируется, physics отключается

---

### REF-02 — Whimsical Mind Maps

**URL:** https://whimsical.com/mind-maps

**Визуальное описание:**  
Чистые rounded-rectangle карточки на белом/светлом canvas. Центральный узел — крупнее и темнее. Дочерние узлы — меньше, цветные border. Связи — мягкие изогнутые линии без стрелок (или с очень тонкими). Цветовые семейства для веток. Анимации плавные. Общее ощущение — образовательное, тёплое, приятно читать.

**Что взять для Mindloom:**
- Скруглённые карточки-узлы вместо кружков — больше пространства для текста
- Цветные бордеры для различения типов узлов
- Кривые без стрелок или с очень тонкими → ощущение "мысли", не "потока данных"
- Иерархия через размер, не только цвет

**Подходит / Не подходит:**  
✓ Очень читаемо на mobile  
✓ Легко адаптировать под warm ivory Mindloom-стиль  
✗ Прямоугольные карточки — менее "психологические", чем пузыри  
✗ Нет типизации связей (hard/soft etc)

**Риск реализации:** 🟢 Низкий — pure HTML divs + SVG edges

---

### REF-03 — Coggle Radial Mind Map

**URL:** https://coggle.it / https://coggle.it/gallery

**Визуальное описание:**  
Радиальная ветвящаяся структура с центром. Ветви — плавные органические кривые, "как реки". Цвета: яркие, но soft (не неоновые). Нет прямоугольных рамок — текст просто "живёт" на ветке. Узлы-конечные точки — маленькие круги или точки. Общее ощущение — живое, дышащее, поэтическое.

**Что взять для Mindloom:**
- Органические кривые ветви как стиль edges — не прямые линии и не жёсткие bezier
- Цветовые семейства веток от центра (coral, violet, amber — точно как Mindloom!)
- Ощущение "расходящейся системы" от центрального узла
- Плавные анимации при появлении

**Подходит / Не подходит:**  
✓ Цветовая философия идеально совпадает с Mindloom-тонами  
✓ Радиальный layout = naturalный для psychological causal map  
✗ Нет типов связей (только ветки одного типа)  
✗ Слишком "schoolbook" — нужно добавить sophistication

**Риск реализации:** 🟢 Низкий — улучшение текущего SVG renderer

---

### REF-04 — FigJam Causal Loop Diagram Template

**URL:** https://www.figma.com/templates/causal-loop-diagram/  
**Community file:** https://www.figma.com/community/file/1118686468186768017/causal-loop-diagram

**Визуальное описание:**  
Мягкий светлый background (off-white). Узлы — rounded rectangles с цветным fill, очень readable типографика. Связи — curved arrows с четкими стрелками. Подписи на связях ("+ increases", "- decreases"). Минималистичная легенда. Общее ощущение — объяснительное, образовательное, не пугающее.

**Что взять для Mindloom:**
- Подписи на связях (тип связи виден без клика) — но не перегружать
- Rounded rectangle узлы с явным text label (без аббревиатур)
- Светлый background с subtle grid/texture
- Цветовая маркировка типов связей в легенде

**Подходит / Не подходит:**  
✓ "Объяснительный" тон — идеально для психологической карты  
✓ Легенда + подписи = понятно без инструкции  
✗ Прямоугольники выглядят слишком "диаграммно" для Mindloom  
✗ Без custom node shapes — нет bubble эффекта

**Риск реализации:** 🟢 Низкий — статичный layout, SVG arrows

---

### REF-05 — Miro Bubble Map Template

**URL:** https://miro.com/templates/bubble-map/

**Визуальное описание:**  
Varying-sized circles/bubbles с текстом внутри. Bubbles разного размера отображают важность. Связи — тонкие линии, иногда без стрелок. Нейтральный или цветной background. Общее ощущение — интуитивное, "мыслительное", не техническое.

**Что взять для Mindloom:**
- Varying size bubbles как основная visual hierarchy
- Простота связей: тонкая линия без декораций для soft-edges
- Мягкий цветной background под каждым bubble (gradient fill)
- Центральный bubble заметно крупнее + другой цвет

**Подходит / Не подходит:**  
✓ Varying size = готовая визуальная иерархия intensity  
✓ Circles работают лучше rectangles для психологических карт  
✗ Generic visual style — нужна Mindloom-кастомизация  
✗ Нет типизации связей

**Риск реализации:** 🟢 Низкий — улучшение текущего подхода

---

### REF-06 — mymap.ai Causal Loop Diagram

**URL:** https://www.mymap.ai/template/causal-loop-diagram

**Визуальное описание:**  
AI-генерированные causal loop diagrams с современным look. Soft background, rounded nodes, цветные arrows. Автоматический layout. Смесь causal loop формализма и modern SaaS aesthetics. Общее ощущение — professional, доступное, non-intimidating.

**Что взять для Mindloom:**
- Стрелки с явным типом: solid vs dashed, цвет = тип
- Rounded nodes с иконками внутри (как текущий Mindloom)
- Авто-layout для избежания overlap
- Subtle shadow под nodes

**Подходит / Не подходит:**  
✓ Современный SaaS-look хорошо соотносится с Mindloom  
✓ Цветные стрелки = решение проблемы типизации  
✗ Иногда выглядит слишком "productivity tool", не "psychological map"

**Риск реализации:** 🟡 Средний — нужен новый layout algorithm

---

## 2. Premium Knowledge Graph

*Ключевое ощущение: умный, изысканный, показывает глубокие связи — не диаграмма для презентации, а живая карта знания.*

---

### REF-07 — Heptabase Knowledge Graph

**URL:** https://heptabase.com / https://wiki.heptabase.com

**Визуальное описание:**  
Cards на бесконечном whiteboard-canvas. Каждая карточка — реальная заметка. Связи между картами — линии. Есть "Knowledge Graph" view с nodes = cards. Минималистичная эстетика: белые карточки на светло-сером canvas. Связи тонкие и аккуратные. Общее ощущение — thinking tool, не dashboard.

**Что взять для Mindloom:**
- Card-style nodes (не просто кружок, а прямоугольник с контентом) для "раскрытых" узлов
- Линии связи без стрелок → ощущение organic network, не hierarchy
- Whiteboard-style background texture (subtle dot grid)
- "Фокус на одном узле" режим — кликнул → расширилась карточка

**Подходит / Не подходит:**  
✓ Card-style nodes = больше информации на узел без клика  
✓ Минимализм хорошо сочетается с Mindloom-стилем  
✗ Слишком нейтральный (белый/серый) — нужна тёплая палитра Mindloom  
✗ Нет типизации связей

**Риск реализации:** 🟡 Средний — другой node shape требует рефактора

---

### REF-08 — Napkin.ai Visual Diagrams

**URL:** https://www.napkin.ai

**Визуальное описание:**  
AI превращает текст в визуальные диаграммы. Разнообразные стили: flowcharts, mind maps, comparisons. Визуальный стиль: professional, clean, с цветными accent nodes. Иконки внутри узлов. Цветные категории. Общее ощущение — intelligent, premium, автоматически красивое.

**Что взять для Mindloom:**
- Иконки внутри узлов как часть visual identity (уже есть в текущем Mindloom!)
- Цветные категории через node color (уже есть)
- Авто-генерируемые labels в человеческом формате (как `buildHumanEdgeTitle` в коде)
- Premium feel через тонкую типографику внутри node

**Подходит / Не подходит:**  
✓ "Intelligent AI tool" feel — идеально для психологического отчёта  
✓ Иконки + цвет = ready visual language  
✗ Иногда слишком "бизнес-презентация" — нужно больше warmth

**Риск реализации:** 🟢 Низкий — style reference, не библиотека

---

### REF-09 — InfraNodus Text Network Graph

**URL:** https://infranodus.com / https://infranodus.com/graphs  
**Gallery:** https://infranodus.com/use-case/network-analysis-visualization

**Визуальное описание:**  
Nodes-кластеры, цветно группированные по топикам. Nodes разного размера (betweenness centrality). Темный или светлый фон. На темном: glowing nodes на черном/dark-navy background. На светлом: soft colored clusters. Связи тонкие. Общее ощущение — scientific + beautiful, как карта мозга.

**Что взять для Mindloom:**
- Глоу-эффект на важных узлах (уже частично есть в текущем коде!)
- Кластеры по цвету — psychological types через цвет (control/emotion/body/value)
- Size as importance = интенсивность узла
- "Карта топиков" ощущение — не hierarchy, а semantic network

**Подходит / Не подходит:**  
✓ Semantic cluster visual = психологические типы через цвет  
✓ Glowing nodes на тёмном выглядят очень впечатляюще  
✗ Тёмный стиль не совпадает с warm ivory Mindloom  
✗ Слишком "научный" — нужно смягчить

**Риск реализации:** 🟢 Низкий — visual reference, glow уже реализован

---

### REF-10 — Figma Community Causal Loop + Dependency Maps

**URL:** https://www.figma.com/community/file/1452980604196660381/causal-loop-diagram-template-the-conference-room  
**Also:** https://www.figma.com/templates/dependency-mapping/

**Визуальное описание:**  
Профессиональные Figma-темплейты с soft neutral backgrounds, rounded nodes, цветными стрелками. Conference Room template: тёплые neutral тона, узлы как карточки с заголовком. Dependency map: мягкие цветные pill-nodes, directed curved arrows. Общее ощущение — consultant-quality, объяснительное, умное.

**Что взять для Mindloom:**
- Pill/capsule shaped nodes для edge labels (уже есть в легенде!)
- Warm neutral tones + rounded cards для узлов
- Directed arrows с явным цветом = тип связи
- Compact legend внизу с примерами

**Подходит / Не подходит:**  
✓ Тёплые тона — близко к Mindloom palette  
✓ Объяснительный стиль = психологическая карта, не data dashboard  
✗ Статичный Figma-файл — нужна интерактивность

**Риск реализации:** 🟢 Низкий — style reference

---

### REF-11 — Neo4j LLM Knowledge Graph Builder

**URL:** https://neo4j.com/blog/developer/llm-knowledge-graph-builder-release/

**Визуальное описание:**  
Interactive knowledge graph на dark background. Colored nodes по entity type. Curved directed edges. Node detail panel справа при клике. Zoom/pan. Общее ощущение — powerful, data-rich, но complex.

**Что взять для Mindloom:**
- Detail panel = sheet при клике (уже реализовано!)
- Entity-type coloring = психологические типы через цвет
- Curved edges с arrows = направленность связей

**Подходит / Не подходит:**  
✓ Click-to-detail pattern = точно как Mindloom sheets  
✗ Слишком тёмный, технический стиль  
✗ Слишком большие графы — не для 5–8 узлов

**Риск реализации:** 🟢 Низкий — только visual reference

---

### REF-12 — Obsidian + Juggl Extended Graph Plugin

**URL:** https://github.com/HEmile/juggl  
**Docs:** https://obsidian.md/help/plugins/graph

**Визуальное описание:**  
Obsidian default: dark background, светящиеся белые/цветные nodes, тонкие серые connections. Красиво на dark, но не для warm Mindloom. Juggl: customizable shapes, colors, sizes, icons — гораздо более гибкий и красивый. Возможность добавить warm theme.

**Что взять для Mindloom:**
- Светящиеся glow-nodes с мягкими shadows
- Force-radius для central node — dominant visual с ореолом
- Hover reveal для node details
- Цветовые группы по типу (есть в текущей реализации)

**Подходит / Не подходит:**  
✓ Glow effect = уже в текущем коде  
✓ Central node visual dominance = уже в коде  
✗ Dark theme не подходит Mindloom  
✗ Force-directed physics не нужна

**Риск реализации:** 🟢 Низкий — visual inspiration only

---

## 3. Neural Heat / Node Map

*Ключевое ощущение: узлы как светящиеся точки на карте — ощущение scan, heatmap, нейронной активности.*

---

### REF-13 — HealBubble Emotion Visualization (2025 research)

**URL:** https://dl.acm.org/doi/10.1145/3770445.3770497

**Визуальное описание:**  
Исследовательская система для trauma-informed эмоциональных состояний. Generative "emotion bubbles" — органические пузыри с цветом, формой и движением, отражающие внутренние состояния. Каждый bubble = эмоция. Анимированные, дышащие. Общее ощущение — интимное, non-verbal, очень soft.

**Что взять для Mindloom:**
- Органическая форма bubble = не строгий круг, а слегка неправильный
- Цвет + движение как смысловые носители (не только label)
- "Дышащий" пульсирующий node для central node
- Non-verbal visual metaphors для психологических состояний

**Подходит / Не подходит:**  
✓ Psychologically safe aesthetic = идеально для Mindloom  
✓ Organic bubble shape = warmth  
✓ Animation как semantic layer  
✗ Нет связей между узлами в original concept  
✗ Анимация может отвлекать от контента отчёта

**Риск реализации:** 🟡 Средний — CSS animation для bubbles

---

### REF-14 — InfraNodus Cluster Color Map

**URL:** https://infranodus.com/docs/network-analysis  
**How to read:** https://help.infranodus.com/kb/read-interpret-text-graph-network

**Визуальное описание:**  
Цветные кластеры — каждая группа узлов имеет свой цвет. Узлы одного кластера притягиваются. Betweenness centrality = размер. Force-Atlas layout создаёт organic clustering. На светлом фоне: мягкие пастельные кластеры. Общее ощущение — карта смыслов, brain map.

**Что взять для Mindloom:**
- Кластерная цветовая логика: одна группа = один тон (control=coral, emotion=amber, etc.)
- Size = importance = intensity (уже реализовано)
- Soft glow around кластерных групп (subtle)
- "Topic cloud" внизу как supplementary визуал

**Подходит / Не подходит:**  
✓ Смысловая цветовая группировка = perfect для psychological types  
✓ Size-as-intensity = уже реализовано  
✗ Кластеры работают при 20+ узлах, при 5–8 неочевидны

**Риск реализации:** 🟢 Низкий — visual reference

---

### REF-15 — open-mindmap iOS-style React Component

**URL:** https://mindmap.u14.app / https://github.com/u14app/mindmap

**Визуальное описание:**  
iOS-style UI: frosted glass controls, rounded corners, smooth animations. Светлый warm background. Nodes — скруглённые прямоугольники с мягкими shadows. Connections — плавные кривые. Общее ощущение — нативный Apple iOS, premium, тактильный.

**Что взять для Mindloom:**
- Frosted glass accent elements (backdrop-filter blur на panel header)
- iOS-level rounded corners на всём (28px уже есть в Mindloom)
- Smooth animation при появлении узлов
- Tonal consistency — все элементы в одной цветовой теме

**Подходит / Не подходит:**  
✓ iOS quality = premium feel Mindloom хочет  
✓ Warm tones совместимы  
✗ Не поддерживает типизацию связей  
✗ React component — нужна интеграция

**Риск реализации:** 🟡 Средний — Zero-dependency компонент, но нужна адаптация

---

### REF-16 — Flourish Network Charts (Radial style)

**URL:** https://flourish.studio/visualisations/network-charts/  
**Examples:** https://flourish.studio/examples/

**Визуальное описание:**  
Radial network: узлы равномерно распределены вокруг центра. Classic network: free-flowing circles with lines. Image nodes: кастомные изображения внутри узлов. Clean, editorial look. Responsive по умолчанию. Общее ощущение — data journalism, Premium Economist-style.

**Что взять для Mindloom:**
- Radial layout = равномерное распределение без overlap (нужно Mindloom!)
- Image nodes = иконки внутри кружков (уже реализовано)
- Editorial quality arrows — thin, clean, directional
- Hover state: subtle highlight ring вокруг узла

**Подходит / Не подходит:**  
✓ Radial = решение overlap проблемы  
✓ Editorial quality = premium  
✗ Стиль слишком нейтральный/холодный для Mindloom warmth  
✗ Иногда слишком data-journalism, не psychological

**Риск реализации:** 🟢 Низкий — geometric radial algo несложен

---

### REF-17 — Miro Brain Map Template

**URL:** https://miro.com/templates/brain-map/

**Визуальное описание:**  
Radial brain map: центральный concept, ветви по направлениям. Карточки-узлы цветные, мягкие. Ассоциативная структура. Тёплые цвета. Общее ощущение — творческое, personal, exploration.

**Что взять для Mindloom:**
- Brain map framing = "ваша система" (не "техническая схема")
- Ветви по ассоциативным направлениям (контроль, тело, ценность...)
- Color clusters per branch = тип узла
- Центральный concept как "ядро паттерна"

**Подходит / Не подходит:**  
✓ "Brain map" framing совпадает с Mindloom philosophy  
✓ Тёплые ветки = warm Mindloom palette  
✗ Ассоциативная структура ≠ causal directed graph

**Риск реализации:** 🟢 Низкий — visual reference only

---

## 4. Organic Speech Cloud / Phrase Cloud

*Ключевое ощущение: речь как форма — слова живут внутри облака, которое само является визуальной метафорой.*

---

### REF-18 — Blobmaker.app Organic SVG Shapes

**URL:** https://www.blobmaker.app

**Визуальное описание:**  
Генератор абсолютно органических SVG blob-форм. Не симметричные, не геометрические — настоящие organic shapes. Можно настроить complexity, contrast, color. Output: чистый SVG path. Общее ощущение — природное, живое, уникальное.

**Что взять для Mindloom:**
- Сгенерировать 2–3 fixed blob paths для speech cloud background
- Warm ivory fill (#fffbf4) + subtle stroke
- Использовать как static SVG background под phrase chips
- Blob = "пузырь речи" — visual metaphor for expressed words

**Подходит / Не подходит:**  
✓ Нет зависимостей — static SVG path inline  
✓ Органичность = уникальный visual language Mindloom  
✓ Полный контроль над формой  
✗ При разном кол-ве chips — chips могут выходить за blob

**Риск реализации:** 🟢 Низкий — static SVG + HTML overlay

---

### REF-19 — CSS Speech Bubble Collections

**URL:** https://freefrontend.com/css-speech-bubbles/  
**Also:** https://projects.verou.me/bubbly/ (Bubbly CSS generator)

**Визуальное описание:**  
Pure CSS speech bubbles разных форм: с хвостиком, без хвостика, облачные, органические. border-radius + pseudo-elements. Некоторые используют clip-path для сложных форм. Общее ощущение — разнообразное, от comic-style до premium soft.

**Что взять для Mindloom:**
- Облачная форма без хвостика (не comic bubble) — через очень большой border-radius
- ::before / ::after bumps для "облачности"
- Soft box-shadow вместо border для ощущения парения
- Нет стрелки-хвостика — облако, не диалог

**Подходит / Не подходит:**  
✓ Нет зависимостей, pure CSS  
✓ SSR-safe  
✗ Только 2 bumps через pseudo-elements  
✗ Ограниченная органичность формы

**Риск реализации:** 🟢 Низкий

---

### REF-20 — Figma Tags / Chips UI Kit

**URL:** https://www.figma.com/community/file/1223445741730414477/tags-chips-ui-kit

**Визуальное описание:**  
Коллекция chip-компонентов в разных стилях: soft filled, outlined, with icon, with close. Warm color variants: amber, coral, teal, violet, cream. Rounded pill shape (border-radius 999px). Общее ощущение — polished, accessible, versatile.

**Что взять для Mindloom:**
- Pill chips с soft colored backgrounds (уже реализованы в Mindloom!)
- Multi-line chips для длинных фраз (chip-blue с overflow wrap)
- Цветовая семантика: chip-red = тяжёлые паттерны, chip-green = ресурсы
- Icon chips для speech patterns (иконка + текст)

**Подходит / Не подходит:**  
✓ Chip дизайн уже реализован в Mindloom — это подтверждение правильного направления  
✓ Warm color variants = Mindloom palette  
✗ Просто chips без cloud-shape = не speech cloud

**Риск реализации:** 🟢 Низкий — уже реализовано, только cloud-shape нужна

---

### REF-21 — Displayr Alternatives to Word Cloud

**URL:** https://www.displayr.com/alternatives-word-cloud/

**Визуальное описание:**  
Статья предлагает: tag clouds как grid cards, bubble charts (size = frequency), treemaps, sentiment scatter plots. Bubble chart variant: каждая фраза = bubble размером с частоту. Sentiment color: красный/зелёный/нейтральный. Общее ощущение — data-driven, но accessible.

**Что взять для Mindloom:**
- Bubble chart of phrases: bigger bubble = more significant phrase
- Sentiment tinting: тревожные паттерны = warm red/amber tint
- Scatter approach: позиционировать chips по значимости, не по алфавиту
- Treemap как альтернатива: categorical blocks grouped by type

**Подходит / Не подходит:**  
✓ Semantic positioning = deep UX value  
✓ Size-as-weight = уже знакомый Mindloom язык  
✗ Сложнее в реализации без d3  
✗ Может выглядеть как data dashboard, не speech bubble

**Риск реализации:** 🟡 Средний — нужен простой layout algorithm

---

### REF-22 — HealBubble Emotion Bubbles (concept)

**URL:** https://dl.acm.org/doi/10.1145/3770445.3770497

**Визуальное описание:**  
Emotion bubbles как visual metaphor — каждый эмоциональный маркер = органический blob с внутренним цветом, слегка неправильной формой. Bubbles "дышат" (scale animation). Пастельные цвета — лавандовый, персиковый, мятный. Тихие, не кричащие. Общее ощущение — intimate, therapeutic, safe space.

**Что взять для Mindloom:**
- Дышащий blob для central phrase (scale 1→1.05→1 animation)
- Пастельный fill внутри blob
- Chips вокруг blob как "эхо" центральной фразы
- Therapeutic color palette: лаванда, персик, mint — рядом с Mindloom tones

**Подходит / Не подходит:**  
✓ Therapeutic framing = идеально для психологического отчёта  
✓ Пастельные тона совместимы с Mindloom  
✓ Дышащая анимация = жизнь, не статика  
✗ Медицинский контекст — нужно адаптировать под менее clinical Mindloom tone

**Риск реализации:** 🟢 Низкий — CSS keyframe breathing animation

---

## 5. Bento Explanatory Graph Cards

*Ключевое ощущение: модульные карточки, каждая объясняет одно — mini-graph внутри card, human text рядом.*

---

### REF-23 — Bento UI Design System (Pinterest / Apple)

**URL:** https://www.pinterest.com/ideas/bento-ui-design/934278345771/  
**Ref:** https://www.stan.vision/journal/revolutionizing-ui-ux-in-2024-with-bento-ui-grid-design-trend

**Визуальное описание:**  
Bento: сетка модульных карточек разного размера (1×1, 2×1, 1×2, 2×2). Каждая карточка — один элемент информации. Apple popularized с M2 MacBook Pro presentations. Warm neutral backgrounds. Rounded corners (24–32px). Subtle shadows. Общее ощущение — organized chaos, breathing room, sophistication.

**Что взять для Mindloom:**
- Mini-graph card: одна bento cell = compressed graph visualization
- "Graph in a box" — causal map вписан в bento tile
- Соседняя bento cell = human text объяснение к графу
- Warm ivory/cream bento tiles = уже есть в Mindloom!

**Подходит / Не подходит:**  
✓ Bento = уже реализован в Mindloom layout  
✓ Mini-graph tile = эффективное использование пространства  
✓ Card + text рядом = объяснительный контекст  
✗ Mini-graph требует compressed но readable layout

**Риск реализации:** 🟢 Низкий — bento shell уже есть

---

### REF-24 — Mindify AI Mental Health UI Kit (Behance)

**URL:** https://www.behance.net/gallery/197098729/Mindify-AI-Mental-Health-App-UI-Kit

**Визуальное описание:**  
275+ screens для mental health AI app. Mood tracking visualizations: soft circular progress, emotion bubbles, trend cards. Soft color palette: лавандовый, персиковый, мятный. Typography: clean sans-serif. Data visualizations: gentle, non-alarming, encouraging. Общее ощущение — modern wellness app, не medical tool.

**Что взять для Mindloom:**
- Emotion indicator cards: circular или pill-shaped с soft color fill
- Progress/intensity bars: тонкие, тёплые, animated
- "Insights" card pattern: eyebrow + title + mini-chart + action
- Non-alarming data presentation: no red alerts, no scary charts

**Подходит / Не подходит:**  
✓ Wellness-не-medical tone = идеально для Mindloom framing  
✓ Мягкие цвета совместимы  
✓ Insights pattern = SectionShell уже похоже  
✗ Mobile-first дизайн — нужна адаптация для web

**Риск реализации:** 🟢 Низкий — visual reference for card design

---

### REF-25 — Design Patterns for Mental Health

**URL:** https://designpatternsformentalhealth.org/

**Визуальное описание:**  
Сборник best practices UI/UX для mental health digital products. Документирует паттерны: safe disclosure, progressive reveal, non-judgmental framing, calm palettes. Не про визуальный граф напрямую, но про принципы дизайна для психологических продуктов.

**Что взять для Mindloom:**
- Progressive disclosure = постепенное раскрытие данных (уже в Mindloom!)
- Non-judgmental labels: "паттерн", "наблюдение" — не "проблема", "нарушение"
- Calm visual rhythm: spacing, padding, breathing room
- "Safe container" aesthetic: узлы в warm shell, не exposed raw data

**Подходит / Не подходит:**  
✓ Принципы designed для психологической безопасности пользователя  
✓ Многое уже реализовано в Mindloom (progressive disclosure, HelpTips)  
✗ Нет конкретных graph/cloud визуалов — это pattern library, не moodboard

**Риск реализации:** 🟢 Низкий — принципы, не визуал

---

### REF-26 — Figma Dependency Mapping Template

**URL:** https://www.figma.com/templates/dependency-mapping/

**Визуальное описание:**  
Dependency map: color-coded pill nodes, curved directed arrows между ними. Мягкий серо-кремовый background. Compact legend. Группы по цвету. Карточки с icon + label. Общее ощущение — SaaS-quality, объяснительное, accessible.

**Что взять для Mindloom:**
- Pill nodes с цветным fill по типу (coral / violet / amber / green)
- Compact legend с image-samples (не только text)
- Curved arrows = directed connections без перегруза
- Hover tooltip = mini explanation (не full sheet для лёгких hover)

**Подходит / Не подходит:**  
✓ Pill nodes + type colors = Mindloom visual language  
✓ SaaS quality без over-engineering  
✗ Слишком нейтральный цвет background  
✗ Нет bubble-эффекта для nodes

**Риск реализации:** 🟢 Низкий

---

### REF-27 — Whimsical AI Mind Map

**URL:** https://whimsical.com/ai/ai-mind-maps

**Визуальное описание:**  
AI-генерируемые mind maps. Центральный блок яркий и крупный. Satellite nodes меньше, цветные по типу. Связи тонкие curved. Auto-layout без overlap. Очень clean. Общее ощущение — instant, intelligent, visually satisfying.

**Что взять для Mindloom:**
- Auto-layout = no overlap = решение главной проблемы текущего графа
- Central block prominence = central node выделен сразу
- AI-generated feel = "умный инструмент" framing
- Color-by-type cards = branch differentiation

**Подходит / Не подходит:**  
✓ Auto-layout = главный нужный improvement  
✓ Instant readability  
✗ Нет directed edges с типами  
✗ Mind map ≠ causal map (нет direction)

**Риск реализации:** 🟡 Средний — нужен radial layout algorithm

---

### REF-28 — VisMe Data Story Cards

**URL:** https://visme.co/blog/data-visualization/

**Визуальное описание:**  
Бизнес data stories: одна метрика = одна карточка. Infographic-style. Иконка + число + context. Warm palettes. Часто использует organic shapes как decorative elements. General "explanatory data design" aesthetic.

**Что взять для Mindloom:**
- "One insight per card" = bento tile pattern
- Icon + number + brief context = BentoTile pattern (уже в Mindloom!)
- Organic decorative shapes в corner = subtle visual richness
- Color coding: каждый тип инсайта = свой тон карточки

**Подходит / Не подходит:**  
✓ Card pattern = уже в Mindloom  
✓ Warm palettes совпадают  
✗ Слишком "бизнес-инфографика" — нужно больше psychological framing

**Риск реализации:** 🟢 Низкий — visual reference

---

## Финальные рекомендации

---

### 3 лучших направления для Graph

#### 🥇 Направление 1: Radial Organic Bubble Map (Coggle + Kumu hybrid)

**Описание:**  
Центральный крупный пузырь (coral gradient), 6–7 satellite пузырей вокруг на равных расстояниях по кругу. Пузыри round, с gradient fill по типу (violet, amber, green, coral). Связи — тонкие органические кривые с arrow-heads, цвет и dash = тип связи. NO physics, NO bouncing — статичный radial layout. Subtle glow вокруг центра.

**Почему это лучшее направление:**
- Решает главную проблему: нет overlap, всегда читаемо
- Пузыри = органичная метафора психологических состояний
- Тёплые цвета = Mindloom palette
- Без технического "editor" look

**Что передать в implementation prompt:**  
Radial layout algorithm (angle = 2π × i / n), bubble nodes с radial-gradient fill, 5 типов рёбер через цвет и dash, subtle entrance animation (fade + scale).

---

#### 🥈 Направление 2: Card-Node Explanatory Map (Heptabase + FigJam hybrid)

**Описание:**  
Nodes = не пузыри, а mini-карточки (rounded rectangle). Каждая карточка: тип (eyebrow мелко) + label (bold) + intensity bar снизу. Связи — тонкие curved arrows с цветом. Click на карточку = раскрывается в full detail sheet.

**Почему:**
- Больше информации без клика (тип + интенсивность видны сразу)
- Card format = familiar and safe
- Детали доступны без перегруза

**Что передать в implementation prompt:**  
Rounded rect nodes (16px radius), intensity bar внутри node, curved SVG edges, click → detail sheet (уже реализовано).

---

#### 🥉 Направление 3: Neural Cluster Map (InfraNodus aesthetic)

**Описание:**  
Glow-nodes с цветными halo по психологическому типу. Clusters объединены subtle background wash. Центральный узел — пульсирующий glow. Связи очень тонкие, почти невидимые — акцент на узлах, не на связях.

**Почему:**  
- Самое "психологическое" и интимное ощущение  
- Glow = уже частично реализован  
- Node-first design = читаемость на mobile

**Риск:** может выглядеть слишком "медицинским" без правильной палитры.

---

### 3 лучших направления для Speech Cloud

#### 🥇 Направление 1: SVG Organic Blob + HTML Chips (REF-18 + REF-20)

**Описание:**  
Статичный SVG blob (warm ivory fill, мягкие контуры) как background. Поверх — flex-wrapped HTML chips. В центре blob — central phrase крупным шрифтом. Chips = текущий `cloud-chip` дизайн Mindloom. Возможно лёгкая breathing animation на blob (scale 1→1.03).

**Почему:**  
Самое визуально "облачное" и органичное. Нет зависимостей. Chips = real HTML.

---

#### 🥈 Направление 2: Card-Cloud Hybrid с Emotion Bubble center (REF-22 + прототип)

**Описание:**  
Карточка с bumps сверху. В centre — большой soft circle с central phrase (HealBubble-inspired). Вокруг circle — chips. Circle "дышит" (subtle pulse). Очень accessible, mobile-first.

**Почему:**  
Максимально надёжно на mobile. Therapeutic "bubble" center. Нет зависимостей.

---

#### 🥉 Направление 3: Semantic Bubble Chart of Phrases (REF-21)

**Описание:**  
Каждая phrase = bubble разного размера (по significant). Bubbles floating в organic layout. Тонкие нити связей к central phrase. Цвет = sentiment (amber = тревожный, coral = тяжёлый паттерн, violet = убеждение).

**Почему:**  
Наиболее богатый семантически. Размер = значимость без числа.  
**Риск:** сложнее в реализации, нужен layout algorithm.

---

### Что выбрать первым

**Для graph:**  
→ **Направление 1 (Radial Organic Bubble)** — потому что: решает реальную проблему overlap, нет новых зависимостей, близко к текущей реализации, визуально сильнее всего.

**Для speech cloud:**  
→ **Направление 2 (Card-Cloud Hybrid с Emotion Bubble center)** — потому что: максимально надёжно, нет зависимостей, mobile-first, легко внедрить как отдельный компонент.

---

### Что НЕ выбирать

| Направление | Почему нет |
|---|---|
| InfraNodus-style dark theme | Не совпадает с warm Mindloom palette |
| Force-directed physics layout | Нестабильность при 5–8 узлах, "прыгает" |
| True wordcloud algorithm | Не то что просил пользователь |
| Neo4j/technical graph aesthetic | Слишком "data engineering", не psychological |
| 3D graph (tags routes, 3d-force) | Overkill, accessibility проблемы, мобильный риск |

---

### Какие элементы дизайна передать в implementation prompt

**Для Graph:**
```
Visual system:
- Node shape: circle with radial gradient fill
- Node size: central=80px, satellite=52px
- Layout: static radial (angle = 2π × i / n), distance from center=constant
- Central node: coral gradient (#f0a091 → #bf5147), glow ring, "Ключевой драйвер" badge
- Satellite nodes: type-based gradient palette (violet/amber/green/blue/teal)
- Edge types: hard=coral solid 1.05px, normal=violet solid 0.78px, soft=amber dashed 0.52px,
  choice_available=green dashed 0.60px, choice_blocked=coral semi-opaque 0.88px
- Arrows: markerUnits=strokeWidth, small clean arrowhead, no decorative elements
- Background: warm ivory radial gradient with subtle multi-point color wash
- No toolbar, no minimap, no grid, no zoom/pan controls
- Click: node or edge → bottom sheet (existing ReportDetailSheet)
- Hover: subtle scale(1.07) transform
- Entrance animation: fade + scale from 0.85 to 1, staggered 100ms per node
```

**Для Speech Cloud:**
```
Visual system:
- Container: Card with overflow:visible, bumps (4 div circles) above top edge
- Central element: large soft circle (100–120px diameter), radial-gradient warm fill,
  central phrase text, subtle breathing animation (scale 1 → 1.04, 4s ease)
- Chips: existing cloud-chip palette (chip-red/amber/purple/blue/green)
- Chip layout: flex-wrap centered below central circle
- Font: central phrase 15–17px font-weight 740, chips 11–12px font-weight 560
- Color semantic: chip-red = тяжёлые паттерны, chip-amber = избегание,
  chip-purple = убеждения, chip-blue = контроль, chip-green = ресурс
- No external dependencies
- Mobile: works at 390px with flex-wrap
```

---

## Ссылки на все референсы

| ID | Название | URL | Категория |
|---|---|---|---|
| REF-01 | Kumu.io Stakeholder Map | https://kumu.io | Bubble Graph |
| REF-02 | Whimsical Mind Maps | https://whimsical.com/mind-maps | Bubble Graph |
| REF-03 | Coggle Radial Map | https://coggle.it/gallery | Bubble Graph |
| REF-04 | FigJam Causal Loop Template | https://www.figma.com/templates/causal-loop-diagram/ | Bubble Graph |
| REF-05 | Miro Bubble Map | https://miro.com/templates/bubble-map/ | Bubble Graph |
| REF-06 | mymap.ai Causal Loop | https://www.mymap.ai/template/causal-loop-diagram | Bubble Graph |
| REF-07 | Heptabase Knowledge Graph | https://heptabase.com | Knowledge Graph |
| REF-08 | Napkin.ai Visual Diagrams | https://www.napkin.ai | Knowledge Graph |
| REF-09 | InfraNodus Text Network | https://infranodus.com/graphs | Knowledge Graph |
| REF-10 | Figma Causal Loop Community | https://www.figma.com/community/file/1118686468186768017 | Knowledge Graph |
| REF-11 | Neo4j LLM Graph Builder | https://neo4j.com/blog/developer/llm-knowledge-graph-builder-release/ | Knowledge Graph |
| REF-12 | Obsidian + Juggl Graph | https://github.com/HEmile/juggl | Knowledge Graph |
| REF-13 | HealBubble Emotion Visualization | https://dl.acm.org/doi/10.1145/3770445.3770497 | Neural Node |
| REF-14 | InfraNodus Cluster Color Map | https://help.infranodus.com/kb/read-interpret-text-graph-network | Neural Node |
| REF-15 | open-mindmap iOS-style | https://mindmap.u14.app | Neural Node |
| REF-16 | Flourish Radial Network | https://flourish.studio/visualisations/network-charts/ | Neural Node |
| REF-17 | Miro Brain Map | https://miro.com/templates/brain-map/ | Neural Node |
| REF-18 | Blobmaker Organic SVG | https://www.blobmaker.app | Speech Cloud |
| REF-19 | CSS Speech Bubbles | https://freefrontend.com/css-speech-bubbles/ | Speech Cloud |
| REF-20 | Figma Chips UI Kit | https://www.figma.com/community/file/1223445741730414477 | Speech Cloud |
| REF-21 | Displayr Word Cloud Alternatives | https://www.displayr.com/alternatives-word-cloud/ | Speech Cloud |
| REF-22 | HealBubble Emotion Bubbles | https://dl.acm.org/doi/10.1145/3770445.3770497 | Speech Cloud |
| REF-23 | Bento UI Design Trend | https://www.stan.vision/journal/revolutionizing-ui-ux-in-2024-with-bento-ui-grid-design-trend | Bento Cards |
| REF-24 | Mindify Mental Health UI Kit | https://www.behance.net/gallery/197098729/Mindify-AI-Mental-Health-App-UI-Kit | Bento Cards |
| REF-25 | Design Patterns for Mental Health | https://designpatternsformentalhealth.org/ | Bento Cards |
| REF-26 | Figma Dependency Mapping | https://www.figma.com/templates/dependency-mapping/ | Bento Cards |
| REF-27 | Whimsical AI Mind Map | https://whimsical.com/ai/ai-mind-maps | Bento Cards |
| REF-28 | VisMe Data Story Cards | https://visme.co/blog/data-visualization/ | Bento Cards |
