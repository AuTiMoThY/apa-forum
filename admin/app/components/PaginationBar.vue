<script setup lang="ts">
import type { PageSizeOption } from "~/composables/usePagination";

interface Props {
    page: number;
    totalItems: number;
    pageSize: number;
    selectedPageSize: PageSizeOption | null | undefined;
    pageSizeOptions: PageSizeOption[];
    rangeText: string;
    resetPage: () => void;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "update:page": [value: number];
    "update:selectedPageSize": [value: PageSizeOption | null | undefined];
}>();

const onPageChange = (p: number) => emit("update:page", p);
const onSelectedPageSizeChange = (v: PageSizeOption | null | undefined) => {
    emit("update:selectedPageSize", v);
    props.resetPage();
};
</script>

<template>
    <div
        v-if="totalItems > 0"
        class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
            <span class="text-sm text-default">每頁</span>
            <USelectMenu
                :model-value="selectedPageSize"
                :items="pageSizeOptions"
                option-attribute="label"
                value-attribute="value"
                class="w-20"
                @update:model-value="onSelectedPageSizeChange" />
            <span class="text-sm text-default">筆 · {{ rangeText }}</span>
        </div>
        <UPagination
            :page="page"
            :total="totalItems"
            :items-per-page="pageSize"
            :show-edges="true"
            @update:page="onPageChange" />
    </div>
</template>
