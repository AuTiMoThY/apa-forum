<script setup lang="ts">
import { DASHBOARD_SHORTCUT_GROUPS } from "~/constants/dashboard-shortcuts";
import type { DashboardShortcutGroup, DashboardShortcutItem } from "~/constants/dashboard-shortcuts";

definePageMeta({
    middleware: "auth"
});

const title = "首頁";
useSeoMeta({
    title
});

const { user: authUser } = useAuth();
// const { stats, loading: statsLoading, fetchStats } = useDashboardStats();
const { hasPermission, isSuperAdmin } = usePermission();

onMounted(() => {
    // fetchStats();
});

// 格式化時間（相對或絕對）
const formatTime = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "剛剛";
    if (minutes < 60) return `${minutes} 分鐘前`;
    if (hours < 24) return `${hours} 小時前`;
    if (days < 7) return `${days} 天前`;

    return date.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
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
                <template #right />
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="space-y-6">
                <!-- 歡迎區塊 + 最後更新 -->
                <UCard
                    class="relative bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800">
                    <div class="relative z-10">
                        <div class="flex items-center gap-3">
                            <div
                                class="flex items-center p-2 rounded-lg">
                                <UIcon
                                    name="i-lucide-sparkles"
                                    class="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                歡迎回來，{{ authUser?.name || authUser?.username }}！
                            </h2>
                        </div>

                    </div>
                </UCard>

            </div>
        </template>
    </PageMain>
</template>
