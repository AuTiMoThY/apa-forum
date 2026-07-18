<script setup lang="ts">
import type { FieldType, FieldTypeOption } from "~/types/CutSectionField";

const emit = defineEmits<{
    (e: "select", type: FieldType): void;
}>();

const fieldTypes: FieldTypeOption[] = [
    {
        type: "title",
        label: "標題",
        icon: "i-lucide-heading",
        description: "主要標題文字"
    },
    {
        type: "subtitle",
        label: "副標題",
        icon: "i-lucide-heading-2",
        description: "次要標題文字"
    },
    {
        type: "content",
        label: "內文",
        icon: "i-lucide-file-text",
        description: "文字內容區塊"
    },
    {
        type: "desktop_image",
        label: "電腦版圖片",
        icon: "i-lucide-monitor",
        description: "電腦版顯示的圖片"
    },
    {
        type: "mobile_image",
        label: "手機版圖片",
        icon: "i-lucide-smartphone",
        description: "手機版顯示的圖片"
    },
    {
        type: "video",
        label: "影片",
        icon: "i-lucide-video",
        description: "影片區塊"
    },
    // {
    //     type: "text",
    //     label: "文字輸入",
    //     icon: "i-lucide-type",
    //     description: "單行文字輸入框"
    // },
    // {
    //     type: "number",
    //     label: "數字輸入",
    //     icon: "i-lucide-hash",
    //     description: "數字輸入框"
    // },
    // {
    //     type: "textarea",
    //     label: "多行文字",
    //     icon: "i-lucide-file-text",
    //     description: "多行文字輸入框"
    // },
    // {
    //     type: "switch",
    //     label: "開關",
    //     icon: "i-lucide-toggle-left",
    //     description: "開關切換"
    // },
    // {
    //     type: "select",
    //     label: "下拉選單",
    //     icon: "i-lucide-list",
    //     description: "下拉選單選擇"
    // },
    // {
    //     type: "image",
    //     label: "單一圖片",
    //     icon: "i-lucide-image",
    //     description: "單一圖片上傳"
    // },
    // {
    //     type: "image_multiple",
    //     label: "多張圖片",
    //     icon: "i-lucide-images",
    //     description: "多張圖片上傳"
    // }
];

const handleSelect = (type: FieldType) => {
    emit("select", type);
};
</script>

<template>
    <UCard>
        <template #header>
            <h4 class="text-md font-semibold">新增欄位</h4>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <UCard
                v-for="fieldType in fieldTypes"
                :key="fieldType.type"
                class="cursor-pointer hover:shadow-md transition-shadow"
                @click="handleSelect(fieldType.type)">
                <div class="flex flex-col items-center text-center p-4 space-y-2">
                    <UIcon :name="fieldType.icon" class="w-8 h-8 text-primary" />
                    <div>
                        <div class="font-medium">{{ fieldType.label }}</div>
                        <div class="text-xs text-gray-500">{{ fieldType.description }}</div>
                    </div>
                </div>
            </UCard>
        </div>
    </UCard>
</template>

