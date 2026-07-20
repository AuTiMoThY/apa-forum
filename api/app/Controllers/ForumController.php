<?php
namespace App\Controllers;

use App\Models\AppForumModel;
use CodeIgniter\HTTP\ResponseInterface;

class ForumController extends BaseController
{
    protected $resourceName = '論壇介紹';

    protected AppForumModel $forumModel;

    public function __construct()
    {
        $this->forumModel = new AppForumModel();
    }

    /**
     * 取得論壇介紹（通常只有一筆）
     */
    public function get()
    {
        try {
            $row = $this->forumModel->first();

            return $this->response->setJSON([
                'success' => true,
                'data'    => $row ?: null,
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'getForum failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['get_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 新增或更新論壇介紹
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
            $existing = $this->forumModel->first();

            $saveData = [];
            foreach (['content_tw', 'content_en'] as $field) {
                if (array_key_exists($field, $data)) {
                    $saveData[$field] = $data[$field] === '' ? null : $data[$field];
                }
            }

            if ($existing) {
                $updated = $this->forumModel->update($existing['id'], $saveData);

                if (!$updated) {
                    return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                        'success' => false,
                        'message' => $this->messages['update_failed'],
                    ]);
                }

                return $this->response->setJSON([
                    'success' => true,
                    'message' => '更新論壇介紹成功',
                ]);
            }

            $insertId = $this->forumModel->insert($saveData);

            if (!$insertId) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => $this->messages['add_failed'],
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => '新增論壇介紹成功',
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'saveForum failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '儲存論壇介紹失敗，請稍後再試',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }
}
