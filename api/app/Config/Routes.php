<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->get('/test-db-connection', 'testDbConnection::index');
$routes->get('/test-db-connection2', 'testDbConnection2::index');
$routes->get('/test-cors', 'TestCors::index');
$routes->get('/test-jwt', 'TestJWT::index');
$routes->post('/test-login', 'TestLogin::index');
$routes->get('/clear-rate-limit', 'ClearRateLimit::index'); // 僅用於開發測試
$routes->get('/debug-auth', 'Home::debugAuth'); // 僅除錯用，確認後移除

// 密碼雜湊工具（用於產生管理員密碼雜湊值）
$routes->get('/password-hash', 'PasswordHashController::hash');

// 讓 preflight OPTIONS 不落 404（CORS filter 仍會附加 headers）
$routes->options('/(:any)', 'Home::options');
$routes->post('/admins/add', 'AdminsController::addAdmin');
$routes->post('/admins/update', 'AdminsController::updateAdmin');
$routes->post('/admins/delete', 'AdminsController::deleteAdmin');
$routes->get('/admins/get', 'AdminsController::getAdmins');
$routes->get('/admins/get-by-id', 'AdminsController::getAdminById');
$routes->post('/admins/login', 'AuthController::login');
$routes->post('/admins/refresh', 'AuthController::refresh');
$routes->get('/admins/me', 'AuthController::me');
$routes->post('/admins/logout', 'AuthController::logout');

// 系統架構層級相關路由
$routes->post('/structure/add', 'StructureController::add');
$routes->post('/structure/update', 'StructureController::update');
$routes->post('/structure/update-sort-order', 'StructureController::updateSortOrder');
$routes->post('/structure/delete', 'StructureController::delete');
$routes->get('/structure/get', 'StructureController::get');

// 模組相關路由
$routes->post('/module/add', 'ModuleController::add');
$routes->post('/module/update', 'ModuleController::update');
$routes->post('/module/delete', 'ModuleController::delete');
$routes->get('/module/get', 'ModuleController::get');

// 上傳圖片相關路由
$routes->post('/upload/image', 'UploadController::image');
$routes->post('/upload/admins', 'UploadController::admins');
$routes->post('/upload/product-category', 'UploadController::productCategory');
$routes->post('/upload/product', 'UploadController::productImage');
$routes->post('/upload/lecturer', 'UploadController::lecturer');
$routes->post('/upload/breakout-session', 'UploadController::breakoutSession');

// 角色相關路由
$routes->get('/role/get', 'RoleController::get');
$routes->get('/role/get-by-id', 'RoleController::getById');
$routes->post('/role/add', 'RoleController::add');
$routes->post('/role/update', 'RoleController::update');
$routes->post('/role/delete', 'RoleController::delete');

// 權限相關路由
$routes->get('/permission/get', 'PermissionController::get');
$routes->get('/permission/get-by-id', 'PermissionController::getById');
$routes->post('/permission/add', 'PermissionController::add');
$routes->post('/permission/update', 'PermissionController::update');
$routes->post('/permission/delete', 'PermissionController::delete');
$routes->post('/permission/update-sort-order', 'PermissionController::updateSortOrder');

// 公司基本資料相關路由
$routes->get('/company-base/get', 'CompanyBaseController::get');
$routes->post('/company-base/save', 'CompanyBaseController::save');

// 議程管理
$routes->get('/agenda/get', 'AgendaController::get');
$routes->post('/agenda/save', 'AgendaController::save');

// 論壇介紹
$routes->get('/forum/get', 'ForumController::get');
$routes->post('/forum/save', 'ForumController::save');

// 主辦單位介紹
$routes->get('/organizer/get', 'OrganizerController::get');
$routes->post('/organizer/save', 'OrganizerController::save');

// 講師管理
$routes->get('/lecturer/get', 'LecturerController::get');
$routes->get('/lecturer/get-by-id', 'LecturerController::getById');
$routes->post('/lecturer/add', 'LecturerController::add');
$routes->post('/lecturer/update', 'LecturerController::update');
$routes->post('/lecturer/update-sort-order', 'LecturerController::updateSortOrder');
$routes->post('/lecturer/delete', 'LecturerController::delete');

// 分組討論管理
$routes->get('/breakout-session/get', 'BreakoutSessionController::get');
$routes->get('/breakout-session/get-by-id', 'BreakoutSessionController::getById');
$routes->get('/breakout-session/get-lecturers', 'BreakoutSessionController::getLecturers');
$routes->get('/breakout-session/get-lecturer-by-id', 'BreakoutSessionController::getLecturerById');
$routes->post('/breakout-session/add', 'BreakoutSessionController::add');
$routes->post('/breakout-session/update', 'BreakoutSessionController::update');
$routes->post('/breakout-session/update-sort-order', 'BreakoutSessionController::updateSortOrder');
$routes->post('/breakout-session/delete', 'BreakoutSessionController::delete');
$routes->post('/breakout-session/add-lecturer', 'BreakoutSessionController::addLecturer');
$routes->post('/breakout-session/update-lecturer', 'BreakoutSessionController::updateLecturer');
$routes->post('/breakout-session/update-lecturer-sort-order', 'BreakoutSessionController::updateLecturerSortOrder');
$routes->post('/breakout-session/delete-lecturer', 'BreakoutSessionController::deleteLecturer');

// Dashboard 統計（需登入）
$routes->get('/dashboard/stats', 'DashboardController::getStats');
