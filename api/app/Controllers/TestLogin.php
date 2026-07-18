<?php

namespace App\Controllers;

use App\Models\SysAdminModel;
use App\Libraries\JWTService;
use CodeIgniter\HTTP\ResponseInterface;

class TestLogin extends BaseController
{
    public function index()
    {
        try {
            $payload = $this->request->getJSON(true) ?: $this->request->getPost();
            
            if (empty($payload['username']) || empty($payload['password'])) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                    'success' => false,
                    'message' => '請提供帳號與密碼',
                ]);
            }

            $userModel = new SysAdminModel();
            $admin = $userModel->where('username', $payload['username'])->first();

            if (!$admin) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                    'success' => false,
                    'message' => '帳號不存在',
                ]);
            }

            if ((int) $admin['status'] !== 1) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)->setJSON([
                    'success' => false,
                    'message' => '帳號已停用',
                ]);
            }

            $isFirstLogin = (int) ($admin['is_first_login'] ?? 0) === 1;
            $passwordValid = false;

            if ($isFirstLogin) {
                // 遷移帳號：密碼為明碼，直接比對
                $passwordValid = $payload['password'] === $admin['password_hash'];
            } else {
                $passwordValid = password_verify($payload['password'], $admin['password_hash']);
            }

            if (!$passwordValid) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)->setJSON([
                    'success' => false,
                    'message' => '密碼錯誤',
                ]);
            }

            // 初次登入（明碼）：將密碼改為雜湊並標記非初次登入
            if ($isFirstLogin) {
                $userModel->update($admin['id'], [
                    'password_hash' => password_hash($payload['password'], PASSWORD_DEFAULT),
                    'is_first_login' => 0,
                ]);
            }

            // 測試 JWT 服務
            $jwtService = new JWTService();
            $tokenPayload = [
                'sub' => (string) $admin['id'],
                'user_id' => (int) $admin['id'],
                'username' => $admin['username'],
            ];
            
            $accessToken = $jwtService->generateAccessToken($tokenPayload);
            $refreshToken = $jwtService->generateRefreshToken($admin['id']);

            // 測試 Cookie 設定
            $isProduction = ENVIRONMENT === 'production';
            try {
                // CodeIgniter 4 的 setCookie 方法：setCookie(name, value, expire, domain, path, prefix, secure, httponly, samesite)
                $this->response->setCookie(
                    'refresh_token',
                    $refreshToken,
                    time() + config('JWT')->refreshTokenExpiration,  // expires (int)
                    '',                                              // domain
                    '/',                                             // path
                    '',                                              // prefix
                    $isProduction,                                    // secure
                    true,                                            // httponly
                    'Strict'                                         // samesite
                );
                $cookieSet = true;
            } catch (\Exception $e) {
                $cookieSet = false;
                $cookieError = $e->getMessage();
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => '測試成功',
                'data' => [
                    'access_token' => $accessToken,
                    'refresh_token' => $refreshToken,
                    'cookie_set' => $cookieSet,
                    'cookie_error' => $cookieError ?? null,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '錯誤: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => explode("\n", $e->getTraceAsString()),
            ]);
        }
    }
}

