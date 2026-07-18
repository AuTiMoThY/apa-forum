import type { ProductRegion } from "~/constants/product";

const { public: runtimePublic } = useRuntimeConfig();
const apiBase = runtimePublic.apiBase as string;

/** 暫存清單一筆（含產品欄位） */
export interface StockInputItem {
    id: number;
    o_id: string;
    p_id: number;
    p_name: string;
    qty: number;
    productseries: string;
    productname: string;
    stock: number;
    product_s_gif: string;
    folderName: string;
}

export const useAppProductStockInput = () => {
    const toast = useToast();
    const loading = ref(false);
    const list = ref<StockInputItem[]>([]);

    /** 產生或取得當前 session 的 uniqueId（存在 ref，頁面可共用） */
    const uniqueId = ref<string>("");

    const ensureUniqueId = () => {
        if (!uniqueId.value) {
            uniqueId.value =
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `stock-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        }
        return uniqueId.value;
    };

    /** 清除過期暫存 */
    const cleanExpired = async (region: ProductRegion): Promise<void> => {
        try {
            await $fetch(`${apiBase}/product/stock-input/clean-expired`, {
                method: "POST",
                params: { region },
                credentials: "include"
            });
        } catch {
            // 忽略錯誤，不阻擋使用者操作
        }
    };

    /** 取得暫存清單 */
    const fetchList = async (
        region: ProductRegion,
        uniqueid: string
    ): Promise<StockInputItem[]> => {
        if (!uniqueid) {
            list.value = [];
            return [];
        }
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; data: StockInputItem[] }>(
                `${apiBase}/product/stock-input/get-list`,
                {
                    method: "GET",
                    params: { region, uniqueid },
                    credentials: "include"
                }
            );
            if (res?.success) {
                list.value = res.data ?? [];
                return res.data ?? [];
            }
            toast.add({ title: "取得暫存清單失敗", color: "error" });
            return [];
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "取得暫存清單失敗",
                color: "error"
            });
            return [];
        } finally {
            loading.value = false;
        }
    };

    /** 新增一筆暫存（產品編號或名稱至少一，數量必填） */
    const addItem = async (
        region: ProductRegion,
        payload: {
            uniqueid: string;
            productSeries?: string;
            productName?: string;
            qty: number;
        }
    ): Promise<boolean> => {
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/product/stock-input/add-item`,
                {
                    method: "POST",
                    params: { region },
                    body: {
                        uniqueid: payload.uniqueid,
                        productSeries: payload.productSeries ?? "",
                        productName: payload.productName ?? "",
                        qty: payload.qty
                    },
                    credentials: "include"
                }
            );
            if (res?.success) {
                return true;
            }
            toast.add({ title: res?.message ?? "新增失敗", color: "error" });
            return false;
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "新增失敗",
                color: "error"
            });
            return false;
        } finally {
            loading.value = false;
        }
    };

    /** 刪除一筆暫存 */
    const deleteItem = async (
        region: ProductRegion,
        id: number
    ): Promise<boolean> => {
        try {
            const res = await $fetch<{ success: boolean }>(
                `${apiBase}/product/stock-input/delete-item`,
                {
                    method: "POST",
                    params: { region },
                    body: { id },
                    credentials: "include"
                }
            );
            if (res?.success) return true;
            return false;
        } catch {
            toast.add({ title: "刪除失敗", color: "error" });
            return false;
        }
    };

    /** 刪除多筆暫存 */
    const deleteItems = async (
        region: ProductRegion,
        ids: number[]
    ): Promise<boolean> => {
        if (ids.length === 0) return true;
        try {
            const res = await $fetch<{ success: boolean }>(
                `${apiBase}/product/stock-input/delete-items`,
                {
                    method: "POST",
                    params: { region },
                    body: { ids },
                    credentials: "include"
                }
            );
            if (res?.success) return true;
            return false;
        } catch {
            toast.add({ title: "刪除失敗", color: "error" });
            return false;
        }
    };

    /** 送出：將暫存寫入產品庫存 */
    const submit = async (
        region: ProductRegion,
        uniqueid: string
    ): Promise<boolean> => {
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/product/stock-input/submit`,
                {
                    method: "POST",
                    params: { region },
                    body: { uniqueid },
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "庫存已更新", color: "success" });
                return true;
            }
            toast.add({ title: res?.message ?? "送出失敗", color: "error" });
            return false;
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "送出失敗",
                color: "error"
            });
            return false;
        } finally {
            loading.value = false;
        }
    };

    /** 產品搜尋（autocomplete），回傳字串陣列 */
    const searchProducts = async (
        region: ProductRegion,
        q: string,
        searchItem: "productseries" | "productname"
    ): Promise<string[]> => {
        if (!q.trim()) return [];
        try {
            const res = await $fetch<{ success: boolean; data: string[] }>(
                `${apiBase}/product/stock-input/search-products`,
                {
                    method: "GET",
                    params: { region, q: q.trim(), searchItem },
                    credentials: "include"
                }
            );
            if (res?.success && Array.isArray(res.data)) return res.data;
            return [];
        } catch {
            return [];
        }
    };

    return {
        list,
        loading,
        uniqueId,
        ensureUniqueId,
        cleanExpired,
        fetchList,
        addItem,
        deleteItem,
        deleteItems,
        submit,
        searchProducts
    };
};
