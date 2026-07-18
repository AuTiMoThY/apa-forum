<?php

namespace App\Filters;

use App\Libraries\JWTService;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * 認證 Filter
 * 檢查使用者是否已登入（使用 JWT）
 */
class AuthFilter implements FilterInterface
{
    protected $jwtService;

    public function __construct()
    {
        $this->jwtService = new JWTService();
    }

    /**
     * 在請求處理前執行
     *
     * @param RequestInterface $request
     * @param array|null $arguments
     * @return mixed
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        $uri = $request->getUri();
        
        // 從請求中提取 Token
        $token = $this->jwtService->extractToken($request);
        
        if (empty($token)) {
            log_message('info', 'JWT token not found in request: ' . $uri);
            return service('response')
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)
                ->setJSON([
                    'success' => false,
                    'message' => '尚未登入，請先登入',
                ]);
        }

        // 驗證 Token
        $decoded = $this->jwtService->validateToken($token);

        if (!$decoded) {
            log_message('info', 'Invalid JWT token: ' . $uri);
            return service('response')
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)
                ->setJSON([
                    'success' => false,
                    'message' => 'Token 無效或已過期',
                ]);
        }

        // 檢查 Token 是否過期
        if ($this->jwtService->isTokenExpired($decoded)) {
            log_message('info', 'Expired JWT token: ' . $uri);
            return service('response')
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)
                ->setJSON([
                    'success' => false,
                    'message' => 'Token 已過期，請重新登入或刷新 Token',
                ]);
        }

        // 檢查帳號狀態
        if (isset($decoded->status) && (int) $decoded->status !== 1) {
            log_message('warning', 'Disabled account attempted access: ' . ($decoded->username ?? 'unknown'));
            
            return service('response')
                ->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)
                ->setJSON([
                    'success' => false,
                    'message' => '帳號已停用',
                ]);
        }

        // 將使用者資料存入請求 Header，供後續使用
        $userData = [
            'user_id' => $decoded->user_id ?? null,
            'username' => $decoded->username ?? null,
            'name' => $decoded->name ?? null,
            'permission_name' => $decoded->permission_name ?? null,
            'status' => $decoded->status ?? null,
            'roles' => $decoded->roles ?? [],
            'permissions' => $decoded->permissions ?? [],
        ];

        $request->setHeader('X-User-Data', json_encode($userData));

        // 繼續處理請求
        return null;
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

