# Production Deploy Runbook — Mindloom Receiver

**Server:** 147.45.166.199  
**Domain:** https://mindloom.edagency.ru  
**Production path:** /opt/mindloom-receiver  
**Container:** mindloom-receiver  
**Compose file:** docker-compose.production.yml

---

## ⚠️ Critical Rules Before You Start

1. **NEVER paste server SSH output into Windows PowerShell.** Lines like `root@147.45.166.199`, `=>`, `✔`, `docker`, `HTTP/2` will be interpreted as PowerShell commands and produce errors. Server commands run inside SSH, local commands run in PowerShell — they are separate shells.

2. **Each command below is labelled with where it runs:**
   - `[LOCAL]` = Windows PowerShell on your machine
   - `[SERVER]` = inside SSH session on 147.45.166.199

3. **NEVER use `docker compose up -d` without `--force-recreate` for a deploy.** Without this flag, a running container is NOT recreated — it just stays up with the old image.

4. **scp is an emergency fallback only**, not a normal deploy method. Normal deploys use `git pull`.

---

## TL;DR — Canonical Commands

### Normal deploy (run on server via SSH)

```bash
# [SERVER]
cd /opt/mindloom-receiver
git fetch origin
git status                          # must be clean, no local changes
git pull --ff-only
docker compose -f docker-compose.production.yml build --pull
docker compose -f docker-compose.production.yml up -d --force-recreate
docker ps | grep mindloom           # must show: Up N seconds (not "Up N days")
docker logs mindloom-receiver --tail 20
curl -s http://localhost:3000/api/health
```

Expected output of last line:
```json
{"ok":true,"db":"ok","timestamp":"..."}
```

### Post-deploy QA (run locally in PowerShell)

```powershell
# [LOCAL] — Windows PowerShell
$env:RECEIVER_URL = "https://mindloom.edagency.ru"
$env:MINDLOOM_WEBHOOK_SECRET = "<MINDLOOM_WEBHOOK_SECRET from server .env.production>"
npm run submit:v2
```

Open the `report_url` from the output in a browser. You must see the V2 dashboard with Speech Cloud, Heatmap, and Node Graph sections.

---

## Part 1 — Root Cause: What Went Wrong

### Q1–Q3: Why scp was needed and why git wasn't used

The original `server-deploy-traefik.md` documented two options for the initial code delivery: "Вариант A — через git" and "Вариант B — через scp". Since there was no GitHub repo set up at the time of the first deployment, Variant B (scp) was used. This created `/opt/mindloom-receiver` as a **plain directory, not a git repository** — so `git pull` was never available on the server.

Every subsequent deploy required another `scp -r`, which:
- Could miss files if the glob or path was wrong
- Copied everything including files that shouldn't change (node_modules if present, .next, etc.)
- Had no integrity check — no way to verify the server had the exact same code as GitHub

### Q9: Why Docker build context was 6.22kB, then 1.47MB

The Docker build context is everything in the directory that matches the Dockerfile's `COPY . .` instruction (minus `.dockerignore`).

