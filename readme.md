# 全端 Web + Docker

基於 **Nuxt 4** 與 **CodeIgniter 4** 的前後端分離專案，以 Docker 容器化部署 API 與資料庫；前台與後台建議本機執行 Nuxt 開發伺服器。

## 目錄

- [Quick Link](#quick-link)
- [快速開始](#快速開始)
- [常用命令](#常用命令)
- [更多資訊](#更多資訊)

## Quick Link

[admin](/admin/)
[frontend](/frontend/)
[frontend main css](/frontend/app/assets/css/main.css)
[Controllers](/api/app/Controllers/)
[Models](/api/app/Models/)
[Routes](/api/app/Config/Routes.php)
[Filters](/api/app/Config/Filters.php)
[mysql init](/docker/mysql/init/)
[test-db-connection](http://localhost:8092/test-db-connection)
[test-db-connection2](http://localhost:8092/test-db-connection2)
[test-cors](http://localhost:8092/test-cors)
[test-jwt](http://localhost:8092/test-jwt)
[test-login (POST)](http://localhost:8092/test-login)

## 快速開始

### 前置需求

- **Docker Desktop**（Windows / Mac）或 **Docker Engine**（Linux）：Docker 20.10+、Docker Compose v2.0+
- **Git**
- Windows 需 **WSL 2**；啟用與驗證步驟見 [DOCS.md — 故障排除](DOCS.md#故障排除)

### 安裝步驟

1. 複製環境變數：`Copy-Item env.example .env`（PowerShell）或 `cp env.example .env`（Mac / Linux）
2. 編輯 `.env`，至少修改 `MYSQL_ROOT_PASSWORD`、`MYSQL_PASSWORD`、`MYSQL_DATABASE`
3. 確認 Docker 已啟動：`docker version`、`docker compose version`
4. 啟動後端與資料庫：`docker compose up -d`（預設 API、MySQL、phpMyAdmin）
5. 首次啟動後初始化資料庫（`docker/mysql/init/` 或 phpMyAdmin 匯入 SQL）
6. 本機開發前台／後台（推薦）：

   ```bash
   cd admin && pnpm install && pnpm dev
   cd frontend && pnpm install && pnpm dev
   ```

### 預設服務位址

| 服務 | 網址 | 備註 |
| --- | --- | --- |
| 後端 API | http://localhost:8092 | 預設隨 compose 啟動 |
| phpMyAdmin | http://localhost:8093 | 預設隨 compose 啟動 |
| 管理後台 | http://localhost:8091 | 本機 `pnpm dev` 或 `--profile nuxt` |
| 前台 | http://localhost:8090 | 本機 `pnpm dev` 或 `--profile nuxt` |

若要前台、後台一併以容器啟動：`docker compose --profile nuxt up -d`

完整安裝說明、環境變數、資料庫更名與靜態產生等細節見 [DOCS.md — Docker 使用指南](DOCS.md#-docker-使用指南)。

## 常用命令

```bash
docker compose up -d
docker compose --profile nuxt up -d
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

更多命令（備份、重建、進入容器等）見 [DOCS.md — 常用命令](DOCS.md#常用命令-1)。

## 更多資訊

- [完整文件](DOCS.md)
- [故障排除](DOCS.md#故障排除)
- [Docker FAQ](docs/docker/docker-faq.md)

---

**最後更新**：2026-05-12
