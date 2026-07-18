<script setup lang="ts">
definePageMeta({
    middleware: ["auth", "permission"]
});

const title = "編輯管理員";
useSeoMeta({
    title
});

const route = useRoute();
const router = useRouter();

const adminId = computed(() => {
    const id = route.params.id as string;
    return parseInt(id, 10);
});

const { loadAdminData } = useUsers();
const adminData = ref<any>(null);
const loadingData = ref(true);

const adminFormRef = ref<{
    loading: boolean;
    submit: () => void;
} | null>(null);

const loading = computed(
    () => (adminFormRef.value?.loading ?? false) || loadingData.value
);

const handleSubmit = () => {
    adminFormRef.value?.submit();
};

// 載入管理員資料
onMounted(async () => {
    loadingData.value = true;
    try {
        const data = await loadAdminData(adminId.value);
        console.log(data);
        if (data) {
            adminData.value = data;
        }
        // loadAdminData 內部已經處理了錯誤和導航，如果返回 null 表示失敗
    } catch (error) {
        console.error("載入管理員資料失敗", error);
    } finally {
        loadingData.value = false;
    }
});
</script>

<template>
    <PageMain id="admins-edit">
        <template #header>
            <UDashboardNavbar
                :title="title"
                :ui="{ right: 'gap-3', title: 'text-primary' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton
                        label="更新管理員"
                        type="button"
                        color="success"
                        icon="lucide:save"
                        :loading="loading"
                        :disabled="loading"
                        @click="handleSubmit()" />
                </template>
            </UDashboardNavbar>
            <UDashboardToolbar>
                <template #left>
                    <UButton
                        label="返回列表"
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-arrow-left"
                        to="/system/admins" />
                </template>
            </UDashboardToolbar>
        </template>
        <template #body>
            <PageLoading v-if="loadingData" />
            <AdminsAdminForm
                v-else
                ref="adminFormRef"
                mode="edit"
                :initial-data="adminData" />
        </template>
    </PageMain>
</template>
