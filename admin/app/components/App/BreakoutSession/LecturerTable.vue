<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { h, resolveComponent } from "vue";
import type { BreakoutLecturerListItem } from "~/types/BreakoutSessionForm";
import { getPaginationRowModel } from "@tanstack/table-core";
import ImageUploadSingle from "~/components/Form/ImageUploadSingle.vue";

const props = defineProps<{
    groupId: number;
    canEdit: boolean;
}>();

const { public: runtimePublic } = useRuntimeConfig();
const apiBase = runtimePublic.apiBase as string;

const {
    fetchLecturers,
    getLecturerById,
    lecturerForm,
    lecturerErrors,
    lecturerSubmitError,
    clearLecturerError,
    resetLecturerForm,
    loadLecturerFormData,
    addLecturer,
    updateLecturer,
    updateLecturerSortOrder,
    deleteLecturer
} = useAppBreakoutSession();

const UButton = resolveComponent("UButton");
const UInput = resolveComponent("UInput");

const lecturers = ref<BreakoutLecturerListItem[]>([]);
const loading = ref(false);
const savingSortId = ref<number | null>(null);
const sortOrderSnapshots = ref<Record<number, number>>({});

const modalOpen = ref(false);
const modalMode = ref<"add" | "edit">("add");
const editingLecturerId = ref<number | null>(null);
const modalLoading = ref(false);

const deleteConfirmModalOpen = ref(false);
const deleteTarget = ref<BreakoutLecturerListItem | null>(null);
const deleteIsDisabled = ref(false);

const imageUploadRef = ref<InstanceType<typeof ImageUploadSingle> | null>(null);
const uploadEndpoint = `${apiBase}/upload/breakout-session`;
const previewBase = `${apiBase}/uploads/breakout-session/`;

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
    { label: "50", value: 50 }
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

const modalTitle = computed(() =>
    modalMode.value === "add" ? "新增講師" : "編輯講師"
);

const truncateText = (text?: string | null, max = 40) => {
    const value = text?.trim();
    if (!value) return "—";
    return value.length > max ? `${value.slice(0, max)}…` : value;
};

const loadLecturers = async () => {
    loading.value = true;
    lecturers.value = await fetchLecturers(props.groupId);
    loading.value = false;
    await nextTick();
    tableRef?.value?.tableApi?.setPageIndex(INITIAL_PAGE_INDEX);
};

const handleSortOrderFocus = (item: BreakoutLecturerListItem) => {
    sortOrderSnapshots.value[item.id] = item.sort_order ?? 0;
};

const handleSortOrderSave = async (item: BreakoutLecturerListItem) => {
    if (!props.canEdit || savingSortId.value === item.id) return;

    const newVal = Number(item.sort_order) || 0;
    const oldVal = sortOrderSnapshots.value[item.id] ?? newVal;

    if (newVal === oldVal) return;

    savingSortId.value = item.id;
    const ok = await updateLecturerSortOrder(item.id, newVal);

    if (ok) {
        sortOrderSnapshots.value[item.id] = newVal;
        await loadLecturers();
    } else {
        item.sort_order = oldVal;
    }

    savingSortId.value = null;
};

const openAddModal = () => {
    modalMode.value = "add";
    editingLecturerId.value = null;
    resetLecturerForm();
    modalOpen.value = true;
};

const openEditModal = async (item: BreakoutLecturerListItem) => {
    modalMode.value = "edit";
    editingLecturerId.value = item.id;
    modalLoading.value = true;
    modalOpen.value = true;

    const data = await getLecturerById(item.id);
    if (data) {
        loadLecturerFormData(data);
    } else {
        modalOpen.value = false;
    }

    modalLoading.value = false;
};

const handleModalSubmit = async () => {
    const imageRef = imageUploadRef.value as any;
    if (imageRef?.upload && typeof imageRef.upload === "function") {
        const ok = await imageRef.upload();
        if (ok === false) return;
    }

    modalLoading.value = true;

    if (modalMode.value === "add") {
        const success = await addLecturer(props.groupId, {
            onSuccess: async () => {
                modalOpen.value = false;
                await loadLecturers();
            }
        });
        if (!success) {
            modalLoading.value = false;
            return;
        }
    } else if (editingLecturerId.value) {
        const success = await updateLecturer(editingLecturerId.value, props.groupId, {
            onSuccess: async () => {
                modalOpen.value = false;
                await loadLecturers();
            }
        });
        if (!success) {
            modalLoading.value = false;
            return;
        }
    }

    modalLoading.value = false;
};

const handleDelete = (item: BreakoutLecturerListItem) => {
    deleteTarget.value = item;
    deleteConfirmModalOpen.value = true;
};

const confirmDelete = async () => {
    if (!deleteTarget.value) return;

    deleteIsDisabled.value = true;
    await deleteLecturer(deleteTarget.value, {
        onSuccess: async () => {
            await loadLecturers();
        }
    });
    deleteConfirmModalOpen.value = false;
    deleteTarget.value = null;
    deleteIsDisabled.value = false;
};

