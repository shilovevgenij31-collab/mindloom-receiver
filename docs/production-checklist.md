# Чеклист деплоя Mindloom Receiver

---

## Перед деплоем (локально)

- [ ] `npm run typecheck` — 0 ошибок TypeScript
- [ ] `npm run build` — сборка успешна, 11 маршрутов
- [ ] Локальный UI smoke test:
  - [ ] http://localhost:3001 открывается
  - [ ] http://localhost:3001/admin/intake открывается (Basic Auth)
  - [ ] http://localhost:3001/admin/reports открывается
  - [ ] `npm run submit:intake` → заявка появляется в /admin/intake
  - [ ] `npm run submit:sample` → report_url открывается
- [ ] Нет новых секретов или `.env` значений в git

---

## Деплой на сервер

### 1. Бэкап перед обновлением (на сервере)

```bash
cp -r /opt/mindloom-receiver /opt/mindloom-receiver-backups/$(date +%Y%m%d_%H%M%S)
```

### 2. Обновить код (с локальной машины, PowerShell)

```powershell
scp -r "C:\Users\andre\Desktop\mindloom\*" root@147.45.166.199:/opt/mindloom-receiver/
```

Или через git (если настроен репозиторий):

```bash
cd /opt/mindloom-receiver
git pull
```

### 3. Пересобрать и перезапустить только mindloom-receiver

```bash
cd /opt/mindloom-receiver
docker compose -f docker-compose.production.yml up -d --build mindloom-receiver
```

**Важно:** эта команда пересобирает и перезапускает только `mindloom-receiver`.  
n8n, Traefik и другие контейнеры **не затрагиваются**.

---

## После деплоя — проверки

### Базовые проверки

```bash
# Контейнер запущен
docker ps | grep mindloom
# Ожидаем: mindloom-receiver  Up N seconds

# Логи без ошибок
docker logs mindloom-receiver --tail 30

# n8n и Traefik живы
docker ps | grep n8n
```

### Smoke test через браузер

- [ ] https://mindloom.edagency.ru/ открывается
- [ ] https://mindloom.edagency.ru/admin открывается (Basic Auth)
- [ ] https://mindloom.edagency.ru/admin/intake — список заявок
- [ ] https://mindloom.edagency.ru/admin/reports — список отчётов
- [ ] https://mindloom.edagency.ru/api/health → `{"ok":true,"db":"ok",...}`

### Функциональный тест

```powershell
# Установить production SECRET
$env:MINDLOOM_WEBHOOK_SECRET = "<секрет с сервера>"
$env:RECEIVER_URL = "https://mindloom.edagency.ru"

# Отправить тестовый отчёт
npm run submit:sample
```

Открыть `report_url` из вывода — убедиться, что страница отчёта отображается корректно.

### Проверить GPT Action

1. Открыть Custom GPT в ChatGPT
2. Отправить тестовое сообщение
3. Убедиться, что заявка появилась в https://mindloom.edagency.ru/admin/intake

---

## Rollback

Если что-то пошло не так:

```bash
# Остановить только mindloom-receiver
cd /opt/mindloom-receiver
docker compose -f docker-compose.production.yml down

# Восстановить из бэкапа
ls /opt/mindloom-receiver-backups/
cp -r /opt/mindloom-receiver-backups/<нужная_дата> /opt/mindloom-receiver-restore

# Запустить восстановленную версию
cd /opt/mindloom-receiver-restore
docker compose -f docker-compose.production.yml up -d
```

**n8n, ultra-cp и Traefik продолжают работать — они полностью изолированы.**

---

## Что НЕЛЬЗЯ делать при деплое

- Трогать контейнеры `n8n-n8n-1`, `n8n-traefik-1`, `ultra-cp` и любые другие
- Изменять существующие `docker-compose.yml` других сервисов
- Копировать `.env.local` на сервер (там неправильный BASE_URL и другие секреты)
- Хранить `MINDLOOM_WEBHOOK_SECRET` или `ADMIN_PASSWORD` в git
