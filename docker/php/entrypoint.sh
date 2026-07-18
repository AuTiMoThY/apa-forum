#!/bin/bash
set -e

# 切換到工作目錄
cd /var/www/html

# 如果 vendor 目錄不存在，執行 composer install
if [ ! -d "vendor" ]; then
    echo "vendor 目錄不存在，正在執行 composer install..."
    composer install --no-dev --optimize-autoloader
fi

# 權限設定
# 這裡的 uploads 可能會有大量檔案，如果每次都做遞迴 chown/chmod 會導致容器啟動極慢。
UPLOADS_DIR="/var/www/html/public/uploads"

mkdir -p /var/www/html/writable
mkdir -p "${UPLOADS_DIR}"

# writable 通常不大：允許遞迴修正
chown -R www-data:www-data /var/www/html/writable
chmod -R 755 /var/www/html/writable

# uploads 僅處理「最外層」目錄權限，避免掃描/遞迴大量圖片檔案。
chown www-data:www-data "${UPLOADS_DIR}"
chmod 755 "${UPLOADS_DIR}"

# 執行原始命令（啟動 Apache）
exec "$@"
