<script setup lang="ts">
interface Props {
    modelValue: string;
    label?: string;
    name?: string;
    description?: string;
    error?: string | boolean;
    required?: boolean;
    disabled?: boolean;
    maxSize?: number;
    acceptTypes?: string[];
    previewMaxWidth?: string;
    /** 指定上傳 API（如 /upload/banner），此時 modelValue 為 filename */
    uploadEndpoint?: string;
    /** 與 uploadEndpoint 搭配，預覽圖 base URL（如 apiBase + 'uploads/ktv/Album/'） */
    previewBaseUrl?: string;
    /** 舊資料僅存檔名時使用的預覽 base（如 apiBase + 'uploads/products/'），可選 */
    legacyPreviewBaseUrl?: string;
    previewAspectRatio?: string;
}

const props = withDefaults(defineProps<Props>(), {
    label: "圖片",
    name: "image",
    description: "",
    error: false,
    required: false,
    disabled: false,
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptTypes: () => ["image/*"],
    previewMaxWidth: "100%",
    previewAspectRatio: "1/1"
});

const emit = defineEmits<{
    "update:modelValue": [value: string];
    "preview-change": [preview: string | null];
}>();

// 使用單圖上傳 composable
const upload = useImageUploadSingle({
    maxSize: props.maxSize,
    acceptTypes: props.acceptTypes,
    uploadEndpoint: props.uploadEndpoint,
    previewBaseUrl: props.previewBaseUrl,
    legacyPreviewBaseUrl: props.legacyPreviewBaseUrl,
    onPreviewChange: (preview) => {
        console.log("[ImageUploadSingle] onPreviewChange", {
            name: props.name,
            preview
        });
        emit("preview-change", preview);
    }
});

// 追蹤圖片載入狀態
const isImageLoaded = ref(false);
const imageLoadError = ref(false);

const handleImageLoad = (e: Event) => {
    const img = e.target as HTMLImageElement;
    isImageLoaded.value = true;
    imageLoadError.value = false;
    console.log("[ImageUploadSingle] image loaded", {
        name: props.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        src: img.currentSrc || img.src
    });
};

const handleImageError = () => {
    isImageLoaded.value = false;
    imageLoadError.value = true;
    console.log("[ImageUploadSingle] image load error", {
        name: props.name,
        src: upload.preview.value || props.modelValue
    });
};

// 當圖片來源改變時，重置載入狀態
watch(
    () => upload.preview.value || props.modelValue,
    () => {
        isImageLoaded.value = false;
        imageLoadError.value = false;
    }
);

// 監聽 upload.formValue 變化，同步到 modelValue
watch(
    () => upload.formValue.value,
    (newValue) => {
        console.log("[ImageUploadSingle] formValue changed", {
            name: props.name,
            newValue
        });
        if (newValue && !newValue.startsWith("temp_")) {
            emit("update:modelValue", newValue);
        } else if (newValue && newValue.startsWith("temp_")) {
            // 臨時 ID 也更新，用於驗證
            emit("update:modelValue", newValue);
        }
    }
);

// 監聽 upload.preview 變化
watch(
    () => upload.preview.value,
    (preview) => {
        console.log("[ImageUploadSingle] preview changed", {
            name: props.name,
            preview
        });
        if (preview) {
            // 有預覽圖時，優先使用 formValue（已上傳的 URL），否則使用臨時 ID
            if (
                upload.formValue.value &&
                !upload.formValue.value.startsWith("temp_")
            ) {
                emit("update:modelValue", upload.formValue.value);
            } else if (upload.tempId.value) {
                emit("update:modelValue", upload.tempId.value);
            } else if (upload.formValue.value) {
                emit("update:modelValue", upload.formValue.value);
            }
        } else if (!preview && !props.modelValue) {
            // 沒有預覽圖且沒有 modelValue 時，清空
            emit("update:modelValue", "");
        }
    },
    { immediate: true }
);

// 監聽外部 modelValue 變化，載入初始值
watch(
    () => props.modelValue,
    (newValue) => {
        console.log("[ImageUploadSingle] external modelValue changed", {
            name: props.name,
            newValue
        });
        if (newValue && newValue !== upload.formValue.value) {
            // 只有在沒有預覽圖時才同步，避免覆蓋新上傳的圖片
            if (!upload.preview.value) {
                upload.loadInitialValue(newValue);
            }
        } else if (!newValue && !upload.preview.value) {
            upload.reset();
        }
    },
    { immediate: true }
);

// 處理移除
const handleRemove = () => {
    console.log("[ImageUploadSingle] remove image", {
        name: props.name,
        modelValue: props.modelValue
    });
    upload.remove();
    emit("update:modelValue", "");
};

// 暴露上傳方法給父組件
defineExpose({
    upload: upload.upload,
    remove: handleRemove,
    reset: upload.reset,
    loadInitialValue: upload.loadInitialValue,
    // 暴露預覽相關數據（用於預覽功能）
    preview: upload.preview,
    formValue: upload.formValue
});
</script>

<template>
    <UFormField
        :label="label"
        :name="name"
        :description="description"
        :error="error"
        :required="required">
        <div class="space-y-2">
            <input
                :ref="upload.inputRef"
                type="file"
                :accept="acceptTypes.join(',')"
                class="hidden"
                :disabled="disabled"
                @change="(e) => {
                    const target = e.target as HTMLInputElement | null;
                    const file = target?.files && target.files[0];
                    console.log('[ImageUploadSingle] file selected', {
                        name,
                        fileName: file?.name,
                        fileSize: file?.size,
                        fileType: file?.type
                    });
                    upload.handleFileSelect(e);
                }" />
            <div
                v-if="upload.preview.value || modelValue"
                class="relative w-full "
                :style="{
                    maxWidth: previewMaxWidth
                }">
                <!-- 預設圖（載入前或載入失敗時顯示） -->
                <div
                    v-if="!isImageLoaded"
                    class="w-full bg-gray-100 rounded-lg border flex items-center justify-center"
                    :style="{
                        aspectRatio: previewAspectRatio
                    }">
                    <div class="text-gray-400 text-center">
                        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p class="text-sm">{{ imageLoadError ? '載入失敗 Failed' : '載入中 Loading...' }}</p>
                    </div>
                </div>
                <!-- 實際圖片（載入後顯示） -->
                <img
                    v-show="isImageLoaded"
                    :src="upload.preview.value || modelValue"
                    :alt="label"
                    class="w-full object-contain rounded-lg border"
                    :style="{
                        aspectRatio: previewAspectRatio
                    }"
                    @load="handleImageLoad($event)"
                    @error="handleImageError" />
                <UButton
                    icon="i-lucide-x"
                    size="xs"
                    color="error"
                    variant="solid"
                    class="absolute top-2 right-2"
                    :disabled="disabled || upload.isUploading.value"
                    @click="handleRemove" />
            </div>
            <UButton
                :label="upload.preview.value || modelValue ? '更換圖片 Change' : '上傳圖片 Upload'"
                icon="i-lucide-upload"
                color="primary"
                variant="outline"
                block
                :loading="upload.isUploading.value"
                :disabled="disabled || upload.isUploading.value"
                @click="() => {
                    console.log('[ImageUploadSingle] trigger file select', {
                        name,
                        modelValue
                    });
                    upload.triggerFileSelect();
                }" />
        </div>
    </UFormField>
</template>