const columns = computed<TableColumn<BreakoutLecturerListItem>[]>(() => [
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
        accessorKey: "image_url",
        header: "圖片",
        cell: ({ row }) => {
            const url = (row.original as BreakoutLecturerListItem).image_url;
            if (!url) return h("span", { class: "text-gray-400" }, "—");
            return h("img", {
                src: url,
                alt: "講師照片",
                class: "h-12 w-12 rounded object-cover"
            });
        }
    },
    {
        accessorKey: "name",
        header: "姓名"
    },
    {
        accessorKey: "title",
        header: "頭銜",
        cell: ({ row }) =>
            h("span", {}, truncateText((row.original as BreakoutLecturerListItem).title, 30))
    },
    {
        accessorKey: "intro",
        header: "簡介",
        cell: ({ row }) =>
            h("span", {}, truncateText((row.original as BreakoutLecturerListItem).intro, 50))
    },
    {
        accessorKey: "sort_order",
        header: "排序",
        cell: ({ row }) => {
            const item = row.original as BreakoutLecturerListItem;

            if (!props.canEdit) {
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
            if (!props.canEdit) {
                return h("span", { class: "text-default-400" }, "—");
            }
            return h("div", { class: "flex items-center gap-2" }, [
                h(UButton, {
                    icon: "i-lucide-pencil",
                    label: "編輯",
                    color: "primary",
                    size: "xs",
                    onClick: () => openEditModal(row.original as BreakoutLecturerListItem)
                }),
                h(UButton, {
                    icon: "i-lucide-trash-2",
                    label: "刪除",
                    color: "error",
                    variant: "outline",
                    size: "xs",
                    onClick: () => handleDelete(row.original as BreakoutLecturerListItem)
                })
            ]);
        }
    }
]);

watch(
    () => props.groupId,
    () => {
        if (props.groupId) {
            loadLecturers();
        }
    },
    { immediate: true }
);
</script>

<template>
    <UCard :ui="{ body: 'space-y-4' }">
        <template #header>
            <div class="flex items-center justify-between gap-3">
                <h3 class="text-lg font-semibold">組別講師</h3>
                <UButton
                    v-if="canEdit"
                    label="新增講師"
                    color="primary"
                    icon="i-lucide-plus"
                    size="sm"
                    @click="openAddModal" />
            </div>
        </template>

        <UTable
            ref="tableRef"
            :data="lecturers"
            :columns="columns"
            :loading="loading"
            v-model:pagination="pagination"
            :pagination-options="{
                getPaginationRowModel: getPaginationRowModel()
            }"
            sticky />

        <div
            v-if="totalItems > 0"
            class="flex flex-wrap items-center justify-between gap-3">
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
                    (tableRef?.tableApi?.getState().pagination.pageIndex || 0) + 1
                "
                :items-per-page="pageSize"
                :total="totalItems"
                :show-edges="true"
                @update:page="
                    (p: number) => tableRef?.tableApi?.setPageIndex(p - 1)
                " />
        </div>
    </UCard>

    <UModal v-model:open="modalOpen" :title="modalTitle" :ui="{ content: 'max-w-[800px]' }">
        <template #body>
            <PageLoading v-if="modalLoading && modalMode === 'edit'" />
            <div v-else class="space-y-4">
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div class="sm:col-span-1">
                        <ImageUploadSingle
                            ref="imageUploadRef"
                            v-model="lecturerForm.image"
                            label="講師照片"
                            name="image"
                            :error="lecturerErrors.image"
                            :disabled="modalLoading"
                            :upload-endpoint="uploadEndpoint"
                            :preview-base-url="previewBase"
                            preview-max-width="160px"
                            preview-aspect-ratio="3/4" />
                    </div>
                    <div class="space-y-4 sm:col-span-2">
                        <UFormField
                            label="排序"
                            name="sort_order"
                            description="數字越小越前面">
                            <UInput
                                v-model.number="lecturerForm.sort_order"
                                type="number"
                                min="0"
                                size="lg"
                                class="w-full"
                                :disabled="modalLoading" />
                        </UFormField>
                        <UFormField
                            label="姓名"
                            name="name"
                            :error="lecturerErrors.name"
                            required>
                            <UInput
                                v-model="lecturerForm.name"
                                placeholder="請輸入講師姓名"
                                size="lg"
                                class="w-full"
                                :disabled="modalLoading"
                                @input="clearLecturerError('name')" />
                        </UFormField>
                        <UFormField label="頭銜" name="title">
                            <UInput
                                v-model="lecturerForm.title"
                                placeholder="請輸入頭銜"
                                size="lg"
                                class="w-full"
                                :disabled="modalLoading" />
                        </UFormField>
                        <UFormField label="簡介" name="intro">
                            <UTextarea
                                v-model="lecturerForm.intro"
                                placeholder="請輸入簡介"
                                :rows="4"
                                autoresize
                                class="w-full"
                                :disabled="modalLoading" />
                        </UFormField>
                    </div>
                </div>
                <div
                    v-if="lecturerSubmitError"
                    class="text-sm text-red-500 dark:text-red-400">
                    {{ lecturerSubmitError }}
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end gap-2">
                <UButton
                    label="取消"
                    color="neutral"
                    variant="ghost"
                    @click="modalOpen = false" />
                <UButton
                    :label="modalMode === 'add' ? '新增' : '儲存'"
                    color="primary"
                    icon="i-lucide-save"
                    :loading="modalLoading"
                    :disabled="modalLoading"
                    @click="handleModalSubmit" />
            </div>
        </template>
    </UModal>

    <DeleteConfirmModal
        v-model:open="deleteConfirmModalOpen"
        title="確認刪除"
        :description="
            deleteTarget ? `確定要刪除講師「${deleteTarget.name}」嗎？` : ''
        "
        :is-disabled="deleteIsDisabled"
        :on-confirm="confirmDelete" />
</template>
