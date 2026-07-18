<script setup lang="ts">
import type { FieldConfig, FieldType } from "~/types/CutSectionField";
import ImageUploadSingle from "~/components/Form/ImageUploadSingle.vue";
import ImageUploadMultiple from "~/components/Form/ImageUploadMultiple.vue";

const { hasPermission, isSuperAdmin } = usePermission();

// 權限檢查
const canSortField = computed(() => isSuperAdmin() || hasPermission(`${props.url}.field.sort`));
// const canDeleteField = computed(() => isSuperAdmin() || hasPermission('about.field.delete'));

const props = withDefaults(
    defineProps<{
        field: FieldConfig;
        index: number;
        url?: string;
        readonly?: boolean;
    }>(),
    {
        readonly: false
    }
);

const emit = defineEmits<{
    (e: "update", field: FieldConfig): void;
    (e: "delete", id: string): void;
    (e: "move-up", index: number): void;
    (e: "move-down", index: number): void;
}>();

const localField = ref<FieldConfig>({ ...props.field });
// console.log("localField:", localField.value);

// 控制標題區的即時編輯
const isEditingLabel = ref(false);

// 監聽外部變更
watch(
    () => props.field,
    (newField) => {
        localField.value = { ...newField };
    },
    { deep: true }
);

// 更新欄位名稱
const updateLabel = (label: string) => {
    if (props.readonly) return;
    localField.value.label = label;
    emit("update", { ...localField.value });
};

// 更新欄位內容
const updateValue = (value: string | number | boolean | string[]) => {
    if (props.readonly) return;
    console.log("更新欄位內容:", value);
    localField.value.value = value;
    emit("update", { ...localField.value });
};

// 欄位類型顯示名稱
const fieldTypeNames: Record<FieldType, string> = {
    title: "標題",
    subtitle: "副標題",
    content: "內文",
    desktop_image: "電腦版圖片",
    mobile_image: "手機版圖片",
    video: "影片",
    text: "文字輸入",
    number: "數字輸入",
    textarea: "多行文字",
    switch: "開關",
    select: "下拉選單",
    image: "單一圖片",
    image_multiple: "多張圖片"
};

// 圖片上傳組件引用（用於立即上傳）
const imageUploadRef = ref<InstanceType<typeof ImageUploadSingle> | null>(null);
const imageMultipleUploadRef = ref<InstanceType<typeof ImageUploadMultiple> | null>(null);

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

const fieldIcon = computed(() => {
    return {
        title: "i-lucide-heading",
        subtitle: "i-lucide-heading-2",
        desktop_image: "i-lucide-image",
        mobile_image: "i-lucide-image",
        content: "i-lucide-file-text",
        video: "i-lucide-video",
        text: "i-lucide-type",
        number: "i-lucide-hash",
        textarea: "i-lucide-file-text",
        switch: "i-lucide-toggle-left",
        select: "i-lucide-list",
        image: "i-lucide-image",
        image_multiple: "i-lucide-images"
    }[props.field.type];
});

watch(isEditingLabel, async (editing) => {
    if (editing) {
        await nextTick();
        // labelInputRef.value?.input?.focus?.();
    }
});
</script>

