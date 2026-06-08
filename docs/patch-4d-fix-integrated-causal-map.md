# Patch 4D Fix: Integrated Infographic Causal Map

This patch fixes the visual direction of the public v2 causal graph only.

What changed:

- Replaced the graph-plus-card-stack layout with one integrated infographic panel.
- Added inline SVG node icons directly inside graph bubbles.
- Strengthened the central driver node with coral gradient, icon, halo, chip, and percent.
- Limited the visual canvas to one central node plus up to six surrounding nodes.
- Positioned causes on the left, support near the top, consequences on the right, and somatic/body nodes lower in the map.
- Styled curved SVG arrows by `edge.type` instead of making all links look similar.
- Moved legend into a compact inline strip inside the same graph module.
- Moved graph explanations into one integrated "Как читать карту" panel.
- Removed the repeated "Ключевые связи" card stack.

What did not change:

- No schema, prompt, repair prompt, normalizer, API, DB, admin, auth, deploy, heatmap, evidence, hero, or legacy renderer changes.
