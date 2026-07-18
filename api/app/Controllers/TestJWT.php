<?php

namespace App\Controllers;

use App\Libraries\JWTService;
use CodeIgniter\HTTP\ResponseInterface;

class TestJWT extends BaseController
{
    public function index()
    {
        try {
            $jwtService = new JWTService();
            
            // 測試生成 Token
            $token = $jwtService->generateAccessToken([
                'user_id' => 1,
                'username' => 'test',
            ]);
            
            return $this->response->setJSON([
                'success' => true,
                'message' => 'JWT service is working',
                'token' => $token,
                'config' => [
                    'algorithm' => config('JWT')->algorithm,
                    'accessTokenExpiration' => config('JWT')->accessTokenExpiration,
                ],
            ]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => 'JWT service error: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}

