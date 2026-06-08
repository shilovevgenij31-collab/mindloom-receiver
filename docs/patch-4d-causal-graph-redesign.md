# Patch 4D: Causal Graph Redesign

This patch changes only the public v2 causal graph inside
`app/r/[publicToken]/ReportV2Dashboard.tsx`.

What changed:

- Replaced the layered column graph with a radial causal map.
- The graph now selects one central node and places 5-7 surrounding nodes around it.
- Visual edges are curved SVG paths with styling based on edge type.
- The graph keeps only the most important visual edges to avoid clutter.
- Legend chips now explain hard, normal, soft, choice-available, and choice-blocked links.
- `node_graph.how_to_read` renders as compact "how to read the map" cards.
- Key edge explanations are limited to the strongest/most central links.

Central node selection:

- Use `node_graph.central_node_id` when it matches a graph node.
- Otherwise use the strongest node by intensity.
- Otherwise use the first available node.
- If `node_graph.nodes` is empty, fallback nodes come from `active_nodes`.

What was not changed:

- No schema changes.
- No prompt or repair prompt changes.
- No normalizer changes.
- No API, DB, admin, auth, deploy, heatmap, evidence, diary, session, or legacy renderer changes.
