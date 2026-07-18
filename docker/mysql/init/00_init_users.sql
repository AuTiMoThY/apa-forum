-- ============================================
-- MySQL 用戶初始化腳本
-- ============================================
-- 此腳本確保 MySQL 用戶與環境變數一致
-- 檔案名稱以 00_ 開頭，確保在其他腳本之前執行
-- 
-- 注意：此腳本只在首次初始化時執行
-- 如果資料庫已存在，請使用 sync-mysql-users.sh 腳本同步用戶
-- ============================================

-- 創建或更新應用程式用戶
-- 使用環境變數：MYSQL_USER 和 MYSQL_PASSWORD
-- 預設值：app_user / app_password
-- 
-- ⚠️ 重要：請根據您的 .env 文件修改以下用戶名和密碼
-- 或者使用 sync-mysql-users.sh 腳本自動同步

-- 如果用戶不存在，創建用戶
CREATE USER IF NOT EXISTS 'apaforum'@'%' IDENTIFIED BY 'apaforum';

-- 如果用戶已存在，更新密碼（確保與環境變數一致）
ALTER USER 'apaforum'@'%' IDENTIFIED BY 'apaforum';

-- 授予權限
GRANT ALL PRIVILEGES ON `apaforum`.* TO 'apaforum'@'%';

-- 刷新權限
FLUSH PRIVILEGES;

-- ============================================
-- 注意事項：
-- 1. 此腳本中的用戶名和密碼應該與 .env 文件中的 MYSQL_USER 和 MYSQL_PASSWORD 一致
-- 2. 如果修改了 .env 文件，請執行 sync-mysql-users.sh 腳本同步用戶
-- 3. 首次初始化後，此腳本不會再次執行，請使用 sync-mysql-users.sh
-- ============================================
