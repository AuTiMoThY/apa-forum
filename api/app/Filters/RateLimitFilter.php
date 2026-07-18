<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Rate Limiting Filter
 * 限制請求頻率，防止暴力破解攻擊
 */
class RateLimitFilter implements FilterInterface
{
    /**
     * 在請求處理前執行
     *
     * @param RequestInterface $request
     * @param array|null $arguments [maxAttempts, timeWindow]
     * @return mixed
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        // 預設值：15 分鐘內最多 5 次嘗試
        $maxAttempts = isset($arguments[0]) ? (int) $arguments[0] : 5;
        $timeWindow = isset($arguments[1]) ? (int) $arguments[1] : 900; // 15 分鐘 = 900 秒
        
        // 取得客戶端 IP
        $ip = $request->getIPAddress();
        
        // 取得快取服務
        $cache = \Config\Services::cache();
        
        // 生成快取鍵（用於計數器）
        $cacheKey = 'rate_limit_' . md5($ip . $request->getUri()->getPath());
        // 生成時間戳記鍵（用於計算剩餘時間）
        $timestampKey = 'rate_limit_ts_' . md5($ip . $request->getUri()->getPath());
        
        // 取得目前的嘗試次數
        $attempts = $cache->get($cacheKey);
        // 取得開始時間
        $startTime = $cache->get($timestampKey);
        
        if ($attempts === null) {
            // 第一次嘗試，設定計數器和時間戳記
            $cache->save($cacheKey, 1, $timeWindow);
            $cache->save($timestampKey, time(), $timeWindow);
        } elseif ($attempts >= $maxAttempts) {
            // 超過限制，拒絕請求
            log_message('warning', 'Rate limit exceeded for IP: ' . $ip . ' on path: ' . $request->getUri()->getPath());
            
            // 計算剩餘時間
            $elapsed = time() - ($startTime ?? time());
            $remaining = max(0, $timeWindow - $elapsed);
            
            return service('response')
                ->setStatusCode(ResponseInterface::HTTP_TOO_MANY_REQUESTS)
                ->setJSON([
                    'success' => false,
                    'message' => '請求過於頻繁，請稍後再試',
                    'retry_after' => $remaining,
                ]);
        } else {
            // 增加計數器
            $cache->increment($cacheKey);
            // 如果時間戳記不存在，重新設定（防止被清除）
            if ($startTime === null) {
                $cache->save($timestampKey, time(), $timeWindow);
            }
        }
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
        // 如果登入成功，清除計數器
        if ($response->getStatusCode() === 200) {
            $data = json_decode($response->getBody(), true);
            // 檢查登入成功（支援舊的 token 和新的 access_token）
            if (isset($data['success']) && $data['success'] === true && 
                (isset($data['data']['token']) || isset($data['data']['access_token']))) {
                // 登入成功，清除該 IP 的 rate limit
                $ip = $request->getIPAddress();
                $cache = \Config\Services::cache();
                $cacheKey = 'rate_limit_' . md5($ip . $request->getUri()->getPath());
                $timestampKey = 'rate_limit_ts_' . md5($ip . $request->getUri()->getPath());
                $cache->delete($cacheKey);
                $cache->delete($timestampKey);
            }
        }
    }
}

