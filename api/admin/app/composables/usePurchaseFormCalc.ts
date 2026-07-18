import type { PurchaseForm } from "~/types/PurchaseForm";
import { createEmptyPurchaseForm } from "~/types/PurchaseForm";
import type { PurchaseRoute } from "~/composables/useAppPurchase";
import { PURCHASE_MODEL_FIELDS } from "./useAppPurchase";

const round5 = (n: number) => Math.round(n * 100000) / 100000;

function nz(s: string | undefined | null): string {
    return s == null ? "" : String(s).trim();
}

function hasVal(s: string): boolean {
    return nz(s) !== "";
}

function toF(s: string): number {
    const n = parseFloat(nz(s));
    return Number.isFinite(n) ? n : NaN;
}

/**
 * 舊版 add_edit.php checkInput() 之核心計算（略過 Pay Cash 隱藏欄嚴格檢查時可通過）
 */
export function runPurchaseCalculate(form: PurchaseForm): { ok: true } | { ok: false; message: string } {
    let exchange_rate = toF(form.exchange_rate);
    let exchange_rateA = toF(form.exchange_rateA);
    let exchange_rateB = toF(form.exchange_rateB);

    if (!Number.isFinite(exchange_rate) || exchange_rate === 0) {
        form.exchange_rate = "1";
        exchange_rate = 1;
        return { ok: false, message: "Rate(C) cannot be zero!" };
    }
    if (!Number.isFinite(exchange_rateA) || exchange_rateA === 0) {
        form.exchange_rateA = "1";
        exchange_rateA = 1;
        return { ok: false, message: "Rate(A) cannot be zero!" };
    }
    if (!Number.isFinite(exchange_rateB) || exchange_rateB === 0) {
        form.exchange_rateB = "1";
        exchange_rateB = 1;
        return { ok: false, message: "Rate(B) cannot be zero!" };
    }

    const income = hasVal(form.income) ? toF(form.income) : NaN;
    const income_A = hasVal(form.income_A) ? toF(form.income_A) : NaN;
    const income_B = hasVal(form.income_B) ? toF(form.income_B) : NaN;
    let subtotal = hasVal(form.subtotal) ? toF(form.subtotal) : NaN;
    let subtotal_A = hasVal(form.subtotal_A) ? toF(form.subtotal_A) : NaN;
    let subtotal_B = hasVal(form.subtotal_B) ? toF(form.subtotal_B) : NaN;

    if (exchange_rateA !== 0 && Number.isFinite(income_A) && income_A !== 0) {
        subtotal_A = round5(exchange_rateA * income_A);
        form.subtotal_A = String(subtotal_A);
    } else if (exchange_rateA !== 0 && Number.isFinite(subtotal_A) && subtotal_A !== 0) {
        const inc = Math.ceil((subtotal_A / exchange_rateA) * 10) / 10;
        form.income_A = String(inc);
    } else if (Number.isFinite(income_A) && income_A !== 0 && Number.isFinite(subtotal_A) && subtotal_A !== 0) {
        form.exchange_rateA = String(round5(subtotal_A / income_A));
    }

    if (exchange_rateB !== 0 && Number.isFinite(income_B) && income_B !== 0) {
        subtotal_B = round5(income_B / exchange_rateB);
        form.subtotal_B = String(subtotal_B);
    } else if (exchange_rateB !== 0 && Number.isFinite(subtotal_B) && subtotal_B !== 0) {
        form.income_B = String(round5(subtotal_B * exchange_rateB));
    } else if (Number.isFinite(income_B) && income_B !== 0 && Number.isFinite(subtotal_B) && subtotal_B !== 0) {
        form.exchange_rateB = String(round5(income_B / subtotal_B));
    }

    exchange_rate = toF(form.exchange_rate);
    exchange_rateA = toF(form.exchange_rateA);
    exchange_rateB = toF(form.exchange_rateB);
    subtotal_A = toF(form.subtotal_A);
    subtotal_B = toF(form.subtotal_B);
    subtotal = toF(form.subtotal);

    const pay = form.pay;
    if (pay === 4) {
        const af = toF(form.anotherfee);
        const afA = toF(form.anotherfee_A);
        const afB = toF(form.anotherfee_B);
        if (
            (!Number.isFinite(af) || af === 0) &&
            (!Number.isFinite(afA) || afA === 0) &&
            (!Number.isFinite(afB) || afB === 0)
        ) {
            return { ok: false, message: "Please input Other Fee or Service Charges!" };
        }
    }

    const anotherfee = hasVal(form.anotherfee) ? toF(form.anotherfee) : NaN;
    const anotherfee_A = hasVal(form.anotherfee_A) ? toF(form.anotherfee_A) : NaN;
    const anotherfee_B = hasVal(form.anotherfee_B) ? toF(form.anotherfee_B) : NaN;

    if (Number.isFinite(income) && hasVal(form.income) && hasVal(form.anotherfee)) {
        form.deduction = String(income + anotherfee);
    }
    if (Number.isFinite(income_A) && hasVal(form.income_A) && hasVal(form.anotherfee_A)) {
        form.deduction_A = String(income_A + anotherfee_A);
    }
    if (Number.isFinite(income_B) && hasVal(form.income_B) && hasVal(form.anotherfee_B)) {
        form.deduction_B = String(income_B + anotherfee_B);
    }

    const rule_C = form.rule_C;
    if (rule_C === 1 && Number.isFinite(income) && hasVal(form.income)) {
        subtotal = exchange_rate * income;
        form.subtotal = String(subtotal);
    } else if (rule_C === 2 && Number.isFinite(income) && hasVal(form.income)) {
        subtotal = round5(income / exchange_rate);
        form.subtotal = String(subtotal);
    }

    subtotal = toF(form.subtotal);
    subtotal_A = toF(form.subtotal_A);
    subtotal_B = toF(form.subtotal_B);
    const takeoff = hasVal(form.takeoff) ? toF(form.takeoff) : NaN;

    if (
        hasVal(form.subtotal) &&
        hasVal(form.subtotal_A) &&
        hasVal(form.subtotal_B)
    ) {
        form.Subtotal_ABC = String(round5(subtotal + subtotal_A + subtotal_B));
    }

    if (
        hasVal(form.subtotal) &&
        hasVal(form.subtotal_A) &&
        hasVal(form.subtotal_B) &&
        hasVal(form.takeoff)
    ) {
        const sum = subtotal + subtotal_A + subtotal_B - takeoff;
        if (form.auto_deduction) {
            form.total2 = String(Math.floor(sum / 100) * 100);
        } else {
            form.total2 = String(round5(sum));
        }
    }

    const paycash = hasVal(form.paycash) ? toF(form.paycash) : NaN;
    const deduction = hasVal(form.deduction) ? toF(form.deduction) : NaN;
    if (hasVal(form.paycash) && hasVal(form.deduction) && Number.isFinite(paycash) && Number.isFinite(deduction)) {
        form.change_C = String(Math.round((paycash - deduction) * 100) / 100);
    }

    return { ok: true };
}

