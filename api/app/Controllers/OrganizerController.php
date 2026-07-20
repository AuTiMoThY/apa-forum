<?php
namespace App\Controllers;

use App\Models\AppOrganizerModel;
use CodeIgniter\HTTP\ResponseInterface;

class OrganizerController extends BaseController
{
    protected $resourceName = '主辦單位介紹';

    protected AppOrganizerModel $organizerModel;

    public function __construct()
    {
        $this->organizerModel = new AppOrganizerModel();
    }

    /**
     * 取得主辦單位介紹（通常只有一筆）
     */
    public function get()
    {
        try {
            $row = $this->organizerModel->first();

            return $this->response->setJSON([
                'success' => true,
                'data'    => $row ?: null,
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'getOrganizer failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['get_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 新增或更新主辦單位介紹
     */
    public function save()
    {
        $this->checkAuth();

        $data = $this->request->getJSON(true) ?: $this->request->getPost();

        $rules = [
            'content_tw' => 'permit_empty',
            'content_en' => 'permit_empty',
        ];

        if (!$this->validateData($data, $rules)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)->setJSON([
                'success' => false,
                'message' => '驗證失敗',
                'errors'  => $this->validator->getErrors(),
            ]);
        }

        try {
            $existing = $this->organizerModel->first();

            $saveData = [];
            foreach (['content_tw', 'content_en'] as $field) {
                if (array_key_exists($field, $data)) {
                    $saveData[$field] = $data[$field] === '' ? null : $data[$field];
                }
            }

            if ($existing) {
                $updated = $this->organizerModel->update($existing['id'], $saveData);

                if (!$updated) {
                    return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                        'success' => false,
                        'message' => $this->messages['update_failed'],
                    ]);
                }

                return $this->response->setJSON([
                    'success' => true,
                    'message' => '更新主辦單位介紹成功',
                ]);
            }

            $insertId = $this->organizerModel->insert($saveData);

            if (!$insertId) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => $this->messages['add_failed'],
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => '新增主辦單位介紹成功',
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'saveOrganizer failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '儲存主辦單位介紹失敗，請稍後再試',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }
}