<template>
    <UCard class="relative group">
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <UIcon :name="fieldIcon" class="w-5 h-5" />
                    <div class="flex items-center gap-2">
                        <template v-if="isEditingLabel">
                            <UInput
                                v-model="localField.label"
                                size="xs"
                                class="w-44"
                                :placeholder="`請輸入欄位名稱，例如：精神一主標`"
                                @blur="
                                    isEditingLabel = false;
                                    updateLabel(localField.label);
                                "
                                @keyup.enter="
                                    isEditingLabel = false;
                                    updateLabel(localField.label);
                                "
                                :autofocus="isEditingLabel">
                                <template #trailing>
                                    <UKbd value="Enter" />
                                </template>
                            </UInput>
                        </template>
                        <template v-else>
                            <span
                                :class="[
                                    'text-sm font-semibold',
                                    props.readonly
                                        ? 'text-gray-600 cursor-default'
                                        : 'text-primary cursor-pointer hover:underline'
                                ]"
                                @click="!props.readonly && (isEditingLabel = true)">
                                {{
                                    localField.label ||
                                    fieldTypeNames[field.type]
                                }}
                            </span>
                        </template>
                        <span
                            class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            類型：{{ fieldTypeNames[field.type] }}
                        </span>
                    </div>
                </div>
                <div v-if="!props.readonly" class="flex items-center gap-1">
                    <PermissionGuard :permission="`${url}.field.sort`">
                        <UButton
                            v-if="index > 0 && canSortField"
                            icon="i-lucide-arrow-up"
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            @click="emit('move-up', index)" />
                    </PermissionGuard>

                    <PermissionGuard :permission="`${url}.field.sort`">
                        <UButton
                            icon="i-lucide-arrow-down"
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            @click="emit('move-down', index)" />
                    </PermissionGuard>

                    <PermissionGuard :permission="`${url}.field.delete`">
                        <UButton
                            icon="i-lucide-trash-2"
                            size="xs"
                            color="error"
                            variant="ghost"
                            @click="emit('delete', field.id)" />
                    </PermissionGuard>
                </div>
            </div>
        </template>

        <div class="">
            <!-- 根據欄位類型顯示不同的輸入元件 -->
            <template
                v-if="field.type === 'title' || field.type === 'subtitle'">
                <UFormField
                    name="field-value"
                    :ui="{ root: 'flex items-center gap-2' }">
                    <UTextarea
                        v-if="!props.readonly"
                        :model-value="typeof localField.value === 'string' ? localField.value : String(localField.value || '')"
                        :placeholder="`請輸入${localField.label}`"
                        :rows="1"
                        @update:model-value="(val) => updateValue(val as string)"
                        autoresize
                        :ui="{ root: 'w-full' }" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300">
                        {{ localField.value || '-' }}
                    </div>
                </UFormField>
            </template>
            
            <template v-else-if="field.type === 'content'">
                <UFormField name="field-value">
                    <UTextarea
                        v-if="!props.readonly"
                        :model-value="typeof localField.value === 'string' ? localField.value : String(localField.value || '')"
                        placeholder="請輸入內文"
                        :rows="3"
                        @update:model-value="(val) => updateValue(val as string)"
                        autoresize
                        :ui="{ root: 'w-full' }" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {{ localField.value || '-' }}
                    </div>
                </UFormField>
            </template>

            <template
                v-else-if="
                    field.type === 'desktop_image' ||
                    field.type === 'mobile_image'
                ">
                <template v-if="!props.readonly">
                    <ImageUploadSingle
                        ref="imageUploadRef"
                        :model-value="typeof localField.value === 'string' ? localField.value : ''"
                        :label="fieldTypeNames[field.type]"
                        :disabled="props.readonly"
                        :preview-max-width="'100%'"
                        :preview-max-height="'300px'"
                        @update:model-value="handleImageValueChange" />
                </template>
                <template v-else>
                    <UFormField
                        :label="fieldTypeNames[field.type]"
                        name="field-value">
                        <div v-if="localField.value && typeof localField.value === 'string'" class="w-full max-w-lg">
                            <img
                                :src="localField.value"
                                alt="圖片"
                                class="w-full max-w-lg object-cover rounded-lg border" />
                        </div>
                        <div v-else class="text-gray-400 text-sm">無圖片</div>
                    </UFormField>
                </template>
            </template>

            <template v-else-if="field.type === 'video'">
                <UFormField name="field-value">
                    <UInput
                        v-if="!props.readonly"
                        :model-value="typeof localField.value === 'string' ? localField.value : String(localField.value || '')"
                        placeholder="請輸入影片連結"
                        @update:model-value="(val) => updateValue(val as string)"
                        :ui="{ root: 'w-full' }" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300">
                        {{ localField.value || '-' }}
                    </div>
                </UFormField>
            </template>

            <!-- 新增的欄位類型 -->
            <template v-else-if="field.type === 'text'">
                <UFormField name="field-value">
                    <UInput
                        v-if="!props.readonly"
                        :model-value="String(localField.value || '')"
                        :placeholder="localField.placeholder || `請輸入${localField.label}`"
                        @update:model-value="updateValue"
                        :ui="{ root: 'w-full' }" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300">
                        {{ localField.value || '-' }}
                    </div>
                </UFormField>
            </template>

            <template v-else-if="field.type === 'number'">
                <UFormField name="field-value">
                    <UInput
                        v-if="!props.readonly"
                        :model-value="String(localField.value || '')"
                        type="number"
                        :placeholder="localField.placeholder || `請輸入${localField.label}`"
                        @update:model-value="(val) => updateValue(val ? Number(val) : 0)"
                        :ui="{ root: 'w-full' }" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300">
                        {{ localField.value || '-' }}
                    </div>
                </UFormField>
            </template>

            <template v-else-if="field.type === 'textarea'">
                <UFormField name="field-value">
                    <UTextarea
                        v-if="!props.readonly"
                        :model-value="typeof localField.value === 'string' ? localField.value : String(localField.value || '')"
                        :placeholder="localField.placeholder || `請輸入${localField.label}`"
                        :rows="3"
                        @update:model-value="(val) => updateValue(val as string)"
                        autoresize
                        :ui="{ root: 'w-full' }" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {{ localField.value || '-' }}
                    </div>
                </UFormField>
            </template>

            <template v-else-if="field.type === 'switch'">
                <UFormField name="field-value">
                    <USwitch
                        v-if="!props.readonly"
                        :model-value="Boolean(localField.value)"
                        @update:model-value="(val: boolean) => updateValue(val ? 1 : 0)"
                        unchecked-icon="i-lucide-x"
                        checked-icon="i-lucide-check" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300">
                        {{ localField.value ? '是' : '否' }}
                    </div>
                </UFormField>
            </template>

            <template v-else-if="field.type === 'select'">
                <UFormField name="field-value">
                    <USelect
                        v-if="!props.readonly"
                        :model-value="localField.value !== null && localField.value !== undefined ? String(localField.value) : ''"
                        :items="localField.options || []"
                        :placeholder="localField.placeholder || `請選擇${localField.label}`"
                        @update:model-value="(val: string | number | null) => updateValue(val !== null ? val : '')" />
                    <div
                        v-else
                        class="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border text-gray-700 dark:text-gray-300">
                        {{ localField.options?.find(opt => String(opt.value) === String(localField.value))?.label || localField.value || '-' }}
                    </div>
                </UFormField>
            </template>

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
                        <div v-if="localField.value && typeof localField.value === 'string'" class="w-full max-w-lg">
                            <img
                                :src="localField.value"
                                alt="圖片"
                                class="w-full max-w-lg object-cover rounded-lg border" />
                        </div>
                        <div v-else class="text-gray-400 text-sm">無圖片</div>
                    </UFormField>
                </template>
            </template>

            <template v-else-if="field.type === 'image_multiple'">
                <template v-if="!props.readonly">
                    <ImageUploadMultiple
                        ref="imageMultipleUploadRef"
                        :model-value="Array.isArray(localField.value) ? localField.value.filter((v): v is string => typeof v === 'string') : []"
                        :label="localField.label"
                        :disabled="props.readonly"
                        @update:model-value="(val: string[]) => updateValue(val)" />
                </template>
                <template v-else>
                    <UFormField
                        :label="localField.label"
                        name="field-value">
                        <div v-if="Array.isArray(localField.value) && localField.value.length > 0" class="grid grid-cols-2 gap-2">
                            <img
                                v-for="(url, idx) in localField.value.filter((v): v is string => typeof v === 'string')"
                                :key="idx"
                                :src="url"
                                alt="圖片"
                                class="w-full object-cover rounded-lg border" />
                        </div>
                        <div v-else class="text-gray-400 text-sm">無圖片</div>
                    </UFormField>
                </template>
            </template>

        </div>
    </UCard>
</template>

