<script setup lang="ts">
import type {
    ContentBlockData,
    TemplateType,
    MediaType,
    LayoutMediaType
} from "~/types/ContentBlock";
import { useDateFormat, useNow } from "@vueuse/core";

const { hasPermission, isSuperAdmin } = usePermission();
const { getTemplateLabel, getMediaTypeLabel } = useContentBlock();
const deleteConfirmModalOpen = ref(false);
const deleteTarget = ref<{ id: string; label: string } | null>(null);

// 權限檢查
const canView = computed(() => {
    if (!structureUrl.value) return true;
    return isSuperAdmin() || hasPermission(`${structureUrl.value}.view`);
});

const canEdit = computed(() => {
    if (!structureUrl.value) return true;
    return isSuperAdmin() || hasPermission(`${structureUrl.value}.edit`);
});

const canDeleteSection = computed(() => {
    if (!structureUrl.value) return false;
    return (
        isSuperAdmin() || hasPermission(`${structureUrl.value}.section.delete`)
    );
});

const canSortSection = computed(() => {
    if (!structureUrl.value) return false;
    return (
        isSuperAdmin() || hasPermission(`${structureUrl.value}.section.sort`)
    );
});

const props = defineProps<{
    index: string | number;
    data?: ContentBlockData;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    pathInfo?: any;
}>();

const emit = defineEmits<{
    (e: "update", data: ContentBlockData): void;
    (e: "delete", sectionId: string): void;
    (e: "delete-request", sectionId: string, label: string): void;
    (e: "move-up", sectionId: string): void;
    (e: "move-down", sectionId: string): void;
}>();

const structureUrl = computed(() => {
    return props.pathInfo?.structure?.url;
});

// 區塊資料
const sectionData = ref<ContentBlockData>({
    id:
        props.data?.id ||
        `block-${useDateFormat(useNow(), "YYYYMMDDHHmmss").value}`,
    index:
        typeof props.index === "number"
            ? props.index
            : parseInt(props.index) || 1,
    template: props.data?.template || "",
    mediaType: props.data?.mediaType,
    fields: props.data?.fields || []
});

// 是否顯示版型選擇器
const showTemplateSelector = ref(false);

// 發送更新事件
const emitUpdate = () => {
    emit("update", { ...sectionData.value });
};

// 選擇版型
const selectTemplate = (template: TemplateType) => {
    sectionData.value.template = template;
    sectionData.value.mediaType = undefined; // 清除媒體類型

    // 根據版型初始化欄位（清除現有欄位）
    initializeFieldsForTemplate(template);

    showTemplateSelector.value = false;
    emitUpdate();
};

// 根據版型初始化欄位
const initializeFieldsForTemplate = (template: TemplateType | "") => {
    if (!template) return; // 如果沒有選擇版型，不初始化欄位

    if (template === "text_only") {
        // 純文字：只有內容欄位
        sectionData.value.fields = [
            {
                id: `field-${Date.now()}-content`,
                type: "content",
                label: "內容",
                value: ""
            }
        ];
    } else if (template === "image_only") {
        // 純圖片：設定預設媒體類型並初始化欄位
        sectionData.value.mediaType = "image";
        initializeFieldsForMediaType("image");
    } else if (
        template === "image_left_text_right" ||
        template === "text_left_image_right"
    ) {
        // 左圖右文、左文右圖：設定預設媒體類型並初始化欄位
        sectionData.value.mediaType = "image";
        initializeFieldsForLayoutMediaType("image");
    }
};

// 更新媒體類型（純圖片版型）
const updateMediaType = (mediaType: MediaType) => {
    const previousMediaType = sectionData.value.mediaType;

    // 檢查是否在雙圖片類型之間切換
    const isPreviousPairType =
        previousMediaType &&
        (previousMediaType === "image_1_1_pair" ||
            previousMediaType === "image_6_4_pair" ||
            previousMediaType === "image_4_6_pair");
    const isNewPairType =
        mediaType === "image_1_1_pair" ||
        mediaType === "image_6_4_pair" ||
        mediaType === "image_4_6_pair";

    // 如果是在雙圖片類型之間切換，只更新媒體類型，保留所有現有值
    if (isPreviousPairType && isNewPairType) {
        // 所有雙圖片類型的欄位結構都相同（圖片1、圖說1、圖片2、圖說2）
        // 只需要更新媒體類型，不需要重新初始化欄位
        sectionData.value.mediaType = mediaType;
    } else {
        // 其他情況（切換到單圖片、影片，或從其他類型切換到雙圖片），正常初始化
        sectionData.value.mediaType = mediaType;
        initializeFieldsForMediaType(mediaType);
    }

    emitUpdate();
};

