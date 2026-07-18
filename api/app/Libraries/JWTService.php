<?php

namespace App\Libraries;

use Config\JWT as JWTConfig;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class JWTService
{
    protected $config;

    public function __construct()
    {
        try {
            $this->config = config('JWT');
            
            // 如果配置檔載入失敗，建立預設配置
            if (!$this->config) {
                $this->config = new \Config\JWT();
            }
            
            // 從環境變數或 .env 讀取密鑰
            if (empty($this->config->secretKey)) {
                $this->config->secretKey = getenv('JWT_SECRET_KEY') ?: 'default-secret-key-change-in-production-min-32-characters';
            }
        } catch (\Exception $e) {
            log_message('error', 'JWTService initialization failed: ' . $e->getMessage());
            // 建立預設配置
            $this->config = new \Config\JWT();
            $this->config->secretKey = getenv('JWT_SECRET_KEY') ?: 'default-secret-key-change-in-production-min-32-characters';
        }
    }

    /**
     * 生成 Access Token
     * 
     * @param array $payload 要包含在 Token 中的資料
     * @return string JWT Token
     */
    public function generateAccessToken(array $payload): string
    {
        $now = time();
        
        $tokenData = [
            'iss' => $this->config->issuer,           // 發行者
            'aud' => $this->config->audience,         // 受眾
            'iat' => $now,                            // 發行時間
            'nbf' => $now,                            // 生效時間
            'exp' => $now + $this->config->accessTokenExpiration, // 過期時間
        ];

        // 合併自訂資料
        $tokenData = array_merge($tokenData, $payload);

        return JWT::encode($tokenData, $this->config->secretKey, $this->config->algorithm);
    }

    /**
     * 生成 Refresh Token
     * 
     * @param int $userId 使用者 ID
     * @return string Refresh Token
     */
    public function generateRefreshToken(int $userId): string
    {
        $now = time();
        
        $tokenData = [
            'iss' => $this->config->issuer,
            'aud' => $this->config->audience,
            'sub' => (string) $userId,                // 主題：使用者 ID
            'type' => 'refresh',                      // Token 類型
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $this->config->refreshTokenExpiration,
        ];

        return JWT::encode($tokenData, $this->config->secretKey, $this->config->algorithm);
    }

    /**
     * 驗證並解析 Token
     * 
     * @param string $token JWT Token
     * @return object|false 解析後的資料，失敗返回 false
     */
    public function validateToken(string $token)
    {
        try {
            $decoded = JWT::decode(
                $token,
                new Key($this->config->secretKey, $this->config->algorithm)
            );

            return $decoded;
        } catch (Exception $e) {
            log_message('error', 'JWT validation failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * 從請求中提取 Token
     * 
     * @param \CodeIgniter\HTTP\RequestInterface $request
     * @return string|null Token 或 null
     */
    public function extractToken($request): ?string
    {
        // 1. 從 Authorization Header 提取
        $authHeader = $request->getHeaderLine('Authorization');
        if (empty($authHeader) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }
        if (empty($authHeader) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        if (!empty($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return trim($matches[1]);
        }

        // 2. 主機若 strip 掉 Authorization，改從自訂 header 讀取（多數主機不會擋自訂 header）
        $token = $request->getHeaderLine('X-Access-Token');
        if (empty($token) && !empty($_SERVER['HTTP_X_ACCESS_TOKEN'])) {
            $token = $_SERVER['HTTP_X_ACCESS_TOKEN'];
        }
        if (!empty($token)) {
            return trim($token);
        }

        return null;
    }

    /**
     * 檢查 Token 是否過期
     * 
     * @param object $decoded 解析後的 Token
     * @return bool
     */
    public function isTokenExpired($decoded): bool
    {
        if (!isset($decoded->exp)) {
            return true;
        }

        return time() > $decoded->exp;
    }
}

