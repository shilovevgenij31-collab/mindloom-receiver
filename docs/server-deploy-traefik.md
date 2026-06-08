# Server Deploy — Mindloom Receiver via Docker + Traefik

Сервер: 147.45.166.199  
Домен: mindloom.edagency.ru  
Стек: Docker + Traefik (сеть n8n_default)

---

## Принципы

- n8n, ultra-cp, Traefik — не трогать
- Mindloom Receiver — отдельный контейнер в той же Traefik-сети
- Существующие docker-compose файлы не изменяем
- Секреты только в .env.production на сервере, не в git

---

## Шаг 0 — Проверить DNS перед деплоем

```bash
nslookup mindloom.edagency.ru
# Ожидаем: Address: 147.45.166.199
```

Если DNS ещё не применился — ждём. Деплоить без корректного DNS смысла нет: Traefik не сможет получить TLS-сертификат.

---

## Шаг 0.5 — Опциональная локальная проверка Docker build

Если Docker установлен локально (Windows Desktop / WSL) — можно проверить сборку до деплоя:

```bash
docker build -t mindloom-receiver:test .
```

Успешный вывод заканчивается строкой вида:
```
=> exporting to image
=> => naming to docker.io/library/mindloom-receiver:test
```

**Если Docker локально недоступен — этот шаг пропускаем.** Сборка на сервере обязательна и произойдёт в Шаге 4.

После проверки образ можно удалить:
```bash
docker rmi mindloom-receiver:test
```

---

## Шаг 1 — Создать папку на сервере

```bash
mkdir -p /opt/mindloom-receiver/data
```

---

## Шаг 2 — Доставить код на сервер

**Вариант A — через git (если есть репозиторий):**
```bash
cd /opt/mindloom-receiver
git clone <repo_url> .
```

**Вариант B — через scp с локальной машины (PowerShell):**
```powershell
scp -r "C:\Users\andre\Desktop\mindloom\*" root@147.45.166.199:/opt/mindloom-receiver/
```

После копирования убедиться, что файлы на месте:
```bash
ls /opt/mindloom-receiver/
# Должны быть: Dockerfile, docker-compose.production.yml, package.json, app/, lib/, public/, ...
```

---

## Шаг 3 — Создать .env.production на сервере

**ВАЖНО: .env.production создаётся вручную на сервере.**  
Локальные файлы `.env.local`, `.env` и другие — не копировать на сервер.  
Они содержат локальные секреты и неправильный BASE_URL.

Генерируем секреты прямо на сервере:
```bash
echo "MINDLOOM_WEBHOOK_SECRET=$(openssl rand -base64 32)"
echo "ADMIN_PASSWORD=$(openssl rand -base64 16)"
```

Записываем файл:
```bash
nano /opt/mindloom-receiver/.env.production
```

Содержимое (подставить сгенерированные значения):
```
MINDLOOM_WEBHOOK_SECRET=<сгенерированный выше>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<сгенерированный выше>
DATABASE_PATH=/app/data/mindloom.db
BASE_URL=https://mindloom.edagency.ru
PORT=3000
NODE_ENV=production
```

**Сохрани MINDLOOM_WEBHOOK_SECRET в надёжном месте** — он нужен для GPT Action и тестов.

Проверить, что файл создан:
```bash
ls -la /opt/mindloom-receiver/.env.production
```

---

## Шаг 4 — Собрать Docker образ

```bash
cd /opt/mindloom-receiver
docker compose -f docker-compose.production.yml build
```

Сборка займёт 3–7 минут: скачивается образ node:20-alpine, компилируется better-sqlite3, собирается Next.js. Следим за выводом — ошибок быть не должно.

Успешное завершение:
```
=> [runner] DONE
```

---

## Шаг 5 — Запустить контейнер

```bash
docker compose -f docker-compose.production.yml up -d
```

Убедиться, что контейнер запустился:
```bash
docker ps | grep mindloom
# Ожидаем: mindloom-receiver   ...   Up N seconds
```

Смотрим логи:
```bash
docker logs mindloom-receiver --tail 50
# Ожидаем строку: ▲ Next.js ready on http://:::3000
```

---

## Шаг 6 — Проверки после деплоя

### 6.1 Health check

```bash
# Напрямую в контейнер (минуя Traefik)
docker exec mindloom-receiver wget -qO- http://localhost:3000/api/health

# Через Traefik + HTTPS (боевой путь)
curl -s https://mindloom.edagency.ru/api/health
# Ожидаем: {"ok":true,"db":"ok","timestamp":"..."}
```

### 6.2 OpenAPI schema доступна

```bash
curl -s -o /dev/null -w "%{http_code}" https://mindloom.edagency.ru/openapi.yaml
# Ожидаем: 200
```

### 6.3 POST — отправка тестового отчёта

```bash
SECRET="<MINDLOOM_WEBHOOK_SECRET из .env.production>"

curl -s -X POST https://mindloom.edagency.ru/api/mindloom/reports \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "participant": {"name": "Тест"},
    "report": {"title": "Проверка деплоя", "summary": "Работает на проде.", "blocks": [], "markers": [], "layers": []},
    "meta": {"schema_version": "1.0"}
  }' | jq
# Ожидаем: {"ok":true,"report_id":"...","report_url":"https://mindloom.edagency.ru/r/..."}
```

### 6.4 Публичная страница отчёта

Открыть `report_url` из предыдущего шага в браузере.

### 6.5 Admin UI

Открыть в браузере: `https://mindloom.edagency.ru/admin/reports`  
Ввести: ADMIN_USERNAME / ADMIN_PASSWORD из `.env.production`.

### 6.6 Неправильный Bearer → 401

```bash
curl -s -X POST https://mindloom.edagency.ru/api/mindloom/reports \
  -H "Authorization: Bearer WRONG" \
  -H "Content-Type: application/json" \
  -d '{}' | jq
# Ожидаем: {"ok":false,"error":"Unauthorized"}
```

### 6.7 n8n продолжает работать

```bash
docker ps | grep n8n
# n8n-n8n-1 и n8n-traefik-1 должны быть Up
```

---

## Rollback

Если что-то пошло не так — останавливаем только наш контейнер:

```bash
cd /opt/mindloom-receiver
docker compose -f docker-compose.production.yml down
```

n8n, ultra-cp и Traefik продолжают работать — они полностью изолированы от нашего сервиса.

---

## После успешного деплоя — подключение GPT Action

1. Открыть Mindloom GPT Builder → Actions → Add Action
2. Schema URL: `https://mindloom.edagency.ru/openapi.yaml`
3. Authentication: Bearer token → значение `MINDLOOM_WEBHOOK_SECRET`
4. Протестировать action с примером JSON прямо в GPT Builder
5. Проверить, что новый отчёт появился в `/admin/reports`