// 更新媒體類型（左圖右文、左文右圖版型）
const updateLayoutMediaType = (mediaType: LayoutMediaType) => {
    sectionData.value.mediaType = mediaType;
    initializeFieldsForLayoutMediaType(mediaType);
    emitUpdate();
};

// 根據媒體類型初始化欄位（純圖片版型）
const initializeFieldsForMediaType = (mediaType: MediaType) => {
    const fields: ContentBlockData["fields"] = [];

    if (mediaType === "image") {
        fields.push({
            id: `field-${Date.now()}-image`,
            type: "image",
            label: "圖片",
            value: ""
        });
        fields.push({
            id: `field-${Date.now()}-caption`,
            type: "caption",
            label: "圖說",
            value: ""
        });
    } else if (mediaType === "video") {
        fields.push({
            id: `field-${Date.now()}-video`,
            type: "video_url",
            label: "影片連結",
            value: ""
        });
    } else if (
        mediaType === "image_1_1_pair" ||
        mediaType === "image_6_4_pair" ||
        mediaType === "image_4_6_pair"
    ) {
        // 雙圖片
        fields.push({
            id: `field-${Date.now()}-image1`,
            type: "image",
            label: "圖片1",
            value: ""
        });
        fields.push({
            id: `field-${Date.now()}-caption1`,
            type: "caption",
            label: "圖說1",
            value: ""
        });
        fields.push({
            id: `field-${Date.now()}-image2`,
            type: "image",
            label: "圖片2",
            value: ""
        });
        fields.push({
            id: `field-${Date.now()}-caption2`,
            type: "caption",
            label: "圖說2",
            value: ""
        });
    }

    sectionData.value.fields = fields;
};

// 根據媒體類型初始化欄位（左圖右文、左文右圖版型）
const initializeFieldsForLayoutMediaType = (mediaType: LayoutMediaType) => {
    const fields: ContentBlockData["fields"] = [];

    if (mediaType === "image") {
        fields.push({
            id: `field-${Date.now()}-content`,
            type: "content",
            label: "內容",
            value: ""
        });
        fields.push({
            id: `field-${Date.now()}-image`,
            type: "image",
            label: "圖片",
            value: ""
        });
        fields.push({
            id: `field-${Date.now()}-caption`,
            type: "caption",
            label: "圖說",
            value: ""
        });
    } else if (mediaType === "video") {
        fields.push({
            id: `field-${Date.now()}-content`,
            type: "content",
            label: "內容",
            value: ""
        });
        fields.push({
            id: `field-${Date.now()}-video`,
            type: "video_url",
            label: "影片連結",
            value: ""
        });
    }

    sectionData.value.fields = fields;
};

const handleDeleteSection = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    deleteTarget.value = {
        id: sectionData.value.id,
        label: `第${sectionData.value.index}個內容區塊`
    };
    deleteConfirmModalOpen.value = true;
};

const handleMoveSection = (event: Event, direction: "up" | "down") => {
    event.preventDefault();
    event.stopPropagation();
    if (direction === "up") {
        emit("move-up", sectionData.value.id);
    } else {
        emit("move-down", sectionData.value.id);
    }
    emitUpdate();
};

// 更新欄位
const updateField = (updatedField: ContentBlockData["fields"][0]) => {
    const index = sectionData.value.fields.findIndex(
        (f) => f.id === updatedField.id
    );
    if (index !== -1) {
        sectionData.value.fields[index] = { ...updatedField };
        emitUpdate();
    }
};

// 監聽外部資料變更
watch(
    () => props.data,
    (newData) => {
        if (newData) {
            const currentIndex = sectionData.value.index;
            sectionData.value = { ...newData };
            sectionData.value.index =
                typeof props.index === "number"
                    ? props.index
                    : parseInt(props.index) || currentIndex;
        }
    },
    { deep: true }
);

// 監聽 index prop 變化
watch(
    () => props.index,
    (newIndex) => {
        const indexValue =
            typeof newIndex === "number" ? newIndex : parseInt(newIndex) || 1;
        if (sectionData.value.index !== indexValue) {
            sectionData.value.index = indexValue;
        }
    },
    { immediate: true }
);

