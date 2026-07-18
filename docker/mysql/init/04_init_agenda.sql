-- 議程管理：app_agenda_day（議程日）+ app_agenda_item（議程列）
-- 對應後台：/agenda

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 議程日
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_agenda_day` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵',
  `label` varchar(100) DEFAULT NULL COMMENT '自訂標籤（如：Day 1、第一天；留空則前端依序顯示）',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序（數字越小越前面）',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間',
  PRIMARY KEY (`id`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='議程日';

-- ---------------------------------------------------------------------------
-- 議程列
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_agenda_item` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵',
  `day_id` bigint(20) UNSIGNED NOT NULL COMMENT '所屬議程日 ID',
  `session` varchar(100) DEFAULT NULL COMMENT '場次（如：09:00-10:00）',
  `type` varchar(100) DEFAULT NULL COMMENT '類型（如：Keynote、Panel）',
  `topic` text DEFAULT NULL COMMENT '主題/內容',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序（數字越小越前面）',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間',
  PRIMARY KEY (`id`),
  KEY `idx_day_id` (`day_id`),
  KEY `idx_sort_order` (`sort_order`),
  CONSTRAINT `fk_agenda_item_day` FOREIGN KEY (`day_id`) REFERENCES `app_agenda_day` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='議程列';

-- ---------------------------------------------------------------------------
-- 範例資料（可選，匯入後可直接預覽 UI）
-- ---------------------------------------------------------------------------
INSERT INTO `app_agenda_day` (`id`, `label`, `sort_order`) VALUES
(1, 'Day 1', 0),
(2, 'Day 2', 1);

INSERT INTO `app_agenda_item` (`day_id`, `session`, `type`, `topic`, `sort_order`) VALUES
(1, '09:00-09:30', '開幕', '開幕致詞', 0),
(1, '09:30-10:30', 'Keynote', '亞太論壇主題演講', 1),
(1, '10:45-12:00', 'Panel', '產業趨勢圓桌論壇', 2),
(2, '09:00-10:00', '專題', '分組討論成果分享', 0),
(2, '10:15-11:30', 'Workshop', '實務工作坊', 1);

-- ---------------------------------------------------------------------------
-- 後台選單與權限（若 sys_structure 尚未有議程管理節點）
-- ---------------------------------------------------------------------------
SET @agenda_exists := (
  SELECT COUNT(*) FROM `sys_structure` WHERE `url` = 'agenda'
);

SET @agenda_id := NULL;

INSERT INTO `sys_structure` (`parent_id`, `label`, `alias`, `module_id`, `url`, `is_show_frontend`, `is_show_backend`, `status`, `sort_order`)
SELECT NULL, '議程管理', 'Agenda', NULL, 'agenda', 0, 1, 1, 20
WHERE @agenda_exists = 0;

SET @agenda_id := (
  SELECT `id` FROM `sys_structure` WHERE `url` = 'agenda' LIMIT 1
);

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
SELECT 'agenda.view', '議程管理（檢視）', '檢視議程管理', NULL, NULL, 'view', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM `sys_permissions` WHERE `name` = 'agenda.view');

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
SELECT 'agenda.edit', '議程管理（編輯）', '編輯議程管理', NULL, NULL, 'edit', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM `sys_permissions` WHERE `name` = 'agenda.edit');

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'agenda.view'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 1 AND p.name = 'agenda.view'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'agenda.edit'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 1 AND p.name = 'agenda.edit'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'agenda.view'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 2 AND p.name = 'agenda.view'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'agenda.edit'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 2 AND p.name = 'agenda.edit'
);
