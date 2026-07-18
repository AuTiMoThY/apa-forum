#!/bin/bash
# ============================================
# MySQL 用戶同步腳本
# ============================================
# 此腳本確保 MySQL 用戶密碼與環境變數一致
# 可以在任何時候執行，用於同步用戶密碼
# ============================================

set -e

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}MySQL 用戶同步腳本${NC}"
echo -e "${GREEN}========================================${NC}"

# 檢查 .env 文件是否存在
if [ ! -f "../../.env" ]; then
    echo -e "${YELLOW}警告：未找到 .env 文件，將使用預設值${NC}"
    MYSQL_USER="${MYSQL_USER:-app_user}"
    MYSQL_PASSWORD="${MYSQL_PASSWORD:-app_password}"
    MYSQL_DATABASE="${MYSQL_DATABASE:-apaforum}"
    MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root_password}"
else
    # 從 .env 文件讀取配置
    echo -e "${GREEN}從 .env 文件讀取配置...${NC}"
    source ../../.env
    MYSQL_USER="${MYSQL_USER:-app_user}"
    MYSQL_PASSWORD="${MYSQL_PASSWORD:-app_password}"
    MYSQL_DATABASE="${MYSQL_DATABASE:-apaforum}"
    MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root_password}"
fi

echo -e "${GREEN}配置資訊：${NC}"
echo -e "  用戶名: ${MYSQL_USER}"
echo -e "  資料庫: ${MYSQL_DATABASE}"
echo -e "  Root 密碼: ${MYSQL_ROOT_PASSWORD:0:3}***"

# 檢查 MySQL 容器是否運行
if ! docker compose ps mysql | grep -q "Up"; then
    echo -e "${RED}錯誤：MySQL 容器未運行${NC}"
    echo -e "${YELLOW}請先啟動 MySQL 容器：docker compose up -d mysql${NC}"
    exit 1
fi

# 等待 MySQL 啟動
echo -e "${GREEN}等待 MySQL 啟動...${NC}"
until docker compose exec -T mysql mysqladmin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" --silent 2>/dev/null; do
    sleep 1
done

echo -e "${GREEN}MySQL 已啟動，開始同步用戶...${NC}"

# 執行 SQL 命令同步用戶
docker compose exec -T mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<EOF
-- 創建用戶（如果不存在）
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';

-- 更新用戶密碼（確保與環境變數一致）
ALTER USER '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';

-- 授予權限
GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_USER}'@'%';

-- 刷新權限
FLUSH PRIVILEGES;

-- 顯示用戶資訊
SELECT User, Host FROM mysql.user WHERE User = '${MYSQL_USER}';
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 用戶同步完成：${MYSQL_USER}${NC}"
    echo -e "${GREEN}✓ 現在可以使用以下資訊登入 phpMyAdmin：${NC}"
    echo -e "  使用者名稱: ${MYSQL_USER}"
    echo -e "  密碼: ${MYSQL_PASSWORD}"
else
    echo -e "${RED}✗ 用戶同步失敗${NC}"
    exit 1
fi
