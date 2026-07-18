const { public: runtimePublic } = useRuntimeConfig();
const apiBase = runtimePublic.apiBase as string;

/** 路線代碼 */
export type PurchaseRoute =
    | "t2y"
    | "t2s"
    | "s2y"
    | "s2t"
    | "y2t"
    | "y2s";

/** 路線顯示名稱 */
export const PURCHASE_ROUTE_LABELS: Record<PurchaseRoute, string> = {
    t2y: "Taiwan to Yangon",
    t2s: "Taiwan to Singapore",
    s2y: "Singapore to Yangon",
    s2t: "Singapore to Taiwan",
    y2t: "Yangon to Taiwan",
    y2s: "Yangon to Singapore"
};

/** 幣別選項（與舊版 lang_chinese finance_currency_array 對應） */
export const PURCHASE_CURRENCIES = [
    "US$",
    "SIN$",
    "KYAT$",
    "NT$",
    "OTHER$"
] as const;

/** 付款／交付方式（與舊版 lang pay 選單值一致） */
export const PURCHASE_PAY_OPTIONS: { value: number; label: string }[] = [
    { value: 999, label: "Please Select" },
    { value: 4, label: "$$YGN TO DOOR 仰光到府" },
    { value: 3, label: "YGN PICK UP 仰光自領" },
    { value: 2, label: "$$MDY TO DOOR 瓦城到府" },
    { value: 1, label: "$$ID WIRE 身分證匯" },
    { value: 0, label: "MDY PICK UP 瓦城自領" },
    { value: 5, label: "ACCOUNT 到帳號" },
    { value: 6, label: "CALL AND ASK 打電話問" },
    { value: 7, label: "TW PICK UP 台灣店取" },
    { value: 8, label: "SG PICK UP 新加坡店取" },
    { value: 9, label: "OTHER 其他" }
];

/** 列表一筆代購 */
export interface PurchaseListItem {
    financeID: number;
    area?: string;
    owner?: string;
    income_A?: number | string;
    income_B?: number | string;
    income?: number | string;
    anotherfee_A?: number | string;
    anotherfee_B?: number | string;
    anotherfee?: number | string;
    deduction_A?: number | string;
    deduction_B?: number | string;
    deduction?: number | string;
    takeoff?: number | string;
    posttime: string;
    financeNo?: string;
    sender_name?: string;
    total2?: number | string;
    total2_currency?: number;
    receiver_name?: string;
    receiver_country?: string;
    note?: string;
    pay?: number;
    [key: string]: unknown;
}

export interface PurchaseListParams {
    page?: number;
    per_page?: number;
    keyword?: string;
    date_begin?: string;
    date_end?: string;
    key_value?: number; // 1=正 -1=負
    key_currency?: number; // -1=全部
    key_feedback?: string;
    order_by?: string;
    order_dir?: "asc" | "desc";
}

export interface PurchaseListResult {
    success: boolean;
    data: PurchaseListItem[];
    total: number;
    page: number;
    per_page: number;
}

/** 可寫入 API 之欄位（與 AppPurchaseModel allowedFields 一致） */
export const PURCHASE_MODEL_FIELDS = [
    "area",
    "owner",
    "income_A",
    "income_B",
    "income",
    "anotherfee_A",
    "anotherfee_B",
    "anotherfee",
    "deduction_A",
    "deduction_B",
    "deduction",
    "takeoff",
    "posttime",
    "financeNo",
    "sender_name",
    "sender_tel",
    "sender_addr",
    "receiver_name",
    "receiver_tel",
    "receiver_city",
    "receiver_addr",
    "receiver_country",
    "total2",
    "total2_currency",
    "note",
    "pay",
    "quantity",
    "total1",
    "addition_pay1",
    "addition_pay2",
    "subtract_pay",
    "paycash_A",
    "paycash_B",
    "paycash",
    "change_A",
    "change_B",
    "change_C",
    "subtotal",
    "subtotal_A",
    "subtotal_B",
    "exchange_rate",
    "exchange_rateA",
    "exchange_rateB",
    "paycondition",
    "typeSel",
    "typeSel_A",
    "typeSel_B",
    "typeText",
    "typeText_A",
    "typeText_B"
] as const;

