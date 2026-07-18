<script setup lang="ts">
import type { PreviewData } from "~/composables/useFormPreview";

interface Props {
    data: PreviewData;
    coverUrl?: string;
    slideUrls?: string[];
    title?: string;
    moduleType?: "news" | "case" | "about" | "progress" | "history" | "custom";
}

const { getTemplateLabel } = useContentBlock();

const props = withDefaults(defineProps<Props>(), {
    coverUrl: "",
    slideUrls: () => [],
    title: "預覽",
    moduleType: "custom"
});

/**
 * 格式化日期顯示
 */
const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("zh-TW", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    } catch {
        return dateStr;
    }
};

/**
 * 渲染 HTML 內容（安全處理）
 */
const renderContent = (html?: string): string => {
    if (!html) return "";
    // 這裡可以加入 XSS 防護邏輯
    // 目前直接返回，因為內容來自管理後台
    return html;
};

/**
 * 解析 content（Case 模組需要解析 JSON 字符串）
 */
const parsedContent = computed(() => {
    if (props.moduleType === "case" && props.data.content) {
        try {
            const parsed = JSON.parse(props.data.content);
            return Array.isArray(parsed) ? parsed : null;
        } catch {
            return null;
        }
    }
    return null;
});

console.log(props.data);
</script>

