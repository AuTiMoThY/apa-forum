<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/table-core";
import { h, resolveComponent, unref } from "vue";
import type {
    PageSizeOption,
    TableWithPaginationApi
} from "~/composables/usePagination";

definePageMeta({
    middleware: ["auth", "permission"]
});

const title = "管理員設定";
useSeoMeta({
    title
});

import { STATUS_LABEL_MAP } from "~/constants/system/status";
import { STATUS_ICON_MAP } from "~/constants/system/status_icon";

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");
// 管理員設定選單不要求權限（constants/menu/system.ts），維持原 UI：登入者皆可見操作按鈕

/** 可排序欄位標題 */
function sortableHeader(label: string): TableColumn<any>["header"] {
    return ({
        column
    }: {
        column: {
            getIsSorted: () => false | "asc" | "desc";
            toggleSorting: (desc?: boolean) => void;
            clearSorting: () => void;
        };
    }) => {
        const isSorted = column.getIsSorted();
        return h(
            UButton,
            {
                color: "neutral",
                variant: "soft",
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
            },
            { default: () => label }
        );
    };
}

function rolesSortValue(
    roles: { label?: string; name?: string }[] | undefined
): string {
    return (roles ?? [])
        .map((role) => (role.label || role.name || "").toLowerCase())
        .sort()
        .join(", ");
}

const router = useRouter();
const { data, loading, fetchData, deleteAdmin } = useUsers();

const deleteConfirmModalOpen = ref(false);
const deleteTarget = ref<{ id: string; name: string } | null>(null);
const deletePasswordSaving = ref(false);

const tableRef = useTemplateRef<TableWithPaginationApi>("tableRef");
const tablePagination = useTablePagination(tableRef);

const defaultPageSizeOption: PageSizeOption = { label: "10", value: 10 };
const paginationBarProps = computed(() => ({
    totalItems: unref(tablePagination.totalItems),
    rangeText: unref(tablePagination.rangeText),
    pageSizeOptions: tablePagination.pageSizeOptions,
    selectedPageSize:
        (unref(tablePagination.selectedPageSize) as
            | PageSizeOption
            | undefined) ?? defaultPageSizeOption,
    currentPage: unref(tablePagination.currentPage),
    pageSize: unref(tablePagination.pageSize)
}));

const onPaginationPageSizeUpdate = (v: PageSizeOption | { value: number }) => {
    tablePagination.setSelectedPageSize(v);
};

const keyword = ref("");
const filteredData = computed(() => {
    const k = keyword.value.trim().toLowerCase();
    if (!k) return data.value;
    return data.value.filter((admin) => {
        const username = admin.username?.toLowerCase() ?? "";
        const name = admin.name?.toLowerCase() ?? "";
        const roleText = (admin.roles ?? [])
            .map((role: { label?: string; name?: string }) =>
                (role.label || role.name || "").toLowerCase()
            )
            .join(" ");
        return (
            username.includes(k) || name.includes(k) || roleText.includes(k)
        );
    });
});

const columns: TableColumn<any>[] = [
    { accessorKey: "username", header: "帳號" },
    { accessorKey: "name", header: "姓名" },
    {
        id: "roles",
        accessorFn: (row) => rolesSortValue(row.roles),
        header: sortableHeader("角色"),
        cell: ({ row }) => {
            const roles = row.original.roles || [];
            if (roles.length === 0) {
                return h("span", { class: "text-gray-400" }, "無角色");
            }
            return h(
                "div",
                { class: "flex flex-wrap gap-1" },
                roles.map((role: any) =>
                    h(
                        "span",
                        {
                            class: "px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                        },
                        role.label || role.name
                    )
                )
            );
        }
    },
    {
        accessorKey: "status",
        accessorFn: (row) => Number(row.status ?? 0),
        header: sortableHeader("狀態"),
        cell: ({ row }) => {
            const status = String(row.original.status);
            const label = STATUS_LABEL_MAP[status] ?? status;
            const icon = STATUS_ICON_MAP[status] ?? "i-lucide-help-circle";

            return h("div", { class: "flex items-center gap-2" }, [
                h(UIcon, {
                    name: icon,
                    class: status === "1" ? "text-emerald-500" : "text-rose-500"
                }),
                h("span", label)
            ]);
        }
    },
    {
        header: "操作",
        cell: ({ row }) => {
            return h("div", { class: "flex items-center gap-2" }, [
                h(UButton, {
                    icon: "i-lucide-edit",
                    label: "編輯",
                    color: "primary",
                    size: "xs",
                    onClick: () => editAdmin(row.original)
                }),
                h(UButton, {
                    icon: "i-lucide-trash",
                    label: "刪除",
                    color: "error",
                    variant: "ghost",
                    size: "xs",
                    onClick: () => handleDelete(row.original)
                })
            ]);
        }
    }
];

const editAdmin = (admin: any) => {
    router.push(`/system/admins/edit/${admin.id}`);
};

async function onDeletePasswordConfirm(password: string) {
    if (!deleteTarget.value?.id) return;
    deletePasswordSaving.value = true;
    try {
        const ok = await deleteAdmin(deleteTarget.value.id, password, {
            onSuccess: () => fetchData()
        });
        if (ok) {
            deleteConfirmModalOpen.value = false;
            deleteTarget.value = null;
        }
    } finally {
        deletePasswordSaving.value = false;
    }
}

const handleDelete = (admin: any) => {
    deleteTarget.value = { id: admin.id, name: admin.name };
    deleteConfirmModalOpen.value = true;
};

watch(keyword, () => {
    tablePagination.pagination.pageIndex = 0;
    nextTick(() => tableRef.value?.tableApi?.setPageIndex?.(0));
});

onMounted(() => {
    fetchData();
});
</script>

<template>
    <PageMain id="admins">
        <template #header>
            <UDashboardNavbar
                :title="title"
                :ui="{ right: 'gap-3', title: 'text-primary' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton
                        label="新增管理員"
                        color="primary"
                        icon="lucide:plus"
                        to="/system/admins/add" />
                </template>
            </UDashboardNavbar>
            <UDashboardToolbar>
                <template #left>
                    <div class="flex items-center gap-3 flex-wrap">
                        <UInput
                            v-model="keyword"
                            placeholder="搜尋管理員（帳號／姓名／角色）"
                            icon="i-lucide-search"
                            size="md"
                            class="w-80"
                            clearable
                            data-autofocus />
                    </div>
                </template>
            </UDashboardToolbar>
        </template>
        <template #body>
            <DataTable
                ref="tableRef"
                :data="filteredData"
                :columns="columns"
                :loading="loading"
                v-model:pagination="tablePagination.pagination"
                :pagination-options="{
                    getPaginationRowModel: getPaginationRowModel()
                }"
                sticky
                v-bind="paginationBarProps"
                @update:selected-page-size="onPaginationPageSizeUpdate"
                @update:page="tablePagination.setPage" />
        </template>
    </PageMain>
    <PasswordDeleteConfirmModal
        v-model:open="deleteConfirmModalOpen"
        title="確認刪除"
        :description="
            deleteTarget
                ? `確定要刪除「${deleteTarget.name}」嗎？此操作無法復原，「${deleteTarget.name}」將會被永久刪除。`
                : ''
        "
        :loading="deletePasswordSaving"
        @confirm="onDeletePasswordConfirm" />
</template>
