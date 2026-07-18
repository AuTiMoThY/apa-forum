<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/table-core";

definePageMeta({
    middleware: ["auth", "permission"]
});

const title = "管理員設定";
useSeoMeta({
  title
});

import { h, resolveComponent } from "vue";
// 參考 Addadmin.vue 的權限設定，轉換顯示文字
import { PERMISSION_LABEL_MAP } from "~/constants/permissions";
import { STATUS_LABEL_MAP } from "~/constants/system/status";
import { STATUS_ICON_MAP } from "~/constants/system/status_icon";

const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");

const router = useRouter();
const { data, loading, fetchData, deleteAdmin } = useUsers();

const deleteConfirmModalOpen = ref(false);
const deleteTarget = ref<{ id: string; name: string } | null>(null);

const tableRef = useTemplateRef<{
    tableApi?: {
        getFilteredRowModel: () => { rows: { length: number } };
        getState: () => { pagination: { pageIndex: number } };
        setPageIndex: (index: number) => void;
        setPageSize?: (size: number) => void;
    };
}>("tableRef");

/** 每頁筆數選項 */
const pageSizeOptions = [
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "50", value: 50 },
    { label: "100", value: 100 }
];

const pagination = ref({
    pageIndex: 0,
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

/** 顯示範圍文字（例：1–10 / 共 25 筆） */
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

const columns: TableColumn<any>[] = [
    { accessorKey: "username", header: "帳號" },
    { accessorKey: "name", header: "姓名" },
    {
        accessorKey: "roles",
        header: "角色",
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
        header: "狀態",
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

const confirmDeleteAdmin = async () => {
    await deleteAdmin({
        id: deleteTarget.value?.id,
        onSuccess: () => fetchData()
    });
    deleteConfirmModalOpen.value = false;
    deleteTarget.value = null;
}

const handleDelete = async (data: any) => {
    deleteTarget.value = { id: data.id, name: data.name };
    deleteConfirmModalOpen.value = true;
}

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
                    <span class="text-sm text-default"
                        >筆 · {{ rangeText }}</span
                    >
                </div>
                <UPagination
                    :default-page="
                        (tableRef?.tableApi?.getState().pagination.pageIndex ||
                            0) + 1
                    "
                    :items-per-page="pageSize"
                    :total="totalItems"
                    :show-edges="true"
                    @update:page="(p: number) => tableRef?.tableApi?.setPageIndex(p - 1)" />
            </div>
        </template>
    </PageMain>
    <DeleteConfirmModal
        v-model:open="deleteConfirmModalOpen"
        title="確認刪除"
        :description="
            deleteTarget
                ? `確定要刪除「${deleteTarget.name}」嗎？此操作無法復原，「${deleteTarget.name}」將會被永久刪除。`
                : ''
        "
        :on-confirm="confirmDeleteAdmin" />
</template>
