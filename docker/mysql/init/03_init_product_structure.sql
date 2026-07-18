-- 產品管理側邊欄：依 sys_structure + sys_module 架構新增
-- 側邊欄由 buildStructureMenu(structureData) 產生，權限為 {url}.view

SET NAMES utf8mb4;

-- 1. sys_structure：新增「產品管理」父節點，以及「產品分類」「產品列表」兩個子節點
--    子節點 url 會成為連結路徑與權限名稱前綴（例如：product/category.view）
SET @product_root_id := NULL;

INSERT INTO `sys_structure` (`parent_id`, `label`, `alias`, `module_id`, `url`, `is_show_frontend`, `is_show_backend`, `status`, `sort_order`)
VALUES (NULL, '產品管理', 'Product', NULL, NULL, 0, 1, 1, 10);

SET @product_root_id := LAST_INSERT_ID();

-- 產品分類（對應 /product/category）
INSERT INTO `sys_structure` (`parent_id`, `label`, `alias`, `module_id`, `url`, `is_show_frontend`, `is_show_backend`, `status`, `sort_order`)
VALUES (@product_root_id, '產品分類', 'Product Categories', NULL, 'product/category', 0, 1, 1, 0);

-- 產品列表（對應 /product/product）
INSERT INTO `sys_structure` (`parent_id`, `label`, `alias`, `module_id`, `url`, `is_show_frontend`, `is_show_backend`, `status`, `sort_order`)
VALUES (@product_root_id, '產品列表', 'Product List', NULL, 'product/product', 0, 1, 1, 1);

-- 2. sys_permissions：對應 hasItemPermission 的 permissionName = url + '.view'
INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
VALUES ('product/category.view', '產品分類（檢視）', '檢視產品分類', NULL, NULL, 'view', 1, 0);

INSERT INTO `sys_permissions` (`name`, `label`, `description`, `module_id`, `category`, `action`, `status`, `sort_order`)
VALUES ('product/product.view', '產品列表（檢視）', '檢視產品列表', NULL, NULL, 'view', 1, 0);

-- 3. sys_role_permissions：讓超級管理員與管理員角色擁有產品分類與產品列表權限
INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'product/category.view';

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'product/category.view';

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `sys_permissions` WHERE `name` = 'product/product.view';

INSERT INTO `sys_role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `sys_permissions` WHERE `name` = 'product/product.view';
