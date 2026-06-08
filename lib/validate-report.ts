const REQUIRED_BLOCK_KEYS = [
  'main_insight',
  'executive_summary',
  'core_pattern',
  'emotional_map',
  'strengths_resources',
  'limitations_risks',
  'defenses_distortions',
  'growth_vector',
  'practical_recommendations',
  'reflection_practice',
] as const;

export const FIXED_BLOCKS_REPAIR_PROMPT =
  'Перегенерируй предыдущий ответ строго по Mindloom Report v2.\n\n' +
  'Верни результат только в одном markdown code block с языком json.\n\n' +
  'Формат:\n\n' +
  '```json\n' +
  '{\n' +
  '  "meta": {\n' +
  '    "schema_version": "2.0",\n' +
  '    "language": "ru",\n' +
  '    "analysis_type": "single_session_report"\n' +
  '  },\n' +
  '  "participant": {\n' +
  '    "name": "Участник"\n' +
  '  },\n' +
  '  "source": {\n' +
  '    "type": "transcript",\n' +
  '    "material_volume": "средний",\n' +
  '    "source_summary": "Краткое описание исходного материала"\n' +
  '  },\n' +
  '  "hero": {\n' +
  '    "title": "Короткое название отчёта",\n' +
  '    "main_insight": "Главный вывод",\n' +
  '    "one_sentence_summary": "Одна фраза, объясняющая суть состояния"\n' +
  '  },\n' +
  '  "target": {\n' +
  '    "growth_blocker": "Что мешает расти",\n' +
  '    "central_knot": "Главный внутренний узел",\n' +
  '    "core_pain": "Основная боль",\n' +
  '    "short_explanation": "Короткое объяснение"\n' +
  '  },\n' +
  '  "desired_state": {\n' +
  '    "explicit_request": "Явный запрос",\n' +
  '    "hidden_request": "Скрытый запрос",\n' +
  '    "future_state": "К чему человек хочет прийти"\n' +
  '  },\n' +
  '  "mechanism": {\n' +
  '    "protective_logic": "Как работает защита",\n' +
  '    "hidden_gain": "Вторичная выгода",\n' +
  '    "perceived_threat": "Какая угроза предотвращается",\n' +
  '    "cost": "Цена стратегии"\n' +
  '  },\n' +
  '  "speech_layer": {\n' +
  '    "key_phrases": ["цитата 1", "цитата 2"],\n' +
  '    "speech_patterns": [\n' +
  '      {\n' +
  '        "pattern": "Название речевого паттерна",\n' +
  '        "description": "Как он проявляется",\n' +
  '        "evidence": ["цитата"]\n' +
  '      }\n' +
  '    ]\n' +
  '  },\n' +
  '  "active_nodes": [\n' +
  '    {\n' +
  '      "id": "defense_control",\n' +
  '      "label": "Гиперконтроль",\n' +
  '      "type": "defense",\n' +
  '      "intensity": 0.86,\n' +
  '      "confidence": 0.78,\n' +
  '      "color": "red",\n' +
  '      "description": "Описание узла",\n' +
  '      "evidence": ["цитата"],\n' +
  '      "connected_to": ["core_belief_collapse"]\n' +
  '    }\n' +
  '  ],\n' +
  '  "heatmap": {\n' +
  '    "title": "Карта активности нейронных зон",\n' +
  '    "description": "Карта показывает распределение активности узлов по зонам перегрева.",\n' +
  '    "scale": [\n' +
  '      { "label": "низкая активность", "range": "0–30%", "description": "Фоновое проявление" },\n' +
  '      { "label": "умеренная активность", "range": "31–60%", "description": "Заметный, но не ведущий сигнал" },\n' +
  '      { "label": "высокая активность", "range": "61–80%", "description": "Сильное проявление в материале" },\n' +
  '      { "label": "перегрев", "range": "81–100%", "description": "Ключевая зона напряжения" }\n' +
  '    ],\n' +
  '    "legend": [\n' +
  '      { "color": "red", "meaning": "перегрев / защита / тревога" },\n' +
  '      { "color": "purple", "meaning": "глубокий паттерн / убеждение" },\n' +
  '      { "color": "yellow", "meaning": "умеренная активация" },\n' +
  '      { "color": "green", "meaning": "ресурс / движение к изменению" }\n' +
  '    ],\n' +
  '    "zones": [\n' +
  '      {\n' +
  '        "id": "defense",\n' +
  '        "label": "Защита",\n' +
  '        "intensity": 0.86,\n' +
  '        "color": "red",\n' +
  '        "description": "Зона высокой защитной активации",\n' +
  '        "why_it_matters": "Эта зона удерживает систему в напряжении и не даёт сбавить темп.",\n' +
  '        "related_node_ids": ["defense_control"]\n' +
  '      }\n' +
  '    ],\n' +
  '    "callouts": [\n' +
  '      { "title": "Самые активные зоны", "text": "Описание главного кластера напряжения." },\n' +
  '      { "title": "Как читать", "text": "Размер и цвет зоны показывают интенсивность проявления." }\n' +
  '    ]\n' +
  '  },\n' +
  '  "node_graph": {\n' +
  '    "title": "Граф причинно-следственных связей",\n' +
  '    "description": "Карта показывает, какие узлы запускают, усиливают и поддерживают главный паттерн.",\n' +
  '    "central_node_id": "defense_control",\n' +
  '    "nodes": [\n' +
  '      {\n' +
  '        "id": "need_safety",\n' +
  '        "label": "Потребность в безопасности",\n' +
  '        "type": "unmet_need",\n' +
  '        "intensity": 0.72,\n' +
  '        "description": "Базовая потребность, которая не находит удовлетворения через текущую стратегию."\n' +
  '      }\n' +
  '    ],\n' +
  '    "edges": [\n' +
  '      {\n' +
  '        "from": "need_safety",\n' +
  '        "to": "defense_control",\n' +
  '        "label": "запускает",\n' +
  '        "type": "hard",\n' +
  '        "strength": 0.8,\n' +
  '        "explanation": "Тревога запускает активацию контроля как защитного механизма."\n' +
  '      }\n' +
  '    ],\n' +
  '    "legend": [\n' +
  '      { "label": "жёсткая связь", "type": "hard", "description": "Один узел автоматически запускает другой." },\n' +
  '      { "label": "обычная связь", "type": "normal", "description": "Связь заметна, но не всегда доминирует." },\n' +
  '      { "label": "ослабленная связь", "type": "soft", "description": "Связь проявляется слабее или непостоянно." },\n' +
  '      { "label": "есть выбор", "type": "choice_available", "description": "Связь можно ослаблять осознанным действием." },\n' +
  '      { "label": "выбора нет", "type": "choice_blocked", "description": "Связь переживается как автоматическая." }\n' +
  '    ],\n' +
  '    "how_to_read": [\n' +
  '      { "title": "need_safety → запускает → defense_control", "description": "Незакрытая потребность активирует защитный механизм." }\n' +
  '    ]\n' +
  '  },\n' +
  '  "hypothesis_table": [\n' +
  '    {\n' +
  '      "node_id": "defense_control",\n' +
  '      "hypothesis": "Контроль используется как способ снизить тревогу",\n' +
  '      "confidence": 0.78,\n' +
  '      "evidence": ["цитата"]\n' +
  '    }\n' +
  '  ],\n' +
  '  "trajectory": {\n' +
  '    "cycle": ["Тревога", "Контроль", "Временное облегчение"],\n' +
  '    "blocking_point": "Контроль",\n' +
  '    "possible_exit": "Что может стать точкой выхода"\n' +
  '  },\n' +
  '  "processing_dashboard": {\n' +
  '    "active_nodes_count": 9,\n' +
  '    "main_layer": "Защита / базовое убеждение",\n' +
  '    "priority": "Тело + психология",\n' +
  '    "overheat_level": 0.82,\n' +
  '    "resource_level": 0.34,\n' +
  '    "markers_detected": 6\n' +
  '  },\n' +
  '  "mindloom_layers": [\n' +
  '    {\n' +
  '      "layer": "Неудовлетворённая потребность",\n' +
  '      "description": "Описание слоя",\n' +
  '      "manifestation": "Как проявляется",\n' +
  '      "intensity": 0.7,\n' +
  '      "evidence": ["цитата"]\n' +
  '    }\n' +
  '  ],\n' +
  '  "transformation_markers": [\n' +
  '    {\n' +
  '      "marker": "Замечать импульс контроля",\n' +
  '      "description": "Что отслеживать",\n' +
  '      "shift_signal": "Как будет выглядеть изменение"\n' +
  '    }\n' +
  '  ],\n' +
  '  "recommended_practices": [\n' +
  '    {\n' +
  '      "title": "Дневник наблюдений",\n' +
  '      "target_node": "Гиперконтроль",\n' +
  '      "layer": "Защита",\n' +
  '      "purpose": "Замечать момент включения контроля до автоматического действия",\n' +
  '      "frequency": "3 раза в неделю",\n' +
  '      "how_to_do": "Краткое описание практики",\n' +
  '      "observe": ["что запустило реакцию", "какая мысль появилась", "что произошло в теле"],\n' +
  '      "shift_signal": "Человек замечает импульс раньше и не следует ему автоматически"\n' +
  '    }\n' +
  '  ],\n' +
  '  "disclaimer": "Это автоматический аналитический отчёт Mindloom на основе предоставленного материала. Он не является медицинским диагнозом, не заменяет психотерапию, медицинскую помощь или консультацию специалиста. Все выводы являются гипотезами и требуют бережной проверки человеком.",\n' +
  '  "snapshot": {\n' +
  '    "key_pattern": "Короткое название главного паттерна — человеческим языком",\n' +
  '    "short_explanation": "Объяснение сути в 1–2 предложениях, понятное без психологического образования",\n' +
  '    "three_signals": [\n' +
  '      "Первый сигнал — короткое проявление",\n' +
  '      "Второй сигнал",\n' +
  '      "Третий сигнал"\n' +
  '    ],\n' +
  '    "main_overheat": {\n' +
  '      "label": "Название главной зоны перегрева",\n' +
  '      "score": 0.91,\n' +
  '      "explanation": "Краткое объяснение, почему эта зона ключевая"\n' +
  '    },\n' +
  '    "first_step": "Конкретное первое действие"\n' +
  '  },\n' +
  '  "how_to_read": {\n' +
  '    "title": "Как пользоваться отчётом",\n' +
  '    "steps": [\n' +
  '      { "title": "Прочитайте главный паттерн", "description": "Центральная связка отчёта." },\n' +
  '      { "title": "Посмотрите карту перегрева", "description": "Активные зоны системы." },\n' +
  '      { "title": "Разберите фразу под микроскопом", "description": "Паттерн в речи." },\n' +
  '      { "title": "Выберите одну практику", "description": "Начните с одного действия." }\n' +
  '    ]\n' +
  '  },\n' +
  '  "phrase_microscope": {\n' +
  '    "title": "Фраза под микроскопом",\n' +
  '    "quote": "Точная цитата из материала",\n' +
  '    "why_this_quote": "Почему именно эта фраза",\n' +
  '    "fragments": [\n' +
  '      {\n' +
  '        "text": "фрагмент цитаты",\n' +
  '        "meaning": "смысл",\n' +
  '        "pattern": "паттерн",\n' +
  '        "explanation": "объяснение"\n' +
  '      }\n' +
  '    ],\n' +
  '    "summary": "Итоговый вывод"\n' +
  '  },\n' +
  '  "honest_translation": {\n' +
  '    "title": "Как сказано / как честно",\n' +
  '    "items": [\n' +
  '      {\n' +
  '        "as_said": "Формулировка из материала",\n' +
  '        "more_honest": "Более честная версия смысла",\n' +
  '        "explanation": "Пояснение"\n' +
  '      }\n' +
  '    ]\n' +
  '  },\n' +
  '  "protected_need": {\n' +
  '    "title": "Потребность под защитой",\n' +
  '    "description": "Одна потребность с трёх сторон.",\n' +
  '    "named": ["потребность 1"],\n' +
  '    "strategy_gets": ["что добывает стратегия"],\n' +
  '    "sacrificed": ["что приносится в жертву"],\n' +
  '    "leading_need": "Ведущая потребность",\n' +
  '    "interpretation": "Интерпретация"\n' +
  '  },\n' +
  '  "feedback_config": {\n' +
  '    "enabled": false,\n' +
  '    "positive_label": "Это про меня",\n' +
  '    "negative_label": "Не похоже на меня"\n' +
  '  }\n' +
  '}\n' +
  '```\n\n' +
  'Правила:\n\n' +
  '- Не добавляй текст до code block.\n' +
  '- Не добавляй текст после code block.\n' +
  '- Внутри code block должен быть только валидный JSON.\n' +
  '- Используй Mindloom Report v2.\n' +
  '- Используй meta.schema_version: "2.0".\n' +
  '- Не используй meta.schema_version: "1.0".\n' +
  '- Не используй schema_version: "mindloom_report_v2_fixed_blocks".\n' +
  '- Не используй schema_version на верхнем уровне.\n' +
  '- Не используй top-level поле protocol.\n' +
  '- Рекомендации "что делать" должны находиться внутри recommended_practices.\n' +
  '- Все top-level поля из формата выше должны присутствовать.\n' +
  '- Пиши только на русском языке.\n' +
  '- Не ставь медицинские диагнозы.\n' +
  '- Все выводы являются гипотезами, а не окончательными утверждениями.\n' +
  '- Не придумывай факты, которых нет в материале.\n' +
  '- Важные выводы по возможности подтверждай evidence или цитатами.\n' +
  '- intensity, confidence, strength, overheat_level, resource_level должны быть числами от 0 до 1.\n' +
  '- Не добавляй комментарии в JSON.\n' +
  '- Не добавляй trailing commas.\n' +
  '- Не используй markdown внутри JSON-строк.\n' +
  '- snapshot, how_to_read, phrase_microscope, honest_translation, protected_need обязательны.\n' +
  '- snapshot.key_pattern — короткий, сильный, человеческий заголовок.\n' +
  '- snapshot.three_signals — ровно 3 сигнала.\n' +
  '- phrase_microscope.quote — точная цитата из материала, не пересказ.\n' +
  '- node_graph.edges[].type — одно из: hard, normal, soft, choice_available, choice_blocked.\n' +
  '- feedback_config.enabled всегда false.';

