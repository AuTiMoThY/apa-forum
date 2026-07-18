<?php
namespace App\Controllers;

use App\Models\SysAdminModel;
use App\Models\UserRoleModel;
use App\Models\UserPermissionModel;
use App\Models\RoleModel;
use App\Models\PermissionModel;
use App\Models\RolePermissionModel;
use App\Libraries\JWTService;
use CodeIgniter\HTTP\ResponseInterface;

class AuthController extends BaseController
{
    protected $userModel;
    protected $userRoleModel;
    protected $userPermissionModel;
    protected $roleModel;
    protected $permissionModel;
    protected $rolePermissionModel;
    protected $jwtService;

    public function __construct()
    {
        $this->userModel = new SysAdminModel();
        $this->userRoleModel = new UserRoleModel();
        $this->userPermissionModel = new UserPermissionModel();
        $this->roleModel = new RoleModel();
        $this->permissionModel = new PermissionModel();
        $this->rolePermissionModel = new RolePermissionModel();
        $this->jwtService = new JWTService();
    }

    /**
     * 取得使用者的所有權限（從角色和直接授予的權限）
     */
    protected function getUserPermissions($userId)
    {
        $permissions = [];
        $permissionIds = [];

        // 從角色獲取權限
        $userRoles = $this->userRoleModel->where('user_id', $userId)->findAll();
        foreach ($userRoles as $userRole) {
            $rolePermissions = $this->rolePermissionModel
                ->where('role_id', $userRole['role_id'])
                ->findAll();
            foreach ($rolePermissions as $rp) {
                if (!in_array($rp['permission_id'], $permissionIds)) {
                    $permissionIds[] = $rp['permission_id'];
                }
            }
        }

        // 從直接授予的權限獲取（is_granted = 1）
        $directPermissions = $this->userPermissionModel
            ->where('user_id', $userId)
            ->where('is_granted', 1)
            ->findAll();
        foreach ($directPermissions as $dp) {
            if (!in_array($dp['permission_id'], $permissionIds)) {
                $permissionIds[] = $dp['permission_id'];
            }
        }

        // 移除被撤銷的權限（is_granted = 0）
        $revokedPermissions = $this->userPermissionModel
            ->where('user_id', $userId)
            ->where('is_granted', 0)
            ->findAll();
        $revokedIds = array_column($revokedPermissions, 'permission_id');
        $permissionIds = array_diff($permissionIds, $revokedIds);

        // 取得權限詳細資料
        if (!empty($permissionIds)) {
            $permissionList = $this->permissionModel
                ->whereIn('id', $permissionIds)
                ->where('status', 1)
                ->findAll();
            $permissions = array_column($permissionList, 'name');
        }

        return $permissions;
    }

