# Patch 4O-fix-4 — Interaction Regression Fix

## Root Cause

After Patch 4O-fix-3 the page rendered visually but all interactive elements were dead.

The cause was **CSS `overflow: clip` creating a fixed-element containing block**. The page wrapper in `app/r/[publicToken]/page.tsx` has `overflowX: 'clip'`. In Chromium 108+ and Safari, an element with `overflow: clip` (unlike `overflow: hidden`) acts as a containing block for `position: fixed` descendants. This means all four sheet components that rendered `position: fixed` backdrops *inside* the article DOM tree were constrained to the article's bounds — they were not viewport-wide overlays and left invisible areas where the page content was intercepting clicks.

Because the backdrops were sized/positioned relative to the `overflow: clip` ancestor rather than the viewport, they did not cover the interactive page elements, causing every click to fall through.

Secondary issue: `openSheet`/`closeSheet` were recreated on every render (plain arrow functions), causing `useEffect` dependencies to re-run on each render cycle.

## Files Changed

- `app/r/[publicToken]/ReportV2Dashboard.tsx`

## What Was Fixed

### 1. Converted all 4 sheet components to `createPortal(content, document.body)`

Sheets now escape the article DOM tree entirely and render directly under `<body>`, making them immune to ancestor CSS containment. Matches the existing correct pattern used by `HelpTip`.

| Component | Was | Now |
|---|---|---|
| `HeatmapInfoSheet` | `return ( <> ... </> )` | `return createPortal( <> ... </>, document.body )` |
| `HowToReadSheet` | `return ( <> ... </> )` | `return createPortal( <> ... </>, document.body )` |
| `ReportDetailSheet` | `return ( <> ... </> )` | `return createPortal( <> ... </>, document.body )` |
| `GraphHowToReadSheet` | `return ( <> ... </> )` | `return createPortal( <> ... </>, document.body )` |

### 2. `useCallback` for `openSheet` / `closeSheet`

```ts
// Before — new function reference each render:
const openSheet = (s: DetailSheetState) => setDetailSheet(s);
const closeSheet = () => setDetailSheet(null);

// After — stable references:
const openSheet = useCallback((s: DetailSheetState) => setDetailSheet(s), []);
const closeSheet = useCallback(() => setDetailSheet(null), []);
```

## Clicks Verified (Manual QA Checklist)

- [ ] Hero: "Как читать отчёт" → opens `HowToReadSheet`
- [ ] Hero: "N активных узлов" → scrolls to evidence section
- [ ] Hero: HelpTip opens on click
- [ ] Overheat / Snapshot / GrowthBlocker / ProtectedNeed / PhraseMicroscope / HonestTranslation: all HelpTips open
- [ ] Heatmap: zone click → opens `ReportDetailSheet` with enriched content
- [ ] Heatmap: "Как читать карту" → opens `HeatmapInfoSheet`
- [ ] Heatmap: keyboard Enter/Space on focused zone → opens sheet
- [ ] NodeGraph: node click → opens `ReportDetailSheet`
- [ ] NodeGraph: edge click → opens `ReportDetailSheet`
- [ ] NodeGraph: "? Как читать" → opens `GraphHowToReadSheet`
- [ ] Evidence: "Показать все узлы" disclosure expands
- [ ] Evidence: "Показать цитаты" disclosure expands
- [ ] Evidence: node click → opens sheet
- [ ] Layers: click → opens enriched layer sheet
- [ ] Markers: click → opens enriched marker sheet
- [ ] Practices: disclosures open/close
- [ ] After closing any sheet → page is interactive again; no invisible overlay

## Typecheck Result

```
EXIT:0  (0 errors)
```

## Build Result

```
✓ Compiled successfully
Route /r/[publicToken]: 33.9 kB (First Load JS 121 kB)
EXIT:0
```
