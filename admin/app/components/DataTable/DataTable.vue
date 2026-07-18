<script setup lang="ts">
import { computed, ref } from "vue";
import type { TableColumn } from "@nuxt/ui";
import type {
    PageSizeOption,
    TablePaginationApi
} from "~/composables/usePagination";

interface Props {
    data: any[];
    columns: TableColumn<any>[];
    loading?: boolean;
    class?: string;
    /** 是否啟用 sticky header */
    sticky?: boolean;
    /** UTable 分頁狀態（v-model:pagination） */
    pagination?: { pageIndex: number; pageSize: number };
    /** UTable 分頁選項（如 getPaginationRowModel） */
    paginationOptions?: any;
    /** 總筆數（啟用分頁列時必填） */
    totalItems?: number;
    /** 範圍文字（例：1–10 / 共 25 筆） */
    rangeText?: string;
    /** 每頁筆數選項 */
    pageSizeOptions?: PageSizeOption[];
    /** 目前選中的每頁筆數（用於 USelectMenu） */
    selectedPageSize?: PageSizeOption;
    /** 目前頁碼（1-based，用於 UPagination page） */
    currentPage?: number;
    /** 每頁筆數（用於 UPagination items-per-page） */
    pageSize?: number;
    /** 是否顯示首頁/末頁按鈕 */
    showEdges?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    showEdges: true,
    sticky: true
});

const emit = defineEmits<{
    (e: "update:page", page: number): void;
    (
        e: "update:selectedPageSize",
        value: PageSizeOption | { value: number }
    ): void;
    (
        e: "update:pagination",
        value: { pageIndex: number; pageSize: number }
    ): void;
}>();

const table = ref<any | null>(null);

// 讓父層可以透過 ref 拿到 tableApi（支援 useTablePagination）
defineExpose<{
    tableApi?: TablePaginationApi;
}>({
    get tableApi() {
        return table.value?.tableApi as TablePaginationApi | undefined;
    }
});

// 代理 UTable 的 v-model:pagination
const paginationProxy = computed({
    get: () => props.pagination,
    set: (val) => {
        if (val) {
            emit(
                "update:pagination",
                val as { pageIndex: number; pageSize: number }
            );
        }
    }
});

const onPageChange = (p: number) => {
    emit("update:page", p);
};

const onSelectedPageSizeChange = (
    v: PageSizeOption | { value: number } | null
) => {
    if (v != null) {
        emit(
            "update:selectedPageSize",
            v as PageSizeOption | { value: number }
        );
    }
};
</script>

<template>
    <!-- 載入中狀態 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
        <p class="text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
    <!-- 不包一層 div，讓 UTable 與「直接寫在頁面」的 DOM 層級一致，sticky 才能對同一捲動容器生效 -->
    <UTable
        v-else
        ref="table"
        :class="props.class"
        :data="data"
        :columns="columns"
        :loading="loading"
        v-model:pagination="paginationProxy"
        :pagination-options="paginationOptions"
        :sticky="sticky" />

    <!-- 若有提供分頁相關 props，則顯示下方頁碼列 -->
    <div
        v-if="totalItems && totalItems > 0"
        class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
            <span class="text-sm text-default">每頁</span>
            <USelectMenu
                v-if="pageSizeOptions && selectedPageSize"
                :model-value="selectedPageSize"
                :items="pageSizeOptions"
                option-attribute="label"
                value-attribute="value"
                class="w-20"
                @update:model-value="onSelectedPageSizeChange" />
            <span class="text-sm text-default"> 筆 · {{ rangeText }} </span>
        </div>
        <UPagination
            v-if="currentPage && pageSize"
            :page="currentPage"
            :items-per-page="pageSize"
            :total="totalItems"
            :show-edges="showEdges"
            @update:page="onPageChange" />
    </div>
</template>
