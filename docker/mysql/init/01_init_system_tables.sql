
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+08:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料表結構 `company_base`
--

CREATE TABLE `company_base` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT '主鍵',
  `name` varchar(255) DEFAULT NULL COMMENT '公司名稱',
  `copyright` varchar(255) DEFAULT NULL COMMENT '版權資訊',
  `phone` varchar(50) DEFAULT NULL COMMENT '電話',
  `fax` varchar(50) DEFAULT NULL COMMENT '傳真',
  `email` varchar(255) DEFAULT NULL COMMENT '電子郵件',
  `case_email` varchar(255) DEFAULT NULL COMMENT '案件電子郵件',
  `zipcode` varchar(10) DEFAULT NULL COMMENT '郵遞區號',
  `city` varchar(100) DEFAULT NULL COMMENT '城市',
  `district` varchar(100) DEFAULT NULL COMMENT '行政區',
  `address` varchar(500) DEFAULT NULL COMMENT '地址',
  `fb_url` varchar(500) DEFAULT NULL COMMENT 'Facebook URL',
  `yt_url` varchar(500) DEFAULT NULL COMMENT 'YouTube URL',
  `line_url` varchar(500) DEFAULT NULL COMMENT 'LINE URL',
  `keywords` text DEFAULT NULL COMMENT '關鍵字',
  `description` text DEFAULT NULL COMMENT '描述',
  `head_code` text DEFAULT NULL COMMENT '<head>代碼',
  `body_code` text DEFAULT NULL COMMENT '<body>代碼',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='公司基本資訊表';


-- --------------------------------------------------------

--
-- 資料表結構 `sys_admin`
--

CREATE TABLE `sys_admin` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT '主鍵',
  `permission_name` varchar(50) DEFAULT NULL COMMENT '權限名稱',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '狀態：1=啟用,0=停用',
  `username` varchar(100) NOT NULL COMMENT '帳號（唯一）',
  `password_hash` varchar(255) NOT NULL COMMENT '密碼雜湊值（或遷移時暫存明碼，初次登入後改為雜湊）',
  `name` varchar(100) NOT NULL COMMENT '姓名',
  `phone` varchar(50) DEFAULT NULL COMMENT '電話',
  `address` varchar(255) DEFAULT NULL COMMENT '地址',
  `profile` text DEFAULT NULL COMMENT '個人簡介',
  `expiration_date` date DEFAULT NULL COMMENT '帳號到期日（NULL 表示無期限）',
  `note_finance` longtext DEFAULT NULL COMMENT '財務備註',
  `note_deliver` longtext DEFAULT NULL COMMENT '寄貨備註',
  `note_purchase` longtext DEFAULT NULL COMMENT '採購備註',
  `is_first_login` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否初次登入：1=是（密碼為明碼）,0=否（密碼已雜湊）',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `sys_admin`
--

