<script setup lang="ts">
import type { PurchaseForm, PurchaseFormErrors } from "~/types/PurchaseForm";
import type { PurchaseRoute } from "~/composables/useAppPurchase";
import {
    PURCHASE_CURRENCIES,
    PURCHASE_PAY_OPTIONS,
    PURCHASE_ROUTE_LABELS
} from "~/composables/useAppPurchase";
import { runPurchaseCalculate } from "~/composables/usePurchaseFormCalc";

const props = withDefaults(
    defineProps<{
        form: PurchaseForm;
        errors: PurchaseFormErrors;
        loading: boolean;
        purchaseRoute: PurchaseRoute;
        mode: "add" | "edit";
        validate: () => boolean;
        /** 編輯：顯示資料庫 posttime 日期 */
        posttimeLabel?: string;
    }>(),
    { posttimeLabel: "" }
);

const emit = defineEmits<{
    (e: "submit"): void;
}>();

const toast = useToast();
const calculatedOk = ref(false);

const routeTitle = computed(() => PURCHASE_ROUTE_LABELS[props.purchaseRoute]);

const todayLabel = computed(() => new Date().toISOString().slice(0, 10));

const dateDisplay = computed(() =>
    props.mode === "edit" && props.posttimeLabel
        ? props.posttimeLabel.slice(0, 10)
        : todayLabel.value
);

const paySelectModel = computed({
    get: () =>
        PURCHASE_PAY_OPTIONS.find((o) => o.value === props.form.pay) ??
        PURCHASE_PAY_OPTIONS[0],
    set: (v: { value: number; label: string } | undefined) => {
        if (v) props.form.pay = v.value;
    }
});

const currencyItems = computed(() =>
    PURCHASE_CURRENCIES.map((label, value) => ({ value, label }))
);

const typeSelModel = computed({
    get: () =>
        currencyItems.value.find((o) => o.value === props.form.typeSel) ??
        currencyItems.value[0],
    set: (v: { value: number; label: string } | undefined) => {
        if (v) props.form.typeSel = v.value;
    }
});
const typeSelAModel = computed({
    get: () =>
        currencyItems.value.find((o) => o.value === props.form.typeSel_A) ??
        currencyItems.value[0],
    set: (v: { value: number; label: string } | undefined) => {
        if (v) props.form.typeSel_A = v.value;
    }
});
const typeSelBModel = computed({
    get: () =>
        currencyItems.value.find((o) => o.value === props.form.typeSel_B) ??
        currencyItems.value[0],
    set: (v: { value: number; label: string } | undefined) => {
        if (v) props.form.typeSel_B = v.value;
    }
});

const total2CurrencyModel = computed({
    get: () =>
        currencyItems.value.find((o) => o.value === props.form.total2_currency) ??
        currencyItems.value[0],
    set: (v: { value: number; label: string } | undefined) => {
        if (v) props.form.total2_currency = v.value;
    }
});

const ruleCItems = [
    { value: 0, label: "無公式 (0)" },
    { value: 1, label: "RULE A：Subtotal = Rate × Income" },
    { value: 2, label: "RULE B：Subtotal = Income ÷ Rate" }
];

const ruleCModel = computed({
    get: () =>
        ruleCItems.find((o) => o.value === props.form.rule_C) ?? ruleCItems[1],
    set: (v: { value: number; label: string } | undefined) => {
        if (v) props.form.rule_C = v.value as 0 | 1 | 2;
    }
});

const financeNoTypeItems = [
    { value: 0, label: "System Auto Create" },
    { value: 1, label: "Key in 手動單號" }
];

const financeNoTypeModel = computed({
    get: () =>
        financeNoTypeItems.find((o) => o.value === props.form.financeNoType) ??
        financeNoTypeItems[0],
    set: (v: { value: number; label: string } | undefined) => {
        if (v) props.form.financeNoType = v.value as 0 | 1;
    }
});

function resetCalculated() {
    calculatedOk.value = false;
}