    /**
     * 取得使用者的所有角色
     */
    protected function getUserRoles($userId)
    {
        $roles = [];
        $userRoles = $this->userRoleModel
            ->select('sys_roles.*')
            ->join('sys_roles', 'sys_roles.id = sys_user_roles.role_id', 'inner')
            ->where('sys_user_roles.user_id', $userId)
            ->where('sys_roles.status', 1)
            ->findAll();

        return $userRoles;
    }
    /**
     * 管理員登入：驗證帳號密碼並生成 JWT Token
     */
    public function login()
    {
        // 記錄登入請求開始
        log_message('info', '=== Login request started ===');
        log_message('info', 'IP: ' . $this->request->getIPAddress());
        log_message('info', 'User-Agent: ' . $this->request->getUserAgent()->getAgentString());

        try {
            // 嘗試從 JSON 或 POST 取得資料
            $payload = null;
            $contentType = $this->request->getHeaderLine('Content-Type');
            log_message('debug', 'Content-Type: ' . $contentType);

            if (strpos($contentType, 'application/json') !== false) {
                // 如果是 JSON 請求，嘗試解析
                log_message('debug', 'Attempting to parse JSON request');
                try {
                    $payload = $this->request->getJSON(true);
                    log_message('debug', 'JSON parsed successfully via getJSON()');
                } catch (\Exception $e) {
                    log_message('warning', 'getJSON() failed: ' . $e->getMessage());
                    // JSON 解析失敗，嘗試從原始輸入解析
                    $rawInput = $this->request->getBody();
                    log_message('debug', 'Raw body length: ' . strlen($rawInput));
                    if (!empty($rawInput)) {
                        $payload = json_decode($rawInput, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            log_message('error', 'JSON parse error: ' . json_last_error_msg() . ' | Raw input: ' . substr($rawInput, 0, 200));
                            $payload = null;
                        } else {
                            log_message('debug', 'JSON parsed successfully via json_decode()');
                        }
                    } else {
                        log_message('warning', 'Raw body is empty');
                    }
                }
            }

            // 如果 JSON 解析失敗，嘗試從 POST 取得
            if ($payload === null || empty($payload)) {
                log_message('debug', 'Attempting to get data from POST');
                $payload = $this->request->getPost();
                log_message('debug', 'POST data: ' . json_encode($payload));
            }

            // 記錄收到的資料
            log_message('info', 'Login payload received: ' . json_encode($payload));
            log_message('info', 'Raw body (first 200 chars): ' . substr($this->request->getBody(), 0, 200));

            $rules = [
                'username' => 'required',
                'password' => 'required',
            ];

            log_message('debug', 'Validating payload with rules: ' . json_encode($rules));
            if (!$this->validateData($payload, $rules)) {
                $errors = $this->validator->getErrors();
                log_message('warning', 'Validation failed: ' . json_encode($errors));
                return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                    'success' => false,
                    'message' => '請提供帳號與密碼',
                    'errors' => $errors,
                ]);
            }
            log_message('debug', 'Validation passed');

            log_message('debug', 'Querying user: ' . ($payload['username'] ?? 'NULL'));
            $admin = $this->userModel->where('username', $payload['username'])->first();
            log_message('debug', 'User query result: ' . ($admin ? 'Found (ID: ' . $admin['id'] . ')' : 'Not found'));

