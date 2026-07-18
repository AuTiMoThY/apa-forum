<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { h, resolveComponent } from "vue";
import type { BreakoutGroupListItem } from "~/types/BreakoutSessionForm";
import { getPaginationRowModel } from "@tanstack/table-core";

definePageMeta({
    middleware: ["auth", "permission"]
});

const route = useRoute();
const router = useRouter();
const { asideData, fetchDataForAside } = useStructure();
const { getBasePath } = useBasePath();
const { findStructureByPath } = useStructureResolver();

if (!asideData.value?.length) {
    await fetchDataForAside();
}

const basePath = getBasePath(route.path);
const structure = findStructureByPath(basePath);
const title = computed(() => structure?.label ?? "分組討論管理");

useSeoMeta({ title });

const UButton = resolveComponent("UButton");
const UInput = resolveComponent("UInput");
const { hasPermission, isSuperAdmin } = usePermission();
const canEdit = computed(
    () =>
        isSuperAdmin() ||
        hasPermission(`${structure?.url}.edit`) ||
        hasPermission("breakout-session.edit")
);

const { data, loading, fetchData, deleteGroup, updateSortOrder } =
    useAppBreakoutSession();

const savingSortId = ref<number | null>(null);
const sortOrderSnapshots = ref<Record<number, number>>({});

const deleteConfirmModalOpen = ref(false);
const deleteTarget = ref<BreakoutGroupListItem | null>(null);
const deleteIsDisabled = ref(false);

const tableRef = useTemplateRef<{
    tableApi?: {
        getFilteredRowModel: () => { rows: { length: number } };
        getState: () => { pagination: { pageIndex: number } };
        setPageIndex: (index: number) => void;
        setPageSize?: (size: number) => void;
    };
}>("tableRef");

const pageSizeOptions = [
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "50", value: 50 },
    { label: "100", value: 100 }
];

const INITIAL_PAGE_INDEX = 0;
const pagination = ref({
    pageIndex: INITIAL_PAGE_INDEX,
    pageSize: 10
});

const selectedPageSize = computed({
    get: () =>
        pageSizeOptions.find((o) => o.value === pagination.value.pageSize) ??
        pageSizeOptions[0],
    set: (v) => {
        const newSize =
            typeof v === "object" && v != null && "value" in v
                ? (v as { value: number }).value
                : typeof v === "number"
                  ? v
                  : undefined;
        if (newSize != null) {
            pagination.value.pageSize = newSize;
            pagination.value.pageIndex = 0;
            tableRef?.value?.tableApi?.setPageSize?.(newSize);
        }
    }
});

const totalItems = computed<number>(
    () => tableRef?.value?.tableApi?.getFilteredRowModel().rows.length ?? 0
);

const pageSize = computed(() => pagination.value.pageSize);

const rangeText = computed(() => {
    const total = totalItems.value;
    if (total === 0) return "0 筆";
    const pageIndex =
        tableRef?.value?.tableApi?.getState().pagination.pageIndex ?? 0;
    const size = pageSize.value;
    const start = pageIndex * size + 1;
    const end = Math.min((pageIndex + 1) * size, total);
    return `${start}–${end} / 共 ${total} 筆`;
});

const stripHtml = (html?: string | null) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};

const truncateText = (text?: string | null, max = 40) => {
    const value = text?.trim();
    if (!value) return "—";
    return value.length > max ? `${value.slice(0, max)}…` : value;
};

const handleSortOrderFocus = (item: BreakoutGroupListItem) => {
    sortOrderSnapshots.value[item.id] = item.sort_order ?? 0;
};

const handleSortOrderSave = async (item: BreakoutGroupListItem) => {
    if (!canEdit.value || savingSortId.value === item.id) return;

    const newVal = Number(item.sort_order) || 0;
    const oldVal = sortOrderSnapshots.value[item.id] ?? newVal;

    if (newVal === oldVal) return;

    savingSortId.value = item.id;
    const ok = await updateSortOrder(item.id, newVal);

    if (ok) {
        sortOrderSnapshots.value[item.id] = newVal;
        await fetchData();
    } else {
        item.sort_order = oldVal;
    }

    savingSortId.value = null;
};

