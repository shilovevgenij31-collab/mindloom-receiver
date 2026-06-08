# Тестирование Mindloom Receiver

> **Порт:** все локальные примеры используют `localhost:3001`.  
> Запустите dev-сервер на этом порту: `npm run dev -- -p 3001`  
> Если используете другой порт — замените `3001` в командах ниже.

---

## Patch 4A: Extended v2 schema checks

### Prompt checks

Откройте любую заявку в `/admin/intake/:id` и проверьте prompt в блоке **Шаг 1**:

- содержит `"snapshot"` с примером полей `key_pattern`, `three_signals`, `main_overheat`
- содержит `"how_to_read"` с примером `steps`
- содержит `"phrase_microscope"` с примером `quote` и `fragments`
- содержит `"honest_translation"` с примером `items`
- содержит `"protected_need"` с примером `named`, `strategy_gets`, `sacrificed`
- `heatmap` расширен: содержит `title`, `description`, `scale`, `callouts`, а `zones` содержит `why_it_matters`
- `node_graph` расширен: содержит `central_node_id`, `legend`, `how_to_read`, а `edges` содержат `type` и `explanation`
- `feedback_config.enabled` = `false`
- правила содержат требование к `phrase_microscope.quote` (реальная цитата) и `node_graph.edges[].type` enum

### Normalizer checks

1. Создайте тестовый JSON с новыми полями:
   ```json
   {
     "meta": { "schema_version": "2.0", "language": "ru", "analysis_type": "single_session_report" },
     "participant": { "name": "Тест" },
     "source": { "type": "transcript", "material_volume": "краткий", "source_summary": "Тест" },
     "hero": { "title": "Тест", "main_insight": "Тест", "one_sentence_summary": "Тест" },
     "target": { "growth_blocker": "Тест", "central_knot": "Тест", "core_pain": "Тест", "short_explanation": "Тест" },
     "desired_state": { "explicit_request": "Тест", "hidden_request": "Тест", "future_state": "Тест" },
     "mechanism": { "protective_logic": "Тест", "hidden_gain": "Тест", "perceived_threat": "Тест", "cost": "Тест" },
     "speech_layer": { "key_phrases": ["цитата"], "speech_patterns": [] },
     "active_nodes": [],
     "heatmap": {
       "title": "Карта",
       "description": "Описание",
       "scale": [{ "label": "перегрев", "range": "81–100%", "description": "Ключевая зона" }],
       "legend": [{ "color": "red", "meaning": "перегрев" }],
       "zones": [{ "id": "z1", "label": "Зона", "intensity": 0.8, "color": "red", "description": "Описание", "why_it_matters": "Почему важно", "related_node_ids": [] }],
       "callouts": [{ "title": "Заголовок", "text": "Текст" }]
     },
     "node_graph": {
       "title": "Граф",
       "description": "Описание",
       "central_node_id": "n1",
       "nodes": [{ "id": "n1", "label": "Узел", "type": "defense", "intensity": 0.9, "description": "Описание узла" }],
       "edges": [{ "from": "n1", "to": "n1", "label": "петля", "type": "hard", "strength": 0.5, "explanation": "Объяснение" }],
       "legend": [{ "label": "жёсткая связь", "type": "hard", "description": "Автоматически" }],
       "how_to_read": [{ "title": "Пример", "description": "Описание" }]
     },
     "hypothesis_table": [],
     "trajectory": { "cycle": [], "blocking_point": null, "possible_exit": null },
     "processing_dashboard": { "active_nodes_count": 1, "main_layer": "Защита", "priority": "Тест", "overheat_level": 0.8, "resource_level": 0.3, "markers_detected": 0 },
     "mindloom_layers": [],
     "transformation_markers": [],
     "recommended_practices": [],
     "disclaimer": "Тест.",
     "snapshot": {
       "key_pattern": "Тестовый паттерн",
       "short_explanation": "Объяснение",
       "three_signals": ["Сигнал 1", "Сигнал 2", "Сигнал 3"],
       "main_overheat": { "label": "Перегрев", "score": 0.9, "explanation": "Объяснение" },
       "first_step": "Первый шаг"
     },
     "how_to_read": {
       "title": "Как читать",
       "steps": [{ "title": "Шаг 1", "description": "Описание" }]
     },
     "phrase_microscope": {
       "title": "Фраза",
       "quote": "Я не могу остановиться",
       "why_this_quote": "Показывает паттерн",
       "fragments": [{ "text": "не могу остановиться", "meaning": "контроль", "pattern": "гиперконтроль", "explanation": "Объяснение" }],
       "summary": "Итог"
     },
     "honest_translation": {
       "title": "Как честно",
       "items": [{ "as_said": "Я просто слабая", "more_honest": "Мне нужна поддержка", "explanation": "Пояснение" }]
     },
     "protected_need": {
       "title": "Потребность",
       "description": "Описание",
       "named": ["безопасность"],
       "strategy_gets": ["контроль"],
       "sacrificed": ["отдых"],
       "leading_need": "безопасность",
       "interpretation": "Интерпретация"
     },
     "feedback_config": { "enabled": false, "positive_label": "Да", "negative_label": "Нет" }
   }
   ```
