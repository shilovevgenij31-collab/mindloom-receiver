# Patch 4M — Mobile Interaction Layer

## What Changed

Added a tap/click interaction layer on top of the existing visual report. No visual redesign. No schema, API, DB, or backend changes.

### Files changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx` — new `DetailSheetState` type, `ReportDetailSheet` component, callbacks threaded through HeatmapSection, NodeGraphSection, EvidenceLayerSectionExact, LayersSectionExact, MarkersSectionExact
- `docs/patch-4m-mobile-interaction-layer.md` — this file

---

## New Components

### `ReportDetailSheet`

A fixed-position bottom sheet that renders contextual details for a tapped element.

**Features:**
- Fixed overlay with semi-transparent blurred backdrop
- Sheet slides from bottom: `position: fixed; bottom: 0`
- Max height: 84vh with `overflow-y: auto`
- Rounded top corners (24px)
- Warm ivory surface matching report palette
- Handle bar at top
- Title with optional eyebrow label
- Close button (×) with `aria-label="Закрыть"`
- ESC key closes via `useEffect` keyboard listener
- Backdrop click closes
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="mlm-sheet-title"`
- No portals — uses CSS `position: fixed` which works independently of DOM position

**State type:**
```typescript
type DetailSheetType = 'heatmap-node' | 'graph-node' | 'graph-edge' | 'evidence-node' | 'layer' | 'marker';

interface DetailSheetState {
  type: DetailSheetType;
  title: string;
  eyebrow: string;
  tone?: Tone | 'beige';
  percent?: number | null;
  description?: string | null;
  explanation?: string | null;
  why?: string | null;
  evidence?: string[];
  tags?: string[];
  badge?: string | null;
  note?: string | null;
  rows?: Array<{ label: string; text?: string | null }>;
  edgeType?: string;
  strength?: number | null;
}
```

**Sheet state is managed in `ReportV2Dashboard`:**
```typescript
const [detailSheet, setDetailSheet] = useState<DetailSheetState | null>(null);
const openSheet = (s: DetailSheetState) => setDetailSheet(s);
const closeSheet = () => setDetailSheet(null);
```

---

## What Became Tappable

### Heatmap nodes

- Each node orb in `HeatmapCanvasFirst` is now tappable
- `cursor: pointer`, `role="button"`, `tabIndex=0`, `aria-label`
- Keyboard: Enter/Space activates
- Sheet content: percent metric + progress bar, description or fallback, why_it_matters if available
- Fallback: "Эта зона показывает, где в материале чаще всего проявляется напряжение или ресурс."
- Note: "Процент — условная сила проявления в данном материале, не медицинская оценка."

### Graph nodes

- Each node in `NeuroNodeGraph` canvas is now tappable
- `cursor: pointer`, `role="button"`, `tabIndex=0`, keyboard activation
- Sheet content: percent, central badge if applicable, description, related incoming/outgoing edges as rows, evidence quotes
- Node edges shown as rows: `← NodeName` / `→ NodeName` with edge explanation
- Fallback: "Этот узел участвует в общей карте причинно-следственных связей."
- Note: "Узел — повторяющаяся смысловая точка, вокруг которой собирается часть паттерна."

### Graph edges

- Each edge has a transparent hit path added: `stroke="transparent"`, `strokeWidth=20`, `cursor: pointer`
- Visible path is unchanged; only the hit path is interactive
- Sheet content: type chip + strength, explanation, edge meaning (per type), note
- Edge meaning strings:
  - hard: "Связь срабатывает быстро и почти автоматически."
  - normal: "Связь заметно поддерживает паттерн."
  - soft: "Связь проявляется слабее или не всегда."
  - choice_available: "Здесь может появляться пространство выбора."
  - choice_blocked: "Здесь система переживает выбор как недоступный."
- Note: "Связь показывает не диагноз, а предполагаемую причинно-следственную динамику по материалу."

### How-to-read rows (graph)

- Each visible read row in `NeuroNodeGraph` is now tappable (when `edgeRef` is available and valid)
- Opens same edge sheet as tapping SVG edge
- Shows "Подробнее →" hint when tappable

### Evidence node rows

- Each node row in `EvidenceLayerSectionExact` is tappable
- Shows full evidence quotes (up to 4) in sheet
- "Все цитаты →" hint shown when more quotes exist

### Layer rows

- Each layer row in `LayersSectionExact` is tappable
- Sheet content: percent, description, quote/manifestation, explanation note
- Note: "Слой показывает, на каком уровне закрепляется реакция: потребность, убеждение, защита, поведение или тело."

### Marker rows

- Each marker row in `MarkersSectionExact` is tappable
- Sheet content: description, expected signal (shift_signal)
- Note: "Маркер помогает замечать реальные изменения в повседневных ситуациях."

---

## HelpTip Fix

`HelpTip` button now uses `e.stopPropagation()` so clicking `?` doesn't trigger a parent card's `onClick`.

---

## Callback Threading

```
ReportV2Dashboard (state + openSheet/closeSheet)
  → HeatmapSection(onNodeClick)
    → NeuroHeatmapCanvasFirst(onNodeClick)
      → HeatmapCanvasFirst(onNodeClick)
  → NodeGraphSection(onNodeClick, onEdgeClick)
    → NeuroNodeGraph(onNodeClick, onEdgeClick)
  → EvidenceLayerSectionExact(onOpen)
  → LayersSectionExact(onOpen)
  → MarkersSectionExact(onOpen)
```

Practices section uses existing inline `DisclosurePanel` for "Как делать и что наблюдать" — no sheet needed, already accessible.

---

## What Was NOT Changed

- Schema, normalizer, prompts, repair prompt
- API, DB, auth, Docker, Traefik
- Route branching, legacy renderer, v1/rich/fixed_blocks renderer
- Admin UI
- Overall 16-section report order
- Hero, Snapshot, HowToRead, GrowthBlocker, ProtectedNeed, PhraseMicroscope, HonestTranslation, KeyPhrases visual composition
- Heatmap visual design (canvas colors, orb sizes, hex texture)
- Graph visual design (node sizes, edge styles, legend, semantic positions)
- Trajectory section
- Disclaimer, Footer
- Practices section (already has disclosure panels)
- `DisclosurePanel` component
- `HelpTip` behavior (except adding stopPropagation)
- All existing CSS media queries

---

## Tests Run

- `npx tsc --noEmit` → clean (no output)
- `npm run build` → clean, 11 pages, `/r/[publicToken]` 28.5 kB

---

## Manual QA Checklist

- [ ] Tapping heatmap node opens sheet with zone name, percent, description
- [ ] Tapping graph node opens sheet with node name, percent, badge, related edges
- [ ] Tapping graph edge (transparent hit path) opens sheet with edge type, explanation
- [ ] Tapping how-to-read row opens edge sheet (when edge data available)
- [ ] Tapping evidence node row opens sheet with full quotes
- [ ] Tapping layer row opens sheet with description + note
- [ ] Tapping marker row opens sheet with description + shift_signal
- [ ] Close button (×) closes sheet
- [ ] Backdrop click closes sheet
- [ ] ESC key closes sheet
- [ ] HelpTip ? button works without opening parent sheet
- [ ] No blank/undefined/NaN in any sheet
- [ ] Practices "Как делать" disclosure still works
- [ ] No horizontal overflow at 390px
- [ ] Keyboard: Enter/Space activates tappable elements
- [ ] All other sections visually unchanged
