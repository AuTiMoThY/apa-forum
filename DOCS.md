# 專案完整文件

本文件為專案完整說明；快速入門與常用連結請見 [readme.md](readme.md)。

## 目錄

- [專案概述](#-專案概述)
  - [主要特色](#主要特色)
- [專案架構](#️-專案架構)
  - [技術棧](#技術棧)
  - [系統架構圖](#系統架構圖)
- [專案目錄結構](#-專案目錄結構)
- [功能概述](#-功能概述)
  - [核心功能](#核心功能)
- [開發指南](#-開發指南)
  - [本地開發](#本地開發推薦docker-跑-api--mysql--phpmyadmin本機跑-nuxt)
  - [環境變數配置](#環境變數配置)
- [部署方式](#-部署方式)
  - [生產環境部署](#生產環境部署)
  - [部署選項](#部署選項)
- [RBAC 權限系統](#-rbac-權限系統)
  - [相關檔案](#相關檔案)
  - [權限指令使用](#權限指令使用)
- [Docker 使用指南](#-docker-使用指南)
  - [前置需求](#前置需求)
  - [快速開始](#快速開始)
  - [詳細說明](#詳細說明)
  - [常用命令](#常用命令-1)
  - [故障排除](#故障排除)
    - [Docker Desktop 連接錯誤](#docker-desktop-連接錯誤)
    - [WSL 2 未啟用](#wsl-2-未啟用)
    - [8092 拒絕連線 / phpMyAdmin 無法連線 MySQL](#8092-拒絕連線--phpmyadmin-無法連線-mysql)
    - [其他常見問題](#其他常見問題)
  - [進階配置](#進階配置)
- [相關文件](#-相關文件)

---

## 📋 專案概述

這是一個基於 **Nuxt 4** 和 **CodeIgniter 4** 的全端 Web 應用專案，採用前後端分離架構，並使用 Docker 容器化部署。專案包含前端、後台和 RESTful API 後端服務。

### 主要特色

- 🚀 **現代化技術棧**：Nuxt 4、Vue 3、TypeScript、CodeIgniter 4
- 🐳 **Docker 容器化**：一鍵啟動完整開發環境
- 🔐 **完整的權限管理**：基於 RBAC（角色權限控制）的權限系統
- 📱 **響應式設計**：支援多種裝置和螢幕尺寸
- 🔒 **安全認證**：JWT Token 認證機制
- 📊 **豐富的業務模組**：新聞、案例、聯絡、進度追蹤等

---

## 🏗️ 專案架構

### 技術棧

#### 前端技術

- **框架**：Nuxt 4.2.1
- **語言**：TypeScript 5.9.3
- **UI 框架**：Vue 3.5.23、@nuxt/ui 4.2.1
- **樣式**：Tailwind CSS 4.0
- **套件管理**：pnpm 10.24.0
- **編輯器**：Monaco Editor、CodeMirror、Tiptap Editor

#### 後端技術

- **框架**：CodeIgniter 4
- **語言**：PHP 8.1+
- **認證**：Firebase JWT 7.0
- **套件管理**：Composer
- **網頁伺服器**：Apache（Docker 環境）

#### 資料庫

- **資料庫**：MySQL 8.0
- **字符集**：utf8mb4（支援完整 Unicode，包括 emoji）

#### 開發工具

- **容器化**：Docker、Docker Compose v2
- **資料庫管理**：phpMyAdmin（開發環境可選）

### 系統架構圖

```
┌─────────────────┐     ┌─────────────────┐
│      前端       │     │      後台       │
│  (Frontend)     │     │    (Admin)      │
│  Port: 8090     │     │  Port: 8091     │
│  Nuxt 4 + Vue 3 │     │  Nuxt 4 + Vue 3 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │    後端 API           │
         │   (CodeIgniter 4)     │
         │   Port: 8092          │
         │   PHP 8.1 + Apache    │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │    MySQL 資料庫       │
         │    Port: 3306         │
         │    MySQL 8.0          │
         └───────────────────────┘
```

---

## 📁 專案目錄結構

```
專案根目錄/
├── admin/                    # 後台（Nuxt 4）
│   ├── app/
│   │   ├── composables/      # 組合式函數（useRole, usePermission 等）
│   │   ├── components/        # Vue 元件
│   │   ├── layouts/          # 佈局模板
│   │   ├── pages/            # 頁面路由
│   │   ├── plugins/          # 插件（權限指令等）
│   │   └── types/            # TypeScript 類型定義
│   ├── public/               # 靜態資源
│   ├── nuxt.config.ts        # Nuxt 配置
│   └── package.json
│
├── frontend/                 # 前端（Nuxt 4）
│   ├── app/
│   │   ├── layouts/          # 佈局模板
│   │   ├── pages/            # 頁面路由
│   │   └── assets/           # 資源文件
│   ├── public/               # 靜態資源
│   ├── nuxt.config.ts        # Nuxt 配置
│   └── package.json
│
├── api/                      # 後端 API（CodeIgniter 4）
│   ├── app/
│   │   ├── Controllers/      # 控制器
│   │   │   ├── AuthController.php      # 認證控制器
│   │   │   ├── RoleController.php      # 角色管理
│   │   │   ├── PermissionController.php # 權限管理
│   │   │   ├── AppNewsController.php    # 新聞管理
│   │   │   ├── AppCaseController.php    # 案例管理
│   │   │   ├── AppContactController.php # 聯絡管理
│   │   │   └── ...
│   │   ├── Models/           # 資料模型
│   │   ├── Filters/          # 過濾器（認證、權限、速率限制）
│   │   ├── Libraries/        # 類別庫（JWT 服務等）
│   │   └── Config/           # 配置文件
│   ├── public/               # 公開目錄（網站根目錄）
│   │   └── uploads/          # 上傳檔案目錄
│   └── writable/             # 可寫入目錄（日誌、快取、Session）
│
├── docker/                   # Docker 相關配置
│   ├── frontend/             # 前端 Dockerfile
│   ├── admin/                # 管理後台 Dockerfile
│   ├── php/                  # PHP 後端 Dockerfile
│   └── mysql/                # MySQL 配置
│       ├── init/             # 初始化 SQL 腳本
│       └── my.cnf            # MySQL 配置文件
│
├── docs/                     # 專案文件
│   ├── docker/               # Docker 相關文件
│   ├── init/                 # 資料庫初始化文件
│   └── ...
│
├── compose.yaml              # Docker Compose 配置
├── env.example               # 環境變數範例
└── readme.md                 # 快速開始指南
```

---

## ✨ 功能概述

### 核心功能

#### 1. 使用者認證與授權

- **JWT Token 認證**：安全的 Token 基礎認證機制
- **RBAC 權限系統**：完整的角色權限控制系統
  - 角色管理（Role）
  - 權限管理（Permission）
  - 使用者角色關聯
  - 角色權限關聯
  - 使用者權限關聯
- **權限指令**：Vue 指令式權限控制（`v-permission`）

#### 2. 業務模組

- **新聞管理**（AppNews）：新聞發布與管理
- **案例管理**（AppCase）：案例展示與管理
- **案例訊息**（AppCaseMsg）：案例相關訊息
- **聯絡管理**（AppContact）：聯絡表單處理
- **進度追蹤**（AppProgress）：專案進度管理
- **關於我們**（AppAbout）：公司資訊管理

#### 3. 系統管理

- **管理員管理**：系統管理員帳號管理
- **模組管理**：系統模組配置
- **結構管理**：系統結構配置
- **文件管理**：文件上傳與管理

#### 4. 開發工具

- **速率限制**：API 請求速率限制保護
- **CORS 支援**：跨域資源共享配置
- **檔案上傳**：支援多種檔案格式上傳

---

## 🔧 開發指南

### 本地開發（推薦：Docker 跑 API + MySQL + phpMyAdmin，本機跑 Nuxt）

建議使用 `docker compose up -d` 啟動後端與資料庫後，在本機執行 admin／frontend 的 `pnpm dev`，以保留 Nuxt 4 auto-import 與較佳 HMR。

#### 前端開發

```bash
# 進入前端目錄
cd frontend

# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev
```

#### 管理後台開發

```bash
# 進入管理後台目錄
cd admin

# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev
```

#### 後端 API 開發

```bash
# 進入 API 目錄
cd api

# 安裝依賴
composer install

# 啟動開發伺服器
php spark serve
```

### 環境變數配置

主要環境變數說明：

| 變數名稱               | 說明              | 預設值                  |
| ---------------------- | ----------------- | ----------------------- |
| `NODE_ENV`             | Node.js 環境      | `development`           |
| `CI_ENVIRONMENT`       | CodeIgniter 環境  | `development`           |
| `ADMIN_PORT`           | 管理後台端口      | `8091`                  |
| `FRONTEND_PORT`        | 前端端口          | `8090`                  |
| `API_PORT`             | 後端端口          | `8092`                  |
| `MYSQL_PORT`           | MySQL 端口        | `3306`                  |
| `NUXT_PUBLIC_API_BASE` | 前端 API 基礎 URL | `http://localhost:8092` |
| `MYSQL_ROOT_PASSWORD`  | MySQL root 密碼   | **必須修改**            |
| `MYSQL_DATABASE`       | 資料庫名稱        | `iapforum`              |
| `MYSQL_USER`           | 資料庫使用者      | `app_user`              |
| `MYSQL_PASSWORD`       | 資料庫密碼        | **必須修改**            |

---

## 🚀 部署方式

> **TODO**: 本節內容待補充

### 生產環境部署

- [ ] Docker 生產環境部署指南
- [ ] 環境變數配置說明
- [ ] SSL/HTTPS 配置
- [ ] 反向代理配置（Nginx/Apache）
- [ ] 資料庫備份與還原策略
- [ ] 監控與日誌管理
- [ ] 效能優化建議

### 部署選項

- [ ] Docker Compose 部署
- [ ] Kubernetes 部署
- [ ] 傳統伺服器部署
- [ ] 雲端平台部署（AWS、Azure、GCP 等）

---

## 🔐 RBAC 權限系統

本專案實現了完整的 RBAC（Role-Based Access Control）權限管理系統。

### 相關檔案

#### 後端（API）

- `api/app/Models/RoleModel.php` - 角色模型
- `api/app/Models/PermissionModel.php` - 權限模型
- `api/app/Models/RolePermissionModel.php` - 角色權限關聯模型
- `api/app/Models/UserRoleModel.php` - 使用者角色關聯模型
- `api/app/Models/UserPermissionModel.php` - 使用者權限關聯模型
- `api/app/Controllers/RoleController.php` - 角色控制器
- `api/app/Controllers/PermissionController.php` - 權限控制器
- `api/app/Controllers/AuthController.php` - 認證控制器
- `api/app/Filters/PermissionFilter.php` - 權限過濾器

#### 前端（Admin）

- `admin/app/composables/useRole.ts` - 角色相關組合式函數
- `admin/app/composables/usePermissionData.ts` - 權限資料組合式函數
- `admin/app/types/permission.ts` - 權限類型定義
- `admin/app/pages/system/roles.vue` - 角色管理頁面
- `admin/app/pages/system/permissions.vue` - 權限管理頁面
- `admin/app/components/Role/FrmModal.vue` - 角色表單元件
- `admin/app/components/Permission/FrmModal.vue` - 權限表單元件
- `admin/app/plugins/permission-directive.client.ts` - 權限指令插件

#### 資料庫

- `rbac.sql` - RBAC 資料庫結構 SQL

### 權限指令使用

在 Vue 元件中使用權限指令：

```vue
<template>
  <!-- 僅有特定權限的使用者可見 -->
  <button v-permission="'user.create'">新增使用者</button>

  <!-- 僅有特定角色的使用者可見 -->
  <div v-role="'admin'">管理員專區</div>
</template>
```

---

## 🐳 Docker 使用指南

### 前置需求

#### 必要軟體

1. **Docker Desktop**（Windows/Mac）或 **Docker Engine**（Linux）
   - 下載：https://www.docker.com/products/docker-desktop
   - 版本要求：Docker 20.10+ 和 Docker Compose v2.0+

2. **Git**（用於克隆專案）

#### 系統需求

- **記憶體**：建議至少 4GB RAM
- **硬碟空間**：建議至少 10GB 可用空間
- **CPU**：建議至少 2 核心

#### 驗證安裝

開啟終端機（命令提示字元或 PowerShell），執行以下命令驗證：

```bash
# 檢查 Docker 版本
docker --version

# 檢查 Docker Compose 版本（v2）
docker compose version

# 檢查 Docker 是否運行
docker ps
```

如果看到版本資訊，表示安裝成功。

---

### 快速開始

#### 1. 複製環境變數檔案

```bash
# Windows (CMD)
copy env.example .env

# Windows (PowerShell)
Copy-Item env.example .env

# Mac/Linux
cp env.example .env
```

#### 2. 編輯環境變數

使用文字編輯器開啟 `.env` 檔案，修改以下重要配置：

```env
# 資料庫密碼（請務必修改！）
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_PASSWORD=your_secure_password

# 如果需要，可以修改端口
ADMIN_PORT=8091
FRONTEND_PORT=8090
API_PORT=8092
MYSQL_PORT=3306
PHPMYADMIN_PORT=8093
```

#### 3. 啟動後端與資料庫（預設不含前台／後台）

```bash
# 預設啟動：API、MySQL、phpMyAdmin（背景執行）
docker compose up -d

# 選用：連同前台、後台一併用容器啟動
docker compose --profile nuxt up -d
```

**說明**：預設不啟動 admin、frontend，建議在本機以 `pnpm dev` 跑 Nuxt，以保留 Nuxt 4 auto-import 與較佳 HMR。若需全部在 Docker 內運行，請使用 `--profile nuxt`。

#### 4. 等待服務啟動

首次啟動需要下載映像檔和構建容器，可能需要 5-10 分鐘。您可以查看日誌：

```bash
# 查看所有服務日誌
docker compose logs -f

# 查看特定服務日誌
docker compose logs -f admin
docker compose logs -f api
docker compose logs -f mysql
```

#### 5. 初始化資料庫（首次使用）

如果您有 SQL 初始化檔案，可以執行：

```bash
# 方法 1：將 SQL 檔案放在 docker/mysql/init/ 目錄下
# 容器啟動時會自動執行該目錄下的所有 .sql 檔案

# 方法 2：手動執行 SQL 檔案
docker compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < your_init.sql

# 方法 3：進入 MySQL 容器執行
docker compose exec mysql mysql -u root -p
# 然後在 MySQL 中執行：
# source /docker-entrypoint-initdb.d/your_file.sql
```

#### 6. 訪問應用

**預設啟動**（`docker compose up -d`）後可訪問：

- **後端 API**：http://localhost:8092
- **phpMyAdmin**：http://localhost:8093

**前台與管理後台**需二擇一：

- **本機開發（推薦）**：在 `admin/`、`frontend/` 目錄分別執行 `pnpm install` 與 `pnpm dev`，API 基礎網址設為 `http://localhost:8092`。
- **Docker 啟動**：先執行 `docker compose --profile nuxt up -d`，再訪問：
  - **管理後台**：http://localhost:8091
  - **前台**：http://localhost:8090

停用 phpMyAdmin：`docker compose stop phpmyadmin`

#### 7. 本機開發前台／後台（推薦）

在已執行 `docker compose up -d` 的前提下，於本機跑 Nuxt，可保留 Nuxt 4 auto-import 與較佳 HMR：

```bash
# 後台
cd admin
pnpm install
pnpm dev

# 前台（另開終端）
cd frontend
pnpm install
pnpm dev
```

若 API 埠號或網址不同，可設環境變數：`NUXT_PUBLIC_API_BASE=http://localhost:8092`（或於各專案 `.env` / `nuxt.config` 調整）。

#### 8. 選用：全部用 Docker 啟動（含前台、後台）

```bash
docker compose --profile nuxt up -d
```

#### 9. 靜態網站生成

- **本機**（在 `frontend` 目錄）：`pnpm generate`
- **Docker**（有使用 `--profile nuxt` 時）：`docker compose --profile nuxt run --rm frontend sh -c "pnpm generate"`

#### 10. 更改資料庫名稱

1. 修改 `.env` 中的 `MYSQL_DATABASE` 與 `DB_DATABASE`（兩者需一致）
2. 更新 `docker/mysql/init/00_init_database_charset.sql` 中的資料庫名稱
3. 重新初始化（會刪除現有資料）：

   ```bash
   docker compose down -v
   docker compose up -d
   ```

   若資料庫中已有重要資料，請先備份：

   ```bash
   docker compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} > backup.sql
   ```

若 API 或 phpMyAdmin 無法連線，見下方 [故障排除 — 8092 拒絕連線](#8092-拒絕連線--phpmyadmin-無法連線-mysql)。

---

### 詳細說明

#### 服務說明

##### 1. MySQL 資料庫（mysql）

- **映像檔**：mysql:8.0
- **端口**：3306（可透過 `.env` 修改）
- **資料持久化**：使用 Docker Volume `mysql_data`
- **初始化腳本**：`docker/mysql/init/` 目錄下的 `.sql` 檔案會自動執行
- **字符集**：預設使用 `utf8mb4` 字符集和 `utf8mb4_general_ci` 排序規則（支援完整 Unicode，包括 emoji）
- **配置文件**：`docker/mysql/my.cnf` 設置 MySQL 伺服器預設字符集

##### 2. PHP 後端 API（api）

- **基礎映像檔**：php:8.1-apache
- **端口**：8092（可透過 `.env` 的 `API_PORT` 修改）
- **工作目錄**：`/var/www/html`
- **已安裝擴展**：mysqli, pdo, pdo_mysql, opcache, gd, zip
- **Apache 配置**：已啟用 mod_rewrite，DocumentRoot 指向 `public` 目錄

##### 3. Nuxt.js 前端（frontend）— 選用 profile `nuxt`

- **基礎映像檔**：node:20-alpine
- **端口**：8090（可透過 `.env` 修改）
- **套件管理器**：pnpm 10.24.0
- **啟動方式**：`docker compose --profile nuxt up -d`，或本機於 `frontend/` 執行 `pnpm dev`

##### 4. Nuxt.js 管理後台（admin）— 選用 profile `nuxt`

- **基礎映像檔**：node:20-alpine
- **端口**：8091（可透過 `.env` 修改）
- **套件管理器**：pnpm 10.24.0
- **啟動方式**：`docker compose --profile nuxt up -d`，或本機於 `admin/` 執行 `pnpm dev`

##### 5. phpMyAdmin（phpmyadmin）

- **映像檔**：phpmyadmin/phpmyadmin:latest
- **端口**：8093（可透過 `.env` 的 `PHPMYADMIN_PORT` 修改）
- **說明**：預設隨 `docker compose up -d` 啟動；停用：`docker compose stop phpmyadmin`

#### 環境變數說明

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| `NODE_ENV` | Node.js 環境 | `development` |
| `CI_ENVIRONMENT` | CodeIgniter 環境 | `development` |
| `ADMIN_PORT` | 管理後台端口 | `8091` |
| `FRONTEND_PORT` | 前端端口 | `8090` |
| `API_PORT` | 後端端口 | `8092` |
| `MYSQL_PORT` | MySQL 端口 | `3306` |
| `PHPMYADMIN_PORT` | phpMyAdmin 端口 | `8093` |
| `NUXT_PUBLIC_API_BASE` | 前端 API 基礎 URL | `http://localhost:8092` |
| `APP_BASE_URL` | 後端應用 URL | `http://localhost:8092` |
| `MYSQL_ROOT_PASSWORD` | MySQL root 密碼 | **必須修改** |
| `MYSQL_DATABASE` | 資料庫名稱 | `iapforum` |
| `MYSQL_USER` | 資料庫使用者 | `app_user` |
| `MYSQL_PASSWORD` | 資料庫密碼 | **必須修改** |

---

### 常用命令

#### 啟動和停止

```bash
# 預設啟動 API、MySQL、phpMyAdmin（背景執行）
docker compose up -d

# 含前台、後台一併啟動
docker compose --profile nuxt up -d

# 啟動特定服務
docker compose up -d mysql api

# 停止所有服務
docker compose down

# 停止服務並刪除 Volume（注意：會刪除資料庫資料）
docker compose down -v

# 重新啟動服務
docker compose restart

# 重新啟動特定服務（admin / frontend 需已用 --profile nuxt 啟動）
docker compose restart admin
```

#### 查看日誌

```bash
# 查看所有服務日誌
docker compose logs -f

# 查看特定服務日誌
docker compose logs -f admin
docker compose logs -f api
docker compose logs -f mysql

# 查看最近 100 行日誌
docker compose logs --tail=100 admin

# 查看特定時間範圍的日誌
docker compose logs --since 30m admin
```

#### 查看狀態

```bash
# 查看所有服務狀態
docker compose ps

# 查看資源使用情況
docker stats

# 查看特定容器的詳細資訊
docker inspect iapforum-api
```

#### 執行命令

```bash
# 在容器中執行命令
docker compose exec api php spark migrate
docker compose exec admin pnpm build
docker compose exec mysql mysql -u root -p

# 進入容器
docker compose exec api bash
docker compose exec admin sh
docker compose exec mysql bash

# 執行 Composer 命令
docker compose exec api composer install
docker compose exec api composer update

# 執行 pnpm 命令
docker compose exec admin pnpm install
docker compose exec admin pnpm update
```

#### 構建和重建

```bash
# 構建所有映像檔
docker compose build

# 構建特定服務
docker compose build api

# 強制重新構建（不使用快取）
docker compose build --no-cache

# 構建並啟動
docker compose up -d --build
```

#### 資料庫操作

```bash
# 備份資料庫
docker compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} > backup.sql

# 備份所有資料庫
docker compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} --all-databases > backup_all.sql

# 還原資料庫
docker compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < backup.sql

# 進入 MySQL 命令行
docker compose exec mysql mysql -u root -p

# 查看資料庫列表
docker compose exec mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SHOW DATABASES;"

# 清空指定資料庫（方法 1：刪除並重新創建資料庫）
docker compose exec mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "DROP DATABASE IF EXISTS \`${MYSQL_DATABASE}\`; CREATE DATABASE \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# 清空指定資料庫（方法 2：刪除所有表，保留資料庫結構）
docker compose exec mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} -e "SET FOREIGN_KEY_CHECKS = 0; SET @tables = NULL; SELECT GROUP_CONCAT('\`', table_schema, '\`.\`', table_name, '\`') INTO @tables FROM information_schema.tables WHERE table_schema = '${MYSQL_DATABASE}'; SET @tables = CONCAT('DROP TABLE IF EXISTS ', @tables); PREPARE stmt FROM @tables; EXECUTE stmt; DEALLOCATE PREPARE stmt; SET FOREIGN_KEY_CHECKS = 1;"

# 清空指定資料庫（方法 3：使用 SQL 腳本，清空所有表數據但保留表結構）
docker compose exec mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} -e "SET FOREIGN_KEY_CHECKS = 0; SET @tables = NULL; SELECT GROUP_CONCAT(table_name) INTO @tables FROM information_schema.tables WHERE table_schema = '${MYSQL_DATABASE}'; SET @tables = CONCAT('TRUNCATE TABLE ', @tables); PREPARE stmt FROM @tables; EXECUTE stmt; DEALLOCATE PREPARE stmt; SET FOREIGN_KEY_CHECKS = 1;"
```

#### 清理

```bash
# 停止並刪除所有容器、網路
docker compose down

# 停止並刪除所有容器、網路、Volume（會刪除資料庫資料）
docker compose down -v

# 刪除所有未使用的映像檔
docker image prune -a

# 刪除所有未使用的資源（容器、網路、映像檔、Volume）
docker system prune -a --volumes
```

##### 只清這個專案

還原到最初始狀態、沒有任何 Containers / Images / Volumes

```bash
docker compose down --rmi all -v --remove-orphans
```

- 刪除這個專案的 containers
- 刪除這個 compose 建的 images
- 刪除這個 compose 用到的 volumes

##### 清空整台機器的 Docker

```bash
docker system prune -a --volumes
```

- 刪掉所有專案的 containers / images / volumes

---

### 故障排除

#### Docker Desktop 連接錯誤

**錯誤訊息**：

```
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
check if the path is correct and if the daemon is running
```

**原因**：Docker Desktop 未啟動或未完全載入。

**解決方法**：

1. 確認 Docker Desktop 已啟動（工作列鯨魚圖示為 Running）
2. 等待完全載入後執行 `docker version` 驗證
3. 若 `docker version` 正常但 `docker compose` 失敗：
   - `docker compose version`（或 `docker-compose version`）
   - 嘗試 `docker-compose up -d`
   - 重啟 Docker Desktop
   - `docker compose config` 檢查 `compose.yaml`
   - 以系統管理員權限執行終端機
4. 若仍失敗：確認 WSL 2 或 Hyper-V、防火牆／防毒、Docker Desktop 版本

#### WSL 2 未啟用

Docker Desktop 在 Windows 上需要 WSL 2（Windows Subsystem for Linux 2）。以系統管理員 PowerShell 執行：

```powershell
wsl --status
```

若顯示需更新核心或未安裝 WSL，依序：

1. 以系統管理員開啟 PowerShell
2. 啟用 WSL：

   ```powershell
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   ```

3. 啟用虛擬機器平台：

   ```powershell
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```

4. 重新啟動電腦
5. 安裝 [WSL 2 核心更新](https://aka.ms/wsl2kernel)（`wsl_update_x64.msi`），完成後再重開機
6. 設定預設版本：`wsl --set-default-version 2`
7. 可選：`wsl --install -d Ubuntu` 或從 Microsoft Store 安裝
8. 再次執行 `wsl --status`，應顯示預設版本 2
9. 重啟 Docker Desktop；Settings → General 勾選「Use the WSL 2 based engine」；Resources → WSL Integration 啟用整合

**替代方案（Hyper-V，不推薦）**：`Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All`，重開機後在 Docker Desktop 取消 WSL 2 engine。

**注意**：需 Windows 10 2004+（組建 19041+）；企業版若 IT 限制 WSL 請聯繫管理員；WSL 2 為 Docker Desktop 建議方式。

#### 8092 拒絕連線 / phpMyAdmin 無法連線 MySQL

若 **localhost:8092 拒絕連線（ERR_CONNECTION_REFUSED）** 或 **phpMyAdmin 顯示「getaddrinfo for mysql failed」**，多數是 MySQL 尚未就緒或未通過健康檢查。

1. 在專案根目錄執行 `docker compose up -d`
2. 等待約 45–60 秒（首次啟動 API 會等 MySQL healthy）
3. 執行 `docker compose ps`；`mysql` 應為 `running (healthy)`，異常時查看 `docker compose logs mysql` 與 `api`
4. 確認服務在同一網路 `iapforum-network`；必要時 `docker compose down` 後再 `up -d`
5. 若 8092 出現 ERR_EMPTY_RESPONSE：改開 http://127.0.0.1:8092/，或調整 `hosts` 讓 `localhost` 對應 IPv4（註解 `::1 localhost`）

#### 其他常見問題

##### 端口已被占用

**錯誤訊息**：`Error: bind: address already in use`

1. 檢查端口：`netstat -ano | findstr :8091`（Windows）或 `lsof -i :8091`（Mac / Linux）
2. 修改 `.env` 端口或停止占用程式

##### 容器無法啟動

1. `docker compose logs [service_name]`
2. 檢查環境變數、Docker Desktop 狀態與系統資源

##### 資料庫連線失敗

1. `docker compose ps` 確認 MySQL 已啟動並等待就緒
2. 檢查 `.env` 資料庫設定
3. `docker compose exec api ping mysql`、`docker compose exec mysql mysql -u root -p`

##### 產品 API 回傳 productname 為空字串

1. 確認 API 連線資料庫與匯入 SQL 一致（`DB_DATABASE`、`Database.php`）
2. 檢查編碼；必要時在 MySQL 查 `HEX(productname)`，確認 `charset` 為 `utf8mb4`

##### phpMyAdmin 無法連線（Access denied）

1. 執行 `.\sync-mysql-users.ps1`（或 `.bat` / `docker/mysql/sync-mysql-users.sh`）
2. `docker compose restart phpmyadmin`
3. 確認 `.env` 的 `MYSQL_USER`、`MYSQL_PASSWORD`

##### 前端無法連接到後端 API

1. 檢查 `NUXT_PUBLIC_API_BASE`
2. 確認 API 可連線（例如 `curl http://localhost:8092`）
3. 檢查瀏覽器網路請求與防火牆

##### 檔案權限問題

```bash
docker compose exec api chown -R www-data:www-data /var/www/html/writable
docker compose exec api chmod -R 755 /var/www/html/writable
docker compose exec api chown -R www-data:www-data /var/www/html/public/uploads
docker compose exec api chmod -R 755 /var/www/html/public/uploads
```

##### Docker Desktop 無法啟動

1. BIOS / UEFI 啟用虛擬化
2. 確認 WSL 2（見上文）
3. 重啟 Docker Desktop 並查看日誌

##### 構建映像檔失敗

1. 檢查網路
2. `docker compose build --no-cache`
3. 檢查 Dockerfile 與完整錯誤訊息

更多問答見 [Docker FAQ](docs/docker/docker-faq.md)。

---

### 進階配置

#### 使用 phpMyAdmin

phpMyAdmin 預設隨 `docker compose up -d` 啟動。

```bash
# 停用 phpMyAdmin
docker compose stop phpmyadmin

# 再次啟動（若已停用）
docker compose up -d phpmyadmin

# 訪問：http://localhost:8093（或 .env 中的 PHPMYADMIN_PORT）
# 登入資訊：
# - Root: root / [MYSQL_ROOT_PASSWORD]
# - App User: [MYSQL_USER] / [MYSQL_PASSWORD]
```

#### 同步 MySQL 用戶密碼

如果遇到 phpMyAdmin 無法連線的問題（通常是用戶密碼不一致），可以使用同步腳本：

**Windows (PowerShell):**
```powershell
.\sync-mysql-users.ps1
```

**Windows (CMD):**
```cmd
sync-mysql-users.bat
```

**Linux/Mac:**
```bash
bash docker/mysql/sync-mysql-users.sh
```

此腳本會：
- 自動從 `.env` 文件讀取配置
- 確保 MySQL 用戶密碼與環境變數一致
- 更新用戶權限

**何時需要使用：**
- 首次啟動後，如果用戶密碼與環境變數不一致
- 修改 `.env` 文件中的 `MYSQL_USER` 或 `MYSQL_PASSWORD` 後
- 遇到 "Access denied" 錯誤時

#### 生產環境配置

生產環境建議：

1. **修改環境變數**：
   ```env
   NODE_ENV=production
   CI_ENVIRONMENT=production
   ```

2. **使用多階段構建**優化映像檔大小

3. **配置 SSL**：使用 Let's Encrypt 或自簽憑證

4. **設定資源限制**：
   ```yaml
   services:
     api:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

5. **配置日誌管理**：使用日誌驅動和輪轉

#### 資料持久化

所有重要資料都使用 Docker Volume 持久化：

- `mysql_data`：MySQL 資料庫資料
- `api_uploads`：上傳檔案
- `api_writable`：CodeIgniter 可寫入目錄
- `admin_node_modules`：Node.js 依賴（開發環境）
- `admin_nuxt`：Nuxt 建置快取（開發環境）
- `frontend_node_modules`：Node.js 依賴（開發環境）
- `frontend_nuxt`：Nuxt 建置快取（開發環境）

#### 網路配置

所有服務都在 `iapforum-network` 網路中，可以透過服務名稱互相訪問：

- 前端訪問後端：`http://api:80`
- 後端訪問資料庫：`mysql:3306`

---

## 📚 相關文件

### Docker 相關

- [Docker 文件總覽](docs/docker/README.md) - Docker 相關文件索引
- [Docker 可行性評估報告](docs/docker/docker-feasibility-assessment.md) - Docker 化可行性分析
- [Docker 實施指南](docs/docker/docker-implementation-guide.md) - 詳細的實施步驟
- [Docker 常見問題解答](docs/docker/docker-faq.md) - 常見問題和解答

### 部署與認證

- [部署時登入後 401 與 Authorization 說明](docs/部署-登入後-401-與-Authorization-說明.md) - 主機 strip Authorization 時的解法（X-Access-Token）

### 專案遷移與初始化

- [專案遷移指南](docs/migration-guide.md) - 完整的遷移步驟說明
- [乾淨初始化 SQL](docs/init/init-clean.sql) - 不含測試資料的初始化文件
- [包含預設管理員的初始化 SQL](docs/init/init-with-super-admin.sql) - 包含預設超級管理員帳號
- [預設管理員建議](docs/init/default-admin-recommendations.md) - 關於是否包含預設管理員的詳細說明

---

**最後更新**：2026-05-12  
**版本**：2.0
