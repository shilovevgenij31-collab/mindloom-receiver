# Mindloom Receiver

Технический backend-приёмник для Mindloom GPT — принимает материалы сессий, организует создание отчётов и публикует их по уникальным публичным ссылкам.

**Production:** https://mindloom.edagency.ru

**Стек:** Next.js 14 · TypeScript · SQLite (better-sqlite3) · Docker + Traefik

---

## Текущее состояние

Production MVP работает end-to-end.

Текущая целевая структура нового отчёта: **Mindloom Report v2** (Patch 4A — extended schema).

- `meta.schema_version: "2.0"` — целевой формат для ручного workflow через `/admin/intake/:id`
- schema v1 остаётся как legacy/backward compatibility
- отчёт v2 — нейропсихологическая аналитическая карта: глубокая и точная, но понятная без психологического образования
- новые смысловые блоки: `snapshot`, `how_to_read`, `phrase_microscope`, `honest_translation`, `protected_need`
- расширены `heatmap` (scale, callouts, why_it_matters) и `node_graph` (legend, how_to_read, edge types)
- отдельного блока `protocol` в v2 нет: практики и "что делать" живут в `recommended_practices`
- diary/session/upload-session/client-account functionality в продукт пока не входит

**Основной workflow (Custom GPT):**

```
Custom GPT
  → GPT Action submitMindloomIntake
  → /api/mindloom/intake
  → /admin/intake — оператор видит заявку
  → оператор копирует промпт для Mindloom
  → вставляет в Mindloom GPT
  → Mindloom GPT возвращает JSON
  → оператор вставляет JSON в /admin/intake/:id → Создать отчёт
  → создаётся report_url
  → участник открывает публичный отчёт /r/:token
```

**Прямой flow (legacy):**

```
Mindloom JSON
  → /api/mindloom/reports
  → report_url
```

---

## Основные URL

| Путь | Описание |
|---|---|
| `/` | Корневая страница с навигацией |
| `/admin` | Дашборд оператора |
| `/admin/intake` | Список входящих заявок (Basic Auth) |
| `/admin/intake/:id` | Детальная страница заявки + создание отчёта |
| `/admin/reports` | Список отчётов (Basic Auth) |
| `/admin/reports/:id` | Детальная страница отчёта |
| `/r/:token` | Публичная страница отчёта (без авторизации) |
| `/api/mindloom/intake` | Принять входящую заявку (Custom GPT Action) |
| `/api/mindloom/reports` | Принять готовый JSON-отчёт напрямую (legacy) |
| `/api/health` | Health check |
| `/openapi-intake.yaml` | OpenAPI schema для GPT Action (intake) |
| `/openapi.yaml` | OpenAPI schema (прямая отправка отчётов) |

`/admin/*` и `/api/admin/*` → HTTP Basic Auth (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).  
`/api/mindloom/*` → Bearer token (`MINDLOOM_WEBHOOK_SECRET`).

---

## Переменные окружения

| Переменная | Назначение |
|---|---|
| `MINDLOOM_WEBHOOK_SECRET` | Bearer token для `/api/mindloom/*` |
| `ADMIN_USERNAME` | Логин для HTTP Basic Auth |
| `ADMIN_PASSWORD` | Пароль для HTTP Basic Auth |
| `BASE_URL` | Публичный URL сервиса (используется при формировании report_url) |
| `RECEIVER_URL` | URL получателя для тестовых скриптов (`submit:intake`, `submit:sample`) |
| `DATABASE_PATH` | Путь к SQLite-файлу (production: `/app/data/mindloom.db`) |
| `NODE_ENV` | `production` или `development` |

---

## Локальный запуск

### 1. Установить зависимости

```bash
npm install
```

### 2. Создать `.env.local`

```bash
cp .env.example .env.local
```

Заполнить значения в `.env.local`:

```env
MINDLOOM_WEBHOOK_SECRET=любой-длинный-секрет
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ваш-пароль
DATABASE_PATH=./data/mindloom.db
BASE_URL=http://localhost:3001
```

### 3. Запустить локально

```bash
npm run dev -- -p 3001
```

Сервер: http://localhost:3001

---

## Локальное тестирование

```powershell
# Установить переменные (PowerShell)
$env:MINDLOOM_WEBHOOK_SECRET = "ваш-MINDLOOM_WEBHOOK_SECRET"
$env:RECEIVER_URL = "http://localhost:3001"

# Отправить тестовую заявку → /api/mindloom/intake → появится в /admin/intake
npm run submit:intake

# Отправить тестовый отчёт напрямую → /api/mindloom/reports → получить report_url
npm run submit:sample
```

Полная инструкция: [docs/testing.md](docs/testing.md)

---

## Typecheck и сборка

```bash
npx tsc --noEmit
npm run build
```

---

## Production deploy

Сервис задеплоен на `https://mindloom.edagency.ru` через Docker + Traefik.

- Инструкция по деплою: [docs/server-deploy-traefik.md](docs/server-deploy-traefik.md)
- Чеклист перед/после деплоя: [docs/production-checklist.md](docs/production-checklist.md)
- Настройка GPT Action: [docs/gpt-action-handoff.md](docs/gpt-action-handoff.md)

**На сервере:**
- Не трогать n8n, Traefik и другие контейнеры.
- При обновлении — пересобирать только `mindloom-receiver`.
- `.env.production` создаётся вручную на сервере, в git не хранится.

---

## Документация

| Файл | Содержание |
|---|---|
| [docs/operator-workflow.md](docs/operator-workflow.md) | Пошаговая инструкция для оператора (русский) |
| [docs/json-schema-v1.md](docs/json-schema-v1.md) | Описание JSON-схемы отчёта Mindloom v1 |
| [docs/json-schema-v2.md](docs/json-schema-v2.md) | Описание целевой JSON-схемы Mindloom Report v2 |
| [docs/testing.md](docs/testing.md) | Тестирование: local, intake, production smoke |
| [docs/production-checklist.md](docs/production-checklist.md) | Чеклист перед и после деплоя |
| [docs/gpt-action-handoff.md](docs/gpt-action-handoff.md) | Инструкция по подключению GPT Action |
| [docs/mindloom-manual-prompt.md](docs/mindloom-manual-prompt.md) | Промпт для ручного workflow с Mindloom GPT |
| [docs/server-deploy-traefik.md](docs/server-deploy-traefik.md) | Деплой через Docker + Traefik |

---

## Что не включено в текущий MVP

- Оплата и подписки
- Личный кабинет участника
- Telegram-бот
- Автоматическая отправка из Mindloom GPT (сейчас ручной workflow оператора)
- Медицинская диагностика или клинические рекомендации
- Хранение и воспроизведение аудио/видео
- Zoom-интеграция, Whisper-транскрибация
