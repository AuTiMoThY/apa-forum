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
const title = computed(() => `${structure?.label ?? "分組討論管理"} - 新增組別`);

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
                        :to="'/breakout-session'" />
                    <UButton
                        type="button"
                        color="success"
                        icon="i-lucide-save"
                        :loading="loading"
                        :disabled="loading"
                        label="新增組別"
                        @click="handleSubmit()" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <AppBreakoutSessionForm ref="formRef" mode="add" />
            <p class="mt-4 text-sm text-default-500">
                儲存後即可新增組別講師。(將導向編輯頁)
            </p>
            <div class="mt-4 flex justify-end">
                <UButton
                    type="button"
                    color="success"
                    icon="i-lucide-save"
                    :loading="loading"
                    :disabled="loading"
                    label="新增組別"
                    @click="handleSubmit()" />
            </div>
        </template>
    </PageMain>
</template>
