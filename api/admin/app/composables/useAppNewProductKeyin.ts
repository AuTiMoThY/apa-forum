import type { ProductRegion } from "~/constants/product";

const { public: runtimePublic } = useRuntimeConfig();
const apiBase = runtimePublic.apiBase as string;

export interface NewProductKeyinPayload {
    locations: { tw: boolean; sg: boolean; mm: boolean };
    classID_tw: number;
    classID_sg: number;
    classID_mm: number;
    financeNoType: 0 | 1;
    productseries: string;
    /** 其餘與 ProductForm 對齊 */
    [key: string]: unknown;
}

export interface NewProductKeyinCreateResult {
    success: boolean;
    message?: string;
    inserted?: Record<string, number>;
    skipped?: string[];
}

export const useAppNewProductKeyin = () => {
    const toast = useToast();
    const loading = ref(false);
    const categoryLoading = ref(false);

    /** 取得單一地區的「大類 - 次分類」下拉選項（與舊版 add 一致：value = 次分類 classlistID） */
    const fetchCategoryOptions = async (
        region: ProductRegion
    ): Promise<{ label: string; value: number }[]> => {
        categoryLoading.value = true;
        try {
            const tops = await $fetch<{ success: boolean; data: { classlistID: number; classname: string }[] }>(
                `${apiBase}/product-category/get`,
                {
                    method: "GET",
                    params: { region, classmaster: 0 },
                    credentials: "include"
                }
            );
            const topList = tops?.data ?? [];
            const options: { label: string; value: number }[] = [
                { label: "（請選擇分類）", value: 0 }
            ];
            if (topList.length === 0) {
                return options;
            }
            const childrenArrays = await Promise.all(
                topList.map((parent: { classlistID: number }) =>
                    $fetch<{ success: boolean; data: { classlistID: number; classname: string }[] }>(
                        `${apiBase}/product-category/get`,
                        {
                            method: "GET",
                            params: { region, classmaster: parent.classlistID },
                            credentials: "include"
                        }
                    ).then((r) => r?.data ?? [])
                )
            );
            topList.forEach((parent: { classlistID: number; classname: string }, i: number) => {
                const children = childrenArrays[i] ?? [];
                children.forEach((child: { classlistID: number; classname: string }) => {
                    options.push({
                        label: `${parent.classname} - ${child.classname}`,
                        value: child.classlistID
                    });
                });
            });
            return options;
        } catch (e: unknown) {
            const msg = (e as { data?: { message?: string } })?.data?.message ?? "取得分類失敗";
            toast.add({ title: msg, color: "error" });
            return [{ label: "（請選擇分類）", value: 0 }];
        } finally {
            categoryLoading.value = false;
        }
    };

    /** 三地分類選項並行載入 */
    const fetchAllCategoryOptions = async (): Promise<{
        tw: { label: string; value: number }[];
        sg: { label: string; value: number }[];
        mm: { label: string; value: number }[];
    }> => {
        const [tw, sg, mm] = await Promise.all([
            fetchCategoryOptions("tw"),
            fetchCategoryOptions("sg"),
            fetchCategoryOptions("mm")
        ]);
        return { tw, sg, mm };
    };

    /** 送出同步新產品 */
    const create = async (
        payload: NewProductKeyinPayload & Record<string, unknown>
    ): Promise<NewProductKeyinCreateResult> => {
        loading.value = true;
        try {
            const res = await $fetch<NewProductKeyinCreateResult>(
                `${apiBase}/product/new-product-keyin/create`,
                {
                    method: "POST",
                    body: payload,
                    credentials: "include"
                }
            );
            if (res?.success) {
                toast.add({ title: res.message ?? "同步新產品成功", color: "success" });
                return res;
            }
            toast.add({
                title: (res as { message?: string })?.message ?? "同步新產品失敗",
                color: "error"
            });
            return { success: false };
        } catch (e: unknown) {
            const msg = (e as { data?: { message?: string } })?.data?.message ?? "同步新產品失敗";
            toast.add({ title: msg, color: "error" });
            return { success: false };
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        categoryLoading,
        fetchCategoryOptions,
        fetchAllCategoryOptions,
        create
    };
};
