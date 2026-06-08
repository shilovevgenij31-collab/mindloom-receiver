# Patch 4R — Final Visual System Unification

## Goal

Bring the entire ReportV2Dashboard to a single coherent premium aesthetic.
Before this patch the report felt like a collection of components patched at different times.
After: one cohesive analytical product.

---

## Visual System Tokens Added

`const VS` block added at the top of `ReportV2Dashboard.tsx` (after imports):

| Token | Value | Purpose |
|---|---|---|
| `VS.r.hero` | 32 | Hero card |
| `VS.r.xl` | 28 | Main section surfaces, quote cards |
| `VS.r.lg` | 24 | Medium cards |
| `VS.r.md` | 20 | Small tiles, disclaimer |
| `VS.r.sm` | 16 | Rows, inner elements |
| `VS.r.row` | 14 | Disclosure buttons, meta chips |
| `VS.r.chip` | 999 | Pills and chips |
| `VS.shadow.card` | `0 2px 10px rgba(70,53,35,0.048), 0 6px 22px rgba(70,53,35,0.038)` | Cards |
| `VS.shadow.panel` | `0 4px 16px rgba(70,53,35,0.052), 0 14px 44px rgba(70,53,35,0.056)` | Panels |
| `VS.text.eyebrow` | `#90847a` | Unified eyebrow/label color |
| `VS.text.muted` | `#7d746b` | Secondary text |
| `VS.text.body` | `#3e3832` | Body text |

---

## Changes Applied

### Shared Primitives

| Component | Property | Before | After |
|---|---|---|---|
| `HelpTip` button | size | 17×17px | 22×22px |
| `HelpTip` button | fontSize | 0.6rem | 0.68rem |
| `HelpTip` button | fontWeight | 800 | 760 |
| `HelpTip` button | background | `#ece7de` | `#ede8e0` |
| `HelpTip` button | border | none | `1px solid rgba(118,92,68,0.16)` |
| `HelpTip` button | color | `#8a8278` | `#6f675f` |
| `Eyebrow` | color | `#93887d` | `#90847a` (VS.text.eyebrow) |
| `Eyebrow` | margin-bottom | 0.48rem | 0.44rem |
| `SectionHead` h2 | fontWeight | 680 | 660 |
| `SectionHead` h2 | flexWrap | nowrap | wrap |
| `SmallLabel` | color | `#94897d` | `#90847a` (VS.text.eyebrow) |
| `BentoTile` | boxShadow | `0 8px 22px rgba(70,53,35,0.045)` | `VS.shadow.card` |
| `SharedPanel` | borderRadius | 30 | 28 (VS.r.xl) |
| `SharedPanel` | boxShadow | `0 18px 50px rgba(70,53,35,0.07)` | `VS.shadow.panel` |
| `SharedPanel` | border | 0.14 opacity | 0.13 opacity |
| `DisclosurePanel` button | borderRadius | 18 | 14 (VS.r.row) |
| `DisclosurePanel` button | padding | 0.82rem 0.9rem | 0.78rem 0.9rem |
| `QuoteRow` | borderRadius | `0 10px 10px 0` | `0 12px 12px 0` |
| `QuoteRow` | background alpha | 0.65 | 0.68 |
| `Callout` | borderRadius | 20 | 22 |
| `QuoteBlock` | fontSize | 21px | 20px |
| `QuoteBlock` | fontWeight | 740 | 720 |
| `SectionShell` | paddingTop | 0.2rem | 0 |

---

### Article-level

| Element | Property | Before | After |
|---|---|---|---|
| Main `<article>` | gap | 1.4rem | 1.5rem |

---

### Hero Section

| Element | Property | Before | After |
|---|---|---|---|
| Hero card | borderRadius | 32 | VS.r.hero (32, same) |
| Hero card | boxShadow | `0 12px 40px rgba(70,53,35,0.06)` | layered shadow |
| "N активных узлов" button | borderRadius | 12 | 14 (VS.r.row) |
| "Как читать отчёт" button | borderRadius | 12 | 14 (VS.r.row) |
| "Как читать отчёт" button | background alpha | 0.82 | 0.88 |
| "Как читать отчёт" button | border opacity | 0.22 | 0.24 |

---

### Overheat Tile

| Element | Property | Before | After |
|---|---|---|---|
| Tile container | boxShadow | `0 4px 18px rgba(228,111,97,0.07)` | layered shadow |
| Progress bar | height | 3px | 4px |

---

### Graph Section

| Element | Property | Before | After |
|---|---|---|---|
| "Как читать" button | padding | 0.42rem 0.72rem | 0.42rem 0.82rem |
| "Как читать" button | background alpha | 0.72 | 0.88 |
| "Как читать" button | fontSize | 0.68rem | 0.7rem |
| "Как читать" button | icon | `?` text | `◎` symbol |
| "Как читать" button | gap | 4 | 5 |

