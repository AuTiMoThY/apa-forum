<script setup lang="ts">
definePageMeta({
    middleware: ["auth", "permission"]
});

const route = useRoute();
const { asideData, fetchDataForAside } = useStructure();
const { getBasePath } = useBasePath();
const { findStructureByPath } = useStructureResolver();
const { hasPermission, isSuperAdmin } = usePermission();

if (!asideData.value?.length) {
    await fetchDataForAside();
}

const basePath = getBasePath(route.path);
const structure = findStructureByPath(basePath);
const title = computed(() => `${structure?.label ?? "分組討論管理"} - 編輯組別`);

useSeoMeta({ title });

const canEdit = computed(
    () =>
        isSuperAdmin() ||
        hasPermission(`${structure?.url}.edit`) ||
        hasPermission("breakout-session.edit")
);

const groupId = computed(() => {
    const id = route.params.id as string;
    return parseInt(id, 10);
});

const { loadGroupData } = useAppBreakoutSession();
const groupData = ref<any>(null);
const loadingData = ref(true);

const formRef = ref<{
    loading: boolean;
    submit: () => void;
} | null>(null);

const loading = computed(
    () => (formRef.value?.loading ?? false) || loadingData.value
);

const handleSubmit = () => {
    formRef.value?.submit();
};

onMounted(async () => {
    loadingData.value = true;
    try {
        const data = await loadGroupData(groupId.value);
        if (data) {
            groupData.value = data;
        }
    } finally {
        loadingData.value = false;
    }
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
                        label="返回列表"
                        color="neutral"
                        variant="ghost"
                        :to="'/breakout-session'" />
                    <UButton
                        v-if="canEdit"
                        type="button"
                        color="success"
                        icon="i-lucide-save"
                        :loading="loading"
                        :disabled="loading"
                        label="儲存"
                        @click="handleSubmit()" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <PageLoading v-if="loadingData" />
            <template v-else>
                <AppBreakoutSessionForm
                    ref="formRef"
                    mode="edit"
                    :initial-data="groupData" />
                <div class="mt-6">
                    <AppBreakoutSessionLecturerTable
                        :group-id="groupId"
                        :can-edit="canEdit" />
                </div>
                <div v-if="canEdit" class="mt-4 flex justify-end">
                    <UButton
                        type="button"
                        color="success"
                        icon="i-lucide-save"
                        :loading="loading"
                        :disabled="loading"
                        label="儲存"
                        @click="handleSubmit()" />
                </div>
            </template>
        </template>
    </PageMain>
</template>
