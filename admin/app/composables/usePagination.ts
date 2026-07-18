import { reactive } from "vue";
import type { Ref } from "vue";

export interface PageSizeOption {
    label: string;
    value: number;
}

const DEFAULT_PAGE_SIZE_OPTIONS: PageSizeOption[] = [
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "50", value: 50 },
    { label: "100", value: 100 }
];

/** UTable 的 tableApi 分頁介面（與 @tanstack/table-core 相容） */
export interface TablePaginationApi {
    getFilteredRowModel: () => { rows: { length: number } };
    getState: () => { pagination: { pageIndex: number } };
    setPageIndex: (index: number) => void;
    setPageSize?: (size: number) => void;
}

export type TableWithPaginationApi = { tableApi?: TablePaginationApi };

export interface UseTablePaginationOptions {
    /** 每頁筆數選項，預設 10/20/50/100 */
    pageSizeOptions?: PageSizeOption[];
}

/**
 * 搭配 UTable（TanStack Table getPaginationRowModel）的分頁 composable
 * 需傳入 ref 指向 UTable 的 template ref（tableApi 由 UTable 暴露）
 */
export function useTablePagination(
    tableRef: Ref<TableWithPaginationApi | null | undefined>,
    options?: UseTablePaginationOptions
) {
    const pageSizeOptions =
        options?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;

    const pagination = reactive({
        pageIndex: 0,
        pageSize: 10
    });

    const selectedPageSize = computed({
        get: () =>
            pageSizeOptions.find((o) => o.value === pagination.pageSize) ??
            pageSizeOptions[0],
        set: (v: PageSizeOption | { value: number } | number | null | undefined) => {
            const newSize =
                typeof v === "object" && v != null && "value" in v
                    ? (v as { value: number }).value
                    : typeof v === "number"
                    ? v
                    : undefined;
            if (newSize != null) {
                pagination.pageSize = newSize;
                pagination.pageIndex = 0;
                tableRef.value?.tableApi?.setPageSize?.(newSize);
            }
        }
    });

    const totalItems = computed<number>(
        () => tableRef.value?.tableApi?.getFilteredRowModel().rows.length ?? 0
    );

    const pageSize = computed(() => pagination.pageSize);

    const rangeText = computed(() => {
        const total = totalItems.value;
        if (total === 0) return "0 筆";
        const pageIndex = pagination.pageIndex;
        const size = pageSize.value;
        const start = pageIndex * size + 1;
        const end = Math.min((pageIndex + 1) * size, total);
        return `${start}–${end} / 共 ${total} 筆`;
    });

    /** 目前頁碼（1-based），與 pagination.pageIndex 同步，確保點擊頁碼後 UI 會更新 */
    const currentPage = computed(() => pagination.pageIndex + 1);

    const setPage = (pageOneBased: number) => {
        const index = pageOneBased - 1;
        pagination.pageIndex = index;
        tableRef.value?.tableApi?.setPageIndex(index);
    };

    const setSelectedPageSize = (v: PageSizeOption | { value: number } | number | null | undefined) => {
        const newSize =
            typeof v === "object" && v != null && "value" in v
                ? (v as { value: number }).value
                : typeof v === "number"
                ? v
                : undefined;
        if (newSize != null) {
            pagination.pageSize = newSize;
            pagination.pageIndex = 0;
            tableRef.value?.tableApi?.setPageSize?.(newSize);
        }
    };

    return {
        pagination,
        pageSizeOptions,
        selectedPageSize,
        totalItems,
        pageSize,
        rangeText,
        currentPage,
        setPage,
        setSelectedPageSize
    };
}