- **6.22kB context** = the directory had almost nothing. Only a few config files (Dockerfile, docker-compose.yml, package.json) — the actual source code (`app/`, `lib/`, `public/`, `scripts/`) was missing or had been partially deleted. Docker ran `COPY . .` with near-empty source, then `RUN npm run build` — which either failed or used a **cached layer** from a previous successful build (Docker caches each layer; if `COPY . .` content hash didn't change from the last run, it reuses the old layer).

- **1.47MB context** = after `scp -r` delivered the full project, Docker picked up all source files. The correct image was built.

### Q10: Why the container was "Up 3 days"

`docker compose up -d` **without `--force-recreate`** does NOT recreate a running container. It only starts stopped containers. If the container is already running, the command exits silently and the container continues with the old image.

Timeline:
1. Original scp → full build → container started → OK
2. Patches accumulated on local machine
3. Someone ran `docker compose up -d` (or even `docker compose up -d --build`) → container was running → not recreated → still showing old code
4. The `--build` flag does rebuild the image, but the container is only replaced if it's detected as changed AND `--force-recreate` is set. Without `--force-recreate`, even a new image doesn't guarantee the container restarts.
5. Result: container appeared "Up 3 days" while the server was actually running stale code.

### Q11: How to guarantee the container is recreated after every deploy

Always use `--force-recreate`:

```bash
# [SERVER]
docker compose -f docker-compose.production.yml up -d --force-recreate
```

This stops the current container and starts a new one from the freshly built image regardless of whether it was running before.

### Why the old token showed legacy layout (not a bug)

The token `vezHc2ecQm9xdjzB5IkEax5Kkf86Qp_d` is a database row from 2026-05-19 with `raw_payload_json` containing `meta.schema_version: "1.0"`. The report page router (`app/r/[publicToken]/page.tsx`) checks:

```ts
const usesV2Dashboard = isMindloomReportV2(payload) && !!v2 && hasV2Content;
// isMindloomReportV2 returns true only when meta.schema_version === '2.0'
```

A row from before V2 was shipped will always render using the legacy `ReportStructured` component — this is **correct and expected behavior**. It does NOT mean V2 dashboard is broken. To verify V2 dashboard, you need a fresh report created after the deploy (see Part 6).

---

## Part 2 — Server State Audit

Run these commands via SSH to understand the current state of the server:

```bash
# [SERVER] — run all of these
cd /opt/mindloom-receiver
pwd
ls -lah
git status 2>/dev/null || echo "NOT A GIT REPO"
git remote -v 2>/dev/null || echo "no remote"
git branch --show-current 2>/dev/null || echo "no branch"
git log --oneline -5 2>/dev/null || echo "no git log"
git rev-parse HEAD 2>/dev/null || echo "no HEAD"
git diff --stat 2>/dev/null || echo "no diff"

cat docker-compose.production.yml
cat Dockerfile
cat .dockerignore
ls -lah data/

docker ps | grep mindloom
docker image ls | grep mindloom
```

### How to interpret results

| Result | Meaning | Next action |
|---|---|---|
| `git status` → NOT A GIT REPO | Directory created via scp, no git | Follow "Restore git-based deploy" in Part 3 |
| `git status` → clean | Git initialized, no local changes | Normal deploy works, use Part 4 |
| `git status` → modified files | Local changes on server | STOP — investigate before pulling |
| `git log` shows recent commits | Server has up-to-date git history | Check if HEAD matches GitHub |
| Container `Up N seconds` | Freshly recreated | Good — last deploy used --force-recreate |
| Container `Up N days` | NOT recreated on last deploy | Use --force-recreate on next deploy |
| Build context 1.47MB+ | Full source in directory | Good |
| Build context < 100KB | Source files missing | Run scp fallback before deploy |

---

## Part 3 — Restore GitHub-Based Deploy

**Most likely scenario: `/opt/mindloom-receiver` is NOT a git repo.**

### Step 1 — Backup current directory (on server)

```bash
# [SERVER]
cp -r /opt/mindloom-receiver /opt/mindloom-receiver-backup-$(date +%Y%m%d_%H%M%S)
ls /opt/mindloom-receiver-backup-*
```

This preserves `.env.production` and `data/` before any changes.

### Step 2 — Clone into a new directory (on server)

```bash
# [SERVER]
cd /opt
git clone <YOUR_GITHUB_REPO_URL> mindloom-receiver-git
cd mindloom-receiver-git
ls  # verify: app/ lib/ public/ scripts/ Dockerfile docker-compose.production.yml
```

Replace `<YOUR_GITHUB_REPO_URL>` with your actual GitHub repo URL (e.g. `https://github.com/yourusername/mindloom-receiver.git`).

### Step 3 — Copy secrets and data from old directory

```bash
# [SERVER]
cp /opt/mindloom-receiver/.env.production /opt/mindloom-receiver-git/.env.production
cp -r /opt/mindloom-receiver/data /opt/mindloom-receiver-git/data
ls /opt/mindloom-receiver-git/data/  # verify: mindloom.db present
```

### Step 4 — Stop current container

```bash
# [SERVER]
cd /opt/mindloom-receiver
docker compose -f docker-compose.production.yml down
```

### Step 5 — Build and start from new directory

```bash
# [SERVER]
cd /opt/mindloom-receiver-git
docker compose -f docker-compose.production.yml build --pull
docker compose -f docker-compose.production.yml up -d --force-recreate
docker ps | grep mindloom
curl -s http://localhost:3000/api/health
```

### Step 6 — Verify, then switch the working directory

After confirming health + V2 dashboard works:

```bash
# [SERVER]
mv /opt/mindloom-receiver /opt/mindloom-receiver-scp-archive
mv /opt/mindloom-receiver-git /opt/mindloom-receiver
```

Or keep both — the container mounts `/opt/mindloom-receiver/data` as a volume, so as long as you point the compose file at the correct data path, either directory works.

### Step 7 — Verify git is set up correctly

```bash
# [SERVER]
cd /opt/mindloom-receiver
git status        # should show: nothing to commit, working tree clean
git remote -v     # should show your GitHub remote
git log --oneline -3
```

---

## Part 4 — Normal GitHub Deploy Flow

Use this every time after merging to your production branch:

```bash
# [SERVER] — full sequence with verification

cd /opt/mindloom-receiver

# 1. Verify current state
git status                          # must be clean
git log --oneline -3                # note the current HEAD
git rev-parse HEAD                  # save this hash for rollback reference

# 2. Pull latest from GitHub
git fetch origin
git pull --ff-only                  # safe: fails if local changes exist

# 3. Confirm update
git log --oneline -3                # HEAD should have changed

# 4. Build new image (--pull updates base images)
docker compose -f docker-compose.production.yml build --pull

# 5. Recreate container (ALWAYS use --force-recreate)
docker compose -f docker-compose.production.yml up -d --force-recreate

# 6. Verify container is fresh
docker ps | grep mindloom
# MUST show: mindloom-receiver ... Up N seconds
# NOT: Up N days (that means --force-recreate was not effective)

# 7. Check logs
docker logs mindloom-receiver --tail 20
# Look for: ▲ Next.js ready on http://:::3000

# 8. Health check
curl -s http://localhost:3000/api/health
# Expected: {"ok":true,"db":"ok","timestamp":"..."}
```

After the server side is done, run post-deploy QA from your local machine (see Part 6).

---

## Part 5 — Emergency Manual Deploy Fallback (scp)

**Use only when git is not available on the server or GitHub is unreachable.**

### Pre-flight (local)

```powershell
# [LOCAL] — Windows PowerShell
cd C:\Users\andre\Desktop\mindloom
npx tsc --noEmit    # must pass with 0 errors
npx next build      # must compile successfully
```

### Backup on server (before copying)

```bash
# [SERVER]
cp -r /opt/mindloom-receiver /opt/mindloom-receiver-backup-$(date +%Y%m%d_%H%M%S)
```

### Copy code to server

```powershell
# [LOCAL] — Windows PowerShell
# Copy all source files (exclude local env files)
scp -r "C:\Users\andre\Desktop\mindloom\app" root@147.45.166.199:/opt/mindloom-receiver/
scp -r "C:\Users\andre\Desktop\mindloom\lib" root@147.45.166.199:/opt/mindloom-receiver/
scp -r "C:\Users\andre\Desktop\mindloom\public" root@147.45.166.199:/opt/mindloom-receiver/
scp -r "C:\Users\andre\Desktop\mindloom\scripts" root@147.45.166.199:/opt/mindloom-receiver/
scp -r "C:\Users\andre\Desktop\mindloom\docs" root@147.45.166.199:/opt/mindloom-receiver/
scp "C:\Users\andre\Desktop\mindloom\Dockerfile" root@147.45.166.199:/opt/mindloom-receiver/
scp "C:\Users\andre\Desktop\mindloom\docker-compose.production.yml" root@147.45.166.199:/opt/mindloom-receiver/
scp "C:\Users\andre\Desktop\mindloom\package.json" root@147.45.166.199:/opt/mindloom-receiver/
scp "C:\Users\andre\Desktop\mindloom\package-lock.json" root@147.45.166.199:/opt/mindloom-receiver/
scp "C:\Users\andre\Desktop\mindloom\next.config.mjs" root@147.45.166.199:/opt/mindloom-receiver/
scp "C:\Users\andre\Desktop\mindloom\.dockerignore" root@147.45.166.199:/opt/mindloom-receiver/
scp "C:\Users\andre\Desktop\mindloom\tsconfig.json" root@147.45.166.199:/opt/mindloom-receiver/
```

**DO NOT copy:** `.env.local`, `.env`, `node_modules/`, `.next/`, `data/`

### Verify and build on server

```bash
# [SERVER]
cd /opt/mindloom-receiver
ls -lah app/ lib/ public/ Dockerfile package.json   # all must exist

# Build with --no-cache to avoid stale layers
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d --force-recreate
docker ps | grep mindloom
curl -s http://localhost:3000/api/health
```

---

## Part 6 — Post-Deploy Checks

Run these in order after every deploy.

### Check 1: Container is fresh

```bash
# [SERVER]
docker ps | grep mindloom
```

✓ Pass: `Up N seconds` or `Up N minutes`  
✗ Fail: `Up N hours` or `Up N days` → container was not recreated, redeploy with `--force-recreate`

### Check 2: Correct git commit on server

```bash
# [SERVER]
cd /opt/mindloom-receiver
git rev-parse HEAD
git log --oneline -1
```

Compare this hash with the latest commit on GitHub. They must match.

### Check 3: Docker image is new

```bash
# [SERVER]
docker image ls | grep mindloom
```

Note the `CREATED` timestamp — should be within the last few minutes.

### Check 4: Next.js started correctly

```bash
# [SERVER]
docker logs mindloom-receiver --tail 30
```

✓ Pass: `▲ Next.js ready on http://:::3000`  
✗ Fail: any error or stack trace → check logs fully with `docker logs mindloom-receiver`

### Check 5: Health endpoint

```bash
# [SERVER] — direct container check
curl -s http://localhost:3000/api/health

# [LOCAL] — through Traefik + HTTPS
curl -s https://mindloom.edagency.ru/api/health
```

✓ Pass: `{"ok":true,"db":"ok","timestamp":"..."}`  
✗ Fail: connection refused, 502, or `{"ok":false}` → check container logs

### Check 6: OpenAPI schema

```bash
# [LOCAL]
curl -s -o /dev/null -w "%{http_code}" https://mindloom.edagency.ru/openapi.yaml
```

✓ Pass: `200`

### Check 7: V2 Dashboard verification

```powershell
# [LOCAL] — Windows PowerShell
$env:RECEIVER_URL = "https://mindloom.edagency.ru"
$env:MINDLOOM_WEBHOOK_SECRET = "<MINDLOOM_WEBHOOK_SECRET from server .env.production>"
npm run submit:v2
```

This creates a fresh report with `meta.schema_version: "2.0"` and prints `report_url`. Open the URL in a browser.

✓ Pass (V2 dashboard active): page shows:
- Badge "Mindloom Report v2" in the header
- Section "Речевые маркеры паттерна" (Speech Cloud with central bubble + chips)
- Section "Тепловая карта" (Heatmap with visual zones)
- Section "Граф связей" (Node Graph)

✗ Fail: shows legacy `ReportStructured` layout (plain cards) → the API accepted the request but V2 rendering isn't activating → check the normalizer routing in `page.tsx`

### Check 8: n8n and Traefik still running

```bash
# [SERVER]
docker ps | grep n8n
# Must show: n8n-n8n-1 and n8n-traefik-1, both Up
```

---

## Part 7 — Understanding Report Layout Versions

This table explains what layout appears for different report types:

| `meta.schema_version` in DB row | Component rendered | Visual |
|---|---|---|
| `2.0` | `ReportV2Dashboard` | New V2 dashboard — Speech Cloud, Heatmap, Node Graph, all interactive |
| `mindloom_report_v2_fixed_blocks` | `ReportStructured` (fixed_blocks mode) | Card-based layout with 10 fixed blocks |
| `rich-v1` | `ReportStructured` (rich mode) | Cards with rich sub-sections |
| `1.0` | `ReportStructured` (v1 mode) | Simple blocks layout (legacy) |

**Key rule:** Old rows in the database will ALWAYS render in whatever layout they were created for. A deploy of new code does NOT change the rendering of existing reports — it only affects new reports created after the deploy.

The token `vezHc2ecQm9xdjzB5IkEax5Kkf86Qp_d` showing legacy layout after the deploy is **correct behavior**, not a bug.

To prove V2 dashboard is working: create a new report via `npm run submit:v2` and open its URL.

---

## Part 8 — V2 Demo Report Command

```powershell
# [LOCAL] — Windows PowerShell
# Against production:
$env:RECEIVER_URL = "https://mindloom.edagency.ru"
$env:MINDLOOM_WEBHOOK_SECRET = "<prod secret>"
npm run submit:v2

# Against local dev:
$env:RECEIVER_URL = "http://localhost:3001"
$env:MINDLOOM_WEBHOOK_SECRET = "mindloom-dev-secret-change-me"
npm run submit:v2
```

Script: `scripts/submit-v2-report.mjs`  
Fixture: `docs/examples/mindloom-v2-deploy-qa.json` (`schema_version: "2.0"`)  

The script prints the `report_url`. Open it to verify V2 dashboard.

---

## Part 9 — Rollback

If a deploy breaks production:

```bash
# [SERVER]
cd /opt/mindloom-receiver

# Option A: Roll back to previous git commit
git log --oneline -5                 # find the last good commit hash
git checkout <previous-good-hash>    # WARNING: detached HEAD state
docker compose -f docker-compose.production.yml build --pull
docker compose -f docker-compose.production.yml up -d --force-recreate

# Option B: If you have a backup directory
cd /opt/mindloom-receiver-backup-<date>
docker compose -f docker-compose.production.yml up -d --force-recreate

# Only mindloom-receiver is affected — n8n and Traefik stay running
```

---

## Part 10 — Pre-Deploy Checklist (local)

Run before pushing to GitHub:

```powershell
# [LOCAL] — Windows PowerShell
cd C:\Users\andre\Desktop\mindloom
npx tsc --noEmit     # 0 errors required
npx next build       # must compile successfully
npx next lint        # 0 errors/warnings required
```

---

## Part 11 — What NOT To Do

| Action | Why forbidden |
|---|---|
| Paste server SSH output into PowerShell | Lines like `root@...`, `=>`, `✔` are interpreted as commands |
| `docker compose up -d` without `--force-recreate` | Running container is not recreated — old code stays |
| scp as primary deploy method | Brittle — easy to miss files, no integrity check |
| `docker compose build` without `up` | Builds image but doesn't start anything |
| Copy `.env.local` to server | Contains wrong BASE_URL and local secrets |
| Touch n8n, traefik, or other containers | Isolate changes to mindloom-receiver only |
| Run `git reset --hard` or `git clean -fd` on server without backup | Destructive — backup first |

---

## Part 12 — Docker Context Size Guide

| Context size | Meaning |
|---|---|
| < 100KB | Source code missing — `app/`, `lib/`, `public/` not in directory |
| ~1-2MB | Correct — full source present, `.next/` and `node_modules/` excluded by `.dockerignore` |
| > 50MB | `.dockerignore` misconfigured or `node_modules/` included |

Check during build:
```
=> [internal] load build context
=> => transferring context: 1.47 MB   ← this is correct
```

If you see `6.22 kB` or similar — stop and check that all source files are present before continuing.

---

## Appendix — Key File Locations

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build: deps → builder → runner |
| `docker-compose.production.yml` | Compose config with Traefik labels and data volume |
| `.dockerignore` | Excludes: `node_modules`, `.next`, `data`, `.env*`, `.git` |
| `.env.production` | Server-only secrets — NOT in git |
| `data/mindloom.db` | SQLite database — persisted via Docker volume |
| `scripts/submit-v2-report.mjs` | V2 dashboard QA script |
| `docs/examples/mindloom-v2-deploy-qa.json` | V2 QA fixture (`schema_version: "2.0"`) |
