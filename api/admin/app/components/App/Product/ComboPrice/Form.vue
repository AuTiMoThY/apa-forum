<script setup lang="ts">
import type { ProductRegion } from "~/constants/product";
import type {
    ComboPriceItemRow,
    ComboPriceListItem
} from "~/composables/useAppProductComboPrice";

const props = defineProps<{
    mode: "add" | "edit";
    loading: boolean;
    region: ProductRegion;
    /** 編輯模式傳入主檔，新增可為 undefined */
    initialData?: Partial<ComboPriceListItem> | null;
}>();

const emit = defineEmits<{
    (
        e: "submit",
        payload: {
            type: number;
            name: string;
            amount: number;
            price: string;
            ordernum: number;
            listID?: number;
            uniqid?: string;
        }
    ): void;
    (e: "submit"): void;
}>();

const { public: runtimePublic } = useRuntimeConfig();
const apiBase = (runtimePublic.apiBase as string) || "";
const productPicBase = `${apiBase}/uploads/ktv/Album/`;

const { fetchItems, addItems, deleteItems } = useAppProductComboPrice();

// --- 表單主欄位 ---
const form = reactive({
    type: props.initialData?.type ?? 0,
    name: props.initialData?.name ?? "",
    amount: props.initialData?.amount ?? 0,
    price: props.initialData?.price ?? "",
    ordernum: props.initialData?.ordernum ?? 0
});

const listID = computed(() => props.initialData?.listID);

const typeOptions = [
    { value: 0, label: "POS" },
    { value: 1, label: "網購" }
];
const selectedTypeOption = computed({
    get: () => typeOptions.find((o) => o.value === form.type) ?? typeOptions[0],
    set: (v: (typeof typeOptions)[number] | undefined) => {
        if (v) form.type = v.value;
    }
});

// --- 新增模式：使用 uniqid 寫入 temp 表 ---
const uniqid = ref<string | null>(
    props.mode === "add"
        ? Math.random().toString(36).slice(2) + Date.now().toString(36)
        : null
);

// --- 組合內商品 ---
const items = ref<ComboPriceItemRow[]>([]);
const itemsLoading = ref(false);
const selectedItemIds = ref<number[]>([]);

const loadItems = async () => {
    itemsLoading.value = true;
    try {
        if (props.mode === "edit" && listID.value) {
            items.value = await fetchItems(props.region, {
                listID: listID.value
            });
        } else if (props.mode === "add" && uniqid.value) {
            items.value = await fetchItems(props.region, {
                uniqid: uniqid.value
            });
        } else {
            items.value = [];
        }
    } finally {
        itemsLoading.value = false;
    }
};

watch(
    () => props.region,
    () => {
        loadItems();
    }
);

onMounted(() => {
    loadItems();
});

const productPicUrl = (row: ComboPriceItemRow) => {
    const folder = row.folderName ? `${row.folderName}/` : "";
    const series = row.productseries
        ? `${String(row.productseries).trim()}/`
        : "";
    const file = row.product_s_gif || "";
    return productPicBase + folder + series + file;
};

// --- 商品選擇 Modal ---
const pickerOpen = ref(false);
const excludeProductIds = computed(() => items.value.map((i) => i.productID));

const onPickerConfirm = async (productIDs: number[]) => {
    const ok = await addItems(props.region, {
        listID: props.mode === "edit" ? listID.value : undefined,
        uniqid: props.mode === "add" ? uniqid.value ?? undefined : undefined,
        productIDs
    });
    if (ok) {
        await loadItems();
    }
};

const removeSelectedItems = async () => {
    if (selectedItemIds.value.length === 0) return;
    const ok = await deleteItems(props.region, {
        listID: props.mode === "edit" ? listID.value : undefined,
        uniqid: props.mode === "add" ? uniqid.value ?? undefined : undefined,
        itemIDs: selectedItemIds.value
    });
    if (ok) {
        selectedItemIds.value = [];
        await loadItems();
    }
};

// --- 驗證與送出（對齊 firestar Products 表單：errors 為 string | false，clearError 於 input 時清除）---
const errors = reactive<Record<string, string | false>>({
    name: false,
    ordernum: false
});

const clearError = (field: string) => {
    errors[field] = false;
};

const validate = (): boolean => {
    errors.name = false;
    errors.ordernum = false;
    if (!form.name.trim()) {
        errors.name = "請輸入組合名稱";
        return false;
    }
    if (String(form.ordernum).trim() === "" && form.ordernum !== 0) {
        errors.ordernum = "請輸入排序";
        return false;
    }
    return true;
};

const submit = () => {
    if (!validate()) return;
    const payloadBase = {
        type: form.type,
        name: form.name.trim(),
        amount: Number(form.amount) || 0,
        price: String(form.price ?? "").trim(),
        ordernum: Number(form.ordernum) || 0
    };
    if (props.mode === "add") {
        emit("submit", {
            ...payloadBase,
            uniqid: uniqid.value ?? undefined
        });
    } else {
        if (!listID.value) return;
        emit("submit", {
            ...payloadBase,
            listID: listID.value
        });
    }
};

