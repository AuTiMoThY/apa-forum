<?php
namespace App\Controllers;

use App\Models\AppBreakoutGroupModel;
use App\Models\AppBreakoutLecturerModel;
use CodeIgniter\HTTP\ResponseInterface;

class BreakoutSessionController extends BaseController
{
    protected $resourceName = '分組討論';

    protected AppBreakoutGroupModel $groupModel;
    protected AppBreakoutLecturerModel $lecturerModel;

    public function __construct()
    {
        $this->groupModel    = new AppBreakoutGroupModel();
        $this->lecturerModel = new AppBreakoutLecturerModel();
    }

    /**
     * 取得組別列表（含講師摘要）
     */
    public function get()
    {
        try {
            $groups = $this->groupModel
                ->orderBy('sort_order', 'ASC')
                ->orderBy('id', 'ASC')
                ->findAll();

            $lecturers = $this->lecturerModel
                ->orderBy('sort_order', 'ASC')
                ->orderBy('id', 'ASC')
                ->findAll();

            $lecturersByGroup = [];
            foreach ($lecturers as $lecturer) {
                $groupId = (int) $lecturer['group_id'];
                if (!isset($lecturersByGroup[$groupId])) {
                    $lecturersByGroup[$groupId] = [];
                }
                $lecturersByGroup[$groupId][] = $lecturer['name'] ?? '';
            }

            $data = [];
            foreach ($groups as $group) {
                $groupId = (int) $group['id'];
                $names   = $lecturersByGroup[$groupId] ?? [];
                $group['lecturer_count']   = count($names);
                $group['lecturer_summary'] = $names ? implode('、', $names) : '';
                $data[] = $group;
            }

            return $this->response->setJSON([
                'success' => true,
                'data'    => $data,
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'getBreakoutGroups failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['get_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 取得單一組別
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
            $row = $this->groupModel->find((int) $id);
            if (!$row) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                    'success' => false,
                    'message' => $this->messages['not_found'],
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'data'    => $row,
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'getBreakoutGroupById failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['get_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 取得組別下的講師列表
     */
    public function getLecturers()
    {
        $data    = $this->request->getJSON(true) ?: $this->request->getGet();
        $groupId = $data['group_id'] ?? null;

        if (!$groupId) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => '缺少組別 ID',
            ]);
        }

        try {
            $rows = $this->lecturerModel
                ->where('group_id', (int) $groupId)
                ->orderBy('sort_order', 'ASC')
                ->orderBy('id', 'ASC')
                ->findAll();

            $data = array_map(fn ($row) => $this->appendLecturerImageUrl($row), $rows);

            return $this->response->setJSON([
                'success' => true,
                'data'    => $data,
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'getBreakoutLecturers failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '取得講師列表失敗',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 取得單一分組講師
     */
    public function getLecturerById()
    {
        $data = $this->request->getJSON(true) ?: $this->request->getGet();
        $id   = $data['id'] ?? null;

        if (!$id) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => '缺少講師 ID',
            ]);
        }

        try {
            $row = $this->lecturerModel->find((int) $id);
            if (!$row) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                    'success' => false,
                    'message' => '講師不存在',
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'data'    => $this->appendLecturerImageUrl($row),
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'getBreakoutLecturerById failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '取得講師資料失敗',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 新增組別
     */
    public function add()
    {
        $this->checkAuth();

        $data = $this->request->getJSON(true) ?: $this->request->getPost();

        if (!$this->validateData($data, $this->getGroupRules())) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)->setJSON([
                'success' => false,
                'message' => $this->messages['validation_failed'],
                'errors'  => $this->validator->getErrors(),
            ]);
        }

        try {
            $insertId = $this->groupModel->insert($this->buildGroupSaveData($data));

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
            log_message('error', 'addBreakoutGroup failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['add_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 更新組別
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

        $row = $this->groupModel->find((int) $id);
        if (!$row) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                'success' => false,
                'message' => $this->messages['not_found'],
            ]);
        }

        if (!$this->validateData($data, $this->getGroupRules(true, (int) $id))) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)->setJSON([
                'success' => false,
                'message' => $this->messages['validation_failed'],
                'errors'  => $this->validator->getErrors(),
            ]);
        }

