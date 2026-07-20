<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\CLIRequest;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;
use App\Models\UserRoleModel;
use App\Models\UserPermissionModel;
use App\Models\RolePermissionModel;
use App\Models\PermissionModel;
use App\Models\SysAdminModel;

/**
 * Class BaseController
 *
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 * Extend this class in any new controllers:
 *     class Home extends BaseController
 *
 * For security be sure to declare any new methods as protected or private.
 */
abstract class BaseController extends Controller
{
    /**
     * Instance of the main Request object.
     *
     * @var CLIRequest|IncomingRequest
     */
    protected $request;

    /**
     * An array of helpers to be loaded automatically upon
     * class instantiation. These helpers will be available
     * to all other controllers that extend BaseController.
     *
     * @var list<string>
     */
    protected $helpers = [];

    /**
     * 資源名稱，用於共用訊息中的 {resource} 佔位符（如「歷史記錄」、「影片」）。
     * 子類別覆寫此屬性即可共用 BaseController 的預設訊息範本。
     *
     * @var string
     */
    protected $resourceName = '資料';

    /**
     * 共用訊息（錯誤／成功）。由 initController 依預設範本 + $resourceName 產生；
     * 子類別可覆寫 $messages 的個別 key 以自訂文案。
     *
     * @var array<string, string>
     */
    protected $messages = [];

    /**
     * 預設訊息範本（含 {resource} 佔位符）。子類別覆寫 $messages 時會與此合併後再替換。
     *
     * @return array<string, string>
     */
    private static function getDefaultMessageTemplates(): array
    {
        return [
            // 缺少ID
            'missing_id' => '缺少{resource} ID (' . ResponseInterface::HTTP_BAD_REQUEST . ')',
            // 不存在
            'not_found' => '{resource}不存在 (' . ResponseInterface::HTTP_NOT_FOUND . ')',
            // 取得失敗
            'get_failed' => '取得{resource}失敗，請稍後再試 (' . ResponseInterface::HTTP_INTERNAL_SERVER_ERROR . ')',
            // 驗證失敗
            'validation_failed' => '驗證失敗 (' . ResponseInterface::HTTP_UNPROCESSABLE_ENTITY . ')',
            // 新增
            'add_failed' => '新增{resource}失敗，請稍後再試 (' . ResponseInterface::HTTP_INTERNAL_SERVER_ERROR . ')',
            'add_success' => '新增{resource}成功，即將導向列表頁面',
            // 更新
            'no_update' => '沒有需要更新的資料',
            'update_failed' => '更新{resource}失敗，請稍後再試 (' . ResponseInterface::HTTP_INTERNAL_SERVER_ERROR . ')',
            'update_success' => '更新{resource}成功，即將導向列表頁面',
            // 刪除
            'delete_failed' => '刪除{resource}失敗，請稍後再試 (' . ResponseInterface::HTTP_INTERNAL_SERVER_ERROR . ')',
            'delete_success' => '刪除{resource}成功',
            // 提交表單
            'submit_failed' => '提交表單失敗，請稍後再試 (' . ResponseInterface::HTTP_INTERNAL_SERVER_ERROR . ')',
            'submit_success' => '表單提交成功，我們將盡快與您聯繫',
            // 狀態
            'update_status_failed' => '更新狀態失敗，請稍後再試 (' . ResponseInterface::HTTP_INTERNAL_SERVER_ERROR . ')',
            'update_status_success' => '更新狀態成功',
            // 回信
            'update_reply_failed' => '更新回信失敗，請稍後再試 (' . ResponseInterface::HTTP_INTERNAL_SERVER_ERROR . ')',
            'update_reply_success' => '更新回信成功',
            'no_reply' => '回信內容為空，請先填寫回信內容',
            // 寄信
            'invalid_email' => '收件人信箱無效',
            'send_email_success' => '郵件發送成功',
            'send_email_failed' => '發送郵件失敗，請稍後再試',
        ];
    }

    /**
     * Be sure to declare properties for any property fetch you initialized.
     * The creation of dynamic property is deprecated in PHP 8.2.
     */
    // protected $session;

    /**
     * @return void
     */
    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        // Do Not Edit This Line
        parent::initController($request, $response, $logger);

        // Preload any models, libraries, etc, here.

        // E.g.: $this->session = service('session');

