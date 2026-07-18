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
const title = computed(() => `${structure?.label ?? "講師管理"} - 新增`);

useSeoMeta({ title });

const formRef = ref<{
    loading: boolean;
    submit: () => void;
} | null>(null);

const loading = computed(() => formRef.value?.loading ?? false);

const handleSubmit = () => {
    formRef.value?.submit();
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
                        label="新增講師"
                        @click="handleSubmit()" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <AppLecturerForm ref="formRef" mode="add" />
            <div class="flex justify-end">
                <UButton
                    type="button"
                    color="success"
                    icon="i-lucide-save"
                    :loading="loading"
                    :disabled="loading"
                    label="新增講師"
                    @click="handleSubmit()" />
            </div>
        </template>
    </PageMain>
</template>
