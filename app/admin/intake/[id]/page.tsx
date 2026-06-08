import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getIntakeById } from '@/lib/intake-repository';
import CopyButton from './CopyButton';
import CreateReportForm from './CreateReportForm';
import ArchiveIntakeButton from './ArchiveIntakeButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

const MINDLOOM_PROMPT_PREFIX =
  'Проанализируй следующий материал и верни Mindloom Report v2 как нейропсихологическую аналитическую карту текущего состояния.\n\n' +
  'Это не обычное психологическое summary. Это структурированный аналитический отчёт по внутренним паттернам, узлам, механизмам, траектории и рекомендуемым практикам.\n\n' +
  'Отчёт должен быть одновременно: глубоким и нейропсихологически точным — и понятным для обычного человека без специального образования. Сложные понятия объясняй простым языком прямо внутри полей description, explanation, why_it_matters — не добавляй отдельных блоков с глоссарием.\n\n' +
  'Верни результат только в одном markdown code block с языком json.\n\n' +
  'Формат ответа должен быть строго таким:\n\n' +
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
  '      "evidence": ["цитата из материала"],\n' +
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
  '      { "label": "есть выбор", "type": "choice_available", "description": "Связь можно начать ослаблять осознанным действием." },\n' +
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
  '    "first_step": "Конкретное первое действие — что можно попробовать прямо сейчас"\n' +
  '  },\n' +
  '  "how_to_read": {\n' +
  '    "title": "Как пользоваться отчётом",\n' +
  '    "steps": [\n' +
  '      { "title": "Прочитайте главный паттерн", "description": "Он показывает центральную связку всего отчёта." },\n' +
  '      { "title": "Посмотрите карту перегрева", "description": "Она показывает, какие зоны сейчас активнее всего." },\n' +
  '      { "title": "Разберите фразу под микроскопом", "description": "Так видно, как паттерн проявляется прямо в речи." },\n' +
  '      { "title": "Выберите одну практику", "description": "Не пытайтесь исправить всё сразу — начните с одного действия." }\n' +
  '    ]\n' +
  '  },\n' +
  '  "phrase_microscope": {\n' +
  '    "title": "Фраза под микроскопом",\n' +
  '    "quote": "Точная цитата из материала — реальная фраза, не пересказ",\n' +
  '    "why_this_quote": "Почему именно эта фраза показывает паттерн",\n' +
  '    "fragments": [\n' +
  '      {\n' +
  '        "text": "фрагмент цитаты",\n' +
  '        "meaning": "скрытый смысл этого фрагмента",\n' +
  '        "pattern": "название паттерна",\n' +
  '        "explanation": "подробное объяснение для читателя без психологического образования"\n' +
  '      },\n' +
  '      {\n' +
  '        "text": "второй фрагмент",\n' +
  '        "meaning": "его смысл",\n' +
  '        "pattern": "название паттерна",\n' +
  '        "explanation": "объяснение"\n' +
  '      }\n' +
  '    ],\n' +
  '    "summary": "Итоговый вывод по фразе в одном предложении"\n' +
  '  },\n' +
  '  "honest_translation": {\n' +
  '    "title": "Как сказано / как честно",\n' +
  '    "items": [\n' +
  '      {\n' +
  '        "as_said": "Как это было сформулировано в материале",\n' +
  '        "more_honest": "Более честная версия смысла — бережная, не категоричная",\n' +
  '        "explanation": "Краткое пояснение к переводу"\n' +
  '      },\n' +
  '      {\n' +
  '        "as_said": "Вторая формулировка из материала",\n' +
  '        "more_honest": "Более честная версия",\n' +
  '        "explanation": "Пояснение"\n' +
  '      }\n' +
  '    ]\n' +
  '  },\n' +
  '  "protected_need": {\n' +
  '    "title": "Потребность под защитой",\n' +
  '    "description": "Одна потребность с трёх сторон: что названо, что добывает стратегия, что приносится в жертву.",\n' +
  '    "named": ["потребность из материала 1", "потребность 2"],\n' +
  '    "strategy_gets": ["что получает стратегия 1", "что получает 2"],\n' +
  '    "sacrificed": ["что приносится в жертву 1"],\n' +
  '    "leading_need": "Ведущая потребность",\n' +
  '    "interpretation": "Как эта потребность добывается и что при этом теряется"\n' +
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
  '- Не используй schema_version на верхнем уровне.\n' +
  '- Не используй schema_version: "mindloom_report_v2_fixed_blocks".\n' +
  '- Не используй старую schema v1.\n' +
  '- Не добавляй top-level поле protocol.\n' +
  '- Смысл блока "что делать" должен находиться внутри recommended_practices.\n' +
  '- Все top-level поля из примера выше должны присутствовать.\n' +
  '- Пиши только на русском языке.\n' +
  '- Это гипотезы, а не диагноз. Не ставь медицинские диагнозы.\n' +
  '- Не придумывай факты, которых нет в материале.\n' +
  '- Каждый важный вывод по возможности подтверждай evidence или цитатами из материала.\n' +
  '- Если данных мало, давай осторожные формулировки, но не меняй структуру schema v2.\n' +
  '- active_nodes должны быть массивом объектов.\n' +
  '- Для active_nodes.type используй только допустимые типы: unmet_need, somatic_emotional_reaction, traumatic_imprint, core_belief, defense, secondary_gain, compensatory_belief, subpersonality, behavior_speech, reinforced_program, hidden_value, worldview_block, paradigm.\n' +
  '- Для active_nodes.color используй только: red, yellow, green, blue, gray, purple.\n' +
  '- Поля intensity, confidence, strength, overheat_level, resource_level должны быть числами от 0 до 1.\n' +
  '- node_graph должен описывать связи между узлами.\n' +
  '- hypothesis_table должен содержать гипотезы, confidence и evidence.\n' +
  '- mindloom_layers должен использовать слои Mindloom, а не произвольную таксономию.\n' +
  '- transformation_markers должен описывать, что отслеживать и какой сдвиг считать признаком изменения.\n' +
  '- recommended_practices должен содержать практики, связанные с target_node и layer.\n' +
  '- Не добавляй комментарии в JSON.\n' +
  '- Не добавляй trailing commas.\n' +
  '- Не используй markdown внутри JSON-строк.\n' +
  '- snapshot.key_pattern должен быть коротким, сильным, человеческим заголовком — не технический термин.\n' +
  '- snapshot.three_signals — ровно 3 коротких проявления паттерна.\n' +
  '- snapshot.main_overheat.score — число от 0 до 1.\n' +
  '- phrase_microscope.quote должна быть точной цитатой из материала. Не пересказывай — цитируй.\n' +
  '- phrase_microscope.fragments[].text должны быть фрагментами той же цитаты.\n' +
  '- honest_translation.items[].as_said желательно брать из материала или близко к формулировке.\n' +
  '- honest_translation.items[].more_honest — бережный перевод смысла, не категоричный.\n' +
  '- protected_need — психологическая гипотеза, не диагноз. Формулируй бережно.\n' +
  '- node_graph.edges[].type должен быть одним из: hard, normal, soft, choice_available, choice_blocked.\n' +
  '- node_graph.central_node_id должен совпадать с id одного из nodes.\n' +
  '- heatmap.zones[].why_it_matters объясняй для обычного читателя без психологического образования.\n' +
  '- feedback_config.enabled всегда false — backend для хранения feedback отсутствует.\n' +
  '- Все поля snapshot, how_to_read, phrase_microscope, honest_translation, protected_need обязательны. Если данных мало — давай осторожные формулировки, но не оставляй поля пустыми.\n\n' +
  'Материал:\n\n';

