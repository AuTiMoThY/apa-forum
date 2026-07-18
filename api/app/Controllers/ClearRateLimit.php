<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;

class ClearRateLimit extends BaseController
{
    /**
     * 清除 Rate Limit 快取（僅用於開發測試）
     */
    public function index()
    {
        // 允許在非 production 環境使用（development 或 testing）
        // 檢查多種方式來判斷是否為開發環境
        $env = defined('ENVIRONMENT') ? ENVIRONMENT : (getenv('CI_ENVIRONMENT') ?: 'production');
        
        // 如果環境變數未設定或為 production，檢查是否為 localhost（開發環境的額外檢查）
        $isLocalhost = in_array($this->request->getIPAddress(), ['127.0.0.1', '::1', 'localhost']) 
                    || strpos($this->request->getServer('HTTP_HOST'), 'localhost') !== false
                    || strpos($this->request->getServer('HTTP_HOST'), '127.0.0.1') !== false;
        
        // 如果是 production 且不是 localhost，則拒絕
        if ($env === 'production' && !$isLocalhost) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)->setJSON([
                'success' => false,
                'message' => '此功能僅在開發環境可用',
                'debug' => [
                    'environment' => $env,
                    'is_localhost' => $isLocalhost,
                    'ip' => $this->request->getIPAddress(),
                    'host' => $this->request->getServer('HTTP_HOST'),
                ],
            ]);
        }

        $cache = \Config\Services::cache();
        $cleared = 0;

        // 清除所有 rate_limit 相關的快取
        // 注意：這會清除所有 IP 的 rate limit，僅用於開發測試
        
        // 注意：CodeIgniter 4 的 Cache 介面可能沒有 getHandler() 方法
        // 直接使用檔案方式清除 rate_limit 相關快取
        
        // 方法 2: 直接刪除檔案（CodeIgniter 4 檔案快取）
        $cacheDir = WRITEPATH . 'cache/';
        if (is_dir($cacheDir)) {
            $files = glob($cacheDir . 'rate_limit_*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    @unlink($file);
                    $cleared++;
                }
            }
        }

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Rate limit 快取已清除',
            'cleared_count' => $cleared,
        ]);
    }
}

