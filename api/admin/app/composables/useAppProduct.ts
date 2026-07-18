import type { ProductRegion } from "~/constants/product";
import type { ProductItem } from "~/types/ProductForm";

const { public: runtimePublic } = useRuntimeConfig();
const apiBase = runtimePublic.apiBase as string;

export type { ProductItem };

export const useAppProduct = () => {
    const toast = useToast();
    const loading = ref(false);
    const list = ref<ProductItem[]>([]);

    const fetchList = async (
        region: ProductRegion,
        classId?: number,
        search?: string
    ): Promise<ProductItem[]> => {
        loading.value = true;
        try {
            const params: Record<string, string | number> = { region };
            if (classId != null) params.class_id = classId;
            const q = search?.trim();
            if (q) params.q = q;
            const res = await $fetch<{ success: boolean; data: ProductItem[] }>(
                `${apiBase}/product/get`,
                {
                    method: "GET",
                    params,
                    credentials: "include"
                }
            );
            if (res?.success) {
                list.value = res.data ?? [];
                return res.data ?? [];
            }
            toast.add({ title: "取得產品列表失敗", color: "error" });
            return [];
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "取得產品列表失敗",
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
    ): Promise<ProductItem | null> => {
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; data: ProductItem }>(
                `${apiBase}/product/get-by-id`,
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

    /** 取得上一筆/下一筆產品 ID（同分類內，供編輯頁 Previous/Next 用） */
    const getPrevNext = async (
        region: ProductRegion,
        productId: number,
        classId?: number | null
    ): Promise<{ prevId: number | null; nextId: number | null }> => {
        try {
            const params: Record<string, string | number> = { region, id: productId };
            if (classId != null && classId > 0) params.class_id = classId;
            const res = await $fetch<{
                success: boolean;
                prevId: number | null;
                nextId: number | null;
            }>(`${apiBase}/product/get-prev-next`, {
                method: "GET",
                params,
                credentials: "include"
            });
            if (res?.success) {
                return { prevId: res.prevId ?? null, nextId: res.nextId ?? null };
            }
            return { prevId: null, nextId: null };
        } catch {
            return { prevId: null, nextId: null };
        }
    };

    const add = async (
        region: ProductRegion,
        payload: Partial<ProductItem>
    ): Promise<{ success: boolean; id?: number }> => {
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; id?: number; message?: string }>(
                `${apiBase}/product/add`,
                {
                    method: "POST",
                    body: { ...payload, region },
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "新增產品成功", color: "success" });
                return { success: true, id: res.id };
            }
            toast.add({ title: res?.message ?? "新增產品失敗", color: "error" });
            return { success: false };
        } catch (e: any) {
            const msg = e?.data?.message ?? "新增產品失敗";
            toast.add({ title: msg, color: "error" });
            return { success: false };
        } finally {
            loading.value = false;
        }
    };

    const update = async (
        region: ProductRegion,
        payload: Partial<ProductItem> & { productID: number }
    ): Promise<boolean> => {
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/product/update`,
                {
                    method: "POST",
                    body: { ...payload, region },
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "更新產品成功", color: "success" });
                return true;
            }
            toast.add({ title: res?.message ?? "更新產品失敗", color: "error" });
            return false;
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "更新產品失敗",
                color: "error"
            });
            return false;
        } finally {
            loading.value = false;
        }
    };

    const remove = async (
        region: ProductRegion,
        id: number,
        onSuccess?: () => void
    ): Promise<boolean> => {
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/product/delete`,
                {
                    method: "POST",
                    body: { region, productID: id },
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "刪除產品成功", color: "success" });
                onSuccess?.();
                return true;
            }
            toast.add({ title: res?.message ?? "刪除產品失敗", color: "error" });
            return false;
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "刪除產品失敗",
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
        getPrevNext,
        add,
        update,
        remove
    };
};
