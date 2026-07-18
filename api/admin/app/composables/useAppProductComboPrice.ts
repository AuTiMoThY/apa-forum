import type { ProductRegion } from "~/constants/product";

const { public: runtimePublic } = useRuntimeConfig();
const apiBase = runtimePublic.apiBase as string;

/** 組合主檔（列表/表單） */
export interface ComboPriceListItem {
    listID: number;
    type: number;
    name: string;
    amount: number;
    price: string;
    ordernum: number;
}

/** 組合內商品項目（含 JOIN 商品欄位） */
export interface ComboPriceItemRow {
    itemID: number;
    productID: number;
    productname: string;
    wholeseries: string;
    productseries?: string;
    product_s_gif?: string;
    folderName?: string;
    classID?: number;
}

export const useAppProductComboPrice = () => {
    const toast = useToast();
    const loading = ref(false);
    const list = ref<ComboPriceListItem[]>([]);

    /** 一次取得全部列表（client-side 分頁用），可選 keyword、order */
    const fetchList = async (
        region: ProductRegion,
        opts?: { keyword?: string; order?: string }
    ): Promise<ComboPriceListItem[]> => {
        loading.value = true;
        try {
            const params: Record<string, string> = { region };
            if (opts?.keyword != null && opts.keyword !== "") params.keyword = opts.keyword;
            if (opts?.order != null) params.order = opts.order;
            const res = await $fetch<{
                success: boolean;
                data: ComboPriceListItem[];
            }>(`${apiBase}/product/combo-price/get`, {
                method: "GET",
                params,
                credentials: "include"
            });
            if (res?.success) {
                list.value = res.data ?? [];
                return res.data ?? [];
            }
            toast.add({ title: "取得組合列表失敗", color: "error" });
            return [];
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "取得組合列表失敗",
                color: "error"
            });
            return [];
        } finally {
            loading.value = false;
        }
    };

    const getById = async (
        region: ProductRegion,
        id: number
    ): Promise<ComboPriceListItem | null> => {
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; data: ComboPriceListItem }>(
                `${apiBase}/product/combo-price/get-by-id`,
                {
                    method: "GET",
                    params: { region, id },
                    credentials: "include"
                }
            );
            if (res?.success && res.data) return res.data;
            return null;
        } catch {
            return null;
        } finally {
            loading.value = false;
        }
    };

    const add = async (
        region: ProductRegion,
        payload: {
            type: number;
            name: string;
            amount: number;
            price: string;
            ordernum: number;
            uniqid?: string;
        }
    ): Promise<{ success: boolean; listID?: number }> => {
        loading.value = true;
        try {
            const res = await $fetch<{
                success: boolean;
                listID?: number;
                message?: string;
            }>(`${apiBase}/product/combo-price/add`, {
                method: "POST",
                body: { ...payload, region },
                credentials: "include"
            });
            if (res?.success) {
                toast.add({ title: "新增組合成功", color: "success" });
                return { success: true, listID: res.listID };
            }
            toast.add({ title: res?.message ?? "新增組合失敗", color: "error" });
            return { success: false };
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "新增組合失敗",
                color: "error"
            });
            return { success: false };
        } finally {
            loading.value = false;
        }
    };

    const update = async (
        region: ProductRegion,
        payload: {
            listID: number;
            type: number;
            name: string;
            amount: number;
            price: string;
            ordernum: number;
        }
    ): Promise<boolean> => {
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/product/combo-price/update`,
                {
                    method: "POST",
                    body: { ...payload, region },
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "更新組合成功", color: "success" });
                return true;
            }
            toast.add({ title: res?.message ?? "更新組合失敗", color: "error" });
            return false;
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "更新組合失敗",
                color: "error"
            });
            return false;
        } finally {
            loading.value = false;
        }
    };

    const remove = async (
        region: ProductRegion,
        idOrIds: number | number[],
        onSuccess?: () => void
    ): Promise<boolean> => {
        try {
            const body =
                typeof idOrIds === "number"
                    ? { region, listID: idOrIds }
                    : { region, ids: idOrIds };
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/product/combo-price/delete`,
                {
                    method: "POST",
                    body,
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "刪除組合成功", color: "success" });
                onSuccess?.();
                return true;
            }
            toast.add({ title: res?.message ?? "刪除組合失敗", color: "error" });
            return false;
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "刪除組合失敗",
                color: "error"
            });
            return false;
        }
    };

    const fetchItems = async (
        region: ProductRegion,
        opts: { listID?: number; uniqid?: string }
    ): Promise<ComboPriceItemRow[]> => {
        try {
            const params: Record<string, string | number> = { region };
            if (opts.listID != null) params.listID = opts.listID;
            if (opts.uniqid != null) params.uniqid = opts.uniqid;
            const res = await $fetch<{ success: boolean; data: ComboPriceItemRow[] }>(
                `${apiBase}/product/combo-price/get-items`,
                {
                    method: "GET",
                    params,
                    credentials: "include"
                }
            );
            if (res?.success) return res.data ?? [];
            return [];
        } catch {
            return [];
        }
    };

    const addItems = async (
        region: ProductRegion,
        opts: { listID?: number; uniqid?: string; productIDs: number[] }
    ): Promise<boolean> => {
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/product/combo-price/add-items`,
                {
                    method: "POST",
                    body: { region, ...opts },
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "已加入商品", color: "success" });
                return true;
            }
            toast.add({ title: res?.message ?? "加入商品失敗", color: "error" });
            return false;
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "加入商品失敗",
                color: "error"
            });
            return false;
        }
    };

    const deleteItems = async (
        region: ProductRegion,
        opts: { listID?: number; uniqid?: string; itemIDs: number[] }
    ): Promise<boolean> => {
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/product/combo-price/delete-items`,
                {
                    method: "POST",
                    body: { region, ...opts },
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "已移除商品", color: "success" });
                return true;
            }
            toast.add({ title: res?.message ?? "移除商品失敗", color: "error" });
            return false;
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "移除商品失敗",
                color: "error"
            });
            return false;
        }
    };

    return {
        list,
        loading,
        fetchList,
        getById,
        add,
        update,
        remove,
        fetchItems,
        addItems,
        deleteItems
    };
};