2. Отправьте через форму **Шаг 2** в любой заявке → **Создать отчёт**.
3. Убедитесь, что отчёт создан без ошибок.
4. Откройте публичную страницу `/r/:token` — базовый v2-дашборд отображается (новые блоки добавятся в Patch 4B).

### Legacy compatibility check

1. Вставьте старый v2 JSON без новых полей (без `snapshot`, `phrase_microscope` и т.д.).
2. Убедитесь, что отчёт создаётся без ошибок.
3. Убедитесь, что публичная страница открывается без ошибок — старые поля отображаются нормально через fallback builders.

---

## Patch 4M: Interaction layer checks

### Visual QA (390px viewport, mobile Chrome DevTools)

| Действие | Ожидаемый результат |
|---|---|
| Тап на узел тепловой карты | Открывается bottom sheet с названием зоны, процентом, description, why_it_matters |
| Тап на узел графа | Bottom sheet с именем узла, процентом, badge (центральный/тип), входящие/исходящие связи, цитаты |
| Тап на ребро графа (прозрачная hit-area) | Bottom sheet с типом связи, strength, explanation, контекстное значение по типу |
| Тап на строку «Как читать карту» | Тот же bottom sheet ребра (edgeRef) |
| Тап на строку узла доказательной базы | Bottom sheet с полными цитатами |
| Тап на строку слоя | Bottom sheet с description, проявлением, заметкой |
| Тап на строку маркера | Bottom sheet с description, shift_signal |
| Кнопка × в sheet | Sheet закрывается |
| Тап на backdrop | Sheet закрывается |
| Клавиша ESC | Sheet закрывается (desktop) |
| Кнопка ? (HelpTip) внутри карточки | HelpTip открывается, sheet не открывается |
| Keyboard: Enter/Space на тапаемом элементе | Sheet открывается (role=button) |

### Проверить:
- нет undefined/null/NaN ни в одном bottom sheet
- нет пустых чипов edge type
- нет пустых заголовков
- нет поломанного графового ребра после добавления прозрачных hit-paths
- SSR не падает (build проходит чисто)

---

## Patch 1: Report v2 checks

Перед общим smoke test проверьте текущий ручной workflow для Mindloom Report v2.

### Prompt checks

Откройте любую заявку в `/admin/intake/:id` и проверьте prompt в блоке **Шаг 1**:

- содержит `meta.schema_version: "2.0"`
- содержит `active_nodes`
- содержит `heatmap`
- содержит `node_graph`
- содержит `recommended_practices`
- не содержит top-level `protocol`
- не просит `mindloom_report_v2_fixed_blocks`

### Create-report checks

1. Вставьте валидный v2 JSON в форму создания отчёта.
2. Убедитесь, что отчёт создаётся без ошибок.
3. Убедитесь, что статус intake становится `completed`.
4. Повторная отправка для той же заявки должна вернуть 409 и существующий `report_url`.

### Invalid JSON checks

1. Вставьте реально сломанный JSON.
2. Убедитесь, что UI показывает repair prompt для Report v2.
3. Repair prompt должен:
   - требовать `meta.schema_version: "2.0"`
   - запрещать `protocol`
   - запрещать top-level `schema_version`
   - запрещать `mindloom_report_v2_fixed_blocks`

### Backward compatibility checks