        try {
            $updated = $this->groupModel->update((int) $id, $this->buildGroupSaveData($data));

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
            log_message('error', 'updateBreakoutGroup failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['update_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 更新組別排序
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

        $row = $this->groupModel->find((int) $id);
        if (!$row) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                'success' => false,
                'message' => $this->messages['not_found'],
            ]);
        }

        try {
            $updated = $this->groupModel->update((int) $id, [
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
            log_message('error', 'updateBreakoutGroupSortOrder failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '更新排序失敗，請稍後再試',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 刪除組別（連帶刪除講師）
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

        $row = $this->groupModel->find((int) $id);
        if (!$row) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                'success' => false,
                'message' => $this->messages['not_found'],
            ]);
        }

        try {
            if (!$this->groupModel->delete((int) $id)) {
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
            log_message('error', 'deleteBreakoutGroup failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['delete_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 新增分組講師
     */
    public function addLecturer()
    {
        $this->checkAuth();

        $data = $this->request->getJSON(true) ?: $this->request->getPost();

        if (!$this->validateData($data, $this->getLecturerRules())) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)->setJSON([
                'success' => false,
                'message' => $this->messages['validation_failed'],
                'errors'  => $this->validator->getErrors(),
            ]);
        }

        $groupId = (int) ($data['group_id'] ?? 0);
        if (!$this->groupModel->find($groupId)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                'success' => false,
                'message' => $this->messages['not_found'],
            ]);
        }

        try {
            $insertId = $this->lecturerModel->insert($this->buildLecturerSaveData($data));

            if (!$insertId) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => '新增講師失敗，請稍後再試',
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => '新增講師成功',
                'data'    => ['id' => (int) $insertId],
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'addBreakoutLecturer failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '新增講師失敗，請稍後再試',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 更新分組講師
     */
    public function updateLecturer()
    {
        $this->checkAuth();

        $data = $this->request->getJSON(true) ?: $this->request->getPost();
        $id   = $data['id'] ?? null;

        if (!$id) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => '缺少講師 ID',
            ]);
        }

        $row = $this->lecturerModel->find((int) $id);
        if (!$row) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                'success' => false,
                'message' => '講師不存在',
            ]);
        }

        if (!$this->validateData($data, $this->getLecturerRules(true))) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)->setJSON([
                'success' => false,
                'message' => $this->messages['validation_failed'],
                'errors'  => $this->validator->getErrors(),
            ]);
        }

        try {
            $saveData = $this->buildLecturerSaveData($data);
            unset($saveData['group_id']);

            $updated = $this->lecturerModel->update((int) $id, $saveData);

            if ($updated === false) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => '更新講師失敗，請稍後再試',
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => '更新講師成功',
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'updateBreakoutLecturer failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '更新講師失敗，請稍後再試',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 更新分組講師排序
     */
    public function updateLecturerSortOrder()
    {
        $this->checkAuth();

        $data      = $this->request->getJSON(true) ?: $this->request->getPost();
        $id        = $data['id'] ?? null;
        $sortOrder = $data['sort_order'] ?? null;

        if (!$id) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => '缺少講師 ID',
            ]);
        }

        if (!is_numeric($sortOrder)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)->setJSON([
                'success' => false,
                'message' => '排序格式錯誤',
            ]);
        }

        $row = $this->lecturerModel->find((int) $id);
        if (!$row) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                'success' => false,
                'message' => '講師不存在',
            ]);
        }

        try {
            $updated = $this->lecturerModel->update((int) $id, [
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
            log_message('error', 'updateBreakoutLecturerSortOrder failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '更新排序失敗，請稍後再試',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 刪除分組講師
     */
    public function deleteLecturer()
    {
        $this->checkAuth();

        $data = $this->request->getJSON(true) ?: $this->request->getPost();
        $id   = $data['id'] ?? null;

        if (!$id) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => '缺少講師 ID',
            ]);
        }

        $row = $this->lecturerModel->find((int) $id);
        if (!$row) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_NOT_FOUND)->setJSON([
                'success' => false,
                'message' => '講師不存在',
            ]);
        }

        try {
            if (!$this->lecturerModel->delete((int) $id)) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => '刪除講師失敗，請稍後再試',
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => '刪除講師成功',
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'deleteBreakoutLecturer failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '刪除講師失敗，請稍後再試',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    private function getGroupRules(bool $isUpdate = false, ?int $excludeId = null): array
    {
        $codeRule = $isUpdate
            ? 'permit_empty|min_length[1]|max_length[50]|is_unique[app_breakout_group.code,id,' . ($excludeId ?? 0) . ']'
            : 'required|min_length[1]|max_length[50]|is_unique[app_breakout_group.code]';
        $titleRule = $isUpdate
            ? 'permit_empty|min_length[1]|max_length[255]'
            : 'required|min_length[1]|max_length[255]';

        return [
            'code'       => $codeRule,
            'title'      => $titleRule,
            'content'    => 'permit_empty',
            'sort_order' => 'permit_empty|integer',
        ];
    }

    private function getLecturerRules(bool $isUpdate = false): array
    {
        $nameRule = $isUpdate
            ? 'permit_empty|min_length[1]|max_length[100]'
            : 'required|min_length[1]|max_length[100]';

        return [
            'group_id'   => $isUpdate ? 'permit_empty|integer' : 'required|integer',
            'name'       => $nameRule,
            'image'      => 'permit_empty|max_length[500]',
            'title'      => 'permit_empty|max_length[255]',
            'intro'      => 'permit_empty',
            'sort_order' => 'permit_empty|integer',
        ];
    }

    private function buildGroupSaveData(array $data): array
    {
        return [
            'code'       => trim((string) ($data['code'] ?? '')),
            'title'      => trim((string) ($data['title'] ?? '')),
            'content'    => $this->normalizeNullableString($data['content'] ?? null),
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ];
    }

    private function buildLecturerSaveData(array $data): array
    {
        return [
            'group_id'   => (int) ($data['group_id'] ?? 0),
            'name'       => trim((string) ($data['name'] ?? '')),
            'image'      => $this->normalizeNullableString($data['image'] ?? null),
            'title'      => $this->normalizeNullableString($data['title'] ?? null),
            'intro'      => $this->normalizeNullableString($data['intro'] ?? null),
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

    private function appendLecturerImageUrl(array $row): array
    {
        helper(['url']);

        $image = $row['image'] ?? null;
        if ($image && !preg_match('#^https?://#i', (string) $image)) {
            $row['image_url'] = base_url('uploads/breakout-session/' . ltrim((string) $image, '/'));
        } elseif ($image) {
            $row['image_url'] = (string) $image;
        } else {
            $row['image_url'] = null;
        }

        return $row;
    }
}
