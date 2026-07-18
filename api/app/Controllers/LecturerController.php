<?php
namespace App\Controllers;

use App\Models\AppLecturerModel;
use CodeIgniter\HTTP\ResponseInterface;

class LecturerController extends BaseController
{
    protected $resourceName = '講師';

    protected AppLecturerModel $model;

    public function __construct()
    {
        $this->model = new AppLecturerModel();
    }

    /**
     * 取得講師列表
     */
    public function get()
    {
        try {
            $rows = $this->model
                ->orderBy('sort_order', 'ASC')
                ->orderBy('id', 'ASC')
                ->findAll();

            $data = array_map(fn ($row) => $this->appendImageUrl($row), $rows);

            return $this->response->setJSON([
                'success' => true,
                'data'    => $data,
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'getLecturers failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['get_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 取得單一講師
     */
    public function getById()
    {
        $data = $this->request->getJSON(true) ?: $this->request->getGet();
        $id   = $data['id'] ?? null;

        if (!$id) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => $this->messages['missing_id'],
            ]);
        }

        try {
            $row = $this->model->find((int) $id);
            if (!$row) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                    'success' => false,
                    'message' => $this->messages['not_found'],
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'data'    => $this->appendImageUrl($row),
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'getLecturerById failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['get_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 新增講師
     */
    public function add()
    {
        $this->checkAuth();

        $data = $this->request->getJSON(true) ?: $this->request->getPost();

        if (!$this->validateData($data, $this->getRules())) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)->setJSON([
                'success' => false,
                'message' => $this->messages['validation_failed'],
                'errors'  => $this->validator->getErrors(),
            ]);
        }

        try {
            $insertId = $this->model->insert($this->buildSaveData($data));

            if (!$insertId) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => $this->messages['add_failed'],
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => $this->messages['add_success'],
                'data'    => ['id' => (int) $insertId],
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'addLecturer failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['add_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 更新講師
     */
    public function update()
    {
        $this->checkAuth();

        $data = $this->request->getJSON(true) ?: $this->request->getPost();
        $id   = $data['id'] ?? null;

        if (!$id) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => $this->messages['missing_id'],
            ]);
        }

        $row = $this->model->find((int) $id);
        if (!$row) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                'success' => false,
                'message' => $this->messages['not_found'],
            ]);
        }

        if (!$this->validateData($data, $this->getRules(true))) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)->setJSON([
                'success' => false,
                'message' => $this->messages['validation_failed'],
                'errors'  => $this->validator->getErrors(),
            ]);
        }

        try {
            $updated = $this->model->update((int) $id, $this->buildSaveData($data));

            if ($updated === false) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => $this->messages['update_failed'],
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => $this->messages['update_success'],
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'updateLecturer failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['update_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 更新講師排序
     */
    public function updateSortOrder()
    {
        $this->checkAuth();

        $data      = $this->request->getJSON(true) ?: $this->request->getPost();
        $id        = $data['id'] ?? null;
        $sortOrder = $data['sort_order'] ?? null;

        if (!$id) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => $this->messages['missing_id'],
            ]);
        }

        if (!is_numeric($sortOrder)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)->setJSON([
                'success' => false,
                'message' => '排序格式錯誤',
            ]);
        }

        $row = $this->model->find((int) $id);
        if (!$row) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                'success' => false,
                'message' => $this->messages['not_found'],
            ]);
        }

        try {
            $updated = $this->model->update((int) $id, [
                'sort_order' => (int) $sortOrder,
            ]);

            if ($updated === false) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => '更新排序失敗，請稍後再試',
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => '更新排序成功',
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'updateLecturerSortOrder failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '更新排序失敗，請稍後再試',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 刪除講師
     */
    public function delete()
    {
        $this->checkAuth();

        $data = $this->request->getJSON(true) ?: $this->request->getPost();
        $id   = $data['id'] ?? null;

        if (!$id) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => $this->messages['missing_id'],
            ]);
        }

        $row = $this->model->find((int) $id);
        if (!$row) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                'success' => false,
                'message' => $this->messages['not_found'],
            ]);
        }

        try {
            if (!$this->model->delete((int) $id)) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => $this->messages['delete_failed'],
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => $this->messages['delete_success'],
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'deleteLecturer failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['delete_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    private function getRules(bool $isUpdate = false): array
    {
        $nameRule = $isUpdate ? 'permit_empty|min_length[1]|max_length[100]' : 'required|min_length[1]|max_length[100]';

        return [
            'name'       => $nameRule,
            'image'      => 'permit_empty|max_length[500]',
            'title'      => 'permit_empty|max_length[255]',
            'intro'      => 'permit_empty',
            'heading'    => 'permit_empty|max_length[255]',
            'content'    => 'permit_empty',
            'sort_order' => 'permit_empty|integer',
        ];
    }

    private function buildSaveData(array $data): array
    {
        return [
            'name'       => trim((string) ($data['name'] ?? '')),
            'image'      => $this->normalizeNullableString($data['image'] ?? null),
            'title'      => $this->normalizeNullableString($data['title'] ?? null),
            'intro'      => $this->normalizeNullableString($data['intro'] ?? null),
            'heading'    => $this->normalizeNullableString($data['heading'] ?? null),
            'content'    => $this->normalizeNullableString($data['content'] ?? null),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ];
    }

    private function normalizeNullableString($value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim((string) $value);

        return $trimmed === '' ? null : $trimmed;
    }

    private function appendImageUrl(array $row): array
    {
        helper(['url']);

        $image = $row['image'] ?? null;
        if ($image && !preg_match('#^https?://#i', (string) $image)) {
            $row['image_url'] = base_url('uploads/lecturer/' . ltrim((string) $image, '/'));
        } elseif ($image) {
            $row['image_url'] = (string) $image;
        } else {
            $row['image_url'] = null;
        }

        return $row;
    }

}
