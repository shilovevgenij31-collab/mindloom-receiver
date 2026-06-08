# Patch 4G-fix - exact Lovable visual port

## Goal

This patch is not a stylistic inspiration pass. It is an exact visual port attempt from the Lovable reference into the existing Mindloom v2 public renderer, while preserving Mindloom's data-driven rendering.

Lovable remained the visual source of truth.

## Lovable source files used

- `src/routes/index.tsx`
- `src/components/report/Heatmap.tsx`
- `src/components/report/CausalGraph.tsx`
- `src/components/report/Section.tsx`
- `src/styles.css`

Reference repo:

- `https://github.com/shilovevgenij31-collab/mindloom-insights`

## Files changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx`
- `docs/patch-4g-fix-exact-lovable-visual-port.md`

## What was rewritten section-by-section

- Hero:
  - kept the Lovable-style hero shell
  - added accent rendering for `ценн*` words in the title
- Snapshot:
  - switched to exact Lovable summary composition and labels
- HowToRead:
  - switched to Lovable stepper wording and spacing
- GrowthBlocker:
  - rewired from the older Mindloom card stack into the Lovable quote + 3-tile structure
- ProtectedNeed:
  - kept only the Lovable-style hero need tile + grouped tag panels + editorial note
- PhraseMicroscope:
  - rewired to the Lovable quote-first microscope layout
- HonestTranslation:
  - rewired to the Lovable before/after translation cards
- Evidence:
  - rewired from older evidence cards into Lovable-like summary tiles + shared ranked panel + amber hypotheses
- Layers:
  - rewired into one Lovable-style shared panel with compact rows
- Markers:
  - rewired into one Lovable-style observation checklist panel
- Practices:
  - rewired into Lovable-style practice cards with colored header area and expected-signal box
- Disclaimer:
  - rewired into the subtle Lovable footer/disclaimer style

## Data-driven behavior preserved

- All content still comes from the normalized Mindloom v2 report.
- No Lovable content was hardcoded as report data.
- Generic text is used only for static headings, labels, and safe fallbacks.
- Missing sections still return `null` or a compact fallback.
- Empty shells and `undefined` / `null` UI leakage were avoided.

## What was intentionally not touched

- Schema
- Normalizer
- Prompts
- Repair prompt
- API
- DB
- Auth
- Docker
- Traefik
- Route branching
- Legacy renderer paths (`v1`, `rich`, `fixed_blocks`)

## Notes on remaining boundaries

- Heatmap and causal graph remain data-driven integrated renderers.
- Their surrounding chrome stays aligned to Lovable, but their adaptive logic was not moved out of Mindloom.

## Verification

- `npm run typecheck`
- `npm run build`

If sandbox build hits Next.js `spawn EPERM`, build must be rerun outside the sandbox.

## Visual QA checklist

- The page should read as one narrow Lovable-style mobile report, not a mixed old/new dashboard.
- Hero composition should closely match the Lovable reference.
- Snapshot should feel like one composed shell, not a card grid.
- Growth blocker should no longer show the older central-knot / core-pain card system.
- Protected need, microscope, and translation should visually read like Lovable sections.
- Evidence, layers, markers, and practices should no longer look like the previous ReportV2 card patterns.
- No horizontal overflow at `390px`.
- Long Russian text must wrap naturally without broken words.
