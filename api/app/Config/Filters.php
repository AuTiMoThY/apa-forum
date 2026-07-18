<?php

namespace Config;

use CodeIgniter\Config\Filters as BaseFilters;
use CodeIgniter\Filters\Cors;
use CodeIgniter\Filters\CSRF;
use CodeIgniter\Filters\DebugToolbar;
use CodeIgniter\Filters\ForceHTTPS;
use CodeIgniter\Filters\Honeypot;
use CodeIgniter\Filters\InvalidChars;
use CodeIgniter\Filters\PageCache;
use CodeIgniter\Filters\PerformanceMetrics;
use CodeIgniter\Filters\SecureHeaders;

class Filters extends BaseFilters
{
    /**
     * Configures aliases for Filter classes to
     * make reading things nicer and simpler.
     *
     * @var array<string, class-string|list<class-string>>
     *
     * [filter_name => classname]
     * or [filter_name => [classname1, classname2, ...]]
     */
    public array $aliases = [
        'csrf'          => CSRF::class,
        'toolbar'       => DebugToolbar::class,
        'honeypot'      => Honeypot::class,
        'invalidchars'  => InvalidChars::class,
        'secureheaders' => SecureHeaders::class,
        'cors'          => Cors::class,
        'forcehttps'    => ForceHTTPS::class,
        'pagecache'     => PageCache::class,
        'performance'   => PerformanceMetrics::class,
        'auth'          => \App\Filters\AuthFilter::class,
        'permission'    => \App\Filters\PermissionFilter::class,
        'ratelimit'     => \App\Filters\RateLimitFilter::class,
    ];

    /**
     * List of special required filters.
     *
     * The filters listed here are special. They are applied before and after
     * other kinds of filters, and always applied even if a route does not exist.
     *
     * Filters set by default provide framework functionality. If removed,
     * those functions will no longer work.
     *
     * @see https://codeigniter.com/user_guide/incoming/filters.html#provided-filters
     *
     * @var array{before: list<string>, after: list<string>}
     */
    public array $required = [
        'before' => [
            'cors',       // CORS 必須最先執行，確保所有回應（含 401/403）都帶 CORS 標頭
            'forcehttps', // Force Global Secure Requests
            'pagecache',  // Web Page Caching
        ],
        'after' => [
            'cors',        // 確保送出的回應都帶 CORS 標頭（含 401/403/404）
            'pagecache',   // Web Page Caching
            'performance', // Performance Metrics
            // 'toolbar',  // Debug Toolbar（已關閉，避免持續寫入 writable/debugbar/）
        ],
    ];

    /**
     * List of filter aliases that are always
     * applied before and after every request.
     *
     * @var array{
     *     before: array<string, array{except: list<string>|string}>|list<string>,
     *     after: array<string, array{except: list<string>|string}>|list<string>
     * }
     */
    public array $globals = [
        'before' => [
            'cors',
            // 'honeypot',
            // 'csrf',
            // 'invalidchars',
        ],
        'after' => [
            // 'honeypot',
            // 'secureheaders',
        ],
    ];

    /**
     * List of filter aliases that works on a
     * particular HTTP method (GET, POST, etc.).
     *
     * Example:
     * 'POST' => ['foo', 'bar']
     *
     * If you use this, you should disable auto-routing because auto-routing
     * permits any HTTP method to access a controller. Accessing the controller
     * with a method you don't expect could bypass the filter.
     *
     * @var array<string, list<string>>
     */
    public array $methods = [];

    /**
     * List of filter aliases that should run on any
     * before or after URI patterns.
     *
     * Example:
     * 'isLoggedIn' => ['before' => ['account/*', 'profiles/*']]
     *
     * @var array<string, array<string, list<string>>>
     */
    public array $filters = [
        // 為所有後台 API 路由套用認證（排除登入、登出和前台提交表單的路由）
        'auth' => [
            'before' => [
                'admins/get',
                'admins/get-by-id',
                'admins/add',
                'admins/update',
                'admins/delete',
                'admins/me',
                'structure/*',
                'module/*',
                'role/*',
                'permission/*',
                'company-base/save',   // GET 開放給前台未登入撈資料，僅 save 需登入
                'agenda/save',
                'lecturer/add',
                'lecturer/update',
                'lecturer/update-sort-order',
                'lecturer/delete',
                'breakout-session/add',
                'breakout-session/update',
                'breakout-session/update-sort-order',
                'breakout-session/delete',
                'breakout-session/add-lecturer',
                'breakout-session/update-lecturer',
                'breakout-session/update-lecturer-sort-order',
                'breakout-session/delete-lecturer',
                'upload/*',

            ],
        ],
        // 為登入 API 套用 Rate Limiting（每 IP：10 次 / 10 分鐘，避免正常重試或 NAT 共用以過早觸發）
        // 格式：ratelimit:maxAttempts,timeWindow(秒)
        'ratelimit:10,600' => [
            'before' => ['admins/login'],
        ],
    ];
}