/**
 * 組成後端 purchase/add、purchase/update 所需 body（不含 route，由呼叫端併入）
 */
export function purchaseFormToApiPayload(
    form: PurchaseForm,
    extras: {
        financeNoType: 0 | 1;
        financeID?: number;
        sql_year?: number | null;
    }
): Record<string, unknown> {
    const out: Record<string, unknown> = {
        financeNoType: extras.financeNoType
    };
    if (extras.financeID != null) {
        out.financeID = extras.financeID;
    }
    if (extras.sql_year != null && extras.sql_year !== undefined) {
        out.sql_year = extras.sql_year;
    }

    const f = form as unknown as Record<string, unknown>;
    for (const key of PURCHASE_MODEL_FIELDS) {
        if (key === "owner" || key === "posttime" || key === "receiver_country") {
            continue;
        }
        const v = f[key];
        if (key === "total2_currency" || key === "typeSel" || key === "typeSel_A" || key === "typeSel_B") {
            out[key] = v === undefined || v === "" ? 0 : Number(v);
        } else if (key === "pay") {
            out[key] = Number(v ?? 999);
        } else {
            out[key] = v ?? "";
        }
    }
    return out;
}

/** 將 API 單筆資料填入表單（含字串化） */
export function applyPurchaseRowToForm(
    form: PurchaseForm,
    row: Record<string, unknown>,
    route: PurchaseRoute
): void {
    const empty = createEmptyPurchaseForm(route);
    const str = (v: unknown) =>
        v === null || v === undefined ? "" : String(v).trim() === "" ? "" : String(v);

    Object.assign(form, empty);

    form.area = str(row.area);
    form.financeNo = str(row.financeNo);
    form.financeNoType = form.financeNo ? 1 : 0;
    form.sender_name = str(row.sender_name);
    form.receiver_name = str(row.receiver_name);
    form.pay = row.pay !== undefined && row.pay !== null && String(row.pay) !== "" ? Number(row.pay) : 999;
    form.note = str(row.note);

    form.typeSel = Number(row.typeSel ?? empty.typeSel);
    form.typeSel_A = Number(row.typeSel_A ?? empty.typeSel_A);
    form.typeSel_B = Number(row.typeSel_B ?? empty.typeSel_B);
    form.total2_currency = Number(row.total2_currency ?? empty.total2_currency);

    form.exchange_rate = str(row.exchange_rate) || "1";
    form.exchange_rateA = str(row.exchange_rateA) || "1";
    form.exchange_rateB = str(row.exchange_rateB) || "1";

    form.income = str(row.income);
    form.income_A = str(row.income_A);
    form.income_B = str(row.income_B);
    form.subtotal = str(row.subtotal);
    form.subtotal_A = str(row.subtotal_A);
    form.subtotal_B = str(row.subtotal_B);
    form.anotherfee = str(row.anotherfee);
    form.anotherfee_A = str(row.anotherfee_A);
    form.anotherfee_B = str(row.anotherfee_B);
    form.deduction = str(row.deduction);
    form.deduction_A = str(row.deduction_A);
    form.deduction_B = str(row.deduction_B);
    form.total2 = str(row.total2);
    form.takeoff = str(row.takeoff);

    form.paycash_A = str(row.paycash_A);
    form.paycash_B = str(row.paycash_B);
    form.paycash = str(row.paycash);
    form.change_A = str(row.change_A);
    form.change_B = str(row.change_B);
    form.change_C = str(row.change_C);

    form.quantity = str(row.quantity);
    form.total1 = str(row.total1);
    form.addition_pay1 = str(row.addition_pay1);
    form.addition_pay2 = str(row.addition_pay2);
    form.subtract_pay = str(row.subtract_pay);
    form.paycondition = str(row.paycondition);
    form.typeText = str(row.typeText);
    form.typeText_A = str(row.typeText_A);
    form.typeText_B = str(row.typeText_B);
    form.sender_tel = str(row.sender_tel);
    form.sender_addr = str(row.sender_addr);
    form.receiver_tel = str(row.receiver_tel);
    form.receiver_city = str(row.receiver_city);
    form.receiver_addr = str(row.receiver_addr);

    form.financeID = Number(row.financeID ?? 0) || undefined;

    form.rule_C = 1;
    form.auto_deduction = false;
    form.Subtotal_ABC = "";
}
