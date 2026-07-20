<script lang="ts" setup>
definePageMeta({
    middleware: ["auth", "permission"],
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
const title = computed(() => structure?.label ?? "主辦單位介紹");
useSeoMeta({ title });

const { hasPermission, isSuperAdmin } = usePermission();
const canEdit = computed(
    () =>
        isSuperAdmin() ||
        hasPermission(`${structure?.url}.edit`) ||
        hasPermission("organizer.edit")
);

const { form, errors, loading, submitError, clearError, fetchData, save } =
    useAppOrganizer();

const isSubmitting = ref(false);

onMounted(() => {
    fetchData();
});

const handleSave = async (e?: Event) => {
    if (e) e.preventDefault();
    if (!canEdit.value) return;

    isSubmitting.value = true;
    try {
        await save();
    } finally {
        isSubmitting.value = false;
    }
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
                        label="儲存"
                        color="success"
                        :icon="
                            loading || isSubmitting
                                ? 'i-lucide-loader-circle'
                                : 'i-lucide-save'
                        "
                        :loading="loading || isSubmitting"
                        :disabled="loading || isSubmitting"
                        @click="handleSave($event)" />
                </template>
            </UDashboardNavbar>
        </template>
        <template #body>
            <PageLoading v-if="loading && !form.content_tw && !form.content_en" />
            <UForm
                v-else
                :state="form"
                class="space-y-6"
                @submit="handleSave($event)">
                <UCard
                    :ui="{ root: 'overflow-visible', header: 'bg-primary/10' }">
                    <template #header>
                        <h3 class="text-lg font-semibold">內容設定</h3>
                    </template>
                    <div class="space-y-4">
                        <UFormField
                            label="中文內容"
                            name="content_tw"
                            :error="errors.content_tw">
                            <UTextarea
                                v-model="form.content_tw"
                                placeholder="請輸入主辦單位介紹中文內容"
                                :rows="12"
                                :disabled="loading || isSubmitting || !canEdit"
                                class="w-full"
                                @input="clearError('content_tw')" />
                        </UFormField>
                        <UFormField
                            label="英文內容"
                            name="content_en"
                            :error="errors.content_en">
                            <UTextarea
                                v-model="form.content_en"
                                placeholder="請輸入主辦單位介紹英文內容"
                                :rows="12"
                                :disabled="loading || isSubmitting || !canEdit"
                                class="w-full"
                                @input="clearError('content_en')" />
                        </UFormField>
                    </div>
                </UCard>

                <div
                    v-if="canEdit"
                    class="flex justify-end gap-4 pt-4">
                    <UButton
                        label="儲存"
                        color="success"
                        icon="i-lucide-save"
                        :loading="loading || isSubmitting"
                        :disabled="loading || isSubmitting"
                        @click="handleSave($event)" />
                </div>

                <div
                    v-if="submitError"
                    class="text-sm text-red-500 dark:text-red-400">
                    {{ submitError }}
                </div>
            </UForm>
        </template>
    </PageMain>
</template>
