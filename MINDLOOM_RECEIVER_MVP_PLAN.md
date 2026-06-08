# Mindloom Receiver — MVP Plan

---

## Executive Summary

**Что делаем:** Mindloom GPT отправляет результат анализа на наш backend → backend сохраняет JSON → возвращает публичную ссылку → участник открывает отчёт.

**Рекомендуемый путь:**
Сначала локальный MVP на Next.js + SQLite: endpoint, сохранение JSON, public report link, минимальная admin page, OpenAPI schema и стандартный prompt для ручного workflow. После локальной проверки — отдельное согласование деплоя на сервер. На сервере ничего не трогать до аудита, n8n не использовать и не менять.

```
Mindloom GPT
  → отправляет JSON на наш endpoint
  → backend проверяет secret, принимает и сохраняет JSON
  → создаёт публичную ссылку
  → участник открывает отчёт по ссылке
```

---

## Current Implementation Strategy

1. Не начинаем с боевого сервера.
2. Делаем **локальную версию** и проверяем механику:
   - отправили JSON → backend принял → сохранил → создал public_token → вернул report_url → `/r/:token` открыл результат → `/admin/reports` показал запись.
3. Проверяем локально через curl / Postman — все acceptance criteria.
4. Готовим стандартный prompt для ручного Mindloom workflow.
5. После успешной локальной проверки — **отдельно согласуем деплой**.
6. Перед деплоем на боевой сервер:
   - осматриваем сервер (READ-ONLY аудит);
   - проверяем n8n, занятые порты, nginx;
   - ничего не трогаем в существующих конфигах;
   - ставим новый сервис отдельно (`/opt/mindloom-receiver`, порт 3100);
   - nginx и домен — только после проверки, всегда `nginx -t` перед reload.
7. После деплоя с HTTPS — подключаем GPT Action в GPT Builder.
8. После GPT Action — тестируем реальную отправку из Mindloom.

---

## 1. Цель MVP

Mindloom GPT производит психологический / нейропсихологический анализ.
Сейчас нет способа сохранить результат и поделиться им с участником.

**Цель первого этапа — простой технический приёмник.**
Главная проверка: «к нам всё приходит и сохраняется».

---

## 2. Что делаем

- Один backend endpoint: `POST /api/mindloom/reports`
- Авторизация через Bearer token (секретный ключ в env)
- Сохранение raw JSON в базу данных as-is
- Генерация уникальной публичной ссылки (`/r/:public_token`)
- Публичная страница отчёта — по ссылке, без логина
- Минимальная админка — список отчётов, просмотр raw JSON
- Health check endpoint
- OpenAPI schema для будущего GPT Action
- Стандартный prompt для ручного Mindloom workflow

---

## 3. Что не делаем

- Деплой на боевой сервер — только после локальной проверки и отдельного согласования
- Красивый визуальный dashboard
- Полноценный дизайн страниц
- Личный кабинет участника
- Авторизация / регистрация участников
- Оплата
- Дневник наблюдений и динамика между сессиями
- Telegram-бот
- Zoom-интеграция, Whisper / транскрибация
- Автоматическая загрузка записей
- Психологическая логика на backend
- Изменение или перенос Mindloom prompt на backend

---

## 4. Архитектура

### Рекомендуемый стек: Next.js 14 + TypeScript + SQLite + PM2

**Почему Next.js, а не чистый Node/Express:**

| Критерий | Node/Express | Next.js 14 |
|---|---|---|
| API routes | отдельный роутер | `/api/**` из коробки |
| Server-rendered страницы | шаблонизатор (EJS) | нативно, App Router |
| Добавить красивый UI позже | придётся переписывать | просто обновляем страницы |
| TypeScript | ручная настройка | из коробки |
| Деплой одним процессом | `node app.js` | `next start` |

**Почему SQLite, а не Postgres:**
- Нет внешнего сервера → не конфликтует с n8n
- Файловая база → бекап одной командой `cp`
- Достаточно для MVP-трафика (сотни / тысячи отчётов)
- Repository-слой → при необходимости заменяем на Postgres без переписывания логики

**Полный стек:**
- Runtime: Node.js 20 LTS
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: SQLite через `better-sqlite3`
- DB layer: `reports-repository.ts` — единственная точка работы с БД
- Process manager: PM2 (для сервера, не нужен локально)
- Reverse proxy: Nginx (только на сервере, новый server block)

**Структура проекта:**

