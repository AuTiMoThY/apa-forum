<script lang="ts" setup>
definePageMeta({
    middleware: ["auth", "permission"]
});

const route = useRoute();
const { asideData, fetchDataForAside } = useStructure();
const { getBasePath } = useBasePath();
const { findStructureByPath } = useStructureResolver();

if (!asideData.value?.length) {
    await fetchDataForAside();
}

const basePath = getBasePath(route.path);
const structure = findStructureByPath(basePath);
const title = computed(() => structure?.label ?? "議程管理");

useSeoMeta({ title });

const { hasPermission, isSuperAdmin } = usePermission();
const canEdit = computed(
    () =>
        isSuperAdmin() ||
        hasPermission(`${structure?.url}.edit`) ||
        hasPermission("agenda.edit")
);

const {
    days,
    loading,
    submitError,
    fetchData,
    addDay,
    removeDay,
    addRow,
    removeRow,
    getDayTitle,
    save
} = useAppAgenda();

const deleteDayModalOpen = ref(false);
const deleteDayTarget = ref<number | null>(null);
const deleteRowTarget = ref<{ dayIndex: number; rowIndex: number } | null>(
    null
);

const isSubmitting = ref(false);

onMounted(() => {
    fetchData();
});

const handleSave = async () => {
    if (!canEdit.value) return;

    isSubmitting.value = true;
    try {
        await save();
    } finally {
        isSubmitting.value = false;
    }
};

const openDeleteDay = (dayIndex: number) => {
    deleteDayTarget.value = dayIndex;
    deleteDayModalOpen.value = true;
};

const deleteDayDescription = computed(() => {
    if (deleteDayTarget.value === null) return "";
    const day = days.value[deleteDayTarget.value];
    if (!day) return "";
    return `確定要刪除「${getDayTitle(
        day,
        deleteDayTarget.value
    )}」及其所有議程列嗎？`;
});

const confirmDeleteDay = () => {
    if (deleteDayTarget.value !== null) {
        removeDay(deleteDayTarget.value);
    }
    deleteDayModalOpen.value = false;
    deleteDayTarget.value = null;
};

const openDeleteRow = (dayIndex: number, rowIndex: number) => {
    deleteRowTarget.value = { dayIndex, rowIndex };
};