INSERT INTO `sys_admin` (`id`, `permission_name`, `status`, `username`, `password_hash`, `name`, `phone`, `address`, `profile`, `expiration_date`, `note_finance`, `note_deliver`, `note_purchase`, `is_first_login`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, 'superadmin', '$2y$10$2wBDnLFld4coHJsPwfRatuMI3tW88plZ.IxflI17g.Y3Rfslb7AcS', '超級管理員', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-12-30 07:02:22', '2025-12-30 07:04:07'),
(2, NULL, 1, 'admin', '$2y$10$CjlAGYn0gfVJJP54D3SsGe.bSosQi.A3F9vmN66uc3vcPca9RNGse', '管理員', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2025-12-30 07:02:22', '2025-12-30 07:02:22');

-- --------------------------------------------------------

--
-- 資料表結構 `sys_module`
--

CREATE TABLE `sys_module` (
  `id` int(11) NOT NULL,
  `label` varchar(100) NOT NULL COMMENT '模組名稱',
  `name` varchar(100) NOT NULL COMMENT '模組代碼',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `sys_permissions`
--

CREATE TABLE `sys_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT '主鍵',
  `name` varchar(255) NOT NULL COMMENT '權限名稱（唯一，格式：module.action 或 module.category.action）',
  `label` varchar(255) NOT NULL COMMENT '權限顯示名稱',
  `description` text DEFAULT NULL COMMENT '權限描述',
  `module_id` int(11) DEFAULT NULL COMMENT '關聯的模組 ID（可選）',
  `category` varchar(50) DEFAULT NULL COMMENT '分類（如：tw, sg, mm）',
  `action` varchar(50) DEFAULT NULL COMMENT '動作（如：view, create, edit, delete, manage）',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '狀態：1=啟用,0=停用',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序順序（數字越小越前面）',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='權限表';


-- --------------------------------------------------------

--
-- 資料表結構 `sys_roles`
--

CREATE TABLE `sys_roles` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT '主鍵',
  `name` varchar(100) NOT NULL COMMENT '角色名稱（唯一）',
  `label` varchar(255) NOT NULL COMMENT '角色顯示名稱',
  `description` text DEFAULT NULL COMMENT '角色描述',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '狀態：1=啟用,0=停用',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色表';

--
-- 傾印資料表的資料 `sys_roles`
--

INSERT INTO `sys_roles` (`id`, `name`, `label`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'super_admin', '超級管理員', '擁有所有權限的超級管理員角色', 1, '2025-12-30 07:02:22', '2025-12-30 07:02:22'),
(2, 'admin', '管理員', '擁有管理員權限的管理員角色', 1, '2025-12-30 07:02:22', '2025-12-30 07:02:22');

-- --------------------------------------------------------

--
-- 資料表結構 `sys_role_permissions`
--

CREATE TABLE `sys_role_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT '主鍵',
  `role_id` bigint(20) UNSIGNED NOT NULL COMMENT '角色 ID',
  `permission_id` bigint(20) UNSIGNED NOT NULL COMMENT '權限 ID',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色權限關聯表';

-- --------------------------------------------------------

--
-- 資料表結構 `sys_structure`
--

CREATE TABLE `sys_structure` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT '主鍵',
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT '父層級 ID（NULL 表示第一層）',
  `label` varchar(100) NOT NULL COMMENT '層級名稱',
  `alias` varchar(255) DEFAULT NULL COMMENT '別名（用於側邊欄選單顯示描述）',
  `module_id` int(11) DEFAULT NULL COMMENT '模組 id',
  `url` varchar(255) DEFAULT NULL COMMENT '自訂 URL（可選，如果為空則使用模組的 name）',
  `is_show_frontend` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否顯示前台：1=顯示,0=不顯示',
  `is_show_backend` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否顯示後台：1=顯示,0=不顯示',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '狀態：1=啟用,0=停用',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序順序（數字越小越前面）',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系統架構層級表';
-- --------------------------------------------------------

--
-- 資料表結構 `sys_user_permissions`
--

CREATE TABLE `sys_user_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT '主鍵',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT '使用者 ID（sys_admin.id）',
  `permission_id` bigint(20) UNSIGNED NOT NULL COMMENT '權限 ID',
  `is_granted` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否授予：1=授予,0=撤銷',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='使用者權限關聯表（直接授予或撤銷）';

-- --------------------------------------------------------

--
-- 資料表結構 `sys_user_roles`
--

CREATE TABLE `sys_user_roles` (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT '主鍵',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT '使用者 ID（sys_admin.id）',
  `role_id` bigint(20) UNSIGNED NOT NULL COMMENT '角色 ID',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='使用者角色關聯表';

--
-- 傾印資料表的資料 `sys_user_roles`
--

INSERT INTO `sys_user_roles` (`id`, `user_id`, `role_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-12-30 07:02:22', '2025-12-30 07:02:22'),
(2, 2, 2, '2025-12-30 07:02:22', '2025-12-30 07:02:22');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `company_base`
--
ALTER TABLE `company_base`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `sys_admin`
--
ALTER TABLE `sys_admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_username` (`username`);

--
-- 資料表索引 `sys_module`
--
ALTER TABLE `sys_module`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `sys_permissions`
--
ALTER TABLE `sys_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_name` (`name`),
  ADD KEY `idx_module_id` (`module_id`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- 資料表索引 `sys_roles`
--
ALTER TABLE `sys_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_name` (`name`);

--
-- 資料表索引 `sys_role_permissions`
--
ALTER TABLE `sys_role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  ADD KEY `idx_role_id` (`role_id`),
  ADD KEY `idx_permission_id` (`permission_id`);

--
-- 資料表索引 `sys_structure`
--
ALTER TABLE `sys_structure`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_parent_id` (`parent_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- 資料表索引 `sys_user_permissions`
--
ALTER TABLE `sys_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_permission` (`user_id`,`permission_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_permission_id` (`permission_id`);

--
-- 資料表索引 `sys_user_roles`
--
ALTER TABLE `sys_user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_role_id` (`role_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `company_base`
--
ALTER TABLE `company_base`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵', AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `sys_admin`
--
ALTER TABLE `sys_admin`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵', AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `sys_module`
--
ALTER TABLE `sys_module`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `sys_permissions`
--
ALTER TABLE `sys_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `sys_roles`
--
ALTER TABLE `sys_roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵', AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `sys_role_permissions`
--
ALTER TABLE `sys_role_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `sys_structure`
--
ALTER TABLE `sys_structure`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `sys_user_permissions`
--
ALTER TABLE `sys_user_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `sys_user_roles`
--
ALTER TABLE `sys_user_roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵', AUTO_INCREMENT=3;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `app_case_msg`
--
ALTER TABLE `app_case_msg`
  ADD CONSTRAINT `fk_app_case_form_case_id` FOREIGN KEY (`case_id`) REFERENCES `app_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `sys_permissions`
--
ALTER TABLE `sys_permissions`
  ADD CONSTRAINT `fk_permissions_module` FOREIGN KEY (`module_id`) REFERENCES `sys_module` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- 資料表的限制式 `sys_role_permissions`
--
ALTER TABLE `sys_role_permissions`
  ADD CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `sys_permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `sys_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `sys_structure`
--
ALTER TABLE `sys_structure`
  ADD CONSTRAINT `fk_structure_parent` FOREIGN KEY (`parent_id`) REFERENCES `sys_structure` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `sys_user_permissions`
--
ALTER TABLE `sys_user_permissions`
  ADD CONSTRAINT `fk_user_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `sys_permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `sys_admin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `sys_user_roles`
--
ALTER TABLE `sys_user_roles`
  ADD CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `sys_roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `sys_admin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
