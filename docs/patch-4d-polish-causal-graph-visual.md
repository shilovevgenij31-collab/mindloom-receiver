# Patch 4D: causal graph visual polish

Scope: visual restyle only for the current integrated v2 public causal graph.

Changed:
- softened the graph canvas background to a flatter warm card surface;
- reduced glossy/cheap 3D effects on graph nodes;
- tuned node colors toward a matte pastel system-map palette;
- softened node shadows, borders, and central driver glow;
- reduced edge stroke weight and arrowhead dominance;
- softened inline legend pills and the "Как читать карту" reading panel.

Not changed:
- no graph structure changes;
- no new graph functionality;
- no schema, prompt, repair prompt, API, auth, DB, env, Docker, Traefik, or deploy flow changes;
- no legacy renderer changes;
- no heatmap, evidence, hero, or other report section changes.

Validation:
- `npm run typecheck`
- `npm run build`
