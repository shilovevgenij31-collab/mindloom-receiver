## Patch 4E-final-fix

Scope: visual polish for the active v2 heatmap canvas in `app/r/[publicToken]/ReportV2Dashboard.tsx`.

Changed:
- stabilized heat node labels with stricter short-label mapping and fixed-width label rendering
- ensured each orb renders only the percent and each caption renders only below the orb
- deepened the thermal background with richer overlapping radial fields
- strengthened per-node heat blobs and node halos so nodes read as heat points, not buttons
- increased hex grid coverage and contrast to make it feel like a structural neural texture
- strengthened neural route lines and dots without changing graph logic or lower blocks

Not changed:
- schema, prompt, repair prompt, normalizer, API, DB, admin, auth, deploy flow
- legacy renderers, causal graph, evidence, hero, other report sections
- lower heatmap blocks structure, mobile shell, route max-width