1. Вставьте legacy schema v1 JSON.
2. Убедитесь, что create-report не падает и не ломает intake flow.
3. Убедитесь, что приложение не падает на старом отчёте.

---

## Подготовка

### .env.local

```env
MINDLOOM_WEBHOOK_SECRET=my-dev-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin-pass
DATABASE_PATH=./data/mindloom.db
BASE_URL=http://localhost:3001
```

### Запуск dev-сервера

```bash
npm run dev -- -p 3001
```

### Переменные для тестов (PowerShell)

```powershell
$env:SECRET = "my-dev-secret"
$env:ADMIN_PASS = "admin-pass"
$env:RECEIVER_URL = "http://localhost:3001"
```

Bash:

```bash
export SECRET=my-dev-secret
export ADMIN_PASS=admin-pass
export RECEIVER_URL=http://localhost:3001
```

---

## A. Локальный health check

```bash
curl -s http://localhost:3001/api/health | jq
```

**Ожидаем:**
```json
{ "ok": true, "db": "ok", "timestamp": "2026-05-19T..." }
```

Если `"ok": false` или HTTP 503 — проблема с базой данных (check DATABASE_PATH в .env.local).

---

## B. Локальный intake test

### B1. Отправить тестовую заявку

```powershell
npm run submit:intake
```

**Ожидаем:**
```
Sending to: http://localhost:3001/api/mindloom/intake
HTTP status: 201
Response: {
  "ok": true,
  "intake_id": "...",
  "admin_url": "http://localhost:3001/admin/intake/..."
}
Admin URL: http://localhost:3001/admin/intake/...
```

### B2. Открыть список заявок

Откройте в браузере (с Basic Auth):
```
http://localhost:3001/admin/intake
```

Новая заявка должна появиться со статусом **новая** и source `custom_gpt`.

### B3. Проверить детальную страницу заявки

Перейдите по `Admin URL` из вывода шага B1.  
На странице должно быть:
- полный `user_message` в блоке «Входящий материал»
- блок «Шаг 1 — Скопировать промпт для Mindloom v2» с готовым промптом
- кнопка «Скопировать промпт v2»
- форма «Шаг 2 — Вставить JSON отчёта v2 от Mindloom»

---

## C. Полный ручной workflow (intake → report)

Проверка сквозного цикла без автоматической отправки из GPT.

### C1. Открыть страницу заявки

Откройте любую заявку из `/admin/intake` → **Подробнее →**.

### C2. Скопировать промпт

Нажмите **Скопировать промпт v2** — в буфер попадает промпт по Mindloom Report v2 с требованием вернуть JSON внутри одного ` ```json ` code block.

### C3. Получить JSON от Mindloom GPT

1. Откройте Mindloom GPT в ChatGPT
2. Вставьте промпт
3. Mindloom вернёт ответ в блоке ` ```json ... ``` `
4. Нажмите **Copy** у блока — можно вставить в форму вместе с фенсами

Или используйте готовый тестовый JSON из `docs/examples/mindloom-sample-report.json`.

### C4. Создать отчёт

Вставьте JSON в форму на странице заявки → **Создать отчёт**.

**Ожидаем:**
```
Отчёт создан. Заявка завершена.
http://localhost:3001/r/...
[Открыть отчёт ↗]
```

### C5. Проверить публичную страницу отчёта

Откройте `report_url` — должна открыться страница ReportV2Dashboard с 16-секционным flow:
1. Hero (название, имя участника, мета-чипы, дата)
2. Snapshot — «Главное за 30 секунд» (ключевой паттерн, три сигнала, главный перегрев, первый шаг)
3. HowToRead — пошаговый маршрут по отчёту
4. GrowthBlocker — что блокирует рост, цитата, механизм
5. ProtectedNeed — ведущая потребность, три группы тегов
6. PhraseMicroscope — цитата под микроскопом, фрагменты
7. HonestTranslation — как сказано / как честно
8. KeyPhrases — ключевые фразы и речевые паттерны
9. Heatmap — визуальная карта перегрева
10. NodeGraph — граф причинно-следственных связей
11. Evidence / ActiveNodes — доказательная база
12. Trajectory — цикл и точка выхода
13. Layers — слои Mindloom (если есть)
14. Markers — маркеры изменений (если есть)
15. Practices — рекомендуемые практики (если есть)
16. Disclaimer + Footer

Проверить:
- нет undefined/null/NaN в текстах
- нет пустых чипов или заголовков
- нижняя панель (bottom sheet) не открывается сама по себе

### C6. Проверить статус заявки

Откройте `/admin/intake` — заявка должна показывать статус **завершена** и ссылку **Отчёт ↗**.

---

## D. Тест прямой отправки отчёта (legacy)

### D1. Через npm скрипт

```powershell
npm run submit:sample
```

**Ожидаем:**
```
Sending to: http://localhost:3001/api/mindloom/reports
HTTP status: 201
Response: { "ok": true, "report_id": "...", "report_url": "http://localhost:3001/r/..." }
Report URL: http://localhost:3001/r/...
```

### D2. Через curl (с полным Mindloom JSON)

```bash
curl -s -X POST http://localhost:3001/api/mindloom/reports \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "participant": {"name": "Тест"},
    "session": {"source": "mindloom_gpt", "language": "ru", "version": "1.0"},
    "report": {
      "title": "Тестовый анализ",
      "summary": "Тестовое резюме.",
      "blocks": [
        {"id": "b1", "title": "Блок", "text": "Текст.", "quotes": [], "recommendations": []}
      ],
      "markers": ["маркер 1", "маркер 2"],
      "layers": []
    },
    "meta": {"schema_version": "1.0"}
  }' | jq