            if (!$admin) {
                // HTTP_UNAUTHORIZED = 401 (未授權)
                return $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                    'success' => false,
                    'message' => '帳號不存在',
                ]);
            }

            if ((int) $admin['status'] !== 1) {
                // HTTP_FORBIDDEN = 403 (禁止存取)
                return $this->response->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)->setJSON([
                    'success' => false,
                    'message' => '帳號已停用',
                ]);
            }

            if (!password_verify($payload['password'], $admin['password_hash'])) {
                // HTTP_UNAUTHORIZED = 401 (未授權)
                return $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                    'success' => false,
                    'message' => '密碼錯誤',
                ]);
            }

            // 取得使用者的角色和權限
            log_message('debug', 'Getting user roles and permissions for user ID: ' . $admin['id']);
            try {
                $roles = $this->getUserRoles($admin['id']);
                $permissions = $this->getUserPermissions($admin['id']);
                log_message('debug', 'Roles count: ' . count($roles) . ', Permissions count: ' . count($permissions));
            } catch (\Exception $e) {
                log_message('error', 'Failed to get user roles/permissions: ' . $e->getMessage());
                log_message('error', 'Stack trace: ' . $e->getTraceAsString());
                // 如果取得角色和權限失敗，使用空陣列
                $roles = [];
                $permissions = [];
            }

            // 準備 Token Payload
            $tokenPayload = [
                'sub' => (string) $admin['id'],
                'user_id' => (int) $admin['id'],
                'username' => $admin['username'],
                'name' => $admin['name'],
                'permission_name' => $admin['permission_name'],
                'status' => (int) $admin['status'],
                'roles' => $roles,
                'permissions' => $permissions,
            ];

            // 生成 Access Token
            log_message('debug', 'Generating access token for user ID: ' . $admin['id']);
            try {
                $accessToken = $this->jwtService->generateAccessToken($tokenPayload);
                log_message('debug', 'Access token generated successfully (length: ' . strlen($accessToken) . ')');
            } catch (\Exception $e) {
                log_message('error', 'Failed to generate access token: ' . $e->getMessage());
                log_message('error', 'File: ' . $e->getFile() . ', Line: ' . $e->getLine());
                log_message('error', 'Stack trace: ' . $e->getTraceAsString());
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => 'Token 生成失敗',
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]);
            }

            // 生成 Refresh Token
            log_message('debug', 'Generating refresh token for user ID: ' . $admin['id']);
            try {
                $refreshToken = $this->jwtService->generateRefreshToken($admin['id']);
                log_message('debug', 'Refresh token generated successfully (length: ' . strlen($refreshToken) . ')');
            } catch (\Exception $e) {
                log_message('error', 'Failed to generate refresh token: ' . $e->getMessage());
                log_message('error', 'File: ' . $e->getFile() . ', Line: ' . $e->getLine());
                log_message('error', 'Stack trace: ' . $e->getTraceAsString());
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => 'Refresh Token 生成失敗',
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]);
            }

            // 準備使用者資料（不包含敏感資訊）
            $user = [
                'id' => $admin['id'],
                'permission_name' => $admin['permission_name'],
                'status' => (int) $admin['status'],
                'username' => $admin['username'],
                'name' => $admin['name'],
                'phone' => $admin['phone'],
                'created_at' => $admin['created_at'],
                'updated_at' => $admin['updated_at'],
                'roles' => $roles,
                'permissions' => $permissions,
            ];

            // 設定 Refresh Token 為 httpOnly Cookie
            // 檢查實際連線是否為 HTTPS（而不是只檢查環境變數）
            // 在開發環境使用 HTTP 時，secure 必須設為 false
            $isSecure = $this->request->isSecure(); // 檢查實際連線是否為 HTTPS
            $cookieExpire = time() + config('JWT')->refreshTokenExpiration;
            log_message('debug', 'Setting refresh_token cookie (expires: ' . $cookieExpire . ', secure: ' . ($isSecure ? 'yes' : 'no') . ', isHTTPS: ' . ($this->request->isSecure() ? 'true' : 'false') . ')');
            try {
                // CodeIgniter 4 的 setCookie 方法：setCookie(name, value, expire, domain, path, prefix, secure, httponly, samesite)
                $this->response->setCookie(
                    'refresh_token',
                    $refreshToken,
                    $cookieExpire,  // expires (int)
                    '',            // domain
                    '/',           // path
                    '',            // prefix
                    $isSecure,     // secure - 根據實際連線決定，不是環境變數
                    true,          // httponly
                    'Strict'       // samesite
                );
                log_message('debug', 'Cookie set successfully');
            } catch (\Exception $e) {
                // 如果 Cookie 設定失敗，記錄錯誤但不中斷流程
                log_message('error', 'Failed to set refresh_token cookie: ' . $e->getMessage());
                log_message('error', 'File: ' . $e->getFile() . ', Line: ' . $e->getLine());
                log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            }

            log_message('info', 'Login successful for user: ' . $admin['username'] . ' (ID: ' . $admin['id'] . ')');
            log_message('info', '=== Login request completed successfully ===');

            return $this->response->setJSON([
                'success' => true,
                'message' => '登入成功',
                'data' => [
                    'user' => $user,
                    'access_token' => $accessToken,
                    'token_type' => 'Bearer',
                    'expires_in' => config('JWT')->accessTokenExpiration,
                ],
            ]);
        } catch (\Throwable $e) {
            // 使用 \Throwable 而不是 \Exception，以捕獲所有錯誤（包括 Error）
            log_message('error', '=== Login request failed ===');
            log_message('error', 'Error type: ' . get_class($e));
            log_message('error', 'Error message: ' . $e->getMessage());
            log_message('error', 'Error file: ' . $e->getFile());
            log_message('error', 'Error line: ' . $e->getLine());
            log_message('error', 'Stack trace:');
            log_message('error', $e->getTraceAsString());

            // 記錄請求資訊以便除錯
            log_message('error', 'Request method: ' . $this->request->getMethod());
            log_message('error', 'Request URI: ' . $this->request->getUri());
            log_message('error', 'Request headers: ' . json_encode($this->request->getHeaders()));
            log_message('error', 'Request body: ' . $this->request->getBody());

            // 強制顯示詳細錯誤以便除錯
            $showDetails = true;

            // 確保回應格式正確
            $errorResponse = [
                'success' => false,
                'message' => '登入時發生錯誤',
                'error' => $showDetails ? $e->getMessage() : 'Internal server error',
            ];

            if ($showDetails) {
                $errorResponse['error_type'] = get_class($e);
                $errorResponse['file'] = $e->getFile();
                $errorResponse['line'] = $e->getLine();
                $errorResponse['trace'] = explode("\n", $e->getTraceAsString());
            }

            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)
                ->setContentType('application/json')
                ->setJSON($errorResponse);
        }
    }
    /**
     * 刷新 Access Token
     */
    public function refresh()
    {
        // 記錄刷新請求開始
        log_message('info', '=== Refresh token request started ===');
        log_message('info', 'IP: ' . $this->request->getIPAddress());
        log_message('info', 'User-Agent: ' . $this->request->getUserAgent()->getAgentString());

        try {
            // 從 Cookie 取得 Refresh Token
            $refreshToken = $this->request->getCookie('refresh_token');

            if (empty($refreshToken)) {
                log_message('warning', 'Refresh token not found in cookie');
                return $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                    'success' => false,
                    'message' => 'Refresh Token 不存在',
                ]);
            }

            log_message('debug', 'Refresh token found in cookie (length: ' . strlen($refreshToken) . ')');

            // 驗證 Refresh Token
            $decoded = $this->jwtService->validateToken($refreshToken);

            if (!$decoded) {
                log_message('warning', 'Refresh token validation failed');
                return $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                    'success' => false,
                    'message' => 'Refresh Token 無效或已過期',
                ]);
            }

            log_message('debug', 'Refresh token validated successfully');

            // 檢查 Token 類型
            if (!isset($decoded->type) || $decoded->type !== 'refresh') {
                log_message('warning', 'Invalid token type: ' . ($decoded->type ?? 'null'));
                return $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                    'success' => false,
                    'message' => '無效的 Token 類型',
                ]);
            }

            // 取得使用者 ID
            $userId = isset($decoded->sub) ? (int) $decoded->sub : null;

            if (!$userId) {
                log_message('warning', 'User ID not found in token payload');
                return $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                    'success' => false,
                    'message' => '無法從 Token 取得使用者資訊',
                ]);
            }

            log_message('debug', 'User ID from token: ' . $userId);

            // 查詢使用者資料
            $admin = $this->userModel->find($userId);

            if (!$admin) {
                log_message('warning', 'User not found: ' . $userId);
                return $this->response->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)->setJSON([
                    'success' => false,
                    'message' => '帳號不存在或已停用',
                ]);
            }

            if ((int) $admin['status'] !== 1) {
                log_message('warning', 'User account disabled: ' . $userId);
                return $this->response->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)->setJSON([
                    'success' => false,
                    'message' => '帳號不存在或已停用',
                ]);
            }

            log_message('debug', 'User found and active: ' . $admin['username'] . ' (ID: ' . $admin['id'] . ')');

            // 重新取得使用者的角色和權限
            log_message('debug', 'Getting user roles and permissions for user ID: ' . $admin['id']);
            try {
                $roles = $this->getUserRoles($admin['id']);
                $permissions = $this->getUserPermissions($admin['id']);
                log_message('debug', 'Roles count: ' . count($roles) . ', Permissions count: ' . count($permissions));
            } catch (\Exception $e) {
                log_message('error', 'Failed to get user roles/permissions: ' . $e->getMessage());
                log_message('error', 'Stack trace: ' . $e->getTraceAsString());
                // 如果取得角色和權限失敗，使用空陣列
                $roles = [];
                $permissions = [];
            }

            // 準備新的 Token Payload
            $tokenPayload = [
                'sub' => (string) $admin['id'],
                'user_id' => (int) $admin['id'],
                'username' => $admin['username'],
                'name' => $admin['name'],
                'permission_name' => $admin['permission_name'],
                'status' => (int) $admin['status'],
                'roles' => $roles,
                'permissions' => $permissions,
            ];

            // 生成新的 Access Token
            log_message('debug', 'Generating new access token for user ID: ' . $admin['id']);
            try {
                $accessToken = $this->jwtService->generateAccessToken($tokenPayload);
                log_message('debug', 'Access token generated successfully (length: ' . strlen($accessToken) . ')');
            } catch (\Exception $e) {
                log_message('error', 'Failed to generate access token: ' . $e->getMessage());
                log_message('error', 'File: ' . $e->getFile() . ', Line: ' . $e->getLine());
                log_message('error', 'Stack trace: ' . $e->getTraceAsString());
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => 'Token 生成失敗',
                    'error' => $e->getMessage(),
                ]);
            }

            log_message('info', 'Token refresh successful for user: ' . $admin['username'] . ' (ID: ' . $admin['id'] . ')');
            log_message('info', '=== Refresh token request completed successfully ===');

            return $this->response->setJSON([
                'success' => true,
                'message' => 'Token 刷新成功',
                'data' => [
                    'access_token' => $accessToken,
                    'token_type' => 'Bearer',
                    'expires_in' => config('JWT')->accessTokenExpiration,
                ],
            ]);
        } catch (\Throwable $e) {
            // 使用 \Throwable 而不是 \Exception，以捕獲所有錯誤（包括 Error）
            log_message('error', '=== Refresh token request failed ===');
            log_message('error', 'Error type: ' . get_class($e));
            log_message('error', 'Error message: ' . $e->getMessage());
            log_message('error', 'Error file: ' . $e->getFile());
            log_message('error', 'Error line: ' . $e->getLine());
            log_message('error', 'Stack trace:');
            log_message('error', $e->getTraceAsString());

            // 記錄請求資訊以便除錯
            log_message('error', 'Request method: ' . $this->request->getMethod());
            log_message('error', 'Request URI: ' . $this->request->getUri());
            log_message('error', 'Request headers: ' . json_encode($this->request->getHeaders()));

            // 確保回應格式正確
            $errorResponse = [
                'success' => false,
                'message' => 'Token 刷新時發生錯誤',
            ];

            // 在開發環境顯示詳細錯誤
            if (ENVIRONMENT !== 'production') {
                $errorResponse['error'] = $e->getMessage();
                $errorResponse['error_type'] = get_class($e);
                $errorResponse['file'] = $e->getFile();
                $errorResponse['line'] = $e->getLine();
            }

            return $this->response
                ->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)
                ->setContentType('application/json')
                ->setJSON($errorResponse);
        }
    }

    /**
     * 取得目前登入的管理員資料
     */
    public function me()
    {
        // 從 Token 中取得使用者資訊（由 AuthFilter 設定）
        $userDataJson = $this->request->getHeaderLine('X-User-Data');

        if (empty($userDataJson)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                'success' => false,
                'message' => '尚未登入',
            ]);
        }

        $userData = json_decode($userDataJson, true);
        $userId = $userData['user_id'] ?? null;

        if (!$userId) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                'success' => false,
                'message' => '無法取得使用者資訊',
            ]);
        }

        // 重新載入最新的角色和權限
        $roles = $this->getUserRoles($userId);
        $permissions = $this->getUserPermissions($userId);

        $userData['roles'] = $roles;
        $userData['permissions'] = $permissions;

        return $this->response->setJSON([
            'success' => true,
            'data' => $userData,
        ]);
    }

    /**
     * 登出並清除 Refresh Token
     */
    public function logout()
    {
        // 清除 Refresh Token Cookie
        // 檢查實際連線是否為 HTTPS（而不是只檢查環境變數）
        $isSecure = $this->request->isSecure();
        $this->response->setCookie(
            'refresh_token',
            '',
            time() - 3600,  // expires (int)
            '',             // domain
            '/',            // path
            '',             // prefix
            $isSecure,      // secure - 根據實際連線決定
            true,           // httponly
            'Strict'        // samesite
        );

        return $this->response->setJSON([
            'success' => true,
            'message' => '已登出',
        ]);
    }
}