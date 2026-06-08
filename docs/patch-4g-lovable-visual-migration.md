# Patch 4G - Lovable visual migration

## Goal

Transfer the visual language from the Lovable prototype into the existing v2 public renderer without changing the report schema, route logic, backend flow, or legacy renderers.

Reference source used:

- `https://github.com/shilovevgenij31-collab/mindloom-insights`

## Files changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx`
- `docs/patch-4g-lovable-visual-migration.md`

## What was migrated

### Shared visual system

- `SectionShell` now behaves like a chapter wrapper instead of a heavy card.
- Added shared visual primitives for the Lovable rhythm:
  - `SharedPanel`
  - `DottedDivider`
  - `PanelRow`
  - `QuoteBlock`
  - `TagGroup`
- Preserved the existing icon system, but aligned section chrome and panel language to the Lovable palette and spacing.

### Sections moved toward the Lovable language

- `HeroSection`
  - one large warm editorial panel
  - brand pill
  - tiny report indicator
  - softer metric composition
- `SnapshotSection`
  - one main panel instead of stacked small cards
  - mint first-step callout below
- `HowToReadSection`
  - stepper inside a shared warm panel
- `ProtectedNeedSection`
  - stronger leading need tile
  - grouped tag language
- `PhraseMicroscopeSection`
  - quote-first editorial composition
  - colored fragment rows
- `HonestTranslationSection`
  - paired before/after translation blocks
- `HeatmapSection`
  - kept the integrated heatmap canvas
  - aligned the lower explanatory area to the new shared-panel system
- `NodeGraphSection`
  - kept the integrated graph
  - aligned the outer chapter shell and supporting surfaces
- `EvidenceLayerSection`
  - reduced nested-card density
  - moved toward grouped summaries and rows
- `TrajectorySection`
  - cycle inside a shared panel
  - compact blocking / exit tiles
- `LayersSection`
  - shared-panel row treatment
- `MarkersSection`
  - checklist-style shared panel
- `PracticesSection`
  - stronger hierarchy for practice cards
  - quieter metadata and cleaner internal rows

## What intentionally stayed unchanged

- No schema changes
- No prompt changes
- No repair prompt changes
- No auth changes
- No API / backend changes
- No DB changes
- No deploy flow changes
- No route branching changes
- No legacy renderer changes
- No structural rebuild of the integrated heatmap canvas
- No structural rebuild of the integrated causal graph

## Data integrity

The renderer remains fully data-driven.

- All migrated sections still render from the normalized v2 payload.
- Empty-state and partial-data guards remain in place.
- No raw debug, internal meta, or payload dump was exposed publicly.

## Minimal resilience fix included

- `TrajectorySection` now renders `blocking_point` and `possible_exit` tiles only when the corresponding value exists, so `undefined` cannot leak into the UI there.

## Verification

- `npm run typecheck`: passed
- `npm run build`: run after this patch; sandbox may still require escalation because of Next.js `spawn EPERM`

## Visual QA checklist

- Mobile report still reads as a centered phone-like column
- No horizontal overflow at `390px`
- Long copy wraps cleanly inside panels
- Hero reads as a chapter opener, not a card stack
- Snapshot / phrase / translation sections read as grouped editorial blocks
- Heatmap and graph stay the same visualizations, only their surrounding visual language changes
- No `undefined` / `null` strings appear in public UI

## Known limitations

- Heatmap canvas and causal graph geometry were intentionally not rebuilt in this patch.
- Final browser screenshot QA still depends on browser tooling availability in-session.
