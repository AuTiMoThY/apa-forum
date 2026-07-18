import type { ProductRegion } from "~/constants/product";
import { watchDebounced } from "@vueuse/core";

type ProductSearchRow = {
    productID: number;
    productname?: string | null;
    wholeseries?: string | null;
    productseries?: string | null;
};

function shouldRunProductSearch(q: string): boolean {
    const t = q.trim();
    if (!t) return false;
    if (t.length >= 2) return true;
    return /^\d+$/.test(t);
}

/**
 * 儀表板 Command Palette 用：依關鍵字呼叫 API，結果供 UDashboardSearch 的 ignoreFilter 群組顯示。
 */
export function useDashboardProductSearch(searchTerm: Ref<string>) {
    const { public: runtimePublic } = useRuntimeConfig();
    const apiBase = (runtimePublic.apiBase as string) || "";
    const route = useRoute();

    /** 與產品頁 useProductRegion 一致：優先使用 URL 的 region，否則 tw */
    const searchRegion = computed<ProductRegion>(() => {
        const q = (route.query.region as string)?.toLowerCase();
        if (q === "tw" || q === "sg" || q === "mm") return q;
        return "tw";
    });

    const productSearchLoading = ref(false);
    const productSearchItems = ref<
        {
            id: string;
            label: string;
            suffix?: string;
            description?: string;
            icon: string;
            disabled?: boolean;
            loading?: boolean;
            to?: { path: string; query: { region: ProductRegion } };
        }[]
    >([]);

    let requestSeq = 0;

    async function fetchProducts(q: string) {
        if (!shouldRunProductSearch(q)) {
            productSearchItems.value = [];
            productSearchLoading.value = false;
            return;
        }
        const seq = ++requestSeq;
        productSearchLoading.value = true;
        productSearchItems.value = [];
        try {
            const res = await $fetch<{
                success: boolean;
                data?: ProductSearchRow[];
            }>(`${apiBase}/product/search`, {
                method: "GET",
                params: { region: searchRegion.value, q: q.trim() },
                credentials: "include"
            });
            if (seq !== requestSeq) return;
            if (!res?.success || !res.data?.length) {
                productSearchItems.value = [
                    {
                        id: "product-empty",
                        label: "沒有符合的產品",
                        icon: "i-lucide-package-x",
                        disabled: true
                    }
                ];
                return;
            }
            productSearchItems.value = res.data.map((row) => {
                const name =
                    (row.productname && String(row.productname).trim()) ||
                    `產品 #${row.productID}`;
                const series = row.wholeseries
                    ? String(row.wholeseries).trim()
                    : "";
                return {
                    id: `product-${row.productID}`,
                    label: name,
                    suffix: series || undefined,
                    description: row.productseries
                        ? String(row.productseries).trim()
                        : undefined,
                    icon: "i-lucide-package-search",
                    to: {
                        path: `/product/product/edit/${row.productID}`,
                        query: { region: searchRegion.value }
                    }
                };
            });
        } catch {
            if (seq !== requestSeq) return;
            productSearchItems.value = [
                {
                    id: "product-error",
                    label: "產品搜尋失敗，請稍後再試",
                    icon: "i-lucide-alert-circle",
                    disabled: true
                }
            ];
        } finally {
            if (seq === requestSeq) {
                productSearchLoading.value = false;
            }
        }
    }

    watchDebounced(
        searchTerm,
        (q) => {
            void fetchProducts((q ?? "").trim());
        },
        { debounce: 320, maxWait: 1200 }
    );

    watch(
        () => route.query.region,
        () => {
            const t = searchTerm.value.trim();
            if (shouldRunProductSearch(t)) {
                void fetchProducts(t);
            }
        }
    );

    const productGroupItems = computed(() => {
        const q = searchTerm.value.trim();
        if (!shouldRunProductSearch(q)) {
            return [];
        }
        if (productSearchLoading.value) {
            return [
                {
                    id: "product-loading",
                    label: "搜尋產品中…",
                    icon: "i-lucide-loader-2",
                    disabled: true,
                    loading: true
                }
            ];
        }
        return productSearchItems.value;
    });

    return { productGroupItems };
}
