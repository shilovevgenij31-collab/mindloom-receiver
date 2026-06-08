Patch 4H - complete flow + progressive disclosure

What was added
- Restored the full Lovable-style semantic top flow for v2 public reports: snapshot, how-to-read, protected need, phrase microscope, honest translation, and a compact supporting key-phrases block.
- Added local fallback builders inside `app/r/[publicToken]/ReportV2Dashboard.tsx` for old v2 payloads:
  - `buildSnapshotFallback`
  - `buildHowToReadFallback`
  - `buildProtectedNeedFallback`
  - `buildPhraseMicroscopeFallback`
  - `buildHonestTranslationFallback`
- Added supporting helpers for safe derivation:
  - `firstNonEmpty`
  - `uniqueStrings`
  - `collectSpeechPhrases`
  - `getStrongestNode`
  - `getStrongestZone`
  - `inferNeedLabel`
  - `inferPhraseFragments`

How old v2 payloads now get the new flow
- If `snapshot`, `how_to_read`, `protected_need`, `phrase_microscope`, or `honest_translation` are missing, the renderer derives them from existing v2 fields such as:
  - `hero`
  - `target`
  - `desired_state`
  - `mechanism`
  - `speech_layer`
  - `active_nodes`
  - `heatmap`
  - `recommended_practices`
  - `mindloom_layers`
- The renderer now prefers real report data first and uses generic copy only as a last defensive fallback.
- Empty shells are avoided; `HowToRead` is always-on, and `Snapshot` is almost always-on when the report contains meaningful title/summary data.

Progressive disclosure added
- Added reusable `DisclosurePanel` for compact mobile UX without new dependencies.
- Applied disclosure to long sections:
  - `Evidence`: extra nodes and extra hypotheses moved under "show more".
  - `Layers`: extra layers moved under "show more".
  - `Markers`: extra markers moved under "show more".
  - `Practices`: "how to do" and "observe" moved under inline disclosure; extra practices moved under "show more".
- Moved `Key phrases` to a compact supporting position after `Phrase microscope` and `Honest translation`.

Flow order now
1. Hero
2. Snapshot
3. How to read
4. Growth blocker
5. Protected need
6. Phrase microscope
7. Honest translation
8. Key phrases
9. Heatmap
10. Graph
11. Evidence
12. Trajectory
13. Layers
14. Markers
15. Practices
16. Disclaimer

What did not change
- Schema
- Normalizer
- Prompts
- Repair prompt
- API
- DB
- Auth
- Docker
- Traefik
- Route branching
- Legacy renderers
- v1 / rich / fixed_blocks renderer
- Admin UI
- Heatmap and graph data flow

Checks passed
- `npm run typecheck`
- `npm run build` after running outside sandbox because Next.js worker spawning can hit sandbox `spawn EPERM`

Visual QA to do
- Check the sample route at `390px` width.
- Confirm the missing top sections now appear on the older v2 sample route.
- Confirm `Key phrases` no longer reads like a primary block.
- Confirm there is no horizontal overflow or letter-by-letter wrapping.
- Confirm evidence/layers/markers/practices stay compact until expanded.
- Confirm heatmap and graph still fit the current Lovable-style rhythm and spacing.