```
mindloom-receiver/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── mindloom/reports/route.ts    ← POST endpoint
│   │   │   └── health/route.ts              ← GET health check
│   │   ├── r/[publicToken]/page.tsx         ← публичная страница отчёта
│   │   └── admin/
│   │       ├── reports/page.tsx             ← список отчётов
│   │       └── reports/[id]/page.tsx        ← детальный просмотр + raw JSON
│   └── lib/
│       ├── db.ts                            ← инициализация SQLite
│       ├── reports-repository.ts            ← все операции с БД
│       └── auth.ts                          ← проверка Bearer token
├── public/
│   └── openapi.yaml                         ← схема для GPT Action (статика)
├── data/                                    ← gitignored
│   └── mindloom.db
├── .env.local                               ← gitignored, НЕ коммитить
├── .env.example                             ← шаблон без значений (в git)
├── middleware.ts                            ← Basic Auth для /admin/*
├── next.config.ts
├── ecosystem.config.js                      ← PM2 конфиг (для сервера)
└── package.json
```

---

## 5. Backend Endpoint

### POST /api/mindloom/reports

**Headers:**
```
Authorization: Bearer <MINDLOOM_WEBHOOK_SECRET>
Content-Type: application/json
```

**Body:** любой валидный JSON — принимаем и сохраняем as-is.

**Логика:**
1. Проверить `Authorization: Bearer ...` через `crypto.timingSafeEqual`
2. Неверный secret → 401 JSON, payload не сохранять
3. Распарсить body как JSON
4. Невалидный JSON → 400 JSON
5. Сгенерировать `id` (nanoid) и `public_token` (32-char base64url)
6. Сохранить в БД
7. Вернуть 201

**Успешный ответ 201:**
```json
{
  "ok": true,
  "report_id": "V1StGXR8_Z5jdHi6B-myT",
  "report_url": "https://receiver.mindloom.app/r/dGhpcyBpcyBhIHRlc3Q"
}
```

**Все ошибки возвращают JSON — никогда HTML, никогда пустой 500:**
```json
{ "ok": false, "error": "Unauthorized" }           → 401
{ "ok": false, "error": "Invalid JSON body" }       → 400
{ "ok": false, "error": "Internal server error" }   → 500
```

---

### GET /r/:publicToken

Публичная страница. Без авторизации. SSR.

- Токен не найден → 404
- Токен найден → структурированный вид если схема известна, иначе raw JSON в `<pre>`

---

### GET /admin/reports / GET /admin/reports/:id

Список и детальный просмотр. HTTP Basic Auth из env. Raw JSON в `<pre>` + кнопка «Скопировать ссылку».

---

### GET /api/health

```json
{ "ok": true, "timestamp": "2026-05-18T10:00:00Z", "db": "ok" }
```

---

### GET /openapi.yaml

Статический файл из `/public/openapi.yaml` для GPT Action.

---

## 6. База данных

### Рекомендация: SQLite с repository-слоем

**Плюсы:** нет внешнего сервера, нет конфликтов с n8n, лёгкий бекап, достаточно для MVP.
**Repository pattern:** весь SQL изолирован в `reports-repository.ts`. Переход на Postgres = замена одного файла.

### Схема

```sql
CREATE TABLE mindloom_reports (
  id                     TEXT PRIMARY KEY,
  public_token           TEXT UNIQUE NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'received',
  raw_payload_json       TEXT NOT NULL,
  normalized_report_json TEXT,
  source                 TEXT,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL
);

CREATE TABLE mindloom_events (
  id             TEXT PRIMARY KEY,
  report_id      TEXT NOT NULL REFERENCES mindloom_reports(id),
  event_type     TEXT NOT NULL,
  metadata_json  TEXT,
  created_at     TEXT NOT NULL
);

CREATE INDEX idx_reports_token   ON mindloom_reports(public_token);
CREATE INDEX idx_reports_created ON mindloom_reports(created_at DESC);
CREATE INDEX idx_events_report   ON mindloom_events(report_id);
```

- **id:** `nanoid(21)` — URL-safe, уникальный
- **public_token:** `crypto.randomBytes(24).toString('base64url')` → 32 символа, ~192 бит энтропии
- **status:** `received` | `processed` | `error`

---

## 7. Рекомендуемый JSON формат для Mindloom

**Endpoint принимает любой JSON.** Это предложение команде Mindloom, не жёсткое требование.
Если придёт другая структура — сохраняем as-is, страница показывает raw JSON.

