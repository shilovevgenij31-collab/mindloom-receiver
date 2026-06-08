# GPT Action Handoff — Mindloom Receiver

---

## Текущая конфигурация (Intake Flow)

| Параметр | Значение |
|---|---|
| OpenAPI Schema URL | `https://mindloom.edagency.ru/openapi-intake.yaml` |
| Endpoint | `POST https://mindloom.edagency.ru/api/mindloom/intake` |
| operationId | `submitMindloomIntake` |
| Authentication | Bearer token |
| Bearer token | `MINDLOOM_WEBHOOK_SECRET` из `.env.production` на сервере |

---

## Как работает Intake Flow

1. Custom GPT вызывает `submitMindloomIntake` с материалом клиента
2. Создаётся **intake** (заявка) в базе данных со статусом `new`
3. В ответе GPT получает `intake_id` и `admin_url`
4. Заявка появляется в `/admin/intake`
5. Оператор обрабатывает заявку вручную и создаёт отчёт

GPT **не получает** готовый отчёт автоматически — это ручной workflow.

После создания intake оператор использует prompt из `/admin/intake/:id`, чтобы получить **Mindloom Report v2**.
Требования к текущему ручному prompt (Patch 4A — extended schema):

- один ` ```json ` code block
- `meta.schema_version: "2.0"`
- без top-level `protocol`
- без top-level `schema_version`
- без `mindloom_report_v2_fixed_blocks`
- "что делать" должно находиться внутри `recommended_practices`
- **Новые обязательные поля (Patch 4A):** `snapshot`, `how_to_read`, `phrase_microscope`, `honest_translation`, `protected_need`
- **Расширенные поля:** `heatmap` теперь содержит `title`, `scale`, `callouts`, `zones[].why_it_matters`; `node_graph` теперь содержит `central_node_id`, `legend`, `how_to_read`, `edges[].type`, `edges[].explanation`
- `feedback_config.enabled` всегда `false`

Подробная спецификация новых полей: [docs/json-schema-v2.md](json-schema-v2.md)

---

## Поля запроса (submitMindloomIntake)

```json
{
  "user_message": "Текст или транскрипт от клиента — обязательное поле",
  "source": "mindloom_custom_gpt"
}
```

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `user_message` | string | **да** | Материал клиента для анализа |
| `source` | string | нет | Источник заявки (по умолчанию определяется автоматически) |

---

## Успешный ответ (201)

```json
{
  "ok": true,
  "intake_id": "V1StGXR8_Z5jdHi6B-myT",
  "admin_url": "https://mindloom.edagency.ru/admin/intake/V1StGXR8_Z5jdHi6B-myT"
}
```

`admin_url` — ссылка для оператора. **Не показывать клиенту.** Защищена HTTP Basic Auth.

---

## Ошибки

| HTTP | Тело | Причина |
|---|---|---|
| 401 | `{"ok":false,"error":"Unauthorized"}` | Неверный Bearer token |
| 400 | `{"ok":false,"error":"Invalid JSON body"}` | Невалидный JSON в запросе |
| 500 | `{"ok":false,"error":"Internal server error"}` | Ошибка сервера |

---

## Инструкция: добавить/обновить Action в GPT Builder

1. Открыть [https://chatgpt.com/gpts](https://chatgpt.com/gpts) → найти **Mindloom GPT** → **Edit**
2. Раздел **Actions** → **Create new action** (или редактировать существующий)
3. В поле **Schema** нажать **Import from URL**:
   ```
   https://mindloom.edagency.ru/openapi-intake.yaml
   ```
4. Schema загружается — появляется операция `submitMindloomIntake`
5. **Authentication** → **API Key** → Auth Type: **Bearer** → вставить `MINDLOOM_WEBHOOK_SECRET`
6. **Test** → выбрать `submitMindloomIntake` → передать тестовый `user_message`
7. В ответе должно быть `"ok": true` и `admin_url`
8. Открыть `admin_url` в браузере — убедиться, что заявка появилась в `/admin/intake`
9. Сохранить GPT

---

## Как получить MINDLOOM_WEBHOOK_SECRET

На сервере (SSH):

```bash
grep MINDLOOM_WEBHOOK_SECRET /opt/mindloom-receiver/.env.production
```

Передавать **только безопасным каналом** — не через открытые чаты или email.

---

## Legacy: прямая отправка отчёта

Старый flow (отправка готового JSON-отчёта напрямую) по-прежнему работает:

| Параметр | Значение |
|---|---|
| OpenAPI Schema URL | `https://mindloom.edagency.ru/openapi.yaml` |
| Endpoint | `POST https://mindloom.edagency.ru/api/mindloom/reports` |
| operationId | `submitReport` |

Принимает **любой валидный JSON** и сразу создаёт отчёт с публичной ссылкой.  
Используется для тестов через `npm run submit:sample`.

---

## Custom GPT instructions — TXT transcripts and uploaded files

### English (paste into GPT Builder → Instructions)

```
When the user provides text directly or uploads a .txt transcript, your job is to submit the original material to Mindloom Receiver.

Critical rule:
Never summarize, shorten, restructure, rewrite, clean up, translate, interpret, or analyze the user's material before calling submitMindloomIntake.

If the user uploads a .txt file:
- read the file content;
- extract the complete transcript text verbatim;
- send the full transcript text word-for-word in user_message;
- preserve speaker labels, timestamps, pauses, repetitions, filler words, and original wording when present;
- do not replace the transcript with a summary, main topics, structured recap, extracted notes, analysis, or "available part of the material";
- do not use placeholders like "extracted_text_from_large_file".

If the complete file content cannot be accessed or cannot fit into the action call:
- do not call submitMindloomIntake;
- tell the user in Russian:
  "Файл слишком большой или не удалось передать полный текст целиком. Пожалуйста, разделите транскрипт на части и отправьте первую часть."
- never submit a shortened version without explicit user confirmation.

Before calling submitMindloomIntake, silently verify:
- user_message contains the actual transcript text, not a summary;
- user_message is long enough to plausibly contain the transcript;
- user_message does not start with phrases like "Summary", "Main topics", "Structured transcript", "Full structured transcript", "extracted_text_from_large_file", unless those phrases are actually part of the transcript.

After successful submit:
- tell the user only that the material was accepted;
- do not show admin_url to the user.
```

### Русская версия (дублировать в Instructions на русском)

```
Если пользователь прикрепил TXT-файл, отправляй в user_message полный текст файла слово в слово.
Нельзя отправлять конспект, краткое содержание, основные темы, структурированную расшифровку или пересказ.
Если полный текст слишком большой — не вызывай Action, попроси разделить файл на части.
```

---

## Важные предупреждения

**Секреты:**
- Не пересылать `MINDLOOM_WEBHOOK_SECRET` и `ADMIN_PASSWORD` открытым текстом.
- Не показывать содержимое `.env.production` на экране при записи экрана или в переписках.
- Если secret скомпрометирован — сгенерировать новый: `openssl rand -base64 32`, обновить `.env.production` и Bearer token в GPT Builder.

**Сервер:**
- `.env.production` хранится только на сервере, не в git.
- После изменения секрета — перезапустить контейнер: `docker compose -f docker-compose.production.yml up -d`.
