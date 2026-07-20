-- 論壇介紹、主辦單位介紹：app_forum / app_organizer
-- 對應後台：/forum、/organizer（單筆內容編輯）

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 論壇介紹
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_forum` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵',
  `content_tw` mediumtext DEFAULT NULL COMMENT '中文內容',
  `content_en` mediumtext DEFAULT NULL COMMENT '英文內容',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='論壇介紹';

-- ---------------------------------------------------------------------------
-- 主辦單位介紹
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_organizer` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主鍵',
  `content_tw` mediumtext DEFAULT NULL COMMENT '中文內容',
  `content_en` mediumtext DEFAULT NULL COMMENT '英文內容',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '建立時間',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='主辦單位介紹';

-- ---------------------------------------------------------------------------
-- 範例資料（來自前台首頁文案）
-- ---------------------------------------------------------------------------
INSERT INTO `app_forum` (`content_tw`, `content_en`)
SELECT
  '動物福利已成為全球文明社會的重要指標之一，亦與公共衛生、社會安全及生命教育密切相關。台灣政府不斷推出動物保護政策以加強動物福利及動保觀念，2017年推動零撲殺政策，在動物保護制度上逐步建立具人道精神的治理模式，但隨著時間的流逝，全臺灣流浪動物的衝突卻未見止息，去年在高雄市永安區更迸發浪犬咬死泳客的悲劇，野生動物因為浪犬産生無數的消亡，如何解決流浪犬問題正是刻不容緩的議題。

2026國際動物保護論壇透過國際遊蕩犬現況及野外族群控制、源頭管理與犬隻總量管制、産業影響力帶動社會動保參與、收容管理與永續經營及協會獨步全球的狗來富專案等五大議題進行國際交流，分享臺灣經驗並促進國際動物保護合作，一同凝聚臺灣動物保護福利及流浪動物的新解方。',
  'Animal welfare has become a key indicator of civil society worldwide, closely intertwined with public health, social safety, and life education. The Taiwanese government has continuously introduced animal protection policies to strengthen animal welfare and public awareness. Notably, the implementation of the "zero-euthanasia" policy in 2017 marked a gradual shift toward a governance model rooted in humanitarian principles. However, despite these efforts, conflicts surrounding stray animals across Taiwan have not ceased. Last year, a tragedy occurred in the Yongan District of Kaohsiung City, where a swimmer was fatally attacked by roaming dogs; furthermore, countless wildlife species continue to perish due to conflicts with free-ranging dogs. Addressing the issue of stray dogs has truly become a matter of utmost urgency.

The 2026 International Animal Protection Forum serves as a platform for global exchange, focusing on five core themes:
1. International Status of Roaming Dogs and Free-Ranging Population Control.
2. Source Management and Dog Population Caps.
3. Driving Social Engagement in Animal Protection via Industry Influence.
4. Shelter Management and Sustainable Operations; and
5. The APA''s Globally Unique "Go Home Project."

By sharing Taiwan''s experiences and fostering international cooperation in animal protection, this forum aims to collectively forge innovative solutions for animal welfare and stray animal management in Taiwan.'
WHERE NOT EXISTS (SELECT 1 FROM `app_forum` LIMIT 1);

INSERT INTO `app_organizer` (`content_tw`, `content_en`)
SELECT
  '成立於民國49年6月4日的中華民國保護動物協會，至今已有超過60年歷史，在過去的歳月中，除致力於宣導動物保護觀念外，也設立了動物保育場，從事流浪動物收容工作。分別於民國78年及87年催生「野生動物保育法」與「動物保護法」。近年來協會更是擴大社會責任，開辦「狗來富專案」、「寵物食物銀行」等勸募活動，並開設動物保護志工培訓課程培育動保所需志工，透過多元的方式增進動物福利進而解決流浪動物所造成的社會問題。',
  'Founded on June 4, 1960, the Animal Protection Association of the Republic of China (APA) boasts a history spanning over six decades. Throughout its years of dedication, the Association has not only championed the core concepts of animal protection but also established animal shelters dedicated to the rescue and care of stray animals. Notably, the APA played a pivotal role in promoting and establishing the Wildlife Conservation Act in 1989 and the Animal Protection Act in 1998.

In recent years, the Association has further expanded its social responsibility by launching public fundraising initiatives such as the "Go Home Project" (for rehoming stray dogs) and the "Pet Food Bank." Furthermore, it offers animal protection volunteer training programs to cultivate professional talent in the field. Through these diverse strategies, the APA continues to enhance animal welfare and proactively address the social challenges associated with stray animals.'
WHERE NOT EXISTS (SELECT 1 FROM `app_organizer` LIMIT 1);

-- ---------------------------------------------------------------------------
-- 後台選單與權限
-- ---------------------------------------------------------------------------
SET @forum_exists := (
  SELECT COUNT(*) FROM `sys_structure` WHERE `url` = 'forum'
);

INSERT INTO `sys_structure` (`parent_id`, `label`, `alias`, `module_id`, `url`, `is_show_frontend`, `is_show_backend`, `status`, `sort_order`)
SELECT NULL, '論壇介紹', 'Forum', NULL, 'forum', 0, 1, 1, 10
WHERE @forum_exists = 0;

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
SELECT 'forum.view', '論壇介紹（檢視）', '檢視論壇介紹', NULL, NULL, 'view', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM `sys_permissions` WHERE `name` = 'forum.view');

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
SELECT 'forum.edit', '論壇介紹（編輯）', '編輯論壇介紹', NULL, NULL, 'edit', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM `sys_permissions` WHERE `name` = 'forum.edit');

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'forum.view'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 1 AND p.name = 'forum.view'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'forum.edit'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 1 AND p.name = 'forum.edit'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'forum.view'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 2 AND p.name = 'forum.view'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'forum.edit'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 2 AND p.name = 'forum.edit'
);

SET @organizer_exists := (
  SELECT COUNT(*) FROM `sys_structure` WHERE `url` = 'organizer'
);

INSERT INTO `sys_structure` (`parent_id`, `label`, `alias`, `module_id`, `url`, `is_show_frontend`, `is_show_backend`, `status`, `sort_order`)
SELECT NULL, '主辦單位介紹', 'Organizer', NULL, 'organizer', 0, 1, 1, 11
WHERE @organizer_exists = 0;

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
SELECT 'organizer.view', '主辦單位介紹（檢視）', '檢視主辦單位介紹', NULL, NULL, 'view', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM `sys_permissions` WHERE `name` = 'organizer.view');

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
SELECT 'organizer.edit', '主辦單位介紹（編輯）', '編輯主辦單位介紹', NULL, NULL, 'edit', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM `sys_permissions` WHERE `name` = 'organizer.edit');

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'organizer.view'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 1 AND p.name = 'organizer.view'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'organizer.edit'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 1 AND p.name = 'organizer.edit'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'organizer.view'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 2 AND p.name = 'organizer.view'
);

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'organizer.edit'
AND NOT EXISTS (
  SELECT 1 FROM `sys_role_permissions` rp
  INNER JOIN `sys_permissions` p ON p.id = rp.permission_id
  WHERE rp.role_id = 2 AND p.name = 'organizer.edit'
);