```json
{
  "participant": {
    "name": "Анна",
    "id": "optional-internal-id"
  },
  "session": {
    "source": "mindloom_gpt",
    "date": "2026-05-18T10:00:00Z",
    "language": "ru",
    "version": "1.0"
  },
  "report": {
    "title": "Нейропсихологический анализ",
    "summary": "Краткое резюме результата...",
    "blocks": [
      {
        "id": "identity",
        "title": "Идентичность",
        "text": "Развёрнутый текст блока...",
        "quotes": ["Цитата из разговора"],
        "recommendations": ["Рекомендация 1"]
      }
    ],
    "markers": [
      { "key": "resilience", "value": "high", "label": "Устойчивость" }
    ],
    "layers": []
  },
  "meta": {
    "schema_version": "1.0"
  }
}
```

---

## 8. Standard Mindloom Prompt for Manual Workflow

### Зачем нужен стандартный prompt

На первом этапе команда **вручную** загружает транскрипт / материалы в Mindloom GPT — автоматической отправки с сервера нет. Чтобы каждый раз получать одинаковый результат, нужна prompt-инструкция, которую команда вставляет вместе с материалами.

**Цели:**
- Mindloom каждый раз возвращает одинаковую JSON-структуру
- Backend и report page могут нормально читать результат
- Та же структура будет использоваться в GPT Action при автоматизации
- Нет зависимости от произвольного текстового ответа GPT

### Что должен делать prompt

- Принять транскрипт / материалы сессии
- Провести анализ через Mindloom
- Вернуть **только JSON** — без markdown, без пояснений до/после, без ` ```json ` блоков
- Строго соответствовать предложенной схеме

### Базовая JSON-схема для prompt

```json
{
  "participant": {
    "name": "...",
    "id": "optional"
  },
  "session": {
    "source": "mindloom_gpt",
    "date": "ISO8601",
    "language": "ru",
    "version": "1.0"
  },
  "report": {
    "title": "...",
    "summary": "...",
    "blocks": [
      {
        "id": "...",
        "title": "...",
        "text": "...",
        "quotes": [],
        "recommendations": []
      }
    ],
    "markers": [],
    "layers": []
  },
  "meta": {
    "schema_version": "1.0"
  }
}
```

### Шаблон prompt-инструкции (черновик для Mindloom)

```
Проведи анализ по приведённым материалам.
Верни результат строго в формате JSON — без markdown, без пояснений, без ```json блоков.
Только чистый JSON-объект по следующей схеме:

{
  "participant": { "name": "имя участника или 'Участник'", "id": "" },
  "session": {
    "source": "mindloom_gpt",
    "date": "<текущая дата ISO8601>",
    "language": "ru",
    "version": "1.0"
  },
  "report": {
    "title": "название анализа",
    "summary": "краткое резюме",
    "blocks": [
      {
        "id": "уникальный_id_блока",
        "title": "название блока",
        "text": "текст анализа",
        "quotes": ["цитаты из материала если есть"],
        "recommendations": ["рекомендации если есть"]
      }
    ],
    "markers": [],
    "layers": []
  },
  "meta": { "schema_version": "1.0" }
}

Материалы:
[ВСТАВИТЬ ТРАНСКРИПТ / МАТЕРИАЛЫ СЕССИИ]
```

### Важно

- Backend всё равно принимает **любой JSON** — prompt обеспечивает стабильность, но не ломает receiver при отклонении от схемы
- raw payload всегда сохраняется as-is
- Красивую нормализацию и dashboard делаем позже, когда схема утверждена

### Ручной workflow (до GPT Action)

1. Команда вставляет prompt + транскрипт в Mindloom GPT
2. Mindloom возвращает JSON
3. Команда копирует JSON
4. Отправляет через curl / Postman на `POST /api/mindloom/reports`
5. Получает `report_url`
6. Передаёт ссылку участнику

---

## 9. GPT Action / OpenAPI

Custom GPT вызывает внешние API через **Actions**, требующие OpenAPI 3.x schema.

**Ограничение ChatGPT:** нужен публичный **HTTPS** endpoint. До деплоя с доменом — GPT Action не подключаем.

`openapi.yaml` → `/public/openapi.yaml` → `https://domain/openapi.yaml`

```yaml
openapi: 3.1.0
info:
  title: Mindloom Receiver API
  version: 1.0.0
servers:
  - url: https://receiver.mindloom.app
paths:
  /api/mindloom/reports:
    post:
      operationId: submitReport
      summary: Отправить результат анализа
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              description: Результат анализа (любой JSON)
      responses:
        '201':
          description: Отчёт сохранён
          content:
            application/json:
              schema:
                type: object
                properties:
                  ok: { type: boolean }
                  report_id: { type: string }
                  report_url: { type: string }
        '401':
          description: Неверный токен
        '400':
          description: Неверный JSON
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

**Шаги подключения (после деплоя с HTTPS):**
1. GPT Builder → Actions → Add Action
2. URL: `https://receiver.mindloom.app/openapi.yaml`
3. Authentication → Bearer → `MINDLOOM_WEBHOOK_SECRET`

