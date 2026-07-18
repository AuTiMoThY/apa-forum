<?php

namespace App\Controllers;

use App\Models\CompanyBaseModel;
use App\Models\AppProductsModel;
use App\Models\AppStoreModel;
use App\Models\AppNewProductsModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * 後台 Dashboard 統計與最後更新時間
 */
class DashboardController extends BaseController
{
    /**
     * 取得 Dashboard 統計與最後更新時間（需登入）
     * 回傳：products, stores, new_products 筆數，以及 last_updated（ISO8601）
     */
    public function getStats()
    {
        $this->checkAuth();

        try {
            $productsModel   = new AppProductsModel();
            $storeModel     = new AppStoreModel();
            $newProductsModel = new AppNewProductsModel();
            $companyBaseModel = new CompanyBaseModel();

            $productsCount     = (int) $productsModel->countAll();
            $storesCount       = (int) $storeModel->countAll();
            $newProductsCount  = (int) $newProductsModel->countAll();

            $updatedDates = [];

            $company = $companyBaseModel->select('updated_at')->first();
            if (!empty($company['updated_at'])) {
                $updatedDates[] = $company['updated_at'];
            }

            $pdtMax = $productsModel->selectMax('updated_at')->first();
            if (!empty($pdtMax['updated_at'])) {
                $updatedDates[] = $pdtMax['updated_at'];
            }

            $storeMax = $storeModel->selectMax('updated_at')->first();
            if (!empty($storeMax['updated_at'])) {
                $updatedDates[] = $storeMax['updated_at'];
            }

            $npMax = $newProductsModel->selectMax('updated_at')->first();
            if (!empty($npMax['updated_at'])) {
                $updatedDates[] = $npMax['updated_at'];
            }

            $lastUpdated = null;
            if (!empty($updatedDates)) {
                $lastUpdated = max($updatedDates);
            }

            return $this->response->setJSON([
                'success' => true,
                'data' => [
                    'products'      => $productsCount,
                    'stores'        => $storesCount,
                    'new_products'  => $newProductsCount,
                    'last_updated'  => $lastUpdated,
                ],
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'Dashboard getStats failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '取得統計失敗，請稍後再試',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }
}
