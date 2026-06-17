import type {
  MindloomEngineOutput,
  NormalizedMindloomAnalysis,
  NormalizedSpeechMarker,
  NormalizedEvidenceQuote,
  NormalizedAttentionLevel,
  NormalizedAttentionRoute,
  NormalizedBlindSpot,
  NormalizedGraph,
  NormalizedGraphNode,
  NormalizedGraphEdge,
  NormalizedNeed,
  NormalizedProtection,
  NormalizedField,
  NormalizedPractice,
  NormalizedSemanticMap,
  NormalizedDynamics,
  NormalizedSelfPortrait,
  Band,
  EngineGraphNode,
} from './types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function safeStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function labelOf(nodes: EngineGraphNode[], nodeId: string): string {
  const found = nodes.find((n) => n.node_id === nodeId);
  return found?.display_label ?? nodeId;
}

// ── Main export ──────────────────────────────────────────────────────────────

export function normalizeMindloomEngineOutput(
  engine: MindloomEngineOutput
): NormalizedMindloomAnalysis {
  const nodes = engine.graph?.nodes ?? [];
  const edges = engine.graph?.edges ?? [];
  const cards = engine.cards?.cards ?? [];

  // ── main_pattern ─────────────────────────────────────────────────────────

  const contactRegimeNode = nodes.find(
    (n) => n.family === 'contact_regime' && n.visible === 'yes'
  );

  const topDefenses = nodes
    .filter((n) => n.family === 'defense' && n.visible === 'yes')
    .sort((a, b) => b.activation - a.activation)
    .slice(0, 3);

  const contactModeCard = cards.find((c) => c.id === 'contact_mode');

  const topDefenseBand: Band =
    topDefenses.length > 0
      ? topDefenses[0].confidence >= 0.7
        ? 'green'
        : topDefenses[0].confidence >= 0.4
        ? 'yellow'
        : 'white'
      : 'white';

  // ── speech_markers ────────────────────────────────────────────────────────

  const speech_markers: NormalizedSpeechMarker[] = (
    engine.markers?.markers ?? []
  ).map((m) => ({
    cue: m.cue,
    meaning: m.meaning,
    occurrences: m.occurrences,
    quote: m.evidence?.[0]?.quote ?? '',
  }));

  // ── evidence_quotes ───────────────────────────────────────────────────────

  const evidence_quotes: NormalizedEvidenceQuote[] = nodes
    .filter((n) => n.visible !== 'no' && n.evidence && n.evidence.length > 0)
    .flatMap((n) =>
      (n.evidence ?? [])
        .filter((e) => e.span && e.span.trim().length > 0)
        .slice(0, 1)
        .map((e) => ({
          quote: safeStr(e.span),
          node_id: n.node_id,
          segment_id: undefined,
        }))
    )
    .slice(0, 6);

  // Fallback: add marker evidence if no node evidence
  if (evidence_quotes.length === 0) {
    (engine.markers?.markers ?? []).forEach((m) => {
      m.evidence?.forEach((e) => {
        evidence_quotes.push({ quote: e.quote, segment_id: e.segment_id });
      });
    });
  }

  // ── attention_route ───────────────────────────────────────────────────────

  let attention_route: NormalizedAttentionRoute;

  if (engine.attention_route && engine.attention_route.segments.length > 0) {
    // Use detailed attention_route if available
    const firstSeg = engine.attention_route.segments[0];
    const pathFromRoute: NormalizedAttentionLevel[] = firstSeg.steps.map((s) => ({
      level: s.key,
      attention: 0,
      earned: true,
      description: s.value,
    }));
    attention_route = {
      path: pathFromRoute,
      skipped: [],
      n_snapshots: 1,
      preliminary: true,
    };
  } else if (engine.attention) {
    // Fallback to attention.path.levels
    const descMap = buildLevelDescMap(engine);
    const path: NormalizedAttentionLevel[] = engine.attention.path.levels.map((l) => ({
      level: l.code,
      attention: l.attention,
      earned: l.earned,
      description: descMap[l.code] ?? null,
    }));
    attention_route = {
      path,
      skipped: engine.attention.path.skipped,
      n_snapshots: engine.attention.n_snapshots,
      preliminary: engine.attention.preliminary,
    };
  } else {
    attention_route = { path: [], skipped: [], n_snapshots: 0, preliminary: true };
  }

  // ── blind_spots ───────────────────────────────────────────────────────────

  const blind_spots: NormalizedBlindSpot[] = [
    ...(engine.attention?.blind ?? []).map((b) => ({
      text: b.text,
      confidence: b.confidence,
      source: 'attention' as const,
    })),
    ...cards
      .filter((c) => c.id === 'blind_spot')
      .map((c) => ({
        text: c.body,
        confidence: c.confidence_band === 'green' ? 0.8 : c.confidence_band === 'yellow' ? 0.6 : 0.4,
        source: 'cards' as const,
      })),
  ];

  // ── graph ─────────────────────────────────────────────────────────────────

  const top_nodes: NormalizedGraphNode[] = nodes
    .filter((n) => n.visible !== 'no')
    .sort((a, b) => b.activation - a.activation)
    .slice(0, 10)
    .map((n) => ({
      node_id: n.node_id,
      display_label: n.display_label ?? n.node_id,
      family: n.family,
      activation: n.activation,
      valence: n.valence,
      f4: n.f4,
    }));

  const key_edges: NormalizedGraphEdge[] = edges
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, 6)
    .map((e) => ({
      from_id: e.from,
      to_id: e.to,
      from_label: labelOf(nodes, e.from),
      to_label: labelOf(nodes, e.to),
      tau: e.tau,
      weight: e.weight,
    }));

  const hypotheses = engine.graph?.ranked_hypotheses ?? [];
  const topHyp = hypotheses[0];

  const ranked_pattern =
    topHyp
      ? topHyp.active_nodes.map((id) => labelOf(nodes, id)).join(' → ')
      : top_nodes.slice(0, 3).map((n) => n.display_label).join(' → ');

  const ambiguity_note = topHyp?.ambiguity_flags?.[0] ?? '';
  const follow_up = topHyp?.follow_up_questions ?? [];

  const graph: NormalizedGraph = { top_nodes, key_edges, ranked_pattern, ambiguity_note, follow_up };

  // ── needs ─────────────────────────────────────────────────────────────────

  const needNodes = nodes.filter((n) => n.family === 'unmet_need' && n.visible !== 'no');
  const unmet: NormalizedNeed[] = needNodes.map((n) => ({
    label: n.display_label ?? n.node_id,
    activation: n.activation,
    need_id: n.need_id,
  }));

  // Protected needs come from the active_need card body (simple extraction)
  const activeNeedCard = cards.find((c) => c.id === 'active_need');
  const protectedRaw = activeNeedCard?.body ?? '';
  const protected_needs: NormalizedNeed[] = protectedRaw.trim()
    ? [{ label: stripMarkdown(protectedRaw), activation: 0.5 }]
    : [];

  // ── protections ───────────────────────────────────────────────────────────

  const defenseNodes = nodes.filter((n) => n.family === 'defense' && n.visible !== 'no');

  const protections: NormalizedProtection[] = defenseNodes.map((defNode) => {
    // Find what it masks
    const maskEdge = edges.find(
      (e) => e.from === defNode.node_id && e.tau === 'masking'
    );
    const masks_label = maskEdge ? labelOf(nodes, maskEdge.to) : null;

    // Find what evokes it
    const evocationEdge = edges.find(
      (e) => e.to === defNode.node_id && e.tau === 'evocation'
    );
    const evoked_by = evocationEdge ? labelOf(nodes, evocationEdge.from) : null;

    const evidence_quote = defNode.evidence?.[0]?.span ?? null;

    return {
      defense_label: defNode.display_label ?? defNode.node_id,
      masks_label,
      evoked_by,
      f4: defNode.f4,
      evidence_quote,
    };
  });

  // ── field ─────────────────────────────────────────────────────────────────

  const field: NormalizedField = {
    allowed: engine.field?.allowed ?? [],
    costly: engine.field?.costly ?? [],
    blocked: engine.field?.blocked ?? [],
    openness: engine.field?.openness ?? 0,
    speaker_agency: engine.field?.speaker ?? 0,
  };

  // ── practices ─────────────────────────────────────────────────────────────

  const practices: NormalizedPractice[] = [
    ...cards
      .filter((c) => c.id === 'try_this')
      .map((c) => ({ text: c.body, source: 'try_this' as const })),
    ...(engine.transition_map?.replacements ?? [])
      .filter((r) => r.relevant)
      .map((r) => ({ text: `${r.old} → ${r.new}`, source: 'transition_map' as const })),
  ];

  // ── semantic_map ──────────────────────────────────────────────────────────

  const semantic_map: NormalizedSemanticMap | null = engine.semantic_map
    ? {
        charged_concepts: engine.semantic_map.concepts
          .filter((c) => c.valence === 'charged')
          .map((c) => ({ label: c.label, state: c.state })),
        collapse_score: engine.semantic_map.collapse_score,
        affordances: engine.semantic_map.affordances.map((a) => ({
          from: a.from,
          to: a.to,
          rationale: a.rationale,
        })),
        care_flag: engine.semantic_map.care_flag,
      }
    : null;

  // ── dynamics ──────────────────────────────────────────────────────────────

  const dynamics: NormalizedDynamics | null =
    engine.dynamics?.shown === true
      ? {
          shown: true,
          regime_summary: engine.dynamics.regime_trajectory.summary,
          shift_signals: engine.dynamics.regime_trajectory.transitions.map((t) => ({
            from_folk: t.from_folk,
            to_folk: t.to_folk,
            valence: t.valence,
          })),
          recurring_blind_spots: engine.dynamics.recurring_blind_spots,
          adaptivity: engine.dynamics.adaptivity.masking_weakening,
        }
      : null;

  // ── self_portrait ─────────────────────────────────────────────────────────

  const self_portrait: NormalizedSelfPortrait | null =
    engine.self_portrait?.shown === true
      ? {
          shown: true,
          frames: engine.self_portrait.frequent_frames.map((f) => ({
            frame: f.frame,
            rate: f.rate,
            signal: f.signal ?? '',
          })),
          jumps: engine.self_portrait.signature_jumps.map((j) => ({
            from: j.from,
            to: j.to,
            lever: j.lever ?? '',
          })),
          triggers: engine.self_portrait.triggers.map((t) => ({
            cue: t.cue,
            leads_to: t.leads_to,
          })),
        }
      : null;

  // ── meta ──────────────────────────────────────────────────────────────────

  const n_segments = engine.diff?.length ?? engine.meta?.n_segments ?? 0;
  const has_dynamics = dynamics !== null;
  const has_self_portrait = self_portrait !== null;
  const care_flag = engine.semantic_map?.care_flag ?? false;
  const is_first_session = !has_dynamics && !has_self_portrait;
  const session_type: 'first' | 'returning' = is_first_session ? 'first' : 'returning';

  // Compute overall confidence from diff
  const allBands = (engine.diff ?? []).flatMap((d) =>
    d.levels.filter((l) => l.earned).map((l) => l.band)
  );
  const confidence_summary: Band = dominantBand(allBands);

  return {
    source: 'mindloom_lite_engine',
    engine_version: engine.cards?.schema_version ?? 'lite.cards.v0.1',
    engine_input_id: engine.input_id,
    session_type,

    main_pattern: {
      regime_folk: contactRegimeNode?.display_label ?? 'Режим контакта',
      top_defense_labels: topDefenses.map((n) => n.display_label ?? n.node_id),
      contact_mode_text: contactModeCard?.body ?? '',
      confidence_band: topDefenseBand,
    },

    speech_markers,
    evidence_quotes,
    attention_route,
    blind_spots,
    graph,

    needs: {
      protected: protected_needs,
      unmet,
    },

    protections,
    field,
    practices,
    business_signals: null,
    semantic_map,
    dynamics,
    self_portrait,

    meta: {
      input_id: engine.input_id,
      n_segments,
      confidence_summary,
      is_first_session,
      has_dynamics,
      has_self_portrait,
      care_flag,
    },
  };
}

// ── Private helpers ───────────────────────────────────────────────────────────

function buildLevelDescMap(engine: MindloomEngineOutput): Record<string, string> {
  const map: Record<string, string> = {};
  for (const profile of engine.diff ?? []) {
    for (const level of profile.levels) {
      if (level.value && !map[level.code]) {
        map[level.code] = level.value;
      }
    }
  }
  return map;
}

function dominantBand(bands: string[]): Band {
  if (bands.length === 0) return 'white';
  const counts: Record<string, number> = { green: 0, yellow: 0, white: 0 };
  for (const b of bands) {
    if (b in counts) counts[b]++;
  }
  if (counts['green'] >= counts['yellow'] && counts['green'] >= counts['white']) return 'green';
  if (counts['yellow'] >= counts['white']) return 'yellow';
  return 'white';
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\n/g, ' ').trim();
}