function doCalculate() {
    const res = runPurchaseCalculate(props.form);
    if (!res.ok) {
        toast.add({ title: res.message, color: "warning" });
        calculatedOk.value = false;
        return;
    }
    calculatedOk.value = true;
    toast.add({ title: "已計算 Calculate OK", color: "success" });
}

function trySubmit() {
    if (!props.validate()) return;
    if (!calculatedOk.value) {
        toast.add({
            title: "請先按 Calculate 再送出（Please click Calculate before submit）",
            color: "warning"
        });
        return;
    }
    emit("submit");
}

function setCalculatedOk(v: boolean) {
    calculatedOk.value = v;
}

defineExpose({ trySubmit, setCalculatedOk });

const total2ColorClass = computed(() => {
    const t = parseFloat(String(props.form.total2 ?? ""));
    if (Number.isNaN(t)) return "text-highlighted";
    if (t < -99999999) return "text-yellow-400";
    if (t < 0) return "text-green-400";
    if (t < 100000) return "text-blue-500";
    if (t >= 1000000 && t < 10000000) return "text-red-500";
    if (t >= 100000000) return "text-purple-600";
    if (t >= 10000000 && t < 100000000) return "text-orange-500";
    return "text-highlighted";
});
</script>

<template>
    <div class="space-y-6">
        <div class="text-sm text-muted">
            路線：<span class="font-medium text-primary">{{ routeTitle }}</span>
            ｜ Date：<span class="font-mono">{{ dateDisplay }}</span>
        </div>

        <UCard>
            <template #header>
                <span class="text-sm font-medium">基本資料 Basic</span>
            </template>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <UFormField label="單號類型 Vochor No. Type">
                    <USelectMenu
                        v-model="financeNoTypeModel"
                        :items="financeNoTypeItems"
                        value-attribute="value"
                        option-attribute="label"
                        class="w-full"
                        @update:model-value="resetCalculated"
                    />
                </UFormField>
                <UFormField
                    label="單據號 Vochor No."
                    :hint="form.financeNoType === 0 ? '留空則由系統依當日序號產生' : '手動輸入單號'"
                >
                    <UInput
                        v-model="form.financeNo"
                        :disabled="form.financeNoType === 0"
                        class="w-full"
                        @update:model-value="resetCalculated"
                    />
                </UFormField>
                <UFormField label="區域 Area" required :error="errors.area || undefined">
                    <UInput v-model="form.area" class="w-full" @update:model-value="resetCalculated" />
                </UFormField>
                <UFormField label="訂貨人 From" required :error="errors.sender_name || undefined">
                    <UInput v-model="form.sender_name" class="w-full" @update:model-value="resetCalculated" />
                </UFormField>
                <UFormField label="代購人 To">
                    <UInput v-model="form.receiver_name" class="w-full" @update:model-value="resetCalculated" />
                </UFormField>
                <UFormField label="付款／交付 Pay" required :error="errors.pay || undefined">
                    <USelectMenu
                        v-model="paySelectModel"
                        :items="PURCHASE_PAY_OPTIONS"
                        value-attribute="value"
                        option-attribute="label"
                        class="w-full min-w-[240px]"
                        @update:model-value="resetCalculated"
                    />
                </UFormField>
                <UFormField label="備註 Note" class="sm:col-span-2">
                    <UTextarea v-model="form.note" :rows="3" class="w-full" @update:model-value="resetCalculated" />
                </UFormField>
            </div>
        </UCard>

        <UCard>
            <template #header>
                <span class="text-sm font-medium">RULE (A) / (B) / (C)</span>
            </template>
            <div class="grid gap-6 lg:grid-cols-3">
                <div class="space-y-3 rounded-lg border border-default p-3">
                    <div class="text-xs font-semibold text-muted">RULE (A)</div>
                    <UFormField label="幣別 TYPE (A)">
                        <USelectMenu
                            v-model="typeSelAModel"
                            :items="currencyItems"
                            value-attribute="value"
                            option-attribute="label"
                            class="w-full"
                            @update:model-value="resetCalculated"
                        />
                    </UFormField>
                    <UFormField label="Rate (A)">
                        <UInput v-model="form.exchange_rateA" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="In (A)">
                        <UInput v-model="form.income_A" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="Subt.(A) KYAT">
                        <UInput v-model="form.subtotal_A" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="Otr.Fe (A)">
                        <UInput v-model="form.anotherfee_A" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="IncomeTotal (A)">
                        <UInput v-model="form.deduction_A" readonly class="w-full" />
                    </UFormField>
                </div>
                <div class="space-y-3 rounded-lg border border-default p-3">
                    <div class="text-xs font-semibold text-muted">RULE (B)</div>
                    <UFormField label="幣別 TYPE (B)">
                        <USelectMenu
                            v-model="typeSelBModel"
                            :items="currencyItems"
                            value-attribute="value"
                            option-attribute="label"
                            class="w-full"
                            @update:model-value="resetCalculated"
                        />
                    </UFormField>
                    <UFormField label="Rate (B)">
                        <UInput v-model="form.exchange_rateB" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="In (B)">
                        <UInput v-model="form.income_B" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="Subt.(B) KYAT">
                        <UInput v-model="form.subtotal_B" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="OtherFee (B)">
                        <UInput v-model="form.anotherfee_B" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="IncomeTotal (B)">
                        <UInput v-model="form.deduction_B" readonly class="w-full" />
                    </UFormField>
                </div>
                <div class="space-y-3 rounded-lg border border-default p-3">
                    <div class="text-xs font-semibold text-muted">RULE (C)</div>
                    <UFormField label="RULE (C) 公式">
                        <USelectMenu
                            v-model="ruleCModel"
                            :items="ruleCItems"
                            value-attribute="value"
                            option-attribute="label"
                            class="w-full"
                            @update:model-value="resetCalculated"
                        />
                    </UFormField>
                    <UFormField label="幣別 TYPE (C)">
                        <USelectMenu
                            v-model="typeSelModel"
                            :items="currencyItems"
                            value-attribute="value"
                            option-attribute="label"
                            class="w-full"
                            @update:model-value="resetCalculated"
                        />
                    </UFormField>
                    <UFormField label="Rate (C)">
                        <UInput v-model="form.exchange_rate" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="Income (C)">
                        <UInput v-model="form.income" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="Subtotal (C)">
                        <UInput v-model="form.subtotal" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="SERVICE CHARGES (C)">
                        <UInput v-model="form.anotherfee" class="w-full" @update:model-value="resetCalculated" />
                    </UFormField>
                    <UFormField label="IncomeTotal (C)">
                        <UInput v-model="form.deduction" readonly class="w-full" />
                    </UFormField>
                </div>
            </div>
        </UCard>

        <UCard>
            <template #header>
                <span class="text-sm font-medium">合計 Total</span>
            </template>
            <div class="flex flex-wrap items-end gap-4">
                <UFormField label="Subtotal (A+B+C)">
                    <UInput v-model="form.Subtotal_ABC" readonly class="min-w-[160px]" />
                </UFormField>
                <UFormField label="Takeoff (minus)">
                    <UInput v-model="form.takeoff" class="min-w-[120px]" @update:model-value="resetCalculated" />
                </UFormField>
                <UFormField label="TOTAL 幣別">
                    <USelectMenu
                        v-model="total2CurrencyModel"
                        :items="currencyItems"
                        value-attribute="value"
                        option-attribute="label"
                        class="min-w-[120px]"
                        @update:model-value="resetCalculated"
                    />
                </UFormField>
                <UFormField label="TOTAL 金額">
                    <UInput
                        v-model="form.total2"
                        readonly
                        size="xl"
                        class="min-w-[200px] font-mono text-xl"
                        :class="total2ColorClass"
                    />
                </UFormField>
                <div class="flex items-center gap-2 pb-1">
                    <UCheckbox v-model="form.auto_deduction" @update:model-value="resetCalculated" />
                    <span class="text-sm">AUTO DEDUCTION（百位捨去）</span>
                </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
                <UButton color="primary" label="Calculate 計算" icon="i-lucide-calculator" @click="doCalculate" />
            </div>
        </UCard>
    </div>
</template>