export const useAppPurchase = () => {
    const toast = useToast();
    const loading = ref(false);

    const getList = async (
        route: PurchaseRoute,
        params: PurchaseListParams = {}
    ): Promise<PurchaseListResult> => {
        const query: Record<string, string | number> = {
            route,
            page: params.page ?? 1,
            per_page: params.per_page ?? 50
        };
        if (params.keyword) query.keyword = params.keyword;
        if (params.date_begin) query.date_begin = params.date_begin;
        if (params.date_end) query.date_end = params.date_end;
        if (params.key_value !== undefined && params.key_value !== 0)
            query.key_value = params.key_value;
        if (params.key_currency !== undefined && params.key_currency !== -1)
            query.key_currency = params.key_currency;
        if (params.key_feedback) query.key_feedback = params.key_feedback;
        if (params.order_by) query.order_by = params.order_by;
        if (params.order_dir) query.order_dir = params.order_dir;

        const res = await $fetch<PurchaseListResult>(`${apiBase}/purchase/list`, {
            method: "GET",
            params: query,
            credentials: "include"
        });
        return res;
    };

    const getById = async (
        route: PurchaseRoute,
        id: number,
        sqlYear?: number | null
    ) => {
        const params: Record<string, string | number> = { route, id };
        if (sqlYear != null) params.sql_year = sqlYear;
        const res = await $fetch<{ success: boolean; data: PurchaseListItem }>(
            `${apiBase}/purchase/get-by-id`,
            {
                method: "GET",
                params,
                credentials: "include"
            }
        );
        return res;
    };

    const deleteOne = async (
        route: PurchaseRoute,
        id: number,
        sqlYear?: number | null
    ) => {
        const body: Record<string, string | number> = { route, id };
        if (sqlYear != null) body.sql_year = sqlYear;
        const res = await $fetch<{ success: boolean; message?: string }>(
            `${apiBase}/purchase/delete`,
            {
                method: "POST",
                body,
                credentials: "include"
            }
        );
        return res;
    };

    const deleteBatch = async (
        route: PurchaseRoute,
        delstr: string
    ) => {
        const res = await $fetch<{ success: boolean; message?: string }>(
            `${apiBase}/purchase/delete`,
            {
                method: "POST",
                body: { route, delstr },
                credentials: "include"
            }
        );
        return res;
    };

    const add = async (
        route: PurchaseRoute,
        body: Record<string, unknown>
    ) => {
        loading.value = true;
        try {
            const res = await $fetch<{
                success: boolean;
                message?: string;
                financeID?: number;
            }>(`${apiBase}/purchase/add`, {
                method: "POST",
                body: { route, ...body },
                credentials: "include"
            });
            if (res?.success) {
                toast.add({
                    title: res.message ?? "新增成功",
                    color: "success"
                });
            } else {
                toast.add({
                    title: res?.message ?? "新增失敗",
                    color: "error"
                });
            }
            return res;
        } catch (e: unknown) {
            const err = e as { data?: { message?: string } };
            toast.add({
                title: err?.data?.message ?? "新增失敗",
                color: "error"
            });
            return { success: false as const };
        } finally {
            loading.value = false;
        }
    };

    const update = async (
        route: PurchaseRoute,
        body: Record<string, unknown>
    ) => {
        loading.value = true;
        try {
            const res = await $fetch<{
                success: boolean;
                message?: string;
                financeID?: number;
            }>(`${apiBase}/purchase/update`, {
                method: "POST",
                body: { route, ...body },
                credentials: "include"
            });
            if (res?.success) {
                toast.add({
                    title: res.message ?? "更新成功",
                    color: "success"
                });
            } else {
                toast.add({
                    title: res?.message ?? "更新失敗",
                    color: "error"
                });
            }
            return res;
        } catch (e: unknown) {
            const err = e as { data?: { message?: string } };
            toast.add({
                title: err?.data?.message ?? "更新失敗",
                color: "error"
            });
            return { success: false as const };
        } finally {
            loading.value = false;
        }
    };

    return {
        getList,
        getById,
        deleteOne,
        deleteBatch,
        add,
        update,
        loading,
        PURCHASE_ROUTE_LABELS,
        PURCHASE_CURRENCIES,
        PURCHASE_PAY_OPTIONS,
        PURCHASE_MODEL_FIELDS
    };
};
