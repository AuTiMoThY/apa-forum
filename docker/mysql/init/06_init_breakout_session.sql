-- 分組討論管理：app_breakout_group + app_breakout_lecturer
-- 對應後台：/breakout-session
-- 分組講師與 app_lecturer（講師管理）無關聯

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 分組討論組別
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_breakout_group` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵',
  `code` varchar(50) NOT NULL COMMENT '代號',
  `title` varchar(255) NOT NULL COMMENT '標題',
  `content` mediumtext DEFAULT NULL COMMENT '內文（HTML）',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序（數字越小越前面）',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='分組討論組別';

-- ---------------------------------------------------------------------------
-- 分組討論講師（隸屬組別，獨立於 app_lecturer）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_breakout_lecturer` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵',
  `group_id` bigint(20) UNSIGNED NOT NULL COMMENT '所屬組別 ID',
  `name` varchar(100) NOT NULL COMMENT '姓名',
  `image` varchar(500) DEFAULT NULL COMMENT '圖片（檔名，存於 uploads/breakout-session/）',
  `title` varchar(255) DEFAULT NULL COMMENT '頭銜',
  `intro` text DEFAULT NULL COMMENT '簡介',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序（數字越小越前面）',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間',
  PRIMARY KEY (`id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_sort_order` (`sort_order`),
  CONSTRAINT `fk_breakout_lecturer_group` FOREIGN KEY (`group_id`) REFERENCES `app_breakout_group` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='分組討論講師';

-- ---------------------------------------------------------------------------
-- 範例資料（可選，匯入後可直接預覽 UI）
-- ---------------------------------------------------------------------------
INSERT INTO `app_breakout_group` (`code`, `title`, `content`, `sort_order`) VALUES
('A', '數位轉型與創新', '<p>探討企業在數位時代的轉型策略與實務案例。</p>', 0),
('B', '永續發展與 ESG', '<p>聚焦環境、社會與公司治理的整合實踐。</p>', 1);

INSERT INTO `app_breakout_lecturer` (`group_id`, `name`, `image`, `title`, `intro`, `sort_order`) VALUES
(1, '陳志明', NULL, '數位策略顧問', '專注於產業數位化與資料驅動決策。', 0),
(1, '林雅婷', NULL, '創新實驗室主持人', '協助企業建立創新文化與敏捷團隊。', 1),
(2, '黃國華', NULL, 'ESG 顧問', '協助組織制定永續策略與揭露報告。', 0);

-- ---------------------------------------------------------------------------
-- 後台選單與權限（若 sys_structure 尚未有分組討論管理節點）
-- ---------------------------------------------------------------------------
SET @breakout_exists := (
  SELECT COUNT(*) FROM `sys_structure` WHERE `url` = 'breakout-session'
);

INSERT INTO `sys_structure` (`parent_id`, `label`, `alias`, `module_id`, `url`, `is_show_frontend`, `is_show_backend`, `status`, `sort_order`)
SELECT NULL, '分組討論管理', 'BreakoutSession', NULL, 'breakout-session', 0, 1, 1, 22
WHERE @breakout_exists = 0;

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
SELECT 'breakout-session.view', '分組討論管理（檢視）', '檢視分組討論管理', NULL, NULL, 'view', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM `sys_permissions` WHERE `name` = 'breakout-session.view');

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
SELECT 'breakout-session.edit', '分組討論管理（編輯）', '編輯分組討論管理', NULL, NULL, 'edit', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM `sys_permissions` WHERE `name` = 'breakout-session.edit');

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'breakout-session.view'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 1 AND p.name = 'breakout-session.view'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'breakout-session.edit'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 1 AND p.name = 'breakout-session.edit'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'breakout-session.view'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 2 AND p.name = 'breakout-session.view'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'breakout-session.edit'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 2 AND p.name = 'breakout-session.edit'
);
