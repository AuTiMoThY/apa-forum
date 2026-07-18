<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class JWT extends BaseConfig
{
    /**
     * JWT 密鑰（必須保密！）
     * 
     * 建議使用環境變數設定：
     * JWT_SECRET_KEY=your-secret-key-here
     * 
     * 生產環境請使用強隨機密鑰（至少 32 字元）
     */
    public string $secretKey = '';

    /**
     * JWT 演算法
     * 支援：HS256, HS384, HS512, RS256, RS384, RS512
     */
    public string $algorithm = 'HS256';

    /**
     * Access Token 過期時間（秒）
     * 預設：30 分鐘
     */
    public int $accessTokenExpiration = 1800;

    /**
     * Refresh Token 過期時間（秒）
     * 預設：7 天
     */
    public int $refreshTokenExpiration = 604800;

    /**
     * Token 發行者（可選）
     */
    public string $issuer = 'apaforum-admin';

    /**
     * Token 受眾（可選）
     */
    public string $audience = 'apaforum-admin-client';
}

