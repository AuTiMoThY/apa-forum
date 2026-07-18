<script setup lang="ts">
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
const title = computed(() => `${structure?.label ?? "講師管理"} - 編輯`);

useSeoMeta({ title });

const lecturerId = computed(() => {
    const id = route.params.id as string;
    return parseInt(id, 10);
});

const { getById } = useAppLecturer();
const lecturerData = ref<any>(null);
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
        const data = await getById(lecturerId.value);
        if (data) {
            lecturerData.value = data;
        } else {
            navigateTo("/lecturer");
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
                        :to="'/lecturer'" />
                    <UButton
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
            <AppLecturerForm
                v-else
                ref="formRef"
                mode="edit"
                :initial-data="lecturerData" />
            <div class="flex justify-end">
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
    </PageMain>
</template>
