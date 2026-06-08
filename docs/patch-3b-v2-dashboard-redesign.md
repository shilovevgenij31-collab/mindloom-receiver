# Patch 3b: V2 Public Dashboard Redesign

The previous four-phone interpretation of the reference image was replaced.

The reference is now used as visual style only: warm background, rounded cards,
muted typography, soft shadows, chips, progress bars, and calm wellness /
neuropsychology accents.

What changed:

- `ReportV2Dashboard` replaces the previous `ReportV2Showcase` route branch.
- Desktop is now a real web report dashboard with a wide hero, overview grid,
  hero-level heatmap, hero-level node graph, and detailed report sections.
- Mobile collapses into a single-column responsive report.
- Heatmap and node graph are primary visual sections, not small list widgets.
- `transformation_markers` are rendered as observation markers, not a diary.
- `recommended_practices` are rendered as practice cards, not a protocol or app flow.

What was not implemented:

- No diary functionality.
- No session history.
- No multi-session dynamics.
- No bottom app navigation.
- No input fields or save buttons.

Legacy reports continue to use the existing legacy renderer path.
