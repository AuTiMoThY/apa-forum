<script setup lang="ts">
import type { CutSectionData, FieldConfig, FieldType } from "~/types/CutSectionField";

const props = defineProps<{
    section: CutSectionData;
    index: number;
}>();

// 判斷欄位類型
const isTitle = (field: FieldConfig) => field.type === 'title';
const isSubtitle = (field: FieldConfig) => field.type === 'subtitle';
const isContent = (field: FieldConfig) => field.type === 'content';
const isImage = (field: FieldConfig) => field.type === 'desktop_image' || field.type === 'mobile_image';
const isVideo = (field: FieldConfig) => field.type === 'video';

// 欄位類型顯示名稱
const fieldTypeNames: Record<FieldType, string> = {
    title: "標題",
    subtitle: "副標題",
    content: "內文",
    desktop_image: "電腦版圖片",
    mobile_image: "手機版圖片",
    video: "影片"
};
</script>

<template>
    <UCard class="mb-6">
        <template #header>
            <h3 class="text-lg font-semibold">第{{ index + 1 }}卡內容</h3>
        </template>
        
        <div class="space-y-4">
            <template v-for="(field, fieldIndex) in section.fields" :key="field.id || fieldIndex">
                <!-- 標題 -->
                <h3
                    v-if="isTitle(field)"
                    class="text-2xl font-bold mb-4">
                    <div class="w-fit text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        類型：{{ fieldTypeNames[field.type] }}
                    </div>
                    {{ field.value || '-' }}
                </h3>
                
                <!-- 副標題 -->
                <h4
                    v-else-if="isSubtitle(field)"
                    class="text-xl font-semibold mb-3">
                    <div class="w-fit text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        類型：{{ fieldTypeNames[field.type] }}
                    </div>
                    {{ field.value || '-' }}
                </h4>
                
                <!-- 內文 -->
                <div
                    v-else-if="isContent(field)"
                    class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
                    <div class="w-fit text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        類型：{{ fieldTypeNames[field.type] }}
                    </div>
                    {{ field.value || '-' }}
                </div>
                
                <!-- 圖片 -->
                <div
                    v-else-if="isImage(field) && field.value"
                    class="mb-4">
                    <div class="w-fit text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        類型：{{ fieldTypeNames[field.type] }}
                    </div>
                    <NuxtImg
                        :src="field.value"
                        :alt="field.label || '圖片'"
                        class="w-full rounded-lg object-cover"
                        loading="lazy" />
                </div>
                
                <!-- 影片 -->
                <div
                    v-else-if="isVideo(field) && field.value"
                    class="mb-4">
                    <div class="w-fit text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        類型：{{ fieldTypeNames[field.type] }}
                    </div>
                    <iframe
                        :src="field.value"
                        class="w-full aspect-video rounded-lg"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen />
                </div>
            </template>
            
            <div v-if="section.fields.length === 0" class="text-center py-8 text-gray-400">
                <p>此區塊目前沒有內容</p>
            </div>
        </div>
    </UCard>
</template>

