# Patch 2: Public Renderer v2

This patch adds a dedicated public renderer for Mindloom Report v2 payloads.

## Runtime behavior

- If `meta.schema_version === "2.0"`, `/r/:token` renders the v2 dashboard path.
- Legacy `v1`, `rich`, and `mindloom_report_v2_fixed_blocks` payloads continue through the previous renderer path.
- Raw JSON remains hidden on the public page.
- Top-level `protocol` is not rendered.

## V2 sections rendered

- `hero`
- `target`
- `desired_state`
- `mechanism`
- `speech_layer`
- `active_nodes`
- `heatmap`
- `node_graph`
- `hypothesis_table`
- `trajectory`
- `processing_dashboard`
- `mindloom_layers`
- `transformation_markers`
- `recommended_practices`
- `disclaimer`

## QA checklist

1. Open a report with `meta.schema_version: "2.0"`.
2. Verify all sections above render without exposing raw payload JSON.
3. Verify `heatmap` is rendered as cards/grid with intensity bars.
4. Verify `node_graph` shows nodes and `from -> to` edges with strength bars.
5. Verify a legacy `v1` report still renders correctly.
6. Verify a `rich` report still renders correctly.
7. Verify a `mindloom_report_v2_fixed_blocks` report still renders correctly.
