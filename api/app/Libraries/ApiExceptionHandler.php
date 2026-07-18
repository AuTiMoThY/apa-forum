<?php

namespace App\Libraries;

use CodeIgniter\Debug\BaseExceptionHandler;
use CodeIgniter\Debug\ExceptionHandlerInterface;
use CodeIgniter\HTTP\Exceptions\HTTPException;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Exceptions as ExceptionsConfig;
use Throwable;

/**
 * API 專用例外處理器
 * 確保所有錯誤都回傳 JSON  body（含 500），方便前端除錯。
 */
class ApiExceptionHandler extends BaseExceptionHandler implements ExceptionHandlerInterface
{
    public function handle(
        Throwable $exception,
        RequestInterface $request,
        ResponseInterface $response,
        int $statusCode,
        int $exitCode,
    ): void {
        if (! $request instanceof IncomingRequest) {
            echo $exception::class . ': ' . $exception->getMessage() . "\n" . $exception->getTraceAsString();
            if (ENVIRONMENT !== 'testing') {
                exit($exitCode);
            }
            return;
        }

        try {
            $response->setStatusCode($statusCode);
        } catch (HTTPException) {
            $statusCode = 500;
            $response->setStatusCode(500);
        }

        if (! headers_sent()) {
            header(
                sprintf(
                    'HTTP/%s %s %s',
                    $request->getProtocolVersion(),
                    $response->getStatusCode(),
                    $response->getReasonPhrase(),
                ),
                true,
                $statusCode,
            );
        }

        $showDetails = ENVIRONMENT !== 'production' || (ini_get('display_errors') && strtolower(ini_get('display_errors')) !== 'off');

        $body = [
            'success' => false,
            'message' => $statusCode >= 500 ? '伺服器發生錯誤' : $exception->getMessage(),
        ];

        if ($showDetails) {
            $body['error']       = $exception->getMessage();
            $body['error_type']  = $exception::class;
            $body['file']        = $exception->getFile();
            $body['line']        = $exception->getLine();
            $body['trace']       = array_slice(explode("\n", $exception->getTraceAsString()), 0, 15);
        } else {
            // production：500 仍回傳 error 訊息方便除錯（可改為 null 避免對外洩漏）
            $body['error'] = $statusCode >= 500 ? $exception->getMessage() : null;
        }

        $response->setContentType('application/json');
        $response->setBody(json_encode($body, JSON_UNESCAPED_UNICODE));
        $response->send();

        if (ENVIRONMENT !== 'testing') {
            exit($exitCode);
        }
    }
}
