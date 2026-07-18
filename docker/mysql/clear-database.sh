#!/bin/bash
# ============================================
# 清空資料庫腳本
# ============================================
# 此腳本用於清空指定的 MySQL 資料庫
# ============================================

set -e

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}清空資料庫腳本${NC}"
echo -e "${GREEN}========================================${NC}"

# 檢查 .env 文件是否存在
if [ ! -f "../../.env" ]; then
    echo -e "${YELLOW}警告：未找到 .env 文件，將使用預設值${NC}"
    MYSQL_DATABASE="${MYSQL_DATABASE:-apaforum}"
    MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root_password}"
else
    # 從 .env 文件讀取配置
    echo -e "${GREEN}從 .env 文件讀取配置...${NC}"
    source ../../.env
    MYSQL_DATABASE="${MYSQL_DATABASE:-apaforum}"
    MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root_password}"
fi

echo -e "${GREEN}資料庫名稱: ${MYSQL_DATABASE}${NC}"

# 檢查 MySQL 容器是否運行
if ! docker compose ps mysql | grep -q "Up"; then
    echo -e "${RED}錯誤：MySQL 容器未運行${NC}"
    echo -e "${YELLOW}請先啟動 MySQL 容器：docker compose up -d mysql${NC}"
    exit 1
fi

# 確認操作
echo -e "${YELLOW}警告：此操作將清空資料庫 ${MYSQL_DATABASE} 的所有資料！${NC}"
read -p "請輸入 'yes' 確認繼續: " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}操作已取消${NC}"
    exit 0
fi

# 選擇清空方式
echo -e "${GREEN}請選擇清空方式：${NC}"
echo "1. 刪除並重新創建資料庫（最徹底，會刪除所有表結構）"
echo "2. 刪除所有表（保留資料庫結構）"
echo "3. 清空所有表數據（保留表結構）"
read -p "請選擇 (1-3): " method

case $method in
    1)
        echo -e "${GREEN}刪除並重新創建資料庫...${NC}"
        docker compose exec -T mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<EOF
DROP DATABASE IF EXISTS \`${MYSQL_DATABASE}\`;
CREATE DATABASE \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
EOF
        echo -e "${GREEN}✓ 資料庫已重新創建${NC}"
        ;;
    2)
        echo -e "${GREEN}刪除所有表...${NC}"
        docker compose exec -T mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" ${MYSQL_DATABASE} <<EOF
SET FOREIGN_KEY_CHECKS = 0;
SET @tables = NULL;
SELECT GROUP_CONCAT('\`', table_name, '\`') INTO @tables 
FROM information_schema.tables 
WHERE table_schema = '${MYSQL_DATABASE}';
SET @tables = CONCAT('DROP TABLE IF EXISTS ', @tables);
PREPARE stmt FROM @tables;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET FOREIGN_KEY_CHECKS = 1;
EOF
        echo -e "${GREEN}✓ 所有表已刪除${NC}"
        ;;
    3)
        echo -e "${GREEN}清空所有表數據...${NC}"
        docker compose exec -T mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD}" ${MYSQL_DATABASE} <<EOF
SET FOREIGN_KEY_CHECKS = 0;
SET @tables = NULL;
SELECT GROUP_CONCAT(table_name) INTO @tables 
FROM information_schema.tables 
WHERE table_schema = '${MYSQL_DATABASE}';
SET @tables = CONCAT('TRUNCATE TABLE ', @tables);
PREPARE stmt FROM @tables;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET FOREIGN_KEY_CHECKS = 1;
EOF
        echo -e "${GREEN}✓ 所有表數據已清空${NC}"
        ;;
    *)
        echo -e "${RED}無效的選擇${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}操作完成！${NC}"