```

---

## E. Production smoke test

```powershell
# Установить production секрет (взять с сервера)
$env:MINDLOOM_WEBHOOK_SECRET = "<секрет из .env.production>"
$env:RECEIVER_URL = "https://mindloom.edagency.ru"
```

### E1. Health check

```bash
curl -s https://mindloom.edagency.ru/api/health | jq
# Ожидаем: {"ok":true,"db":"ok","timestamp":"..."}
```

### E2. Admin pages

Открыть в браузере:
- https://mindloom.edagency.ru/
- https://mindloom.edagency.ru/admin (Basic Auth)
- https://mindloom.edagency.ru/admin/intake
- https://mindloom.edagency.ru/admin/reports

### E3. Отправить тестовый отчёт

```powershell
npm run submit:sample
```

Открыть `report_url` из вывода в браузере.

### E4. Проверить Custom GPT Action

1. Открыть Mindloom Custom GPT в ChatGPT
2. Отправить тестовое сообщение
3. GPT должен ответить `intake_id` и `admin_url`
4. Открыть `admin_url` — заявка появилась с материалом

### E5. OpenAPI schemas

```bash
curl -s -o /dev/null -w "%{http_code}" https://mindloom.edagency.ru/openapi-intake.yaml
# Ожидаем: 200

curl -s -o /dev/null -w "%{http_code}" https://mindloom.edagency.ru/openapi.yaml
# Ожидаем: 200
```

---

## F. Типичные ошибки

### 401 — неверный Bearer token

```bash
curl -s -X POST http://localhost:3001/api/mindloom/reports \
  -H "Authorization: Bearer WRONG" \
  -H "Content-Type: application/json" \
  -d '{}' | jq
# Ожидаем: {"ok":false,"error":"Unauthorized"}
```

**Решение:** убедитесь, что `MINDLOOM_WEBHOOK_SECRET` в `.env.local` совпадает с тем, что передаётся в заголовке.

---

### 401 — Basic Auth на /admin

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/admin/reports
# Ожидаем: 401
```

**Решение:** открывайте `/admin/*` через браузер с вводом `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

---

### 400 — невалидный JSON

```bash
curl -s -X POST http://localhost:3001/api/mindloom/reports \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d 'not-valid-json' | jq
# Ожидаем: {"ok":false,"error":"Invalid JSON body"}
```

**Решение в форме:** если вставили JSON с ` ```json ` обёрткой, форма покажет: «Скопируйте только чистый JSON от Mindloom без ``` и лишнего текста».

---

### 409 — отчёт уже создан для этой заявки

```
{"ok":false,"error":"Report already exists for this intake","report_url":"..."}
```

**Не ошибка** — используйте `report_url` из ответа.

---

### 404 — несуществующий токен

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/r/faketoken123
# Ожидаем: 404
```