---

## 10. Security

| Угроза | Защита |
|---|---|
| Неавторизованная отправка | Bearer token через `crypto.timingSafeEqual` |
| Перебор public_token | 32-char base64url ≈ 192 бит — невозможно |
| Доступ к /admin | HTTP Basic Auth в middleware |
| SQL injection | `better-sqlite3` параметризованные запросы |
| XSS при отображении JSON | `<pre>` с экранированием, не `dangerouslySetInnerHTML` |
| Огромный payload | Лимит body 10MB в Next.js config |
| Секреты в репозитории | `.env.local` в `.gitignore`, только `.env.example` в git |
| Секреты в логах | Никогда не логировать SECRET |

**Два разных секрета:** `MINDLOOM_WEBHOOK_SECRET` (для GPT) и `ADMIN_PASSWORD` (для команды).

---

## 11. Что можно сделать без доступов

Пока нет SSH-доступа к серверу и GPT Builder:

- Финальный план (этот документ)
- Полный рабочий **локальный MVP** (Next.js, SQLite, все endpoints)
- Локальная public report page
- Локальная admin page
- Локальная SQLite база
- Стандартный Mindloom prompt для ручного workflow
- OpenAPI schema (`openapi.yaml`)
- Mock JSON для тестов
- Все curl / Postman тесты (acceptance criteria)
- PM2 конфиг и Nginx конфиг (шаблоны)
- `.env.example` с перечнем переменных

---

## 12. Что нельзя сделать без доступов

- Развернуть боевую версию на их сервере
- Безопасно настроить nginx и HTTPS без аудита существующей конфигурации
- Подключить GPT Action без публичного HTTPS endpoint
- Проверить реальный запрос из Mindloom без доступа к GPT Builder
- Финально проверить production flow end-to-end
- Осмотреть занятые порты и реальную конфигурацию сервера
- Настроить боевые env / secrets

---

## 13. Deployment Plan (после согласования)

### Принципы
- Только после успешной локальной проверки
- Сначала только аудит — ничего не менять
- n8n и существующие сервисы не трогать
- Новый сервис: `/opt/mindloom-receiver`, порт 3100
- Nginx: только новый server block, всегда `nginx -t` перед reload
- Секреты: только в `.env.local` на сервере, не в git

### Шаг 1: Аудит сервера (READ-ONLY)

```bash
systemctl list-units --type=service --state=running
ps aux | grep -E 'node|nginx|docker|n8n|pm2'
ss -tlnp
docker ps 2>/dev/null
ls /etc/nginx/sites-enabled/
node --version
df -h
```

### Шаг 2: Деплой

```bash
mkdir -p /opt/mindloom-receiver/data
cd /opt/mindloom-receiver
git clone <repo_url> .
npm ci && npm run build
```

### Шаг 3: .env.local на сервере (вручную, не из git)

```
PORT=3100
MINDLOOM_WEBHOOK_SECRET=<openssl rand -base64 32>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<openssl rand -base64 16>
DATABASE_PATH=/opt/mindloom-receiver/data/mindloom.db
BASE_URL=http://147.45.166.199:3100
NODE_ENV=production
```

### Шаг 4: PM2

```bash
pm2 start ecosystem.config.js && pm2 save && pm2 startup
```

### Шаг 5: Nginx (только после получения домена)

```nginx
server {
    listen 80;
    server_name receiver.mindloom.app;
    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
nginx -t && nginx -s reload
certbot --nginx -d receiver.mindloom.app
```

### Шаг 6: Проверка существующих сервисов

```bash
ps aux | grep n8n
```

---

## 14. Testing Plan

### Локально: `npm run dev` → `localhost:3000`

