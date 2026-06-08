# Patch 4S — Section-by-Section Premium Polish

## Goal

After Patch 4R unified the visual system tokens, Patch 4S applies that system
section by section: softer backgrounds, less alarm-like colours, more breathing
room, lighter counter weights. The report now feels like one analytical product
rather than a patchwork of independently styled cards.

---

## Changes Applied

### OverheatTile

| Property | Before | After |
|---|---|---|
| Background | `#fff5f2 → #ffeee9` | `#fff9f7 → #fff3ef` (warm peach, not alarm red) |
| Border opacity | 0.18 | 0.12 |
| Shadow | custom coral shadow | `VS.shadow.card` |
| Eyebrow colour | `#b85a50` | `#a87068` (softer) |
| Score number colour | `#d9695d` | `#c8706a` |
| Score fontWeight | 700 | 680 |
| Label fontWeight | 680 | 660 |
| Progress bar fill | `#f0b0a4 → #d9695d` | `#f2b8ae → #c8706a` |
| Track background | `rgba(228,111,97,0.12)` | `rgba(228,111,97,0.10)` |
| Explanation text colour | `#7a5550` | `#8a6860` |
| Fallback italic text colour | `#8a6058` | `#9a7870` |

Result: important indicator, not a warning banner.

---

### NeuroNodeGraph card

| Property | Before | After |
|---|---|---|
| borderRadius | 30 | `VS.r.xl` (28) |
| boxShadow | `0 18px 48px rgba(74,54,34,0.075)` | `VS.shadow.panel` |
| border opacity | 0.15 | 0.13 |

---

### GrowthBlockerSectionExact

| Element | Property | Before | After |
|---|---|---|---|
| Quote card | background | `#fff0ec → #fff7df` | `#fff4f1 → #fff8e8` |
| Quote card | border | `rgba(228,111,97,0.18)` | `rgba(228,111,97,0.13)` |
| Blocker card | background | `#fff0ec` | `#fff4f1` |
| Blocker card | border | `rgba(228,111,97,0.22)` | `rgba(228,111,97,0.15)` |
| Blocker card | borderRadius | 22 | `VS.r.md` (20) |
| Repeat card | background | `#f2efff` | `#f5f3ff` |
| Repeat card | border | `rgba(127,104,217,0.22)` | `rgba(127,104,217,0.16)` |
| Repeat card | borderRadius | 22 | `VS.r.md` (20) |
| SystemGoal card | background | `linear…#edf9f3, #e3f2eb` | `linear…#eef9f4, #e6f3ec` |
| SystemGoal card | border | `rgba(104,169,141,0.28)` | `rgba(104,169,141,0.20)` |
| SystemGoal card | borderRadius | 22 | `VS.r.md` (20) |

---

### ProtectedNeedSectionExact

| Element | Property | Before | After |
|---|---|---|---|
| leading_need card | background | `#edf6ff → #edf9f3` | `#eef7ff → #eef9f4` |
| leading_need card | border | `rgba(74,149,211,0.22)` | `rgba(74,149,211,0.16)` |
| leading_need card | glow radial alpha | 0.24 | 0.14 |
| TagGroups gap | gap | 0.65rem | 0.70rem |

---

### PhraseMicroscopeSectionExact (fragment cards)

| Property | Before | After |
|---|---|---|
| Fragment 0 background | `#fff3ef` | `#fff6f4` |
| Fragment 1 background | `#f2efff` | `#f5f3ff` |
| Fragment 2 background | `#fff9ec` | `#fffbef` |
| Fragment 0 border | `rgba(228,111,97,0.18)` | `rgba(228,111,97,0.13)` |
| Fragment 1 border | `rgba(127,104,217,0.18)` | `rgba(127,104,217,0.13)` |
| Fragment 2 border | `rgba(228,166,52,0.18)` | `rgba(228,166,52,0.13)` |
| Left accent bar width | 4px | 3px |

---

### EvidenceLayerSectionExact (summary strip)

| Property | Before | After |
|---|---|---|
| Count number fontSize | 1.35rem | 1.2rem |
| Count number fontWeight | 760 | 700 |
| Label margin-top | 0.2rem | 0.22rem |

---

### PracticesSectionExact

| Property | Before | After |
|---|---|---|
| Green practice border | `rgba(104,169,141,0.28)` | `rgba(104,169,141,0.20)` |
| Blue practice border | `rgba(74,149,211,0.25)` | `rgba(74,149,211,0.18)` |
| Purple practice border | `rgba(127,104,217,0.25)` | `rgba(127,104,217,0.18)` |
| Green header bg | `#edf9f3 → transparent` | `#eef9f4 → transparent` |
| Blue header bg | `#edf6ff → transparent` | `#eef7ff → transparent` |
| Purple header bg | `#f2efff → transparent` | `#f4f2ff → transparent` |
| Practice icon box bg | `#fff` (solid) | `rgba(255,253,248,0.7)` (translucent) |

---

### TrajectorySection (blocking/exit cards)

| Property | Before | After |
|---|---|---|
| Card padding | `0.9rem 0.9rem` | `1rem 1rem` |
| Title margin-top | 0.55rem | 0.60rem |
| Text margin-top | 4px | 5px |
| Text lineHeight | 1.5 | 1.55 |

---

### LayersSectionExact

| Property | Before | After |
|---|---|---|
| Row padding | `0.82rem 0` | `0.92rem 0` |

---

### MarkersSectionExact

| Property | Before | After |
|---|---|---|
| Row padding | `0.78rem 0` | `0.86rem 0` |

---

## What Was NOT Touched

- Heatmap canvas (HeatmapCanvasFirst) — all 6 layers preserved
- NeuroNodeGraph layout/edges/nodes — algorithm unchanged
- MindloomSpeechCloud — structure and chips unchanged
- All portal sheets (HowToReadSheet, HeatmapInfoSheet, GraphHowToReadSheet, ReportDetailSheet)
- All click/keyboard handlers (heatmap zone, graph node/edge, layer, marker)
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

- [ ] OverheatTile looks like an informational indicator, not a warning banner
- [ ] OverheatTile progress bar is warm coral, not alarm red
- [ ] GrowthBlocker quote card: softer gradient, less saturated
- [ ] GrowthBlocker grid cards (blocker/repeat/goal): lighter backgrounds
- [ ] ProtectedNeed leading card: softer blue glow
- [ ] PhraseMicroscope fragments: softer, thinner left accent bar
- [ ] Evidence summary strip: numbers less dominant (1.2rem/700)
- [ ] Practice cards: lighter border, icon box translucent
- [ ] Trajectory blocking/exit cards: more breathing room inside
- [ ] Layer rows: more breathing room between items
- [ ] Marker rows: more breathing room between items
- [ ] Graph card: radius/shadow consistent with VS system
- [ ] All sheets open/close (HowToRead, Heatmap info, Graph info, Detail)
- [ ] Heatmap zone click → DetailSheet
- [ ] Graph node/edge click → DetailSheet
- [ ] Layer row click → DetailSheet
- [ ] Marker row click → DetailSheet
- [ ] Evidence DisclosurePanel toggle
- [ ] Practices "Как делать" DisclosurePanel toggle
- [ ] Speech Cloud "+ ещё N" expand
- [ ] No red runtime error toast
- [ ] Mobile 390px: no overflow
