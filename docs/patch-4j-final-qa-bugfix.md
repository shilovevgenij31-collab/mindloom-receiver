# Patch 4J — Final QA / bugfix only

Files changed:
- `app/r/[publicToken]/ReportV2Dashboard.tsx`
- `app/r/[publicToken]/page.tsx`
- `docs/patch-4j-final-qa-bugfix.md`

Scope:
- QA / bugfix only for the current Lovable-style mobile v2 report.
- No redesign.
- No schema, normalizer, prompt, repair prompt, API, DB, auth, Docker, Traefik, route branching, legacy renderer, admin UI, intake flow, or deploy config changes.

What was fixed:

1. Fallback builder hardening
- `snapshot` fallback no longer injects generic mock-like primary text when report data is missing.
- `protected_need` fallback no longer manufactures generic need/tags as its primary source.
- Fallbacks now rely more strictly on the current normalized report content and return `null` when there is not enough real signal.

2. Percent / score formatting safety
- Added a single percent-normalization path for dashboard percentages.
- Values in `0..1` are rendered as `0..100%`.
- Values already in `0..100` are not multiplied again.
- Invalid values do not produce `NaN%`.
- This stabilizes hero / snapshot / heatmap / graph / evidence / layers formatting.

3. Empty-chip and empty-tag cleanup
- `TagGroup` now filters and deduplicates empty values before rendering.
- `KeyPhrasesSupportSection` now filters and deduplicates phrases before rendering.
- This reduces empty UI noise and duplicate chips.

4. Help / content polish
- Added missing `HelpTip` to the active growth-blocker section.
- Kept the current section structure intact.

5. Flow stabilization
- The optional feedback block is effectively disabled in the active public mobile flow so it does not break the expected 16-block report sequence.

6. Hydration-risk reduction
- Added `timeZone: 'UTC'` to the route-level date formatting helper in `page.tsx` to keep date rendering stable across environments.

Checks completed:
- `npm run typecheck`: passed
- `npm run build` in sandbox: failed with known Next.js worker `spawn EPERM`

Runtime QA status:
- Browser QA against `http://localhost:3001/r/bCPIvpt3pi3nbSMp2zeuew987oAFgyLO` was attempted.
- Current local `3001` server is broken at runtime with `500` and missing Next dev chunk (`Cannot find module './682.js'`).
- Restarting the local server and re-running production build outside sandbox both required escalation.
- Escalation was rejected by the approval system because of a session usage-limit condition, not because of command safety.

What was not changed:
- Hero concept
- Heatmap architecture
- Graph architecture
- Legacy renderers
- Backend / schema / prompts / normalization pipeline

Manual QA still required once local `3001` is restarted:
- Sample route shows the full 16-block Lovable flow in the correct order.
- No `undefined`, `null`, `NaN`, empty chips, or empty shells.
- `390px` viewport has no horizontal overflow.
- Heatmap and graph do not create internal horizontal scroll.
- HelpTips open without overflow.
- Desktop remains a centered mobile shell, not a wide dashboard.
- Long sections remain under disclosure rather than flooding the main flow.