const WEAK_TEXT_PATTERNS = [
  /^нет\.?$/i,
  /^нет данных\.?$/i,
  /^данных нет\.?$/i,
  /^недостаточно данных\.?$/i,
  /^не удалось определить\.?$/i,
  /^паттерн не определ[её]н\.?$/i,
];

function isWeakText(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return WEAK_TEXT_PATTERNS.some((pattern) => pattern.test(normalized));
}

export interface QualityResult {
  ok: boolean;
  warnings: string[];
  repairPrompt: string | null;
}

export function validateMindloomReportQuality(payload: unknown): QualityResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: true, warnings: [], repairPrompt: null };
  }

  const p = payload as Record<string, unknown>;

  // Legacy blocking quality gate for deprecated fixed_blocks payloads only.
  // New v2 payloads should pass through as long as the JSON itself is valid.
  if (p.schema_version !== 'mindloom_report_v2_fixed_blocks') {
    return { ok: true, warnings: [], repairPrompt: null };
  }

  const warnings: string[] = [];

  const report =
    p.report && typeof p.report === 'object' && !Array.isArray(p.report)
      ? (p.report as Record<string, unknown>)
      : {};

  if (!report.title || typeof report.title !== 'string' || !report.title.trim()) {
    warnings.push('Поле report.title отсутствует или пустое');
  }

  const blocks =
    report.blocks && typeof report.blocks === 'object' && !Array.isArray(report.blocks)
      ? (report.blocks as Record<string, unknown>)
      : {};

  const missingKeys: string[] = [];
  const emptyTextBlocks: string[] = [];
  const weakTextBlocks: string[] = [];
  let substantiveCount = 0;

  for (const key of REQUIRED_BLOCK_KEYS) {
    const block = blocks[key];
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
      missingKeys.push(key);
      continue;
    }
    const b = block as Record<string, unknown>;
    if (!b.text || typeof b.text !== 'string' || !b.text.trim()) {
      emptyTextBlocks.push(key);
      continue;
    }
    if (isWeakText(b.text)) {
      weakTextBlocks.push(key);
    }
    if (b.text.length > 80) {
      substantiveCount++;
    }
  }

  if (missingKeys.length > 0) {
    warnings.push(`Отсутствуют блоки: ${missingKeys.join(', ')}`);
  }
  if (emptyTextBlocks.length > 0) {
    warnings.push(`Блоки без текста: ${emptyTextBlocks.join(', ')}`);
  }
  if (weakTextBlocks.length > 0) {
    warnings.push(`Блоки с формальным текстом без анализа: ${weakTextBlocks.join(', ')}`);
  }
  if (substantiveCount < 7) {
    warnings.push(`Только ${substantiveCount} из 10 блоков содержательны (нужно минимум 7)`);
  }

  const ok = warnings.length === 0;
  return { ok, warnings, repairPrompt: ok ? null : FIXED_BLOCKS_REPAIR_PROMPT };
}
