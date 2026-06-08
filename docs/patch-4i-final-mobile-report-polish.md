# Patch 4I — Final mobile report polish

Files changed:
- `app/r/[publicToken]/ReportV2Dashboard.tsx`
- `docs/patch-4i-final-mobile-report-polish.md`

Scope:
- Final polish only for the current v2 public mobile renderer.
- No schema, normalizer, prompt, repair prompt, API, DB, auth, deploy flow, route branching, admin UI, or legacy renderer changes.

What was improved:

1. Full 16-block flow preserved
- Confirmed the active renderer still keeps the intended order:
  1. Hero
  2. Snapshot
  3. HowToRead
  4. GrowthBlocker
  5. ProtectedNeed
  6. PhraseMicroscope
  7. HonestTranslation
  8. KeyPhrases
  9. Heatmap
  10. NodeGraph
  11. Evidence
  12. Trajectory
  13. Layers
  14. Markers
  15. Practices
  16. Disclaimer

2. Typography softened
- Reduced several remaining heavy weights in the active exact sections instead of changing layout.
- Hero, snapshot, blockers, protected need, microscope, graph, evidence, layers, markers, and practices now read less shouty and less dashboard-like.
- Kept hierarchy intact while pulling down excessive emphasis.

3. Long text flow and disclosure
- Heatmap supporting copy now trims long scale/focus text and exposes the full text through disclosure when needed.
- Graph “how to read” area now shows the first rows directly and moves additional explanations into a disclosure block.
- This keeps the mobile page shorter and prevents dense text walls in the visible flow.

4. Heatmap polish
- Kept the integrated canvas-first heatmap path.
- Continued to soften orb treatment so nodes feel less like buttons.
- Remaining-zone accounting now matches the visible-node limit correctly.
- Mobile text handling for the lower explanatory area is safer under long content.

5. Graph polish
- Edge type fallback is now inferred from strength when explicit edge type is missing.
- This makes the graph more data-driven and more visually consistent on partial payloads.
- Edge styling differences between hard / normal / soft / choice edges are clearer.
- Node styling is softer and less glossy.

6. Data-driven / fallback resilience
- Verified the active renderer still uses fallback builders for:
  - `snapshot`
  - `how_to_read`
  - `protected_need`
  - `phrase_microscope`
  - `honest_translation`
- Partial payloads continue to degrade into readable sections instead of empty technical gaps.

Checks:
- `npm run typecheck`
- `npm run build`

Visual QA to verify manually:
- No `undefined` / `null` strings in UI.
- No horizontal overflow at `390px`.
- Heatmap canvas remains dominant and readable.
- Graph stays readable without turning into a dense text block.
- Long explanation content collapses into disclosure instead of flooding the page.
- Legacy routes still do not use this renderer.
