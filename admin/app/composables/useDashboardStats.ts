export interface DashboardStats {
    products: number;
    stores: number;
    new_products: number;
    last_updated: string | null;
}

export const useDashboardStats = () => {
    const { public: runtimePublic } = useRuntimeConfig();
    const apiBase = runtimePublic.apiBase as string;
    const toast = useToast();

    const stats = useState<DashboardStats | null>("dashboard-stats", () => null);
    const loading = ref(false);

    const fetchStats = async (): Promise<DashboardStats | null> => {
        loading.value = true;
        try {
            const res = await $fetch<{
                success: boolean;
                data?: DashboardStats;
                message?: string;
            }>(`${apiBase}/dashboard/stats`, {
                method: "GET",
                credentials: "include",
            });
            if (res?.success && res.data) {
                stats.value = { ...res.data };
                return stats.value;
            }
            toast.add({
                title: res?.message || "取得統計失敗",
                color: "error",
            });
            return null;
        } catch (e: unknown) {
            const err = e as { data?: { message?: string }; message?: string };
            toast.add({
                title: err?.data?.message || err?.message || "取得統計失敗",
                color: "error",
            });
            return null;
        } finally {
            loading.value = false;
        }
    };

    return {
        stats,
        loading,
        fetchStats,
    };
};