Корректный 404 — не 500.

---

### Порт 3001 занят

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Решение (PowerShell):**
```powershell
# Найти процесс на порту 3001
netstat -ano | findstr :3001
# Завершить (замените PID)
Stop-Process -Id <PID>
```

---

### Docker build медленный после изменений package.json

Если изменился `package.json` — Docker перекачивает все node_modules.  
Это нормально: `better-sqlite3` компилируется нативно (~3–7 минут).  
Следите за выводом — ошибок быть не должно.

---

### GPT Action: «object schema missing properties»

При импорте OpenAPI schema в GPT Builder ошибка про отсутствие properties.  
**Актуальная схема** `openapi-intake.yaml` содержит явные `properties` (`user_message`, `source`).  
Убедитесь, что импортируете именно `openapi-intake.yaml`, а не `openapi.yaml`:
```
https://mindloom.edagency.ru/openapi-intake.yaml
```

---

## F. TXT transcript intake test

Проверяет, что Custom GPT отправляет полный текст файла, а не summary.

### Шаги

1. Создать небольшой `.txt` файл с 20–50 строками транскрипта (реплики, имена, повторы).
2. В Custom GPT прикрепить файл.
3. Написать:
   > Хочу отправить материал на Mindloom-анализ. Используй полный текст файла слово в слово, без краткого содержания.
4. Открыть `/admin/intake`.
5. Открыть новую заявку → проверить поле **Входящий материал**.

**Ожидаем:** `user_message` содержит полный транскрипт — прямую речь, реплики, исходные формулировки.

**Не должно быть:**
- `extracted_text_from_large_file`
- «основные темы», «структурированная расшифровка», «краткое содержание»
- пересказ вместо полного текста

**Если пришёл summary** — GPT instructions или OpenAPI description настроены неправильно. Обновить Instructions в GPT Builder (см. `docs/gpt-action-handoff.md`) и переимпортировать `openapi-intake.yaml`.

---

## G. Тест markdown fences в CreateReportForm

### G1. Вставить JSON с ` ```json ` фенсами → отчёт должен создаться

1. Откройте любую незавершённую заявку → **Подробнее →**
2. В форму **Шаг 2** вставьте:
   ````
   ```json
   {
     "participant": {"name": "Тест"},
     "session": {"source": "mindloom_gpt", "language": "ru", "version": "1.0"},
     "report": {
       "title": "Тест с фенсами",
       "summary": "Проверка автоматической очистки.",
       "blocks": [{"id": "b1", "title": "Блок", "text": "Текст.", "quotes": [], "recommendations": []}],
       "markers": ["маркер"],
       "layers": []
     },
     "meta": {"schema_version": "1.0"}
   }
   ```
   ````
3. Нажмите **Создать отчёт**

**Ожидаем:** отчёт создан, никаких ошибок. Cleaning notes могут не появиться — это нормально.

---

### G2. Вставить JSON с ` ``` ` (без `json`) → отчёт должен создаться

Та же проверка, но с ``````` вместо ` ```json `.

---

### G3. Вставить реально сломанный JSON → понятная ошибка

1. Вставьте в форму:
   ```
   {"broken": "json", "missing_brace":
   ```
2. Нажмите **Создать отчёт**

**Ожидаем:**
```
JSON невалиден. Скопируйте содержимое блока кода от Mindloom без лишнего текста.
Проверьте, что ответ начинается с { и заканчивается }.
```

---

## H. Дополнительные тесты

### Произвольный JSON сохраняется → 201

```bash
curl -s -X POST http://localhost:3001/api/mindloom/reports \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{"custom": "structure", "list": [1,2,3]}' | jq
```

Откройте `report_url` — покажет fallback-карточку «Отчёт получен и сохранён».  
Raw JSON на публичной странице **не показывается**.

### PowerShell версия health check

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/health" | ConvertTo-Json
```

### PowerShell версия отправки отчёта

```powershell
$body = '{"participant":{"name":"Тест"},"report":{"title":"Тест","summary":"Тест","blocks":[],"markers":[],"layers":[]},"meta":{"schema_version":"1.0"}}'
Invoke-RestMethod -Uri "http://localhost:3001/api/mindloom/reports" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $env:SECRET" } `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json
```
