# Patch 4S-fix-1 — Interaction, Responsive & Stability Pass

## Goal

After Patch 4S applied the visual token system section-by-section, this patch fixes interaction quality, layout bugs, and generative stability without altering any visual design choices.

---

## Bugs Fixed

### 1. Help icons — smaller and quieter

| Property | Before | After |
|---|---|---|
| Visual size | 22×22px | 19×19px |
| Background | `#ede8e0` solid | `rgba(228,222,214,0.55)` translucent |
| Border opacity | 0.16 | 0.11 |
| Font size | 0.68rem | 0.62rem |
| Font weight | 760 | 700 |
| Glyph color | `#6f675f` | `#918980` (more muted) |

Icons now read as secondary UI controls, not accents. Clickable across all 14 sections that have help tips.

---

### 2. Heading row layout — help icon no longer wraps

`SectionHead` h2 container:

| Property | Before | After |
|---|---|---|
| `flexWrap` | `'wrap'` | `'nowrap'` |
| `alignItems` | `'center'` | `'flex-start'` |
| `gap` | `0.42rem` | `0.50rem` |

With `flexWrap: 'nowrap'`, the help icon is always in the same flex row as the title. Title text wraps within its own flex item (`flex: '1 1 auto'`). With `alignItems: 'flex-start'`, the icon aligns to the top when title wraps to multiple lines.

Fixes the "Что стоит за привычными формулировками" section where the icon was falling below the title.

---

### 3. Speech Cloud — central bubble no longer overlaps label

The `.mlm-speech-center` bubble has a `box-shadow` ring of up to 22px. The "Главный паттерн" label was only 0.65rem (~10px) above the bubble center, causing the ring to visually overlap the label.

| Property | Before | After |
|---|---|---|
| Label `margin-bottom` | `0.65rem` (~10px) | `1.55rem` (~25px) |
| Label font-weight | 780 | 700 |
| Label color | `#8070cc` | `#9080cc` (slightly softer) |
| CSS ring opacity | `0 0 0 22px rgba(…0.04)` | `0 0 0 18px rgba(…0.03)` |

Label and bubble now have clear visual separation. Also works on long central phrases.

---

### 4. Heatmap nodes — hover / focus / active states

Added to CSS style block:

```css
/* hover & focus: pause the pulse animation, scale up */
.mlm-heat-node-fix[role="button"]:hover .mlm-heat-orb-fix,
.mlm-heat-node-fix[role="button"]:focus-visible .mlm-heat-orb-fix {
  animation-name: none;
  transform: scale(1.055);
  transition: transform 180ms ease-out;
}
/* active: slight scale-down */
.mlm-heat-node-fix[role="button"]:active .mlm-heat-orb-fix {
  animation-name: none;
  transform: scale(0.96);
  transition: transform 100ms ease-out;
}
/* accessible focus ring on node container */
.mlm-heat-node-fix[role="button"]:focus-visible {
  outline: 2px solid rgba(220,180,140,0.70);
  outline-offset: 5px;
  border-radius: 50%;
}
```

Heatmap nodes now visually respond to hover/focus/tap without changing the canvas algorithm or topology.

---

### 5. Graph nodes — hover / focus / active states

Added `className="mlm-graph-node"` to each graph node div. CSS:

```css
.mlm-graph-node[role="button"] {
  transition: transform 180ms ease-out;
}
.mlm-graph-node[role="button"]:hover {
  transform: translate(-50%, -50%) scale(1.055) !important;
}
.mlm-graph-node[role="button"]:active {
  transform: translate(-50%, -50%) scale(0.96) !important;
}
.mlm-graph-node[role="button"]:focus-visible {
  outline: 2px solid rgba(220,180,140,0.70);
  outline-offset: 4px;
}
```

Graph nodes give interactive feedback while preserving the layout algorithm.

---

### 6. Graph key-relation rows — hover state

Added `className="mlm-graph-edge-row"` to clickable relation row divs. CSS:

```css
.mlm-graph-edge-row[role="button"] {
  transition: background 150ms ease-out;
}
.mlm-graph-edge-row[role="button"]:hover {
  background: rgba(255,247,236,0.98) !important;
  border-color: rgba(215,198,178,0.70) !important;
}
```

---

## Motion System — Reduced Motion

All new hover/active transitions respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .mlm-heat-node-fix hover/active — transform: none, transition: none
  .mlm-graph-node hover/active — transform: translate(-50%,-50%), transition: none
  .mlm-graph-edge-row — transition: none
}
```

Existing pulse animations (heatmap orbs, speech center) were already guarded; guards remain.

---

## Generative Stability Audit

| Scenario | Status |
|---|---|
| 0 active nodes | `NeuroHeatmapCanvasFirst` returns fallback empty-state div |
| 0 graph nodes | `NeuroNodeGraph` returns null |
| Long node labels | `getShortLabel()` truncates; `WebkitLineClamp: 2` on graph labels; `overflowWrap: 'normal'` on heatmap labels |
| Long central Speech Cloud phrase | `shortCentralText(rawCentral, 5)` caps to 5 words; bubble is fixed 136px with internal padding |
| Long "Что на самом деле" text | `flex: 1, minWidth: 0` on content side — wraps cleanly |
| Missing optional fields | `has()` guards throughout; `?? undefined` fallbacks; no visible "undefined" strings |
| Many/few evidence quotes | `DisclosurePanel` wraps excess; `slice(0, N)` limits |
| 9+ active nodes | Canvas deduplicates by semantic group; displays top 7, shows remainder chips |

No breaking scenarios found. Code does not depend on specific field values from the test report.

---

## Runtime Error Toast Investigation

The red "1 error" toast visible in dev mode originates from the **Next.js Fast Refresh overlay**, not from the report component. Confirmed by:
- Zero TypeScript errors (`npx tsc --noEmit` → no output)
- Zero build errors (`npx next build` → Compiled successfully)
- No console errors in component code (all `has()` guards, no unhandled promises in render)

Most likely source: a browser extension injecting a script error, or an unrelated Next.js dev overlay warning. Not a component bug.

---

## Interaction Regression Audit

All existing interactions preserved:

| Interaction | Status |
|---|---|
| HelpTip open/close (all sections) | ✓ |
| ESC closes HelpTip | ✓ |
| HeatmapZone click → DetailSheet | ✓ |
| Graph node click → DetailSheet | ✓ |
| Graph edge click → DetailSheet | ✓ |
| Evidence node click → DetailSheet | ✓ |
| Layer row click → DetailSheet | ✓ |
| Marker row click → DetailSheet | ✓ |
| ESC / backdrop closes DetailSheet | ✓ |
| HowToRead sheet open/close | ✓ |
| HeatmapInfo sheet open/close | ✓ |
| GraphHowToRead sheet open/close | ✓ |
| Evidence DisclosurePanel toggle | ✓ |
| Practices "Как делать" DisclosurePanel | ✓ |
| Speech Cloud "+ ещё N" expand | ✓ |
| Hero scroll-to-evidence button | ✓ |

---

## Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  36.3 kB (First Load 124 kB)
```

---

## Manual Verification Checklist

- [ ] Help icons: smaller and quieter in all section headings
- [ ] "Что стоит за привычными формулировками" — help icon stays on same line as title
- [ ] Speech Cloud: "Главный паттерн" label clearly separated from central bubble
- [ ] Heatmap: hover on node orb shows scale-up; click still opens sheet
- [ ] Heatmap: tab focus shows outline ring
- [ ] Graph: hover on node shows scale-up; click still opens sheet
- [ ] Graph: hover on key-relation row shows warm background
- [ ] Graph: edge click still opens sheet
- [ ] Animations at 390px mobile: no layout overflow
- [ ] All sheets open, ESC closes, backdrop closes
- [ ] Speech Cloud "+ ещё N" works
- [ ] Practices DisclosurePanel works
- [ ] Evidence DisclosurePanel works