const C = {
  bg: '#f5f3ef',
  card: '#ffffff',
  border: '1px solid #e8e3db',
  shadow: '0 1px 10px rgba(0,0,0,0.06)',
  text: '#1a1a1a',
  muted: '#8a8580',
  link: '#5c6bc0',
  font: 'system-ui, -apple-system, sans-serif',
} as const;

const INTAKE_STATUS: Record<string, { bg: string; color: string }> = {
  new:       { bg: '#ede7f6', color: '#5b21b6' },
  completed: { bg: '#d9f2eb', color: '#1a7a63' },
};

const INTAKE_STATUS_LABELS: Record<string, string> = {
  new: 'новая',
  completed: 'завершена',
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default async function AdminIntakeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const intake = getIntakeById(id);

  if (!intake) notFound();

  const base = process.env.BASE_URL ?? 'http://localhost:3000';
  const userMessage = intake.user_message ?? '';
  const mindloomPrompt = MINDLOOM_PROMPT_PREFIX + userMessage;
  const existingReportUrl = intake.report_public_token
    ? `${base}/r/${intake.report_public_token}`
    : null;
  let prettyJson: string;
  let rawPayload: Record<string, unknown> = {};
  try {
    rawPayload = JSON.parse(intake.raw_payload_json) as Record<string, unknown>;
    prettyJson = JSON.stringify(rawPayload, null, 2);
  } catch {
    prettyJson = intake.raw_payload_json;
  }

  const inputType = typeof rawPayload.input_type === 'string' ? rawPayload.input_type : null;
  const filename = typeof rawPayload.filename === 'string' ? rawPayload.filename : null;
  const fileType = typeof rawPayload.file_type === 'string' ? rawPayload.file_type : null;
  const originalUserMessage =
    typeof rawPayload.user_message === 'string' && rawPayload.user_message.trim() && rawPayload.user_message !== userMessage
      ? rawPayload.user_message
      : null;
  const inputTypeLabel = inputType ?? 'unknown';
  const inputTypeStyle =
    inputType === 'file_extracted_text'
      ? { background: '#e0f2fe', color: '#075985' }
      : inputType === 'transcript'
        ? { background: '#ede7f6', color: '#5b21b6' }
        : inputType === 'document'
          ? { background: '#d9f2eb', color: '#1a7a63' }
          : inputType === 'text'
            ? { background: '#f0ede6', color: '#6b6560' }
            : { background: '#fef3c7', color: '#92400e' };
  const isFileExtract = inputType === 'file_extracted_text';
  const charCount = userMessage.length;

  const statusStyle = INTAKE_STATUS[intake.status] ?? { bg: '#f0ede8', color: '#6b6560' };
  const statusLabel = INTAKE_STATUS_LABELS[intake.status] ?? intake.status;
  const isArchived = Boolean(intake.archived_at);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, padding: '2rem 1.25rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/admin/intake" style={{ fontSize: '0.82rem', color: C.link, textDecoration: 'none' }}>← Входящие заявки</Link>
          <Link href="/admin" style={{ fontSize: '0.82rem', color: C.link, textDecoration: 'none' }}>Админ</Link>
        </div>

        {/* Page header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: C.text, margin: 0 }}>Заявка</h1>
            <span style={{
              display: 'inline-block', padding: '0.22rem 0.7rem', borderRadius: 20,
              fontSize: '0.73rem', fontWeight: 600, background: statusStyle.bg, color: statusStyle.color,
            }}>
              {statusLabel}
            </span>
            {isArchived && (
              <span style={{
                display: 'inline-block', padding: '0.22rem 0.7rem', borderRadius: 20,
                fontSize: '0.73rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b',
              }}>
                Archived
              </span>
            )}
            {intake.source && (
              <span style={{
                display: 'inline-block', padding: '0.22rem 0.6rem', borderRadius: 20,
                fontSize: '0.73rem', color: C.muted, background: '#f0ede6',
              }}>
                {intake.source}
              </span>
            )}
          </div>
          <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#ccc', margin: '0 0 0.35rem' }}>
            {intake.id}
          </p>
          <p style={{ fontSize: '0.82rem', color: C.muted, margin: 0 }}>
            Создано {fmtDate(intake.created_at)}
            {intake.completed_at && ` · Завершено ${fmtDate(intake.completed_at)}`}
          </p>
        </div>

        {/* Report created card — shown when already completed */}
        {isArchived && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 16, padding: '1rem 1.25rem',
            boxShadow: C.shadow, marginBottom: '1rem',
          }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.88rem', fontWeight: 700, color: '#991b1b' }}>
              Заявка архивирована
            </p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.55 }}>
              Она скрыта из рабочих списков. Данные физически не удалены.
            </p>
          </div>
        )}

        {/* Report created card — shown when already completed */}
        {existingReportUrl && (
          <div style={{
            background: '#d9f2eb', border: '1px solid #a8dfd1',
            borderRadius: 20, padding: '1.25rem 1.5rem',
            boxShadow: C.shadow, marginBottom: '1rem',
          }}>
            <p style={{ margin: '0 0 0.6rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#1a7a63' }}>
              Отчёт создан
            </p>
            <a
              href={existingReportUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', color: '#207a63', fontSize: '0.88rem', wordBreak: 'break-all', marginBottom: '0.9rem', textDecoration: 'none', fontWeight: 500 }}
            >
              {existingReportUrl}
            </a>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href={existingReportUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', padding: '0.45rem 1.1rem',
                  background: '#1a7a63', color: '#fff', borderRadius: 10,
                  textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
                }}
              >
                Открыть отчёт ↗
              </a>
              <CopyButton text={existingReportUrl} label="Скопировать ссылку" />
            </div>
          </div>
        )}

        {/* Incoming material */}
        <div style={{
          background: C.card, border: C.border, borderRadius: 20,
          padding: '1.25rem 1.5rem', boxShadow: C.shadow, marginBottom: '1rem',
        }}>
          {/* Section header with file metadata chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted }}>
              Входящий материал
            </p>
            <span style={{ padding: '0.15rem 0.55rem', borderRadius: 20, ...inputTypeStyle, fontSize: '0.7rem', fontWeight: 600 }}>
              {inputTypeLabel}
            </span>
            {filename && (
              <span style={{ padding: '0.15rem 0.55rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                {filename}
              </span>
            )}
            {fileType && (
              <span style={{ padding: '0.15rem 0.55rem', borderRadius: 20, background: '#f0ede6', color: '#6b6560', fontSize: '0.7rem' }}>
                {fileType}
              </span>
            )}
            {charCount > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: C.muted }}>
                {charCount.toLocaleString('ru-RU')} симв.
              </span>
            )}
          </div>
          {(inputType === 'file_extracted_text' || inputType === 'transcript') && (
            <div style={{
              padding: '0.65rem 0.9rem',
              background: '#fef9e7',
              border: '1px solid #fde68a',
              borderRadius: 10,
              marginBottom: '0.75rem',
            }}>
              <p style={{ margin: 0, fontSize: '0.77rem', color: '#92400e', lineHeight: 1.6 }}>
                Для TXT-транскриптов здесь должен быть полный текст разговора слово в слово. Если видите краткое содержание, основные темы или <code style={{ background: '#fde68a', padding: '0.1em 0.3em', borderRadius: 3, fontFamily: 'monospace', fontSize: '0.9em' }}>extracted_text_from_large_file</code> вместо полного текста — не отправляйте заявку в Mindloom. Создайте intake заново с полным transcript или разделите файл на части.
              </p>
            </div>
          )}
          {userMessage ? (
            <>
              {originalUserMessage && (
                <div style={{
                  padding: '0.75rem 0.9rem',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 12,
                  marginBottom: '0.75rem',
                }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1d4ed8' }}>
                    Заметка оператора / сообщение пользователя
                  </p>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#1e40af', lineHeight: 1.55 }}>
                    {originalUserMessage}
                  </p>
                </div>
              )}
              <div style={{
                padding: '1rem', background: '#faf9f7',
                border: C.border, borderRadius: 12,
                fontSize: '0.92rem', color: '#333', lineHeight: 1.7,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {userMessage}
              </div>
            </>
          ) : isFileExtract ? (
            <div style={{
              padding: '0.9rem 1.1rem',
              background: '#fef3c7', border: '1px solid #fcd34d',
              borderRadius: 12,
            }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.82rem', fontWeight: 600, color: '#92400e' }}>
                Текст файла не был передан
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#92400e', lineHeight: 1.55 }}>
                Файл был передан, но текст не был извлечён. Попросите Custom GPT повторить извлечение или передайте текст вручную через поле <code style={{ background: '#fde68a', padding: '0.1em 0.35em', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.85em' }}>extracted_text</code> в запросе.
              </p>
            </div>
          ) : (
            <p style={{ color: C.muted, fontSize: '0.88rem', margin: 0 }}>
              Текст не найден в данных заявки.
            </p>
          )}
        </div>

        {/* Step 1 — Copy prompt */}
        <div style={{
          background: C.card, border: C.border, borderRadius: 20,
          padding: '1.25rem 1.5rem', boxShadow: C.shadow, marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexGrow: 1 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: '50%',
                background: '#ede7f6', color: '#5b21b6',
                fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
              }}>1</span>
              <h2 style={{ fontSize: '0.97rem', fontWeight: 600, color: C.text, margin: 0 }}>
                Шаг 1 — Скопировать промпт для Mindloom v2
              </h2>
            </div>
            <CopyButton text={mindloomPrompt} label="Скопировать промпт v2" />
          </div>
          <pre style={{
            margin: 0, padding: '1rem', background: '#faf9f7',
            border: C.border, borderRadius: 12,
            fontSize: '0.85rem', lineHeight: 1.65, fontFamily: C.font,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#444',
            maxHeight: '280px', overflowY: 'auto',
          }}>
            {mindloomPrompt}
          </pre>
        </div>

        {/* Step 2 — Paste Mindloom JSON */}
        <div style={{
          background: C.card, border: C.border, borderRadius: 20,
          padding: '1.25rem 1.5rem', boxShadow: C.shadow, marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, borderRadius: '50%',
              background: '#e0f2fe', color: '#075985',
              fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
            }}>2</span>
            <h2 style={{ fontSize: '0.97rem', fontWeight: 600, color: C.text, margin: 0 }}>
                Шаг 2 — Вставить JSON отчёта v2 от Mindloom
            </h2>
          </div>
          {isArchived ? (
            <p style={{ margin: 0, color: C.muted, fontSize: '0.88rem', lineHeight: 1.55 }}>
              Заявка архивирована, создание отчёта из неё отключено.
            </p>
          ) : (
            <CreateReportForm intakeId={intake.id} />
          )}
        </div>

        {/* Raw JSON — technical secondary section */}
        <div style={{
          background: '#1c1c1e', border: '1px solid #2c2c2e',
          borderRadius: 16, padding: '1.25rem 1.5rem',
        }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#666' }}>
            Raw JSON
          </p>
          <pre style={{
            margin: 0, color: '#ccc', fontSize: '0.78rem', lineHeight: 1.55,
            overflowX: 'auto', fontFamily: 'monospace',
          }}>
            {prettyJson}
          </pre>
        </div>

        {/* Archive action */}
        <div style={{
          background: C.card, border: C.border, borderRadius: 16,
          padding: '1rem 1.5rem', boxShadow: C.shadow, marginTop: '1rem',
        }}>
          <p style={{ margin: '0 0 0.6rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted }}>
            Cleanup
          </p>
          {isArchived ? (
            <p style={{ margin: 0, color: C.muted, fontSize: '0.84rem' }}>
              Заявка уже архивирована. Действия отключены.
            </p>
          ) : (
            <>
              <p style={{ margin: '0 0 0.75rem', color: C.muted, fontSize: '0.84rem', lineHeight: 1.55 }}>
                Запись будет скрыта из рабочих списков. Данные физически не удаляются.
              </p>
              <ArchiveIntakeButton intakeId={intake.id} />
            </>
          )}
        </div>

      </div>
    </div>
  );
}
