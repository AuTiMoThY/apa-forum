-- ============================================
-- MySQL 資料庫字符集初始化腳本
-- ============================================
-- 此腳本確保資料庫使用 utf8mb4 字符集和 utf8mb4_general_ci 排序規則
-- 檔案名稱以 00_ 開頭，確保在其他腳本之前執行
-- ============================================

-- 伺服器預設字符集由 docker/mysql/my.cnf 設定（character-set-server / collation-server）。
-- 不在此使用 SET GLOBAL，避免以一般應用帳號匯入時需 SUPER 或 SYSTEM_VARIABLES_ADMIN 權限。

-- 設置當前會話的字符集
SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;

-- 設置當前資料庫字符集（名稱須與 .env 的 MYSQL_DATABASE 一致）
-- 不使用 PREPARE / EXECUTE：phpMyAdmin 走 prepared statement 協定時，ALTER DATABASE 會觸發 #1295
ALTER DATABASE `apaforum` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 若資料庫名稱不同，請改為實際名稱，例如：
-- ALTER DATABASE `your_database_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- ============================================
-- 注意事項：
-- 1. 請確認上方 ALTER DATABASE 的資料庫名稱與 .env 的 MYSQL_DATABASE 一致
-- 2. 若修改 .env 的 MYSQL_DATABASE，請同步更新本腳本中的 ALTER DATABASE
-- 3. 此腳本只在首次初始化時執行（當資料庫 Volume 為空時）
-- 4. 如果資料庫已存在且需要修改字符集，可以手動執行：
--    ALTER DATABASE `your_database_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- 5. MySQL 8.0 預設字符集已經是 utf8mb4，但明確設置可以確保一致性
-- 6. 如需重新初始化資料庫，請執行：docker compose down -v && docker compose up -d
-- ============================================