const columns = computed<TableColumn<BreakoutGroupListItem>[]>(() => [
    {
        id: "no",
        header: "No.",
        enableSorting: false,
        cell: ({ row, table }) => {
            const { pageIndex, pageSize } = table.getState().pagination;
            return pageIndex * pageSize + row.index + 1;
        }
    },
    {
        accessorKey: "code",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return h(UButton, {
                color: "neutral",
                variant: "ghost",
                label: "代號",
                icon: isSorted
                    ? isSorted === "asc"
                        ? "i-lucide-arrow-up-narrow-wide"
                        : "i-lucide-arrow-down-wide-narrow"
                    : "i-lucide-arrow-up-down",
                class: "-mx-2.5",
                onClick: () => {
                    if (isSorted === "asc") {
                        column.toggleSorting(true);
                    } else if (isSorted === "desc") {
                        column.clearSorting();
                    } else {
                        column.toggleSorting(false);
                    }
                }
            });
        }
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return h(UButton, {
                color: "neutral",
                variant: "ghost",
                label: "標題",
                icon: isSorted
                    ? isSorted === "asc"
                        ? "i-lucide-arrow-up-narrow-wide"
                        : "i-lucide-arrow-down-wide-narrow"
                    : "i-lucide-arrow-up-down",
                class: "-mx-2.5",
                onClick: () => {
                    if (isSorted === "asc") {
                        column.toggleSorting(true);
                    } else if (isSorted === "desc") {
                        column.clearSorting();
                    } else {
                        column.toggleSorting(false);
                    }
                }
            });
        }
    },
    {
        accessorKey: "content",
        header: "內文",
        cell: ({ row }) =>
            h(
                "span",
                {},
                truncateText(stripHtml((row.original as BreakoutGroupListItem).content), 50)
            )
    },
    {
        accessorKey: "lecturer_summary",
        header: "講師",
        cell: ({ row }) => {
            const item = row.original as BreakoutGroupListItem;
            const summary =
                item.lecturer_summary ||
                (item.lecturer_count ? `${item.lecturer_count} 位` : "—");
            return h("span", {}, truncateText(summary, 40));
        }
    },
    {
        accessorKey: "sort_order",
        header: ({ column }) => {
            const isSorted = column.getIsSorted();
            return h(UButton, {
                color: "neutral",
                variant: "ghost",
                label: "排序",
                icon: isSorted
                    ? isSorted === "asc"
                        ? "i-lucide-arrow-up-narrow-wide"
                        : "i-lucide-arrow-down-wide-narrow"
                    : "i-lucide-arrow-up-down",
                class: "-mx-2.5",
                onClick: () => {
                    if (isSorted === "asc") {
                        column.toggleSorting(true);
                    } else if (isSorted === "desc") {
                        column.clearSorting();
                    } else {
                        column.toggleSorting(false);
                    }
                }
            });
        },
        cell: ({ row }) => {
            const item = row.original as BreakoutGroupListItem;

            if (!canEdit.value) {
                return h("span", {}, String(item.sort_order ?? 0));
            }

            return h(UInput, {
                modelValue: item.sort_order ?? 0,
                type: "number",
                min: 0,
                size: "sm",
                class: "w-20",
                disabled: savingSortId.value === item.id,
                "onUpdate:modelValue": (value: number | string) => {
                    item.sort_order = Number(value) || 0;
                },
                onFocus: () => handleSortOrderFocus(item),
                onBlur: () => handleSortOrderSave(item),
                onKeydown: (event: KeyboardEvent) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        (event.target as HTMLInputElement)?.blur();
                    }
                }
            });
        }
    },
    {
        header: "操作",
        cell: ({ row }) => {
            if (!canEdit.value) {
                return h("span", { class: "text-default-400" }, "—");
            }
            return h("div", { class: "flex items-center gap-2" }, [
                h(UButton, {
                    icon: "i-lucide-pencil",
                    label: "編輯",
                    color: "primary",
                    size: "xs",
                    onClick: () => handleEdit(row.original as BreakoutGroupListItem)
                }),
                h(UButton, {
                    icon: "i-lucide-trash-2",
                    label: "刪除",
                    color: "error",
                    variant: "outline",
                    size: "xs",
                    onClick: () => handleDelete(row.original as BreakoutGroupListItem)
                })
            ]);
        }
    }
]);

const handleEdit = (item: BreakoutGroupListItem) => {
    router.push(`/breakout-session/edit/${item.id}`);
};

const handleDelete = (item: BreakoutGroupListItem) => {
    deleteTarget.value = item;
    deleteConfirmModalOpen.value = true;
};

const confirmDelete = async () => {
    if (!deleteTarget.value) return;

    deleteIsDisabled.value = true;
    await deleteGroup(deleteTarget.value, {
        onSuccess: async () => {
            await fetchData();
        }
    });
    deleteConfirmModalOpen.value = false;
    deleteTarget.value = null;
    deleteIsDisabled.value = false;
};

const loadInitial = async () => {
    await fetchData();
    await nextTick();
    tableRef?.value?.tableApi?.setPageIndex(INITIAL_PAGE_INDEX);
};

onMounted(() => {
    loadInitial();
});
</script>

<template>
    <PageMain>
        <template #header>
            <UDashboardNavbar
                :title="title"
                :ui="{ right: 'gap-3', title: 'text-primary' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton
                        v-if="canEdit"
                        label="新增組別"
                        color="primary"
                        icon="i-lucide-plus"
                        :to="'/breakout-session/add'" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable
                ref="tableRef"
                :data="data"
                :columns="columns"
                :loading="loading"
                v-model:pagination="pagination"
                :pagination-options="{
                    getPaginationRowModel: getPaginationRowModel()
                }"
                sticky />

            <div
                v-if="totalItems > 0"
                class="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <span class="text-sm text-default">每頁</span>
                    <USelectMenu
                        v-model="selectedPageSize"
                        :items="pageSizeOptions"
                        option-attribute="label"
                        value-attribute="value"
                        class="w-20" />
                    <span class="text-sm text-default">筆 · {{ rangeText }}</span>
                </div>
                <UPagination
                    :default-page="
                        (tableRef?.tableApi?.getState().pagination.pageIndex ||
                            0) + 1
                    "
                    :items-per-page="pageSize"
                    :total="totalItems"
                    :show-edges="true"
                    @update:page="
                        (p: number) => tableRef?.tableApi?.setPageIndex(p - 1)
                    " />
            </div>
        </template>
    </PageMain>

    <DeleteConfirmModal
        v-model:open="deleteConfirmModalOpen"
        title="確認刪除"
        :description="
            deleteTarget
                ? `確定要刪除組別「${deleteTarget.code} - ${deleteTarget.title}」嗎？`
                : ''
        "
        :is-disabled="deleteIsDisabled"
        :on-confirm="confirmDelete" />
</template>
