## Patch 4F

Scope: visual system redesign for the v2 public mobile report in `app/r/[publicToken]/ReportV2Dashboard.tsx`.

Changed:
- introduced shared mobile-bento primitives: `MLIcon`, `SectionShell`, `BentoTile`, updated `Chip`, updated `Callout`, and `MetricBar`
- strengthened typography hierarchy for section labels, titles, and content blocks
- reduced nested white-card patterns across the main narrative sections
- rebuilt snapshot, growth blocker, protected need, phrase microscope, honest translation, evidence, trajectory, layers, markers, practices, and heatmap lower explanation into more editorial layouts
- aligned heatmap lower rows and graph section shell with the new visual language

Not changed:
- schema, prompt, repair prompt, normalizer, API, DB, admin, auth, deploy/env/Docker/Traefik
- routing, legacy renderers, route branching, mobile shell width, causal graph core layout, heatmap core canvas layout