---

### Heatmap Lower Info Cards

| Element | Property | Before | After |
|---|---|---|---|
| All 3 info cards | borderRadius | 18 | 20 |
| "Как читать" button | icon | `?` | `◎` |
| "Как читать" button | borderRadius | 9 | 10 |
| "Как читать" button | padding | 0.28rem 0.5rem | 0.3rem 0.55rem |
| "Как читать" button | fontSize | 0.6rem | 0.62rem |

---

### Typography

| Location | Property | Before | After |
|---|---|---|---|
| GrowthBlocker quote | fontSize | 20px | 19px |
| GrowthBlocker quote | fontWeight | 740 | 720 |
| ProtectedNeed leading_need | fontSize | 22px | 21px |
| ProtectedNeed leading_need | fontWeight | 740 | 720 |
| SnapshotSectionExact signal numbers | fontSize | 18px | 17px |
| SnapshotSectionExact signal numbers | fontWeight | 740 | 720 |
| PracticesSectionExact practice title | fontWeight | 740 | 720 |

---

### Other Section Cards

| Location | Property | Before | After |
|---|---|---|---|
| `MindloomSpeechCloud` card | borderRadius | 30 | VS.r.xl (28) |
| `MindloomSpeechCloud` card | boxShadow | `0 18px 50px rgba(70,53,35,0.07)` | VS.shadow.panel |
| HonestTranslation cards | borderRadius | 24 | VS.r.lg (24, same) |
| HonestTranslation cards | boxShadow | `0 8px 24px rgba(70,53,35,0.05)` | VS.shadow.card |
| PracticesSectionExact card | borderRadius | 28 | VS.r.xl (28, same) |
| PracticesSectionExact card | boxShadow | `0 18px 50px rgba(70,53,35,0.07)` | VS.shadow.panel |
| PhraseMicroscope fragments | borderRadius | 16 | 18 |
| MarkersSectionExact badge | borderRadius | 8 | 10 |
| Trajectory grid gap | gap | 0.6rem | 0.65rem |
| DisclaimerSectionExact | borderRadius | 20 | VS.r.md (20, same) |
| DisclaimerSectionExact | border opacity | 0.14 | 0.12 |

---

## What Was NOT Touched

- Heatmap canvas (HeatmapCanvasFirst) — all layers preserved
- NeuroNodeGraph — unchanged
- MindloomSpeechCloud — structure, central bubble, phrase chips unchanged
- All portal sheets (HowToReadSheet, HeatmapInfoSheet, GraphHowToReadSheet, ReportDetailSheet) — logic unchanged
- All click handlers (heatmap zone click, graph node/edge click, layer click, marker click)
- All DisclosurePanel expand/collapse logic
- All ESC/backdrop close
- Backend, API, schema, normalizer, prompts, DB, auth, deploy
- No new dependencies

---

## Typecheck / Build

```
npx tsc --noEmit  → 0 errors
npx next build    → ✓ Compiled successfully
/r/[publicToken]  36 kB (First Load 123 kB)
```

---

## Manual Verification Checklist

- [ ] Report feels like a single cohesive product (not separate patches)
- [ ] HelpTip `?` buttons are consistently sized (22×22px) across all sections
- [ ] Section title weight calmer and cleaner (660 vs 680)
- [ ] All SharedPanel surfaces have consistent radius (28) and shadow
- [ ] BentoTile shadows uniform across Evidence, Protected Need, TagGroups
- [ ] DisclosurePanel rows look unified across sections
- [ ] QuoteRow citations readable and consistent
- [ ] Hero chips (active nodes + "Как читать") consistent radius/style
- [ ] Overheat progress bar height matches evidence bars (4px)
- [ ] Graph "Как читать" button visually matches Hero "Как читать" style
- [ ] Heatmap lower cards consistent radius (20)
- [ ] Phrase microscope fragment cards consistent (18px radius)
- [ ] Practice titles calmer weight
- [ ] Vertical rhythm better (1.5rem section gap)
- [ ] No overflow on mobile 390px
- [ ] All sheets open/close correctly (HowToRead, Heatmap info, Graph info, Detail)
- [ ] Heatmap zone click opens DetailSheet
- [ ] Graph node/edge click opens DetailSheet
- [ ] Layer rows clickable → DetailSheet
- [ ] Marker rows clickable → DetailSheet
- [ ] Evidence DisclosurePanel toggle
- [ ] Practices "Как делать" DisclosurePanel toggle
- [ ] Speech Cloud "+ ещё N" expand
- [ ] No red runtime error toast
