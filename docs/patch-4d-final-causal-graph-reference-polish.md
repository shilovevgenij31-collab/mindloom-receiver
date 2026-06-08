# Patch 4D-final: causal graph reference polish

Scope: final visual polish for the current integrated v2 public causal graph.

Changed:
- moved visible graph nodes into deterministic semantic positions: causes/triggers on the left, central driver in the middle, consequences and body/result on the right;
- strengthened the central driver as the visual system core with a larger matte terracotta bubble and double halo;
- restyled surrounding nodes as premium matte bubbles with ivory rings, soft colored glow, and subtle volume;
- made edge types visually distinct: hard, normal, soft, choice_available, and choice_blocked now map to different stroke weights, colors, dash styles, opacity, and arrows;
- shortened SVG edges so lines terminate near bubble boundaries instead of crossing node text;
- added a warmer premium canvas background with very subtle topographic/neural field lines;
- aligned inline legend samples with real edge styles;
- softened the "Как читать карту" panel with lighter dividers and tinted rows.

Not changed:
- no schema, prompt, repair prompt, normalizer, API, DB, admin, auth, deploy, env, Docker, or Traefik changes;
- no heatmap, evidence, hero, other report section, legacy renderer, mobile shell, or route width changes;
- no graph card stack restored;
- no generated image assets.

Validation:
- `npm run typecheck`
- `npm run build`