```bash
# Test 1 — Успешная отправка
curl -s -X POST http://localhost:3000/api/mindloom/reports \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{"report":{"title":"Тест","summary":"Работает"}}' | jq
# Ожидаем: 201, { "ok": true, "report_url": "..." }

# Test 2 — Неверный токен → 401
curl -s -X POST http://localhost:3000/api/mindloom/reports \
  -H "Authorization: Bearer WRONG" -d '{}' | jq

# Test 3 — Невалидный JSON → 400
curl -s -X POST http://localhost:3000/api/mindloom/reports \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d 'not-json' | jq

# Test 4 — Публичная страница
curl -s http://localhost:3000/r/<token>

# Test 5 — Несуществующий токен → 404
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/r/faketoken

# Test 6 — Admin с паролем → 200
curl -s -u admin:$ADMIN_PASS http://localhost:3000/admin/reports

# Test 7 — Admin без пароля → 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/reports

# Test 8 — Health check
curl -s http://localhost:3000/api/health | jq

# Test 9 — Произвольный JSON → 201
curl -s -X POST http://localhost:3000/api/mindloom/reports \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{"anything":"goes"}' | jq
```

---

## 15. Acceptance Criteria

- [ ] `POST /api/mindloom/reports` с правильным Bearer → 201 + `report_url`
- [ ] raw JSON сохранён в БД без изменений
- [ ] `GET /r/:token` открывается без авторизации и показывает данные
- [ ] `GET /r/несуществующий` → 404 (не 500)
- [ ] Неверный Bearer → 401 **JSON** (не HTML)
- [ ] Невалидный JSON body → 400 **JSON**
- [ ] Внутренняя ошибка → 500 **JSON**
- [ ] `/admin/reports` защищена Basic Auth, показывает список
- [ ] `/admin/reports/:id` показывает raw JSON и ссылку
- [ ] `/api/health` → 200 + проверяет БД
- [ ] `/openapi.yaml` доступен как статика
- [ ] Произвольный JSON принимается и сохраняется

*Критерии для сервера добавляются после согласования деплоя.*

---

## 16. Still Open Questions

1. **Production площадка:** их сервер 147.45.166.199 / временный тестовый сервер / Vercel + Postgres как промежуточный вариант?
2. **Домен / subdomain:** какой именно использовать для HTTPS endpoint?
3. **DNS-доступ:** кто имеет доступ к DNS и сможет прописать A-запись?
4. **GPT Builder:** кто имеет доступ и будет добавлять Action в Custom GPT?
5. **Режим работы Mindloom на первом этапе:** автоматический GPT Action или ручное копирование JSON?
6. **Финальный JSON формат:** есть ли у Mindloom / команды конкретные пожелания?
7. **Хранить транскрипт?** Только итоговый analysis JSON или диалог тоже?
8. **Защита публичной страницы:** без пароля, только длинная ссылка — это финальное решение?
9. **Disclaimer на странице отчёта:** нужен ли? Рекомендация — добавить сразу.
10. **База данных:** SQLite точно ок или команда хочет Postgres с самого начала?
11. **Кто проведёт первый end-to-end тест** из Mindloom после деплоя?

---

## 17. Что нужно от команды для старта деплоя

1. Подтверждение сервера: 147.45.166.199 или другой?
2. SSH-доступ к серверу
3. Информация о сервере: что запущено, что нельзя трогать
4. Домен или поддомен для endpoint
5. DNS-доступ (для A-записи)
6. Решение по базе: SQLite / Postgres
7. Способ безопасной передачи Webhook secret (не открытым текстом)
8. Доступ к GPT Builder

---

## 18. Альтернативные варианты

### A. Next.js + SQLite на нашем сервере ← Рекомендуется
Один процесс, минимум зависимостей, не конфликтует с n8n. Легко расширить.

### B. Next.js + Postgres на нашем сервере
Надёжнее при масштабировании. Если Postgres уже есть — не нужно устанавливать отдельно.

### C. Временный прототип на Vercel / Render
Плюс: HTTPS из коробки, GPT Action без SSH-доступа.
Минус: данные не у нас, SQLite не поддерживается, потом переносить.
**Только как промежуточный шаг** на время ожидания доступов.

### D. Webhook через существующий n8n
Высокий риск сломать воркфлоу, нет контроля над кодом. **Не рекомендуется.**

---

## 19. Этап 2 и далее

| Функция | Этап |
|---|---|
| Красивый визуал страницы отчёта | 2 |
| Нормализация JSON → структурированный отчёт | 2 |
| Rate limiting на API | 2 |
| Email / Telegram уведомление при новом отчёте | 2 |
| Автоматический GPT Action (вместо ручного workflow) | 2 |
| Swap SQLite → Postgres | По мере роста |
| Личный кабинет участника | 3 |
| История отчётов, дневник, динамика | 3 |
| Telegram-бот | 3 |
| Zoom / Whisper интеграция | 4 |
| Paywall / коммерческая воронка | 4 |