// 初始化：只在首次載入且沒有資料時初始化
onMounted(() => {
    // 如果沒有外部資料且已選擇版型，初始化欄位
    if (
        !props.data &&
        sectionData.value.template &&
        sectionData.value.fields.length === 0
    ) {
        initializeFieldsForTemplate(sectionData.value.template);
    }
});
</script>

<template>
    <!-- 沒有查看權限時顯示無權限提示 -->
    <PermissionGuard
        :permission="structureUrl ? `${structureUrl}.view` : undefined"
        :fallback="true">
        <template #fallback>
            <UCard>
                <div
                    class="flex flex-col items-center justify-center py-8 text-gray-400">
                    <UIcon
                        name="i-lucide-shield-alert"
                        class="w-12 h-12 mb-4" />
                    <p class="text-sm">您沒有權限查看此區塊內容</p>
                </div>
            </UCard>
        </template>

        <UCollapsible
            class="flex flex-col"
            :default-open="true"
            :data-id="sectionData.id">
            <div
                class="flex items-center justify-between bg-primary/10 p-4 rounded-lg sticky top-0 z-10 backdrop-blur-xs max-sm:flex-col">
                <div class="leading flex items-center gap-2 cursor-pointer max-sm:w-full max-sm:items-start">
                    <UIcon name="i-lucide-layout-template" class="size-5" />
                    <h3 class="text-lg font-semibold">
                        第{{ index }}個內容區塊{{ canEdit ? "編輯" : "查看" }}
                    </h3>
                    <UBadge
                        v-if="sectionData.template"
                        color="primary"
                        variant="soft"
                        size="xs"
                        :label="getTemplateLabel(sectionData.template)" />
                    <!-- 只讀模式提示 -->
                    <UBadge
                        v-if="canView && !canEdit"
                        color="warning"
                        variant="soft"
                        size="xs"
                        label="只讀模式" />
                </div>
                <div v-if="canEdit" class="flex items-center gap-2 max-sm:w-full max-sm:justify-end">
                    <PermissionGuard
                        :permission="`${structureUrl}.section.sort`">
                        <UButton
                            icon="i-lucide-arrow-up"
                            color="neutral"
                            variant="ghost"
                            size="sm"
                            :disabled="!canMoveUp"
                            @click="handleMoveSection($event, 'up')" />
                    </PermissionGuard>
                    <PermissionGuard
                        :permission="`${structureUrl}.section.sort`">
                        <UButton
                            icon="i-lucide-arrow-down"
                            color="neutral"
                            variant="ghost"
                            size="sm"
                            :disabled="!canMoveDown"
                            @click="handleMoveSection($event, 'down')" />
                    </PermissionGuard>
                    <PermissionGuard
                        :permission="`${structureUrl}.section.delete`">
                        <UButton
                            label="刪除"
                            icon="i-lucide-trash-2"
                            color="error"
                            variant="ghost"
                            size="sm"
                            @click="handleDeleteSection($event)" />
                    </PermissionGuard>
                </div>
            </div>

            <template #content>
                <div class="p-4">
                    <!-- 版型選擇器 -->
                    <div v-if="showTemplateSelector && canEdit" class="mb-4">
                        <ContentBlockTemplateSelector
                            @select="selectTemplate" />
                    </div>

                    <!-- 如果還沒有選擇版型，顯示版型選擇提示 -->
                    <div
                        v-if="!sectionData.template && canEdit"
                        class="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg mb-4">
                        <UIcon
                            name="i-lucide-layout-template"
                            class="w-12 h-12 mx-auto mb-2" />
                        <p class="mb-2">請選擇版型</p>
                        <UButton
                            label="選擇版型"
                            icon="i-lucide-layout"
                            color="primary"
                            variant="outline"
                            @click="showTemplateSelector = true" />
                    </div>

                    <!-- 已選擇版型，顯示欄位編輯 -->
                    <template v-else-if="sectionData.template">
                        <!-- 版型選擇按鈕（允許更換版型） -->
                        <div v-if="canEdit" class="mb-4">
                            <UButton
                                :label="
                                    showTemplateSelector ? '取消' : '更換版型'
                                "
                                :icon="
                                    showTemplateSelector
                                        ? 'i-lucide-x'
                                        : 'i-lucide-layout'
                                "
                                color="primary"
                                variant="outline"
                                size="sm"
                                @click="
                                    showTemplateSelector = !showTemplateSelector
                                " />
                        </div>

                        <!-- 純文字版型 -->
                        <template v-if="sectionData.template === 'text_only'">
                            <ContentBlockFieldItem
                                v-for="field in sectionData.fields"
                                :key="field.id"
                                :field="field"
                                :readonly="!canEdit"
                                @update="updateField" />
                        </template>

                        <!-- 純圖片版型 -->
                        <template
                            v-else-if="sectionData.template === 'image_only'">
                            <div class="space-y-4">
                                <!-- 媒體類型選擇 -->
                                <UFormField
                                    v-if="canEdit"
                                    label="媒體類型"
                                    name="media-type">
                                    <USelect
                                        :model-value="sectionData.mediaType"
                                        :items="[
                                            {
                                                label: getMediaTypeLabel(
                                                    'image'
                                                ),
                                                value: 'image'
                                            },
                                            {
                                                label: getMediaTypeLabel(
                                                    'video'
                                                ),
                                                value: 'video'
                                            },
                                            {
                                                label: getMediaTypeLabel(
                                                    'image_1_1_pair'
                                                ),
                                                value: 'image_1_1_pair'
                                            },
                                            {
                                                label: getMediaTypeLabel(
                                                    'image_6_4_pair'
                                                ),
                                                value: 'image_6_4_pair'
                                            },
                                            {
                                                label: getMediaTypeLabel(
                                                    'image_4_6_pair'
                                                ),
                                                value: 'image_4_6_pair'
                                            }
                                        ]"
                                        option-attribute="label"
                                        value-attribute="value"
                                        @update:model-value="(value) => updateMediaType(value as MediaType)"
                                        :ui="{ base: 'w-full' }" />
                                </UFormField>
                                <div v-else class="mb-2">
                                    <span class="text-sm text-gray-600"
                                        >媒體類型：</span
                                    >
                                    <span class="text-sm font-medium">
                                        {{
                                            getMediaTypeLabel(
                                                sectionData.mediaType as MediaType
                                            )
                                        }}
                                    </span>
                                </div>
                                <!-- 欄位列表 -->
                                <ContentBlockFieldItem
                                    v-for="field in sectionData.fields"
                                    :key="field.id"
                                    :field="field"
                                    :readonly="!canEdit"
                                    @update="updateField" />
                            </div>
                        </template>

                        <!-- 左圖右文、左文右圖版型 -->
                        <template
                            v-else-if="
                                sectionData.template ===
                                    'image_left_text_right' ||
                                sectionData.template === 'text_left_image_right'
                            ">
                            <div class="space-y-4">
                                <!-- 媒體類型選擇 -->
                                <UFormField
                                    v-if="canEdit"
                                    label="媒體類型"
                                    name="media-type">
                                    <USelect
                                        :model-value="sectionData.mediaType"
                                        :items="[
                                            { label: '圖片', value: 'image' },
                                            { label: '影片', value: 'video' }
                                        ]"
                                        option-attribute="label"
                                        value-attribute="value"
                                        @update:model-value="(value) => updateLayoutMediaType(value as LayoutMediaType)"
                                        :ui="{ base: 'w-full' }" />
                                </UFormField>
                                <div v-else class="mb-2">
                                    <span class="text-sm text-gray-600"
                                        >媒體類型：</span
                                    >
                                    <span class="text-sm font-medium">
                                        {{
                                            sectionData.mediaType === "image"
                                                ? "圖片"
                                                : sectionData.mediaType ===
                                                  "video"
                                                ? "影片"
                                                : "-"
                                        }}
                                    </span>
                                </div>
                                <!-- 欄位列表 -->
                                <ContentBlockFieldItem
                                    v-for="field in sectionData.fields"
                                    :key="field.id"
                                    :field="field"
                                    :readonly="!canEdit"
                                    @update="updateField" />
                            </div>
                        </template>
                    </template>
                </div>
            </template>
        </UCollapsible>
    </PermissionGuard>
    <DeleteConfirmModal
        v-model:open="deleteConfirmModalOpen"
        title="確認刪除區塊"
        :description="
            deleteTarget
                ? `確定要刪除「${deleteTarget.label}」嗎？此操作無法復原，區塊資料將會被永久刪除。`
                : ''
        "
        :on-confirm="
            () => {
                if (deleteTarget) {
                    emit('delete', deleteTarget.id);
                }
                deleteConfirmModalOpen = false;
                deleteTarget = null;
            }
        " />
</template>
