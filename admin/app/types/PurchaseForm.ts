import type { PurchaseRoute } from "~/composables/useAppPurchase";

/** RULE (C)：0 無公式／1 類 RULE A／2 類 RULE B */
export type PurchaseRuleC = 0 | 1 | 2;

/** 表單狀態（含 UI 專用欄位；送出時組成 API payload） */
export interface PurchaseForm {
    financeID?: number;
    /** 區域 */
    area: string;
    /** 單號 */
    financeNo: string;
    /** 0 System Auto / 1 Key in */
    financeNoType: 0 | 1;
    sender_name: string;
    receiver_name: string;
    pay: number;
    note: string;
    rule_C: PurchaseRuleC;
    typeSel: number;
    typeSel_A: number;
    typeSel_B: number;
    exchange_rate: string;
    exchange_rateA: string;
    exchange_rateB: string;
    income: string;
    income_A: string;
    income_B: string;
    subtotal: string;
    subtotal_A: string;
    subtotal_B: string;
    anotherfee: string;
    anotherfee_A: string;
    anotherfee_B: string;
    deduction: string;
    deduction_A: string;
    deduction_B: string;
    total2: string;
    total2_currency: number;
    takeoff: string;
    auto_deduction: boolean;
    /** 唯讀：Subtotal(A+B+C) */
    Subtotal_ABC: string;
    paycash_A: string;
    paycash_B: string;
    paycash: string;
    change_A: string;
    change_B: string;
    change_C: string;
    quantity: string;
    total1: string;
    addition_pay1: string;
    addition_pay2: string;
    subtract_pay: string;
    paycondition: string;
    typeText: string;
    typeText_A: string;
    typeText_B: string;
    sender_tel: string;
    sender_addr: string;
    receiver_tel: string;
    receiver_city: string;
    receiver_addr: string;
}

export interface PurchaseFormErrors {
    area: string | false;
    sender_name: string | false;
    pay: string | false;
}

/** 各路線 TOTAL 幣別預設（與舊版 init.php total2_currency_sel_index） */
export const PURCHASE_DEFAULT_TOTAL2_CURRENCY: Record<PurchaseRoute, number> = {
    t2y: 2,
    t2s: 1,
    s2y: 2,
    s2t: 3,
    y2t: 2,
    y2s: 2
};

export function createEmptyPurchaseForm(route: PurchaseRoute): PurchaseForm {
    return {
        area: "",
        financeNo: "",
        financeNoType: 0,
        sender_name: "",
        receiver_name: "",
        pay: 999,
        note: "",
        rule_C: 1,
        typeSel: 4,
        typeSel_A: 0,
        typeSel_B: 3,
        exchange_rate: "1",
        exchange_rateA: "1",
        exchange_rateB: "1",
        income: "",
        income_A: "",
        income_B: "",
        subtotal: "",
        subtotal_A: "",
        subtotal_B: "",
        anotherfee: "",
        anotherfee_A: "",
        anotherfee_B: "",
        deduction: "",
        deduction_A: "",
        deduction_B: "",
        total2: "",
        total2_currency: PURCHASE_DEFAULT_TOTAL2_CURRENCY[route] ?? 2,
        takeoff: "",
        auto_deduction: false,
        Subtotal_ABC: "",
        paycash_A: "",
        paycash_B: "",
        paycash: "",
        change_A: "",
        change_B: "",
        change_C: "",
        quantity: "",
        total1: "",
        addition_pay1: "",
        addition_pay2: "",
        subtract_pay: "",
        paycondition: "",
        typeText: "",
        typeText_A: "",
        typeText_B: "",
        sender_tel: "",
        sender_addr: "",
        receiver_tel: "",
        receiver_city: "",
        receiver_addr: ""
    };
}
