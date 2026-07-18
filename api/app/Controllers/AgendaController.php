<?php
namespace App\Controllers;

use App\Models\AppAgendaDayModel;
use App\Models\AppAgendaItemModel;
use CodeIgniter\HTTP\ResponseInterface;

class AgendaController extends BaseController
{
    protected $resourceName = '議程';

    protected AppAgendaDayModel $dayModel;
    protected AppAgendaItemModel $itemModel;

    public function __construct()
    {
        $this->dayModel  = new AppAgendaDayModel();
        $this->itemModel = new AppAgendaItemModel();
    }

    /**
     * 取得完整議程（含各日項目）
     */
    public function get()
    {
        try {
            $days = $this->dayModel
                ->orderBy('sort_order', 'ASC')
                ->orderBy('id', 'ASC')
                ->findAll();

            $items = $this->itemModel
                ->orderBy('sort_order', 'ASC')
                ->orderBy('id', 'ASC')
                ->findAll();

            $itemsByDay = [];
            foreach ($items as $item) {
                $dayId = (int) $item['day_id'];
                if (!isset($itemsByDay[$dayId])) {
                    $itemsByDay[$dayId] = [];
                }
                $itemsByDay[$dayId][] = $item;
            }

            $result = [];
            foreach ($days as $day) {
                $dayId = (int) $day['id'];
                $day['items'] = $itemsByDay[$dayId] ?? [];
                $result[] = $day;
            }

            return $this->response->setJSON([
                'success' => true,
                'data'    => $result,
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'getAgenda failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => $this->messages['get_failed'],
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * 整批儲存議程（新增/更新/刪除 days 與 items）
     */
    public function save()
    {
        $this->checkAuth();

        $payload = $this->request->getJSON(true) ?: $this->request->getPost();
        $days    = $payload['days'] ?? null;

        if (!is_array($days)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_UNPROCESSABLE_ENTITY)->setJSON([
                'success' => false,
                'message' => '資料格式錯誤',
            ]);
        }

        $db = db_connect();

        try {
            $db->transStart();

            $existingDayIds = array_map(
                static fn ($row) => (int) $row['id'],
                $this->dayModel->select('id')->findAll()
            );

            $keptDayIds = [];

            foreach ($days as $dayIndex => $day) {
                if (!is_array($day)) {
                    continue;
                }

                $dayId = isset($day['id']) && $day['id'] !== '' && $day['id'] !== null
                    ? (int) $day['id']
                    : null;

                $dayData = [
                    'label'      => $this->normalizeNullableString($day['label'] ?? null),
                    'sort_order' => (int) ($day['sort_order'] ?? $dayIndex),
                ];

                if ($dayId && in_array($dayId, $existingDayIds, true)) {
                    $this->dayModel->update($dayId, $dayData);
                    $keptDayIds[] = $dayId;
                } else {
                    $dayId = (int) $this->dayModel->insert($dayData);
                    $keptDayIds[] = $dayId;
                }

                $items         = is_array($day['items'] ?? null) ? $day['items'] : [];
                $existingItems = $this->itemModel->where('day_id', $dayId)->findAll();
                $existingItemIds = array_map(
                    static fn ($row) => (int) $row['id'],
                    $existingItems
                );
                $keptItemIds = [];

                foreach ($items as $itemIndex => $item) {
                    if (!is_array($item)) {
                        continue;
                    }

                    $itemId = isset($item['id']) && $item['id'] !== '' && $item['id'] !== null
                        ? (int) $item['id']
                        : null;

                    $itemData = [
                        'day_id'     => $dayId,
                        'session'    => $this->normalizeNullableString($item['session'] ?? null),
                        'type'       => $this->normalizeNullableString($item['type'] ?? null),
                        'topic'      => $this->normalizeNullableString($item['topic'] ?? null),
                        'sort_order' => (int) ($item['sort_order'] ?? $itemIndex),
                    ];

                    if ($itemId && in_array($itemId, $existingItemIds, true)) {
                        $this->itemModel->update($itemId, $itemData);
                        $keptItemIds[] = $itemId;
                    } else {
                        $newItemId = (int) $this->itemModel->insert($itemData);
                        $keptItemIds[] = $newItemId;
                    }
                }

                $deleteItemIds = array_diff($existingItemIds, $keptItemIds);
                if (!empty($deleteItemIds)) {
                    $this->itemModel->whereIn('id', $deleteItemIds)->delete();
                }
            }

            $deleteDayIds = array_diff($existingDayIds, $keptDayIds);
            if (!empty($deleteDayIds)) {
                $this->dayModel->whereIn('id', $deleteDayIds)->delete();
            }

            $db->transComplete();

            if ($db->transStatus() === false) {
                return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                    'success' => false,
                    'message' => '儲存議程失敗，請稍後再試',
                ]);
            }

            return $this->response->setJSON([
                'success' => true,
                'message' => '儲存議程成功',
            ]);
        } catch (\Throwable $e) {
            $db->transRollback();
            log_message('error', 'saveAgenda failed: {message}', ['message' => $e->getMessage()]);

            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '儲存議程失敗，請稍後再試',
                'error'   => ENVIRONMENT !== 'production' ? $e->getMessage() : null,
            ]);
        }
    }

    private function normalizeNullableString($value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim((string) $value);

        return $trimmed === '' ? null : $trimmed;
    }
}
