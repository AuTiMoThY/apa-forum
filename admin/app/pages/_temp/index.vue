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
const title = computed(() => structure?.label ?? "TEMP");
useSeoMeta({ title });

const { hasPermission, isSuperAdmin } = usePermission();
const canEdit = computed(
    () =>
        isSuperAdmin() ||
        hasPermission(`${structure?.url}.edit`) ||
        hasPermission("breakout-session.edit")
);
// const { form, loading, submitError, fetchData, save } = useAppAbout();
const isSubmitting = ref(false);
const showHtmlCode = ref(false);

// onMounted(() => {
//     fetchData();
// });

// const handleSave = async () => {
//     isSubmitting.value = true;
//     try {
//         await save();
//     } finally {
//         isSubmitting.value = false;
//     }
// };
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

                </template>
            </UDashboardNavbar>
        </template>
        <template #body>

        </template>
    </PageMain>
</template>
