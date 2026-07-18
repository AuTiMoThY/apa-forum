<script setup lang="ts">
import type { TemplateType, TemplateOption } from "~/types/ContentBlock";

const emit = defineEmits<{
    (e: "select", type: TemplateType): void;
}>();

const templates: TemplateOption[] = [
    {
        type: "text_only",
        label: "純文字",
        icon: "i-lucide-file-text",
        description: "僅包含文字內容"
    },
    {
        type: "image_only",
        label: "純圖片",
        icon: "i-lucide-image",
        description: "圖片、影片或多張圖片組合"
    },
    {
        type: "image_left_text_right",
        label: "左圖右文",
        icon: "i-lucide-layout-grid",
        description: "左側圖片，右側文字內容"
    },
    {
        type: "text_left_image_right",
        label: "左文右圖",
        icon: "i-lucide-layout-grid",
        description: "左側文字內容，右側圖片"
    }
];

const handleSelect = (type: TemplateType) => {
    emit("select", type);
};
</script>

<template>
    <UCard>
        <template #header>
            <h4 class="text-md font-semibold">選擇版型</h4>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <UCard
                v-for="template in templates"
                :key="template.type"
                class="cursor-pointer hover:shadow-md transition-shadow"
                @click="handleSelect(template.type)">
                <div class="flex flex-col items-center text-center p-4 space-y-2">
                    <UIcon :name="template.icon" class="w-8 h-8 text-primary" />
                    <div>
                        <div class="font-medium">{{ template.label }}</div>
                        <div class="text-xs text-gray-500">{{ template.description }}</div>
                    </div>
                </div>
            </UCard>
        </div>
    </UCard>
</template>

