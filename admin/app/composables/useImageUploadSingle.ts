/**
 * 單張圖片上傳 Composable
 * 支持延遲上傳（資料庫寫入成功後才上傳）
 * 可選 uploadEndpoint + previewBaseUrl：上傳到指定 API 並以 filename 為 modelValue（例：banner、color）
 */
export const useImageUploadSingle = (options?: {
    maxSize?: number; // 最大文件大小（字節），默認 5MB
    acceptTypes?: string[]; // 接受的檔案類型，默認 ["image/*"]
    onPreviewChange?: (preview: string | null) => void; // 預覽變更回調
    /** 指定上傳 API 路徑（如 /upload/banner），回傳 filename 寫入 formValue */
    uploadEndpoint?: string;
    /** 當使用 uploadEndpoint 時，預覽圖的 base URL（如 apiBase + 'uploads/' 或 'uploads/banner/'） */
    previewBaseUrl?: string;
    /** 舊資料僅存檔名時使用的預覽 base（如 apiBase + 'uploads/products/'），可選 */
    legacyPreviewBaseUrl?: string;
}) => {
    const { uploadImage, uploadToEndpoint, getImagePreview } = useImageUpload();
    const toast = useToast();

    const maxSize = options?.maxSize ?? 5 * 1024 * 1024; // 默認 5MB
    const acceptTypes = options?.acceptTypes ?? ["image/*"];
    const useEndpoint = !!options?.uploadEndpoint;

    // 輸入元素引用
    const inputRef = ref<HTMLInputElement | null>(null);
    // 預覽 URL
    const preview = ref<string | null>(null);
    // 上傳狀態
    const isUploading = ref(false);
    // 待上傳的文件
    const pendingFile = ref<File | null>(null);
    // 臨時 ID（用於標記待上傳的圖片）
    const tempIdRef = ref<string | null>(null);
    // 表單數據的響應式引用（用於更新實際值）
    const formValueRef = ref<string>("");

    /**
     * 生成臨時 ID
     */
    const generateTempId = (): string => {
        return `temp_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`;
    };

    /**
     * 驗證文件
     */
    const validateFile = (file: File): boolean => {
        // 驗證檔案類型
        const isValidType = acceptTypes.some((type) => {
            if (type.endsWith("/*")) {
                const baseType = type.split("/")[0];
                return file.type.startsWith(`${baseType}/`);
            }
            return file.type === type;
        });

        if (!isValidType) {
            toast.add({
                title: "檔案格式錯誤",
                description: "請選擇圖片檔案",
                color: "error"
            });
            return false;
        }

        // 驗證檔案大小
        if (file.size > maxSize) {
            toast.add({
                title: "檔案過大",
                description: `圖片大小不能超過 ${Math.round(maxSize / 1024 / 1024)}MB`,
                color: "error"
            });
            return false;
        }

        return true;
    };

    /**
     * 處理文件選擇（暫不上傳）
     */
    const handleFileSelect = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        if (!validateFile(file)) {
            if (inputRef.value) {
                inputRef.value.value = "";
            }
            return;
        }

        try {
            // 生成臨時 ID
            const tempId = generateTempId();
            tempIdRef.value = tempId;

            // 生成本地預覽
            const previewUrl = await getImagePreview(file);
            preview.value = previewUrl;
            options?.onPreviewChange?.(previewUrl);

            // 保存 File 對象，等待提交時再上傳
            pendingFile.value = file;
            
            // 更新 formValue 為臨時 ID（用於表單驗證）
            formValueRef.value = tempId;
        } catch (error) {
            console.error("圖片處理錯誤:", error);
            toast.add({
                title: "處理失敗",
                description: "圖片處理時發生錯誤",
                color: "error"
            });
        } finally {
            if (inputRef.value) {
                inputRef.value.value = "";
            }
        }
    };

    /**
     * 觸發文件選擇
     */
    const triggerFileSelect = () => {
        // console.log("triggerFileSelect", inputRef.value);
        inputRef.value?.click();
    };

    /**
     * 移除圖片
     */
    const remove = () => {
        preview.value = null;
        formValueRef.value = "";
        pendingFile.value = null;
        tempIdRef.value = null;
        if (inputRef.value) {
            inputRef.value.value = "";
        }
        options?.onPreviewChange?.(null);
    };

    /**
     * 上傳待上傳的圖片
     */
    const upload = async (): Promise<boolean> => {
        if (!pendingFile.value) {
            return true; // 沒有待上傳的圖片
        }

        isUploading.value = true;

        try {
            if (useEndpoint && options?.uploadEndpoint) {
                const result = await uploadToEndpoint(
                    pendingFile.value,
                    options.uploadEndpoint
                );
                if (result) {
                    formValueRef.value = result.filename;
                    preview.value = options.previewBaseUrl
                        ? options.previewBaseUrl + result.filename
                        : result.url;
                    pendingFile.value = null;
                    tempIdRef.value = null;
                    options?.onPreviewChange?.(preview.value);
                    return true;
                }
            } else {
                const uploadedUrl = await uploadImage(pendingFile.value);
                if (uploadedUrl) {
                    formValueRef.value = uploadedUrl;
                    preview.value = uploadedUrl;
                    pendingFile.value = null;
                    tempIdRef.value = null;
                    options?.onPreviewChange?.(uploadedUrl);
                    return true;
                }
            }
            toast.add({
                title: "上傳失敗",
                description: "圖片上傳失敗，請重試",
                color: "error"
            });
            return false;
        } catch (error) {
            console.error("上傳圖片錯誤:", error);
            toast.add({
                title: "上傳失敗",
                description: "圖片上傳時發生錯誤",
                color: "error"
            });
            return false;
        } finally {
            isUploading.value = false;
        }
    };

    /**
     * 載入初始數據（編輯模式）
     * 當有 previewBaseUrl 時，value 視為 filename；若 value 含 '/' 則為新路徑，否則用 legacyPreviewBaseUrl（舊資料僅檔名）
     */
    const loadInitialValue = (value: string | null) => {
        if (value) {
            formValueRef.value = value;
            pendingFile.value = null;
            tempIdRef.value = null;
            const base = options?.previewBaseUrl
                ? (value.includes("/")
                    ? options.previewBaseUrl
                    : (options?.legacyPreviewBaseUrl ?? options.previewBaseUrl))
                : "";
            preview.value = base ? base + value : value;
            options?.onPreviewChange?.(preview.value);
        } else {
            preview.value = null;
            formValueRef.value = "";
            pendingFile.value = null;
            tempIdRef.value = null;
            options?.onPreviewChange?.(null);
        }
    };

    /**
     * 重置
     */
    const reset = () => {
        preview.value = null;
        formValueRef.value = "";
        pendingFile.value = null;
        tempIdRef.value = null;
        if (inputRef.value) {
            inputRef.value.value = "";
        }
        options?.onPreviewChange?.(null);
    };

    return {
        // Refs
        inputRef,
        preview,
        isUploading,
        formValue: formValueRef, // 用於雙向綁定表單數據

        // Methods
        handleFileSelect,
        triggerFileSelect,
        remove,
        upload,
        loadInitialValue,
        reset,

        // Computed
        hasPendingFile: computed(() => pendingFile.value !== null),
        tempId: tempIdRef // 暴露臨時 ID，用於檢查是否為臨時值
    };
};