defineExpose({
    submit
});
</script>

<template>
    <!-- 外層 loading 由父頁面傳入（含初始載入與送出） -->
    <div
        v-if="props.loading"
        class="flex flex-col items-center justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
        <p class="text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
    <UForm v-else class="space-y-4 w-full">
        <section class="frm-bd flex gap-4 w-full">
            <div class="frm-bd-aside flex-[40%] order-2 flex flex-col gap-4">
                <UCard
                    :ui="{
                        body: 'flex flex-col gap-4'
                    }">
                    <FormSortField
                        :value="form.ordernum"
                        @update:value="(val: number) => (form.ordernum = val)" />
                </UCard>
            </div>
            <div class="frm-bd-main flex flex-col gap-4 flex-[60%] order-1">
                <UFormField label="類型" required>
                    <USelectMenu
                        v-model="selectedTypeOption"
                        :items="typeOptions"
                        value-attribute="value"
                        option-attribute="label"
                        class="w-48" />
                </UFormField>
                <UFormField label="組合名稱" required :error="errors.name">
                    <UInput
                        v-model="form.name"
                        placeholder="組合名稱"
                        class="max-w-md"
                        @input="clearError('name')" />
                </UFormField>
                <UFormField label="價格設定">
                    <div class="flex items-center gap-2">
                        <span>任選</span>
                        <UInput
                            v-model.number="form.amount"
                            type="number"
                            min="0"
                            class="w-24" />
                        <span>個</span>
                        <UInput
                            v-model="form.price"
                            placeholder="價格"
                            class="w-28" />
                        <span>元</span>
                    </div>
                </UFormField>
            </div>
        </section>
        <section class="frm-bd flex flex-col gap-4 w-full">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-base font-medium">組合內商品</h3>
                <div class="flex gap-2">
                    <UButton
                        label="加入商品"
                        size="sm"
                        icon="i-lucide-plus"
                        @click="pickerOpen = true" />
                    <UButton
                        label="刪除所選"
                        size="sm"
                        color="error"
                        variant="outline"
                        :disabled="selectedItemIds.length === 0"
                        @click="removeSelectedItems" />
                </div>
            </div>
            <div class="border rounded overflow-auto max-h-80">
                <table class="w-full text-sm">
                    <thead class="bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th class="p-2 w-10">
                                <input
                                    type="checkbox"
                                    :checked="
                                        items.length > 0 &&
                                        selectedItemIds.length === items.length
                                    "
                                    @change="
                                        ($event.target as HTMLInputElement)
                                            .checked
                                            ? (selectedItemIds = items.map(
                                                  (i) => i.itemID
                                              ))
                                            : (selectedItemIds = [])
                                    " />
                            </th>
                            <th class="p-2 text-left">產品編號</th>
                            <th class="p-2 text-left">產品名稱</th>
                            <th class="p-2 w-20">小圖</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="row in items"
                            :key="row.itemID"
                            class="border-t">
                            <td class="p-2">
                                <input
                                    type="checkbox"
                                    :checked="
                                        selectedItemIds.includes(row.itemID)
                                    "
                                    @change="
                                        ($event.target as HTMLInputElement)
                                            .checked
                                            ? selectedItemIds.push(row.itemID)
                                            : (selectedItemIds =
                                                  selectedItemIds.filter(
                                                      (id) => id !== row.itemID
                                                  ))
                                    " />
                            </td>
                            <td class="p-2">{{ row.wholeseries }}</td>
                            <td class="p-2">{{ row.productname }}</td>
                            <td class="p-2">
                                <img
                                    v-if="row.product_s_gif"
                                    :src="productPicUrl(row)"
                                    alt=""
                                    class="w-12 h-12 object-cover rounded" />
                                <span v-else class="text-gray-400">—</span>
                            </td>
                        </tr>
                        <tr v-if="items.length === 0 && !itemsLoading">
                            <td
                                colspan="4"
                                class="p-4 text-center text-gray-500">
                                尚未加入商品，請點「加入商品」選擇
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p v-if="itemsLoading" class="text-sm text-gray-500 mt-1">
                載入中…
            </p>
        </section>
        <section class="frm-ft">
            <UButton
                label="取消 Cancel"
                color="neutral"
                variant="ghost"
                :to="{
                    path: '/product/product',
                    query: { region: props.region }
                }" />
            <UButton
                :label="props.mode === 'add' ? '確定新增 Add' : '確定儲存 Submit'"
                color="primary"
                :loading="props.loading"
                @click="emit('submit')" />
        </section>
    </UForm>

    <!-- 商品選擇彈窗放在表單元件內 -->
    <AppProductComboPriceProductPickerModal
        v-model:open="pickerOpen"
        :region="props.region"
        :exclude-product-ids="excludeProductIds"
        @confirm="onPickerConfirm" />
</template>
