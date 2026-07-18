import type { ProductRegion } from "~/constants/product";

const { public: runtimePublic } = useRuntimeConfig();
const apiBase = runtimePublic.apiBase as string;

export interface ProductCategoryItem {
    classlistID: number;
    folderName?: string | null;
    classname: string;
    classseries?: string | null;
    classmaster: number;
    classordernum: number;
    chkdel: number;
    onTop: number;
    pic?: string;
    chk_assembly?: number;
    /** 次分類數量（頂層時）或該分類下產品數（子層時），由 getList API 填入 */
    subCount?: number;
    created_at?: string;
    updated_at?: string;
}

export const useAppProductCategory = () => {
    const toast = useToast();
    const loading = ref(false);
    const list = ref<ProductCategoryItem[]>([]);

    const fetchList = async (
        region: ProductRegion,
        classmaster?: number
    ): Promise<ProductCategoryItem[]> => {
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; data: ProductCategoryItem[] }>(
                `${apiBase}/product-category/get`,
                {
                    method: "GET",
                    params: { region, classmaster: classmaster ?? 0 },
                    credentials: "include"
                }
            );
            if (res?.success) {
                list.value = res.data ?? [];
                return res.data ?? [];
            }
            toast.add({ title: "取得分類列表失敗", color: "error" });
            return [];
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "取得分類列表失敗",
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
    ): Promise<ProductCategoryItem | null> => {
        try {
            const res = await $fetch<{ success: boolean; data: ProductCategoryItem }>(
                `${apiBase}/product-category/get-by-id`,
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
        }
    };

    const add = async (
        region: ProductRegion,
        payload: Partial<ProductCategoryItem>
    ): Promise<{ success: boolean; id?: number }> => {
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; id?: number; message?: string }>(
                `${apiBase}/product-category/add`,
                {
                    method: "POST",
                    body: { ...payload, region },
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "新增分類成功", color: "success" });
                return { success: true, id: res.id };
            }
            toast.add({ title: res?.message ?? "新增分類失敗", color: "error" });
            return { success: false };
        } catch (e: any) {
            const msg = e?.data?.message ?? "新增分類失敗";
            toast.add({ title: msg, color: "error" });
            return { success: false };
        } finally {
            loading.value = false;
        }
    };

    const update = async (
        region: ProductRegion,
        payload: Partial<ProductCategoryItem> & { classlistID: number }
    ): Promise<boolean> => {
        loading.value = true;
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/product-category/update`,
                {
                    method: "POST",
                    body: { ...payload, region },
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "更新分類成功", color: "success" });
                return true;
            }
            toast.add({ title: res?.message ?? "更新分類失敗", color: "error" });
            return false;
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "更新分類失敗",
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
                `${apiBase}/product-category/delete`,
                {
                    method: "POST",
                    body: { region, classlistID: id },
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: "刪除分類成功", color: "success" });
                onSuccess?.();
                return true;
            }
            toast.add({ title: res?.message ?? "刪除分類失敗", color: "error" });
            return false;
        } catch (e: any) {
            toast.add({
                title: e?.data?.message ?? "刪除分類失敗",
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
        remove
    };
};
