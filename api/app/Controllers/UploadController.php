<?php

namespace App\Controllers;

use App\Models\AppProClasslistModel;
use CodeIgniter\HTTP\ResponseInterface;

class UploadController extends BaseController
{
    /**
     * 取得安全之儲存檔名（使用原檔名，僅保留 basename 與安全字元；若重複則加序號）
     */
    private function getSafeOriginalName(\CodeIgniter\HTTP\Files\UploadedFile $file, string $uploadPath): string
    {
        $original = $file->getClientName();
        $base = $original !== '' ? basename($original) : '';
        $base = preg_replace('/[^\w\-\.]/u', '_', $base);
        $base = trim($base, '._');
        if ($base === '') {
            return $file->getRandomName();
        }
        $path = $uploadPath . DIRECTORY_SEPARATOR . $base;
        if (! is_file($path)) {
            return $base;
        }
        $ext = pathinfo($base, PATHINFO_EXTENSION);
        $name = pathinfo($base, PATHINFO_FILENAME);
        $i = 1;
        do {
            $candidate = $ext !== '' ? $name . '_' . $i . '.' . $ext : $name . '_' . $i;
            $path = $uploadPath . DIRECTORY_SEPARATOR . $candidate;
            $i++;
        } while (is_file($path));
        return $candidate;
    }

