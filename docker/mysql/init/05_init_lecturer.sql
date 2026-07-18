-- 講師管理：app_lecturer
-- 對應後台：/lecturer

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 講師
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_lecturer` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵',
  `name` varchar(100) NOT NULL COMMENT '姓名',
  `image` varchar(500) DEFAULT NULL COMMENT '圖片（檔名，存於 uploads/lecturer/）',
  `title` varchar(255) DEFAULT NULL COMMENT '頭銜',
  `intro` text DEFAULT NULL COMMENT '介紹',
  `heading` varchar(255) DEFAULT NULL COMMENT '標題',
  `content` mediumtext DEFAULT NULL COMMENT '內文（HTML）',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序（數字越小越前面）',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間',
  PRIMARY KEY (`id`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='講師';

-- ---------------------------------------------------------------------------
-- 範例資料（可選，匯入後可直接預覽 UI）
-- ---------------------------------------------------------------------------
INSERT INTO `app_lecturer` (`name`, `image`, `title`, `intro`, `heading`, `content`, `sort_order`) VALUES
('王小明', NULL, '亞太論壇首席顧問', '專長於數位轉型與組織創新，擁有超過二十年產業顧問經驗。', '數位轉型的新思維', '<p>在快速變遷的時代，企業需要重新思考價值鏈與客戶體驗。</p>', 0),
('李美華', NULL, '策略管理教授', '現任知名大學商學院教授，研究領域涵蓋策略管理與領導力。', '領導力與團隊共創', '<p>有效的領導不僅是決策，更是激發團隊潛能的藝術。</p>', 1);

-- ---------------------------------------------------------------------------
-- 後台選單與權限（若 sys_structure 尚未有講師管理節點）
-- ---------------------------------------------------------------------------
SET @lecturer_exists := (
  SELECT COUNT(*) FROM `sys_structure` WHERE `url` = 'lecturer'
);

INSERT INTO `sys_structure` (`parent_id`, `label`, `alias`, `module_id`, `url`, `is_show_frontend`, `is_show_backend`, `status`, `sort_order`)
SELECT NULL, '講師管理', 'Lecturer', NULL, 'lecturer', 0, 1, 1, 21
WHERE @lecturer_exists = 0;

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
SELECT 'lecturer.view', '講師管理（檢視）', '檢視講師管理', NULL, NULL, 'view', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM `sys_permissions` WHERE `name` = 'lecturer.view');

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
SELECT 'lecturer.edit', '講師管理（編輯）', '編輯講師管理', NULL, NULL, 'edit', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM `sys_permissions` WHERE `name` = 'lecturer.edit');

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'lecturer.view'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 1 AND p.name = 'lecturer.view'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'lecturer.edit'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 1 AND p.name = 'lecturer.edit'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'lecturer.view'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 2 AND p.name = 'lecturer.view'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'lecturer.edit'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 2 AND p.name = 'lecturer.edit'
);
