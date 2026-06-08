# Patch 3c — Mindloom Report v2 Final Visual Polish

## What changed

**File modified:** `app/r/[publicToken]/ReportV2Dashboard.tsx` (full rewrite of visual layer)

---

## Problems fixed from previous dashboard

### 1. Overview cards: broken narrow-column typography
**Before:** Each overview section (Target / Desired State / Mechanism) used a nested `ml-v2d-grid-3` inside an outer 3-column grid. At any viewport this produced extremely narrow columns where Russian text wrapped to one word or even one syllable per line.

**Fix:** Replaced nested grid with `LabeledBlock` — a vertical stack of labeled paragraphs. Each field renders as a full-width labeled block inside the card. No nested grids. Text can freely wrap at natural word boundaries.

### 2. Heatmap: not visually premium enough
**Before:** Simple rounded blobs, minimal glow, no thermal depth.

**Fix:**
- Added layered thermal blobs (blurred radial gradients) behind each node — these animate independently (`ml-throb`) creating a living heat-field effect
- Nodes now have `radial-gradient` fills using `color-mix(in srgb, ...)` for a true glow look
- `drop-shadow` filter on nodes creates the glowing halo
- Nodes animate with `ml-pulse` (scale + opacity) with staggered delays per node index
- Background has 4 different radial gradients pre-baked for warm/cool zones
- Grid overlay masked to a radial gradient (visible at center, fades at edges)

### 3. Node graph: looked like card list with lines
**Before:** Rectangular cards with text inside the graph panel.

**Fix:**
- Nodes are now **circular** (`border-radius: 50%`) with `radial-gradient` fills per tone
- Each tone has a distinct gradient: red = warm rust, purple = deep violet, green = forest, etc.
- `--nc` CSS variable per node drives the `ml-nodeglow` animation (glow pulse)
- Hover: `scale(1.12)` + glow shadow
- SVG edges use variable opacity and stroke-width based on `edge.strength`
- Column labels positioned at top, hidden on mobile
- Mobile fallback: nodes become horizontal pill-style cards, SVG hidden

### 4. Technical IDs as primary content
**Before:** `defense_hypercontrol` and similar snake_case IDs shown as main headings.

**Fix:** `nodeLabel()` always prefers `node.label` over `node.id`. In hypothesis cards: human-readable label shown as heading, `node_id` shown only as small monospace chip below.

### 5. English section labels
**Fix:** All section labels replaced with Russian:
- ACTIVE NODES → Активные узлы
- SPEECH EVIDENCE → Речевые маркеры
- HYPOTHESES → Гипотезы по узлам
- TRAJECTORY MAP → Траектория паттерна
- PROCESSING DASHBOARD → Панель проработки
- MINDLOOM LAYERS → Слои Mindloom
- TRANSFORMATION MARKERS → Маркеры трансформации
- RECOMMENDED PRACTICES → Рекомендованные практики
- NEURO HEATMAP → Тепловая карта узлов
- NODE GRAPH → Системная карта связей

### 6. Practices / markers: wall of text
**Fix:** Practices now use internal `ml-practice-section` cards for Цель / Как делать / Наблюдать — each subsection has its own labeled block. Shift signal highlighted in green. Markers use lavender cards with shift signal in green inset.

### 7. Spacing and empty columns
**Fix:** `LabeledBlock` is only rendered when value is non-null/non-empty (`hasText()` guard). No empty cards rendered. Stats grid uses 4 columns (Узлов / Маркеров / Слоёв / Практик) in a compact strip.

---

## Layout structure

1. Hero (full width, 2-column: content + meta card)
2. Overview grid (3 columns: Target / Desired State / Mechanism) — uses `LabeledBlock`, no nested grids
3. Heatmap (full width hero card with dark neural panel + side legend)
4. Node Graph (full width, circular SVG-connected nodes + edge detail grid)
5. Evidence (2 cols: Active Nodes | Speech Evidence)
6. Hypotheses (auto-fit grid, shown only if data exists)
7. Trajectory (horizontal chain with arrow connectors)
8. Processing Dashboard + Layers (2 cols)
9. Markers + Practices (2 cols)
10. Disclaimer

---

## Typography

- `h1` in hero: `clamp(1.85rem, 4vw, 3.6rem)` — large but not oversized
- Section titles: `clamp(1.18rem, 2vw, 1.65rem)`
- Eyebrows: `0.68rem` uppercase tracking
- Body text: `0.88–0.95rem` / `line-height: 1.62–1.68`
- No narrow columns where text could wrap by letter

---

## Mobile layout (390px)

- Single column everywhere
- Heatmap panel `min-height: 350px`, nodes forced to `56×56px`
- Node graph SVG hidden; nodes become static pill cards
- Trajectory becomes vertical stack (border-right/left swap)
- Heatmap side panel becomes an auto-fit grid of zone cards

---

## Animations

| Animation | What | Trigger |
|---|---|---|
| `ml-fadein` | Sections fade + slide up | On mount |
| `ml-pulse` | Heatmap nodes scale/opacity | Continuous, staggered |
| `ml-throb` | Heatmap thermal blobs | Continuous |
| `ml-nodeglow` | Graph node box-shadow glow | Continuous |
| `ml-grow` | Progress bar fill | On mount |
| `ml-linein` | SVG edge lines opacity | On mount |
| hover `transform` | Cards, nodes lift by 2px | On hover |

All animations and hover transitions are disabled under `prefers-reduced-motion: reduce`.

---

## What was NOT changed

- Schema v2 structure
- Prompt for Mindloom
- Repair prompt
- Create-report route
- API / OpenAPI
- DB schema
- Admin UI
- Auth / env / secrets
- Docker / Traefik
- Legacy v1 / rich / fixed_blocks renderer path
- Raw JSON is never exposed publicly

---

## Typecheck / build

Both `npm run typecheck` and `npm run build` pass with no errors or warnings.

---

## Style reference

Visual style inspired by Holst/Mindloom reference: warm beige background, soft white cards, large border radius, subtle shadows, muted typography, lavender/mint/beige accents, pill chips, progress bars, calm premium wellness feeling. Reference used for **style only** — no mobile app layout, no bottom nav, no diary screen, no four-phone layout.