<template>
    <div class="form-preview space-y-6 p-6 @container">
        <!-- 標題 -->
        <div v-if="title || data.title" class="border-b pb-4">
            <h2 class="text-2xl font-bold text-gray-900">
                {{ data.title || title }}
            </h2>
            <!-- 日期（News 模組） -->
            <div
                v-if="
                    (moduleType === 'news' || moduleType === 'progress') &&
                    (data.show_date || data.progress_date)
                "
                class="mt-2 text-sm text-gray-500">
                <UIcon name="i-lucide-calendar" class="w-4 h-4 inline mr-1" />
                {{
                    formatDate(
                        moduleType === "news"
                            ? data.show_date
                            : (data.progress_date as string)
                    )
                }}
            </div>
        </div>

        <!-- 封面圖 -->
        <div v-if="coverUrl || data.cover" class="w-full">
            <img
                :src="coverUrl || data.cover"
                alt="封面圖"
                class="w-full object-cover rounded-lg shadow-md"
                style="max-height: 400px" />
        </div>

        <!-- 輪播圖（News、Case 模組） -->
        <div
            v-if="
                (moduleType === 'news' || moduleType === 'case') &&
                (slideUrls?.length > 0 || (data.slide?.length ?? 0) > 0)
            "
            class="w-full">
            <h3 class="text-lg font-semibold mb-3 text-gray-700">輪播圖</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                    v-for="(url, index) in slideUrls || data.slide"
                    :key="index"
                    class="relative aspect-square">
                    <img
                        :src="url"
                        :alt="`輪播圖 ${index + 1}`"
                        class="w-full h-full object-cover rounded-lg border shadow-sm" />
                </div>
            </div>
        </div>

        <!-- 輪播圖（ Progress 模組） -->
        <div
            v-if="moduleType === 'progress' && data.images?.length > 0"
            class="w-full">
            <h3 class="text-lg font-semibold mb-3 text-gray-700">
                工程進度圖片
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                    v-for="(url, index) in data.images"
                    :key="index"
                    class="relative aspect-square">
                    <img
                        :src="url"
                        :alt="`工程進度圖片 ${Number(index) + 1}`"
                        class="w-full h-full object-cover rounded-lg border shadow-sm" />
                </div>
            </div>
        </div>

        <!-- Progress 模組的其他欄位 -->
        <div
            v-if="moduleType === 'progress'"
            class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div v-if="data.case_title" class="flex items-center gap-2">
                <UIcon name="i-lucide-building" class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600">所屬專案：</span>
                <span class="font-semibold">{{ data.case_title }}</span>
            </div>
        </div>

        <!-- 其他欄位（用於擴展） -->
        <div
            v-if="moduleType === 'case'"
            class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div v-if="data.year" class="flex items-center gap-2">
                <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600">年份：</span>
                <span class="font-semibold">{{ data.year }}</span>
            </div>
            <div v-if="data.s_text" class="flex items-center gap-2">
                <UIcon name="i-lucide-tag" class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600">小字：</span>
                <span class="font-semibold">{{ data.s_text }}</span>
            </div>
            <div v-if="data.ca_type" class="flex items-center gap-2">
                <UIcon name="i-lucide-building" class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600">類型：</span>
                <span class="font-semibold">{{ data.ca_type }}</span>
            </div>
            <div v-if="data.ca_area" class="flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600">區域：</span>
                <span class="font-semibold">{{ data.ca_area }}</span>
            </div>
        </div>
        <!-- 內容區塊（Case 模組的特殊處理） -->
        <div v-if="moduleType === 'case' && parsedContent" class="space-y-6">
            <UPageSection
                v-for="(section, index) in parsedContent"
                :key="section?.id || index"
                :class="`${section.template} media-type-${
                    section.mediaType ?? ''
                }`"
                :ui="{ container: 'py-8 @[768px]:py-12' }">
                <!-- 純文字版型 -->
                <div v-if="section.template === 'text_only'" class="space-y-3">
                    <div v-for="field in section.fields" :key="field.id">
                        <div
                            v-if="field.type === 'content'"
                            class="prose max-w-none">
                            <p class="whitespace-pre-wrap text-gray-800">
                                {{ field.value }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 純圖片版型 -->
                <div
                    v-else-if="section.template === 'image_only'"
                    class="space-y-3">
                    <!-- 單圖片 -->
                    <template v-if="section.mediaType === 'image'">
                        <div v-for="field in section.fields" :key="field.id">
                            <div v-if="field.type === 'image'">
                                <img
                                    :src="field.value"
                                    :alt="getImageCaption(section.fields, section.fields.findIndex((f: any) => f.id === field.id)) || '圖片'"
                                    class="w-full object-cover rounded-lg border shadow-sm" />
                            </div>
                        </div>
                    </template>
                    <!-- 影片 -->
                    <template v-else-if="section.mediaType === 'video'">
                        <div v-for="field in section.fields" :key="field.id">
                            <div v-if="field.type === 'video_url'">
                                <iframe
                                    v-if="field.value"
                                    :src="getEmbedUrl(field.value)"
                                    class="w-full aspect-video rounded-lg border"
                                    frameborder="0"
                                    allowfullscreen />
                            </div>
                        </div>
                    </template>
                    <!-- 雙圖片 (1:1) -->
                    <template
                        v-else-if="
                            section.mediaType &&
                            section.mediaType === 'image_1_1_pair'
                        ">
                        <div
                            class="grid grid-cols-1 @[768px]:grid-cols-2 gap-4 items-center">
                            <div
                                v-for="(field, index) in section.fields.filter((f: any) => f.type === 'image')"
                                :key="field.id">
                                <img
                                    :src="field.value"
                                    :alt="getImageCaption(section.fields, section.fields.findIndex((f: any) => f.id === field.id)) || `圖片 ${Number(index) + 1}`"
                                    class="w-full object-cover rounded-lg border shadow-sm" />
                            </div>
                        </div>
                    </template>
                    <!-- 雙圖片 (6:4) -->
                    <template
                        v-else-if="
                            section.mediaType &&
                            section.mediaType === 'image_6_4_pair'
                        ">
                        <div
                            class="grid grid-cols-1 @[768px]:grid-cols-[6fr_4fr] gap-4 items-stretch">
                            <div
                                v-for="(field, index) in section.fields.filter((f: any) => f.type === 'image')"
                                :key="field.id"
                                class="img-box">
                                <img
                                    :src="field.value"
                                    :alt="getImageCaption(section.fields, section.fields.findIndex((f: any) => f.id === field.id)) || `圖片 ${Number(index) + 1}`"
                                    class="w-full h-full object-cover rounded-lg border shadow-sm" />
                            </div>
                        </div>
                    </template>
                    <!-- 雙圖片 (4:6) -->
                    <template
                        v-else-if="
                            section.mediaType &&
                            section.mediaType === 'image_4_6_pair'
                        ">
                        <div
                            class="grid grid-cols-1 @[768px]:grid-cols-[4fr_6fr] gap-4 items-stretch">
                            <div
                                v-for="(field, index) in section.fields.filter((f: any) => f.type === 'image')"
                                :key="field.id"
                                class="img-box">
                                <img
                                    :src="field.value"
                                    :alt="getImageCaption(section.fields, section.fields.findIndex((f: any) => f.id === field.id)) || `圖片 ${Number(index) + 1}`"
                                    class="w-full h-full object-cover rounded-lg border shadow-sm" />
                            </div>
                        </div>
                    </template>
                </div>

                <!-- 左圖右文版型 -->
                <div
                    v-else-if="section.template === 'image_left_text_right'"
                    class="space-y-3">
                    <div
                        class="grid grid-cols-1 @[768px]:grid-cols-2 gap-6 items-center">
                        <!-- 左邊：圖片 -->
                        <div class="order-1 md:order-1">
                            <template v-if="section.mediaType === 'image'">
                                <div
                                    v-for="field in section.fields"
                                    :key="field.id">
                                    <div v-if="field.type === 'image'">
                                        <img
                                            :src="field.value"
                                            :alt="getImageCaption(section.fields, section.fields.findIndex((f: any) => f.id === field.id)) || '圖片'"
                                            class="w-full object-cover" />
                                        <p
                                            class="text-sm text-gray-500 text-center mt-2">
                                            {{
                                                getImageCaption(
                                                    section.fields,
                                                    section.fields.findIndex(
                                                        (f: any) =>
                                                            f.id === field.id
                                                    )
                                                ) || ""
                                            }}
                                        </p>
                                    </div>
                                </div>
                            </template>
                            <template v-else-if="section.mediaType === 'video'">
                                <div
                                    v-for="field in section.fields"
                                    :key="field.id">
                                    <div v-if="field.type === 'video_url'">
                                        <iframe
                                            v-if="field.value"
                                            :src="getEmbedUrl(field.value)"
                                            class="w-full aspect-video rounded-lg border"
                                            frameborder="0"
                                            allowfullscreen />
                                    </div>
                                </div>
                            </template>
                        </div>
                        <!-- 右邊：文字內容 -->
                        <div class="order-2 md:order-2">
                            <div
                                v-for="field in section.fields"
                                :key="field.id">
                                <div
                                    v-if="field.type === 'content'"
                                    class="prose max-w-none">
                                    <p
                                        class="whitespace-pre-wrap text-gray-800">
                                        {{ field.value }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 左文右圖版型 -->
                <div
                    v-else-if="section.template === 'text_left_image_right'"
                    class="space-y-3">
                    <div
                        class="grid grid-cols-1 @[768px]:grid-cols-2 gap-6 items-center">
                        <!-- 左邊：文字內容 -->
                        <div class="order-2 md:order-1">
                            <div
                                v-for="field in section.fields"
                                :key="field.id">
                                <div
                                    v-if="field.type === 'content'"
                                    class="prose max-w-none">
                                    <p
                                        class="whitespace-pre-wrap text-gray-800">
                                        {{ field.value }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <!-- 右邊：圖片 -->
                        <div class="order-1 md:order-2">
                            <template v-if="section.mediaType === 'image'">
                                <div
                                    v-for="field in section.fields"
                                    :key="field.id">
                                    <div v-if="field.type === 'image'">
                                        <img
                                            :src="field.value"
                                            :alt="getImageCaption(section.fields, section.fields.findIndex((f: any) => f.id === field.id)) || '圖片'"
                                            class="w-full object-cover rounded-lg border shadow-sm" />
                                        <p class="text-sm">
                                            {{ field.caption || "" }}
                                        </p>
                                    </div>
                                </div>
                            </template>
                            <template v-else-if="section.mediaType === 'video'">
                                <div
                                    v-for="field in section.fields"
                                    :key="field.id">
                                    <div v-if="field.type === 'video_url'">
                                        <iframe
                                            v-if="field.value"
                                            :src="getEmbedUrl(field.value)"
                                            class="w-full aspect-video rounded-lg border"
                                            frameborder="0"
                                            allowfullscreen />
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- 預設顯示（未指定版型或通用顯示） -->
                <div
                    v-else-if="section?.fields && Array.isArray(section.fields)"
                    class="space-y-3">
                    <div
                        v-for="(field, fieldIndex) in section.fields"
                        :key="fieldIndex">
                        <!-- 只顯示非圖說欄位（圖說會作為圖片的 alt） -->
                        <template v-if="field.type !== 'caption'">
                            <span class="text-gray-600">
                                {{ field.label }}：
                            </span>
                            <br />
                            <span
                                v-if="field.type === 'image'"
                                class="font-semibold">
                                <img
                                    :src="field.value"
                                    :alt="
                                        getImageCaption(
                                            section.fields,
                                            Number(fieldIndex)
                                        ) || '圖片'
                                    "
                                    class="w-full object-cover rounded-lg border shadow-sm" />
                            </span>
                            <span
                                v-else-if="field.type === 'video_url'"
                                class="font-semibold">
                                <iframe
                                    v-if="field.value"
                                    :src="getEmbedUrl(field.value)"
                                    class="w-full aspect-video rounded-lg border"
                                    frameborder="0"
                                    allowfullscreen />
                            </span>
                            <span
                                v-else
                                class="font-semibold whitespace-pre-wrap">
                                {{ field.value }}
                            </span>
                        </template>
                    </div>
                </div>
            </UPageSection>
        </div>

        <!-- HTML 內容（News 模組） -->
        <div
            v-if="moduleType === 'news' && data.content"
            class="prose-content max-w-none">
            <div v-html="renderContent(data.content)" />
        </div>

        <!-- 自訂內容（其他模組或自訂渲染） -->
        <div v-if="moduleType === 'custom'" class="prose-content max-w-none">
            <div v-if="data.content" v-html="renderContent(data.content)" />
        </div>

        <!-- History 模組 -->
        <div
            v-if="moduleType === 'history'"
            class="prose-content max-w-none flex flex-col gap-2">
            <div v-if="data.year" class="flex items-center gap-2">
                <span class="text-gray-600">年份：</span>
                <span class="font-semibold">{{ data.year }}</span>
            </div>
            <div v-if="data.content" class="flex items-center gap-2">
                <span class="text-gray-600">內容：</span>
                <span class="font-semibold">{{ data.content }}</span>
            </div>
            <div v-if="data.image" class="flex flex-col">
                <span class="text-gray-600">圖片：</span>
                <img
                    :src="data.image"
                    :alt="`圖片 ${data.year}`"
                    class="w-full object-cover rounded-lg border shadow-sm" />
            </div>
        </div>
    </div>
</template>

<style scoped>
@reference '~/assets/css/main.css';

.form-preview {
    @apply bg-white;
}
</style>