        // 合併預設訊息範本與子類別覆寫，再將 {resource} 替換為實際資源名稱
        $templates = array_merge(self::getDefaultMessageTemplates(), $this->messages);
        $resourceName = $this->resourceName;
        $this->messages = array_map(
            static fn (string $msg): string => str_replace('{resource}', $resourceName, $msg),
            $templates
        );
    }

    /**
     * 檢查使用者是否已登入
     * 
     * 優先從 JWT Token 取得使用者資訊（由 AuthFilter 設定在 X-User-Data header）
     * 如果沒有，則從 Session 取得（向後兼容）
     * 
     * @return array|null 使用者資料，如果未登入則返回 null
     */
    protected function checkAuth()
    {
        // 優先從 JWT Token 取得使用者資訊（由 AuthFilter 設定）
        $userDataJson = $this->request->getHeaderLine('X-User-Data');
        
        if (!empty($userDataJson)) {
            $user = json_decode($userDataJson, true);
            
            if ($user && is_array($user)) {
                // 檢查帳號狀態
                if (isset($user['status']) && (int) $user['status'] !== 1) {
                    $this->response->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)->setJSON([
                        'success' => false,
                        'message' => '帳號已停用',
                    ])->send();
                    exit();
                }
                
                return $user;
            }
        }
        
        // 向後兼容：從 Session 取得（如果沒有 JWT Token）
        $session = session();
        $user = $session->get('admin_user');
        
        if (!$user) {
            $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                'success' => false,
                'message' => '尚未登入，請先登入',
            ])->send();
            exit();
        }
        
        // 檢查帳號狀態
        if (isset($user['status']) && (int) $user['status'] !== 1) {
            $session->remove('admin_user');
            $session->destroy();
            
            $this->response->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)->setJSON([
                'success' => false,
                'message' => '帳號已停用',
            ])->send();
            exit();
        }
        
        return $user;
    }

    /** JWT 為 user_id，Session 為 id */
    protected function getAuthUserId(array $user): int
    {
        return (int) ($user['id'] ?? $user['user_id'] ?? 0);
    }

    /**
     * 驗證後台 sys_admin 登入密碼（邏輯與 AuthController::login 一致）
     *
     * @param array<string, mixed> $user
     */
    protected function verifySysAdminPassword(array $user, string $password): bool
    {
        if ($password === '') {
            return false;
        }

        $userId = $this->getAuthUserId($user);
        if ($userId <= 0) {
            return false;
        }

        $admin = (new SysAdminModel())->find($userId);
        if (! is_array($admin) || $admin === []) {
            return false;
        }

        $stored = (string) ($admin['password_hash'] ?? '');
        if ($stored === '') {
            return false;
        }

        $isFirstLogin = (int) ($admin['is_first_login'] ?? 0) === 1;
        if ($isFirstLogin) {
            return hash_equals($stored, $password) || password_verify($password, $stored);
        }

        return password_verify($password, $stored);
    }

    /**
     * 刪除操作前驗證登入密碼；通過回傳 null，失敗回傳 JSON 錯誤 Response。
     *
     * @param array<string, mixed> $user
     */
    protected function verifyDeletePasswordResponse(array $user, string $password): ?ResponseInterface
    {
        if ($password === '') {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => '請輸入登入密碼',
            ]);
        }

        if (! $this->verifySysAdminPassword($user, $password)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => '密碼錯誤',
            ]);
        }

        return null;
    }

    /**
     * 檢查使用者是否有指定權限
     * 
     * @param string $permission 權限名稱
     * @return bool 是否有權限
     */
    protected function checkPermission($permission)
    {
        $user = $this->checkAuth();
        $userId = $this->getAuthUserId($user);
        
        // 檢查是否為超級管理員
        if ($this->isSuperAdmin($userId)) {
            return true;
        }
        
        // 取得使用者權限
        $userPermissions = $this->getUserPermissions($userId);
        
        if (!in_array($permission, $userPermissions)) {
            log_message('warning', 'Permission denied: User ' . ($user['username'] ?? $userId) . ' attempted to access ' . $permission);
            
            $this->response->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)->setJSON([
                'success' => false,
                'message' => '沒有權限執行此操作',
            ])->send();
            exit();
        }
        
        return true;
    }

    /**
     * 檢查使用者是否為超級管理員
     * 
     * @param int $userId
     * @return bool
     */
    protected function isSuperAdmin($userId)
    {
        $userRoleModel = new UserRoleModel();
        $isSuperAdmin = $userRoleModel
            ->select('sys_roles.name')
            ->join('sys_roles', 'sys_roles.id = sys_user_roles.role_id')
            ->where('sys_user_roles.user_id', $userId)
            ->where('sys_roles.name', 'super_admin')
            ->where('sys_roles.status', 1)
            ->first();
        
        return !empty($isSuperAdmin);
    }

    /**
     * 取得使用者的所有權限（從角色和直接授予的權限）
     * 
     * @param int $userId
     * @return array 權限名稱陣列
     */
    protected function getUserPermissions($userId)
    {
        $permissions = [];
        $permissionIds = [];
        
        $userRoleModel = new UserRoleModel();
        $rolePermissionModel = new RolePermissionModel();
        $userPermissionModel = new UserPermissionModel();
        $permissionModel = new PermissionModel();
        
        // 從角色獲取權限
        $userRoles = $userRoleModel->where('user_id', $userId)->findAll();
        foreach ($userRoles as $userRole) {
            $rolePermissions = $rolePermissionModel
                ->where('role_id', $userRole['role_id'])
                ->findAll();
            foreach ($rolePermissions as $rp) {
                if (!in_array($rp['permission_id'], $permissionIds)) {
                    $permissionIds[] = $rp['permission_id'];
                }
            }
        }
        
        // 從直接授予的權限獲取（is_granted = 1）
        $directPermissions = $userPermissionModel
            ->where('user_id', $userId)
            ->where('is_granted', 1)
            ->findAll();
        foreach ($directPermissions as $dp) {
            if (!in_array($dp['permission_id'], $permissionIds)) {
                $permissionIds[] = $dp['permission_id'];
            }
        }
        
        // 移除被撤銷的權限（is_granted = 0）
        $revokedPermissions = $userPermissionModel
            ->where('user_id', $userId)
            ->where('is_granted', 0)
            ->findAll();
        $revokedIds = array_column($revokedPermissions, 'permission_id');
        $permissionIds = array_diff($permissionIds, $revokedIds);
        
        // 取得權限詳細資料
        if (!empty($permissionIds)) {
            $permissionList = $permissionModel
                ->whereIn('id', $permissionIds)
                ->where('status', 1)
                ->findAll();
            $permissions = array_column($permissionList, 'name');
        }
        
        return $permissions;
    }
}
