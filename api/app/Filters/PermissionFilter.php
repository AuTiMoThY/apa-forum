<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\UserRoleModel;
use App\Models\UserPermissionModel;
use App\Models\RolePermissionModel;
use App\Models\PermissionModel;

/**
 * 權限檢查 Filter
 * 檢查使用者是否有執行特定操作所需的權限
 */
class PermissionFilter implements FilterInterface
{
    protected $requiredPermission;
    
    /**
     * 在請求處理前執行
     *
     * @param RequestInterface $request
     * @param array|null $arguments 權限名稱（例如: ['system.roles.create']）
     * @return mixed
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        // 從參數中取得需要的權限名稱
        $this->requiredPermission = $arguments[0] ?? null;
        
        // 如果沒有指定權限，允許通過（但需要先通過認證）
        if (!$this->requiredPermission) {
            return;
        }
        
        $session = session();
        $user = $session->get('admin_user');
        
        // 如果沒有登入，返回 401（這應該不會發生，因為應該先通過 AuthFilter）
        if (!$user) {
            return service('response')
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)
                ->setJSON([
                    'success' => false,
                    'message' => '尚未登入',
                ]);
        }
        
        // 檢查是否為超級管理員（super_admin 擁有所有權限）
        $userRoleModel = new UserRoleModel();
        $isSuperAdmin = $userRoleModel
            ->select('sys_roles.name')
            ->join('sys_roles', 'sys_roles.id = sys_user_roles.role_id')
            ->where('sys_user_roles.user_id', $user['id'])
            ->where('sys_roles.name', 'super_admin')
            ->where('sys_roles.status', 1)
            ->first();
        
        if ($isSuperAdmin) {
            return; // 超級管理員有所有權限
        }
        
        // 檢查使用者是否有權限
        $userPermissions = $this->getUserPermissions($user['id']);
        
        if (!in_array($this->requiredPermission, $userPermissions)) {
            log_message('warning', 'Permission denied: User ' . ($user['username'] ?? $user['id']) . ' attempted to access ' . $this->requiredPermission);
            
            return service('response')
                ->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)
                ->setJSON([
                    'success' => false,
                    'message' => '沒有權限執行此操作',
                ]);
        }
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

    /**
     * 在請求處理後執行
     *
     * @param RequestInterface $request
     * @param ResponseInterface $response
     * @param array|null $arguments
     * @return mixed
     */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // 不需要後處理
    }
}

