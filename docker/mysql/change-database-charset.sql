-- ============================================
-- 修改資料庫字符集腳本
-- ============================================
-- 此腳本用於將現有資料庫的字符集改為 utf8mb4_general_ci
-- 使用方法：在 MySQL 中執行此腳本
-- ============================================

-- 修改資料庫字符集
-- 請根據實際資料庫名稱修改以下命令
ALTER DATABASE `apaforum` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 如果需要修改所有表的字符集，可以執行以下命令（請謹慎使用）
-- 注意：這會修改所有表的字符集，可能需要較長時間
-- SELECT CONCAT('ALTER TABLE `', table_name, '` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;')
-- FROM information_schema.tables
-- WHERE table_schema = 'apaforum'
-- AND table_type = 'BASE TABLE';

-- ============================================
-- 注意事項：
-- 1. 請將 `apaforum` 替換為實際的資料庫名稱
-- 2. 修改資料庫字符集不會自動修改現有表的字符集
-- 3. 如果需要修改所有表的字符集，請使用上面的 SELECT 語句生成 ALTER TABLE 命令
-- 4. 建議在修改前先備份資料庫
-- ============================================