    /**
     * 圖片上傳
     */
    public function image()
    {
        helper(['url']);

        $file = $this->request->getFile('image');

        if (!$file || !$file->isValid()) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)
                ->setJSON([
                    'success' => false,
                    'message' => '未取得有效的檔案'
                ]);
        }

        // 檢查檔案大小（5MB）
        $maxSize = 5 * 1024 * 1024;
        if ($file->getSize() > $maxSize) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)
                ->setJSON([
                    'success' => false,
                    'message' => '檔案大小超出限制 (5MB)'
                ]);
        }

        // 檢查副檔名與 MIME
        $allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml'
        ];

        if (!in_array($file->getMimeType(), $allowedMimeTypes, true)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)
                ->setJSON([
                    'success' => false,
                    'message' => '檔案格式不支援，僅允許 JPG/PNG/GIF/WebP/SVG'
                ]);
        }

        $uploadPath = FCPATH . 'uploads';


        if (!is_dir($uploadPath) && !mkdir($uploadPath, 0755, true)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)
                ->setJSON([
                    'success' => false,
                    'message' => '無法建立上傳目錄'
                ]);
        }

        $newName = $this->getSafeOriginalName($file, $uploadPath);

        try {
            $file->move($uploadPath, $newName);
        } catch (\Throwable $th) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)
                ->setJSON([
                    'success' => false,
                    'message' => '檔案儲存失敗'
                ]);
        }

        $url = base_url('uploads/' . $newName);

        return $this->response->setJSON([
            'success' => true,
            'url' => $url
        ]);
    }

    /**
     * 產品圖片上傳
     *
     * 新版規則：儲存至 /uploads/ktv/Album/{folderName}/{productseries}/檔名
     * - folderName 來自對應分類表 pro_classlist.folderName
     * - productseries 由前端/產品 API 依既有規則產生
     *
     * 為了相容舊調用方式：
     * - 若缺少 class_id 或 productseries，則退回舊行為：/uploads/ktv/Album/{RegionName}/{隨機子資料夾}/檔名
     *
     * region 仍透過 GET/POST 傳入（tw/sg/mm），用來切換對應的 pro_classlist_* 資料表。
     */
    public function productImage()
    {
        $file = $this->request->getFile('image');
        if (! $file || ! $file->isValid()) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)
                ->setJSON([
                    'success' => false,
                    'message' => '未取得有效的檔案',
                ]);
        }
        $maxSize = 5 * 1024 * 1024;
        if ($file->getSize() > $maxSize) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)
                ->setJSON([
                    'success' => false,
                    'message' => '檔案大小超出限制 (5MB)',
                ]);
        }
        $allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ];
        if (! in_array($file->getMimeType(), $allowedMimeTypes, true)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)
                ->setJSON([
                    'success' => false,
                    'message' => '檔案格式不支援，僅允許 JPG/PNG/GIF/WebP/SVG',
                ]);
        }

        // region 僅用來切換資料表，不參與路徑結構
        $region = $this->request->getGetPost('region');
        if (! is_string($region) || $region === '') {
            $region = 'mm';
        }
        $region = strtolower($region);
        if (! in_array($region, ['tw', 'sg', 'mm'], true)) {
            $region = 'mm';
        }

        // 新版路徑所需參數
        $classId       = $this->request->getGetPost('class_id');
        $productseries = $this->request->getGetPost('productseries');
        $classIdInt    = is_numeric($classId) ? (int) $classId : 0;
        $productseries = is_string($productseries) ? trim($productseries) : '';

        // 當有提供 class_id 與 productseries 時，採用新規則：/uploads/ktv/Album/{folderName}/{productseries}/
        if ($classIdInt > 0 && $productseries !== '') {
            $classlistModel = new AppProClasslistModel();
            $classlistModel->setTableForRegion($region);

            $folderName = '';
            try {
                $classRow = $classlistModel->find($classIdInt);
                if (is_array($classRow) && isset($classRow['folderName'])) {
                    $folderName = trim((string) $classRow['folderName']);
                }
            } catch (\Throwable $e) {
                // 若查詢分類失敗，後面會走舊邏輯
            }

            if ($folderName !== '') {
                $relativeDir = 'ktv'
                    . DIRECTORY_SEPARATOR . 'Album'
                    . DIRECTORY_SEPARATOR . $folderName
                    . DIRECTORY_SEPARATOR . $productseries;

                $uploadPath = FCPATH . 'uploads' . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativeDir);

                if (! is_dir($uploadPath) && ! mkdir($uploadPath, 0755, true)) {
                    return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)
                        ->setJSON([
                            'success' => false,
                            'message' => '無法建立上傳目錄',
                        ]);
                }

                $newName = $this->getSafeOriginalName($file, $uploadPath);
                try {
                    $file->move($uploadPath, $newName);
                } catch (\Throwable $th) {
                    return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)
                        ->setJSON([
                            'success' => false,
                            'message' => '檔案儲存失敗',
                        ]);
                }

                $relativePath = 'ktv/Album/' . $folderName . '/' . $productseries . '/' . $newName;
                $url      = base_url('uploads/' . $relativePath);
                $filename = $folderName . '/' . $productseries . '/' . $newName;

                return $this->response->setJSON([
                    'success'  => true,
                    'url'      => $url,
                    'filename' => $filename,
                ]);
            }
            // 若 folderName 取不到，會往下使用舊路徑邏輯以避免整體流程中斷
        }

        // 舊路徑邏輯（相容模式）：/uploads/ktv/Album/{RegionName}/{隨機子資料夾}/
        $regionFolder = [
            'tw' => 'Taiwan',
            'sg' => 'Singapore',
            'mm' => 'apaforum',
        ];
        $regionName = $regionFolder[$region] ?? 'apaforum';
        $subfolder  = date('YmdHis') . '-' . bin2hex(random_bytes(2));
        $relativeDir = 'ktv'
            . DIRECTORY_SEPARATOR . 'Album'
            . DIRECTORY_SEPARATOR . $regionName
            . DIRECTORY_SEPARATOR . $subfolder;
        $uploadPath = FCPATH . 'uploads' . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativeDir);

        if (! is_dir($uploadPath) && ! mkdir($uploadPath, 0755, true)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)
                ->setJSON([
                    'success' => false,
                    'message' => '無法建立上傳目錄',
                ]);
        }
        $newName = $this->getSafeOriginalName($file, $uploadPath);
        try {
            $file->move($uploadPath, $newName);
        } catch (\Throwable $th) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)
                ->setJSON([
                    'success' => false,
                    'message' => '檔案儲存失敗',
                ]);
        }
        $relativePath = 'ktv/Album/' . $regionName . '/' . $subfolder . '/' . $newName;
        $url      = base_url('uploads/' . $relativePath);
        $filename = $regionName . '/' . $subfolder . '/' . $newName;
        return $this->response->setJSON([
            'success'  => true,
            'url'      => $url,
            'filename' => $filename,
        ]);
    }

    /**
     * 管理員頭像上傳（存至 uploads/admins/，供 sys_admin.photo 使用）
     */
    public function admins()
    {
        return $this->uploadToFolder('admins');
    }

    /**
     * 講師照片上傳（存至 uploads/lecturer/，供 app_lecturer.image 使用）
     */
    public function lecturer()
    {
        return $this->uploadToFolder('lecturer');
    }

    /**
     * 分組討論講師照片上傳（存至 uploads/breakout-session/，供 app_breakout_lecturer.image 使用）
     */
    public function breakoutSession()
    {
        return $this->uploadToFolder('breakout-session');
    }


    /**
     * 通用：上傳圖片到指定子目錄
     */
    private function uploadToFolder(string $subDir): \CodeIgniter\HTTP\ResponseInterface
    {
        $file = $this->request->getFile('image');
        if (! $file || ! $file->isValid()) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => '未取得有效的檔案',
            ]);
        }
        $maxSize = 5 * 1024 * 1024;
        if ($file->getSize() > $maxSize) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => '檔案大小超出限制 (5MB)',
            ]);
        }
        $allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        ];
        if (! in_array($file->getMimeType(), $allowedMimeTypes, true)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)->setJSON([
                'success' => false,
                'message' => '檔案格式不支援，僅允許 JPG/PNG/GIF/WebP/SVG',
            ]);
        }
        $uploadPath = FCPATH . 'uploads' . DIRECTORY_SEPARATOR . $subDir;
        if (! is_dir($uploadPath) && ! mkdir($uploadPath, 0755, true)) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '無法建立上傳目錄',
            ]);
        }
        $newName = $this->getSafeOriginalName($file, $uploadPath);
        try {
            $file->move($uploadPath, $newName);
        } catch (\Throwable $th) {
            return $this->response->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR)->setJSON([
                'success' => false,
                'message' => '檔案儲存失敗',
            ]);
        }
        $url = base_url('uploads/' . $subDir . '/' . $newName);
        return $this->response->setJSON([
            'success'  => true,
            'url'      => $url,
            'filename' => $newName,
        ]);
    }
}
