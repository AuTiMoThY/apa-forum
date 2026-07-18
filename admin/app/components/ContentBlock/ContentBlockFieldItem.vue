<script setup lang="ts">
import type { ContentBlockField } from "~/types/ContentBlock";
import ImageUploadSingle from "~/components/Form/ImageUploadSingle.vue";

const props = withDefaults(
    defineProps<{
        field: ContentBlockField;
        readonly?: boolean;
    }>(),
    {
        readonly: false
    }
);

const emit = defineEmits<{
    (e: "update", field: ContentBlockField): void;
}>();

const localField = ref<ContentBlockField>({ ...props.field });

// 監聽外部變更
watch(
    () => props.field,
    (newField) => {
        localField.value = { ...newField };
    },
    { deep: true }
);

// 更新欄位內容
const updateValue = (value: string | string[]) => {
    if (props.readonly) return;
    localField.value.value = value;
    emit("update", { ...localField.value });
};

// 圖片上傳組件引用（用於立即上傳）
const imageUploadRef = ref<InstanceType<typeof ImageUploadSingle> | null>(null);

// 處理圖片值變更（來自 ImageUploadSingle 組件）
const handleImageValueChange = async (value: string) => {
    // 如果是臨時 ID，觸發立即上傳
    if (value && value.startsWith('temp_') && imageUploadRef.value) {
        const success = await imageUploadRef.value.upload();
        if (success && imageUploadRef.value.formValue) {
            const uploadedValue = imageUploadRef.value.formValue;
            if (typeof uploadedValue === 'string' && !uploadedValue.startsWith('temp_')) {
                updateValue(uploadedValue);
            }
        }
    } else if (value && !value.startsWith('temp_')) {
        // 已上傳的 URL，直接更新
        updateValue(value);
    }
};

// 欄位類型顯示名稱
const fieldTypeNames: Record<string, string> = {
    content: "內容",
    image: "圖片",
    caption: "圖說",
    video_url: "影片連結"
};

const fieldIcon = computed(() => {
    return {
        content: "i-lucide-file-text",
        image: "i-lucide-image",
        caption: "i-lucide-message-square",
        video_url: "i-lucide-video"
    }[props.field.type] || "i-lucide-file";
});
</script>

<template>
    <UCard class="relative group">
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <UIcon :name="fieldIcon" class="w-5 h-5" />
                    <span class="text-sm font-semibold">
                        {{ localField.label }}
                    </span>
                    <span
                        class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        類型：{{ fieldTypeNames[field.type] || field.type }}
                    </span>
                </div>
            </div>
        </template>

        <div class="">
            <!-- 內容欄位（textarea） -->
            <template v-if="field.type === 'content'">
                <UFormField name="field-value">
                    <UTextarea
                        v-if="!props.readonly"
                        :model-value="typeof localField.value === 'string' ? localField.value : ''"
                        :placeholder="`請輸入${localField.label}`"
                        :rows="3"
                        @update:model-value="updateValue"
                        autoresize
                        :ui="{ root: 'w-full' }" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {{ typeof localField.value === 'string' ? localField.value : '-' }}
                    </div>
                </UFormField>
            </template>

            <!-- 圖片欄位 -->
            <template v-else-if="field.type === 'image'">
                <template v-if="!props.readonly">
                    <ImageUploadSingle
                        ref="imageUploadRef"
                        :model-value="typeof localField.value === 'string' ? localField.value : ''"
                        :label="localField.label"
                        :disabled="props.readonly"
                        :preview-max-width="'100%'"
                        :preview-max-height="'300px'"
                        @update:model-value="handleImageValueChange" />
                </template>
                <template v-else>
                    <UFormField
                        :label="localField.label"
                        name="field-value">
                        <div v-if="typeof localField.value === 'string' && localField.value" class="w-full max-w-lg">
                            <img
                                :src="localField.value"
                                alt="圖片"
                                class="w-full max-w-lg object-cover rounded-lg border" />
                        </div>
                        <div v-else class="text-gray-400 text-sm">無圖片</div>
                    </UFormField>
                </template>
            </template>

            <!-- 圖說欄位 -->
            <template v-else-if="field.type === 'caption'">
                <UFormField name="field-value">
                    <UInput
                        v-if="!props.readonly"
                        :model-value="typeof localField.value === 'string' ? localField.value : ''"
                        :placeholder="`請輸入${localField.label}`"
                        @update:model-value="updateValue"
                        :ui="{ root: 'w-full' }" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300">
                        {{ typeof localField.value === 'string' ? localField.value : '-' }}
                    </div>
                </UFormField>
            </template>

            <!-- 影片連結欄位 -->
            <template v-else-if="field.type === 'video_url'">
                <UFormField name="field-value">
                    <UInput
                        v-if="!props.readonly"
                        :model-value="typeof localField.value === 'string' ? localField.value : ''"
                        :placeholder="`請輸入${localField.label}`"
                        @update:model-value="updateValue"
                        :ui="{ root: 'w-full' }" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300">
                        {{ typeof localField.value === 'string' ? localField.value : '-' }}
                    </div>
                </UFormField>
            </template>
        </div>
    </UCard>
</template>