const confirmDeleteRow = () => {
    if (deleteRowTarget.value) {
        removeRow(
            deleteRowTarget.value.dayIndex,
            deleteRowTarget.value.rowIndex
        );
    }
    deleteRowTarget.value = null;
};
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
                        label="新增日期"
                        color="primary"
                        variant="outline"
                        icon="i-lucide-calendar-plus"
                        :disabled="loading || isSubmitting"
                        @click="addDay" />
                    <UButton
                        v-if="canEdit"
                        label="儲存"
                        color="success"
                        :icon="
                            loading || isSubmitting
                                ? 'i-lucide-loader-circle'
                                : 'i-lucide-save'
                        "
                        :loading="loading || isSubmitting"
                        :disabled="loading || isSubmitting"
                        @click="handleSave" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <PageLoading v-if="loading && !days.length" />

            <div v-else class="space-y-6">
                <div
                    v-if="!days.length"
                    class="rounded-lg border border-dashed border-default p-10 text-center">
                    <p class="text-muted mb-4">尚未建立任何議程日</p>
                    <UButton
                        v-if="canEdit"
                        label="新增 Day 1"
                        color="primary"
                        icon="i-lucide-calendar-plus"
                        @click="addDay" />
                </div>

                <UCard
                    v-for="(day, dayIndex) in days"
                    :key="day.id ?? dayIndex"
                    :ui="{ header: 'bg-primary/10' }">
                    <template #header>
                        <div
                            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div class="flex flex-1 items-center gap-3">
                                <h3 class="text-lg font-semibold shrink-0">
                                    {{ getDayTitle(day, dayIndex) }}
                                </h3>
                                <UInput
                                    v-if="canEdit"
                                    v-model="day.label"
                                    placeholder="自訂標籤（選填，如 Day 1）"
                                    size="md"
                                    class="max-w-xs"
                                    :disabled="loading || isSubmitting" />
                            </div>
                            <div class="flex flex-wrap items-center gap-2">
                                <UButton
                                    v-if="canEdit"
                                    label="新增場次"
                                    color="primary"
                                    variant="soft"
                                    size="md"
                                    icon="i-lucide-plus"
                                    :disabled="loading || isSubmitting"
                                    @click="addRow(dayIndex)" />
                                <UButton
                                    v-if="canEdit && days.length > 1"
                                    label="刪除"
                                    color="error"
                                    variant="soft"
                                    size="md"
                                    icon="i-lucide-trash-2"
                                    :disabled="loading || isSubmitting"
                                    @click="openDeleteDay(dayIndex)" />
                            </div>
                        </div>
                    </template>

                    <div class="overflow-x-auto">
                        <table
                            class="w-full min-w-[720px] border-collapse text-sm">
                            <thead>
                                <tr class="border-b border-default bg-muted/30">
                                    <th
                                        class="px-3 py-2 text-left font-medium w-[160px]">
                                        場次
                                    </th>
                                    <th
                                        class="px-3 py-2 text-left font-medium w-[160px]">
                                        類型
                                    </th>
                                    <th class="px-3 py-2 text-left font-medium">
                                        主題/內容
                                    </th>
                                    <th
                                        v-if="canEdit"
                                        class="px-3 py-2 text-center font-medium w-[80px]">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(row, rowIndex) in day.items"
                                    :key="row.id ?? rowIndex"
                                    class="border-b border-default/60 align-top">
                                    <td class="px-3 py-2">
                                        <UInput
                                            v-if="canEdit"
                                            v-model="row.session"
                                            placeholder="如 09:00-10:00"
                                            size="md"
                                            class="w-full"
                                            :disabled="
                                                loading || isSubmitting
                                            " />
                                        <span v-else>{{
                                            row.session || "—"
                                        }}</span>
                                    </td>
                                    <td class="px-3 py-2">
                                        <UInput
                                            v-if="canEdit"
                                            v-model="row.type"
                                            placeholder="如 Keynote"
                                            size="md"
                                            class="w-full"
                                            :disabled="
                                                loading || isSubmitting
                                            " />
                                        <span v-else>{{
                                            row.type || "—"
                                        }}</span>
                                    </td>
                                    <td class="px-3 py-2">
                                        <UTextarea
                                            v-if="canEdit"
                                            v-model="row.topic"
                                            placeholder="請輸入主題或內容"
                                            :rows="2"
                                            autoresize
                                            class="w-full"
                                            :disabled="
                                                loading || isSubmitting
                                            " />
                                        <span
                                            v-else
                                            class="whitespace-pre-wrap"
                                            >{{ row.topic || "—" }}</span
                                        >
                                    </td>
                                    <td
                                        v-if="canEdit"
                                        class="px-3 py-2 text-center">
                                        <UButton
                                            color="error"
                                            variant="ghost"
                                            size="sm"
                                            icon="i-lucide-trash-2"
                                            :disabled="loading || isSubmitting"
                                            @click="
                                                openDeleteRow(
                                                    dayIndex,
                                                    rowIndex
                                                )
                                            " />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <UButton
                            v-if="canEdit"
                            label="新增場次"
                            color="primary"
                            variant="soft"
                            size="md"
                            icon="i-lucide-plus"
                            :ui="{ base: 'w-full justify-center' }"
                            :disabled="loading || isSubmitting"
                            @click="addRow(dayIndex)" />
                    </div>
                </UCard>

                <div class="flex justify-end">
                    <UButton
                        v-if="canEdit"
                        label="儲存"
                        color="success"
                        :icon="
                            loading || isSubmitting
                                ? 'i-lucide-loader-circle'
                                : 'i-lucide-save'
                        "
                        :loading="loading || isSubmitting"
                        :disabled="loading || isSubmitting"
                        @click="handleSave" />
                </div>

                <div
                    v-if="submitError"
                    class="text-sm text-red-500 dark:text-red-400">
                    {{ submitError }}
                </div>
            </div>

            <DeleteConfirmModal
                v-model:open="deleteDayModalOpen"
                title="確認刪除此 Day"
                :description="deleteDayDescription"
                :on-confirm="confirmDeleteDay" />

            <UModal
                :open="deleteRowTarget !== null"
                title="確認刪除此列"
                description="此操作將移除該議程列，儲存後才會寫入資料庫。"
                @update:open="
                    (value) => {
                        if (!value) deleteRowTarget = null;
                    }
                ">
                <template #body>
                    <div class="flex justify-end gap-3 pt-2">
                        <UButton
                            label="取消"
                            color="neutral"
                            variant="outline"
                            @click="deleteRowTarget = null" />
                        <UButton
                            label="刪除"
                            color="error"
                            @click="confirmDeleteRow" />
                    </div>
                </template>
            </UModal>
        </template>
    </PageMain>
</template>
