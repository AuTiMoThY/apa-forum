<script setup lang="ts">
import type { ProductForm, ProductFormErrors } from "~/types/ProductForm";
import type { ProductRegion } from "~/constants/product";
import ImageUploadSingle from "~/components/Form/ImageUploadSingle.vue";

const { public: runtimePublic } = useRuntimeConfig();
const apiBase = (runtimePublic.apiBase as string) ?? "";

const props = withDefaults(
    defineProps<{
        form: ProductForm;
        errors: ProductFormErrors;
        loading: boolean;
        region: ProductRegion;
        categoryOptions: { label: string; value: number }[];
        selectedCategory?: { label: string; value: number } | undefined;
        mode: "add" | "edit";
        validate: () => boolean;
        /** 編輯模式：上一筆產品 ID（用於 Previous / Save & go to previous） */
        prevId?: number | null;
        /** 編輯模式：下一筆產品 ID（用於 Next / Save & go to next） */
        nextId?: number | null;
        /** 同步新產品頁使用：隱藏單一產品類別欄位（改由頁面提供三地分類） */
        hideCategory?: boolean;
        /** 同步新產品頁使用：隱藏產品編號欄位（改由頁面提供編號+編號產生方式） */
        hideProductSeries?: boolean;
    }>(),
    { hideCategory: false, hideProductSeries: false }
);

const emit = defineEmits<{
    (
        e: "update:selectedCategory",
        value: { label: string; value: number } | null | undefined
    ): void;
    (e: "submit"): void;
    (e: "submit_previous"): void;
    (e: "submit_next"): void;
    (e: "submit_save_as_new"): void;
}>();

const selectedCategory = computed({
    get: () => props.selectedCategory,
    set: (v: { label: string; value: number } | undefined) =>
        emit("update:selectedCategory", v)
});

const product_s_gif_upload_ref = ref<InstanceType<
    typeof ImageUploadSingle
> | null>(null);
const product_s_1_gif_upload_ref = ref<InstanceType<
    typeof ImageUploadSingle
> | null>(null);
const product_s_2_gif_upload_ref = ref<InstanceType<
    typeof ImageUploadSingle
> | null>(null);

const product_s_gif = computed({
    get: () => props.form.product_s_gif ?? "",
    set: (v: string) => {
        (props.form as Record<string, unknown>).product_s_gif = v || undefined;
    }
});

const product_s_1_gif = computed({
    get: () => props.form.product_s_1_gif ?? "",
    set: (v: string) => {
        (props.form as Record<string, unknown>).product_s_1_gif =
            v || undefined;
    }
});

const product_s_2_gif = computed({
    get: () => props.form.product_s_2_gif ?? "",
    set: (v: string) => {
        (props.form as Record<string, unknown>).product_s_2_gif =
            v || undefined;
    }
});

const productsPreviewBase = `${apiBase}/uploads/ktv/Album/`;
const productsLegacyPreviewBase = `${apiBase}/uploads/products/`;
const productsUploadEndpoint = (
    region: string,
    classId: number | undefined,
    productseries: string | undefined
) => {
    const params = new URLSearchParams();
    params.set("region", region);
    if (classId != null && !Number.isNaN(classId)) {
        params.set("class_id", String(classId));
    }
    if (productseries) {
        params.set("productseries", productseries);
    }
    return `${apiBase}/upload/product?${params.toString()}`;
};

const bonuspriceA_SelItems = [
    { value: "0", label: "KEEP ORIGINAL" },
    { value: "1", label: "AUTO ROUND UP" },
    { value: "2", label: "AUTO ROUND DOWN" }
];

/** Color / Size / Qty 上下架用：Off=0, On=1 */
const onOffRadioItems = [
    { label: "下架 Offline", value: 0 },
    { label: "上架 Online", value: 1 }
];

/** 網路市價計算：Rule A 市價*百分比（ROUND UP/DOWN/KEEP）, Rule B 市價+固定, No rule 直接輸入 */
function calculateBonusprice() {
    const form = props.form as Record<string, unknown>;
    const marketprice = Number(form.marketprice) || 0;
    const sel = String(form.bonuspriceSel ?? "1");
    if (sel === "1") {
        const percent = Number(form.bonuspriceA_percent) || 100;
        const raw = (marketprice * percent) / 100;
        const aSel = String(form.bonuspriceA_Sel ?? "1");
        if (aSel === "0") form.bonusprice = String(raw);
        else if (aSel === "2") form.bonusprice = String(Math.floor(raw));
        else form.bonusprice = String(Math.ceil(raw));
    } else if (sel === "2") {
        const plus = Number(form.bonuspriceB_Plus) || 0;
        form.bonusprice = String(marketprice + plus);
    } else {
        form.bonusprice = String(form.bonuspriceC ?? "");
    }
}

const uploadProduct_s_gif = async () => {
    const el = product_s_gif_upload_ref.value as any;
    console.log("[ProductForm] uploadProduct_s_gif start", {
        currentValue: product_s_gif.value
    });
    if (el?.upload && typeof el.upload === "function") {
        const ok = await el.upload();
        console.log("[ProductForm] uploadProduct_s_gif result", {
            ok,
            finalValue: product_s_gif.value
        });
        if (ok === false) return false;
    } else {
        console.log("[ProductForm] uploadProduct_s_gif skipped - no upload method");
    }
    return true;
};

/** 送出前呼叫：上傳三張產品圖（若有待上傳檔案） */
async function uploadAllProductImages(): Promise<boolean> {
    for (const ref of [
        product_s_gif_upload_ref,
        product_s_1_gif_upload_ref,
        product_s_2_gif_upload_ref
    ]) {
        const el = ref.value as any;
        if (el?.upload && typeof el.upload === "function") {
            console.log("[ProductForm] uploadAllProductImages - call upload", {
                refName: ref === product_s_gif_upload_ref
                    ? "product_s_gif"
                    : ref === product_s_1_gif_upload_ref
                    ? "product_s_1_gif"
                    : "product_s_2_gif"
            });
            const ok = await el.upload();
            console.log("[ProductForm] uploadAllProductImages - upload result", {
                ok,
                refName: ref === product_s_gif_upload_ref
                    ? "product_s_gif"
                    : ref === product_s_1_gif_upload_ref
                    ? "product_s_1_gif"
                    : "product_s_2_gif"
            });
            if (ok === false) {
                console.log("[ProductForm] uploadAllProductImages - stop due to failure");
                return false;
            }
        } else {
            console.log("[ProductForm] uploadAllProductImages - skipped, no upload method", {
                refName: ref === product_s_gif_upload_ref
                    ? "product_s_gif"
                    : ref === product_s_1_gif_upload_ref
                    ? "product_s_1_gif"
                    : "product_s_2_gif"
            });
        }
    }
    console.log("[ProductForm] uploadAllProductImages - all done");
    return true;
}

defineExpose({
    uploadAllProductImages,
    uploadProduct_s_gif
});
</script>

<template>
    <!-- 載入中狀態 -->
    <div
        v-if="props.loading"
        class="flex flex-col items-center justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
        <p class="text-gray-500 dark:text-gray-400">Loading...</p>
    </div>

    <UForm v-else :state="props.form" class="space-y-4 w-full">
        <section class="frm-bd flex gap-4 w-full">
            <div class="frm-bd-aside flex-[40%] order-2 flex flex-col gap-4">
                <UCard
                    :ui="{
                        body: 'flex flex-col gap-4'
                    }">
                    <FormOnlineStatus
                        :value="props.form.chkdel"
                        @update:value="(val: number) => (props.form.chkdel = val)" />
                    <FormPOSStatus
                        :value="props.form.onTop"
                        @update:value="(val: number) => (props.form.onTop = val)" />
                    <FormSortField
                        :value="props.form.productordernum"
                        @update:value="(val: number) => (props.form.productordernum = val)" />
                </UCard>
                <UCard
                    :ui="{
                        body: 'flex flex-col gap-4'
                    }">
                    <UFormField :label="`產品市價\nPrice`" name="marketprice">
                        <UInput
                            v-model.number="props.form.marketprice"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0" />
                    </UFormField>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <UFormField label="LEVEL 1" name="level1">
                            <UInput
                                v-model="props.form.level1"
                                type="text"
                                placeholder="選填" />
                        </UFormField>
                        <UFormField label="LEVEL 2" name="level2">
                            <UInput
                                v-model="props.form.level2"
                                type="text"
                                placeholder="選填" />
                        </UFormField>
                        <UFormField label="LEVEL 3" name="level3">
                            <UInput
                                v-model="props.form.level3"
                                type="text"
                                placeholder="選填" />
                        </UFormField>
                        <UFormField label="LEVEL 4" name="level4">
                            <UInput
                                v-model="props.form.level4"
                                type="text"
                                placeholder="選填" />
                        </UFormField>
                        <UFormField label="LEVEL 5" name="level5">
                            <UInput
                                v-model="props.form.level5"
                                type="text"
                                placeholder="選填" />
                        </UFormField>
                    </div>
                    <!-- 網路市價 Web Price -->
                    <UFormField
                        :label="`網路市價\nWeb Price`"
                        name="webprice_block">
                        <div class="webprice_block_wrap">
                            <div class="webprice_block_item">
                                <div class="webprice_block_item-hd">
                                    <label class="webprice_block_item-label">
                                        <input
                                            type="radio"
                                            name="bonuspriceSel"
                                            value="1"
                                            :checked="
                                                String(
                                                    props.form.bonuspriceSel ??
                                                        '1'
                                                ) === '1'
                                            "
                                            class="h-4 w-4 shrink-0 cursor-pointer rounded-full border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-0 dark:border-gray-600 dark:focus:ring-primary/50"
                                            @change="(e: Event) => (props.form as Record<string, unknown>).bonuspriceSel = (e.target as HTMLInputElement).value" />
                                        <span
                                            class="webprice_block_item-label-txt">
                                            Rule (A)
                                        </span>
                                    </label>
                                </div>
                                <div class="webprice_block_item-bd">
                                    <div class="flex flex-col gap-2">
                                        <span class="webprice_block_item-field">
                                            網路市價 = 產品市價 ×
                                            <UInput
                                                :model-value="String((props.form as Record<string, unknown>).bonuspriceA_percent ?? '')"
                                                type="number"
                                                min="0"
                                                step="1"
                                                class="inline-block w-16"
                                                placeholder="100"
                                                @update:model-value="(v: unknown) => (props.form as Record<string, unknown>).bonuspriceA_percent = v != null ? String(v) : ''" />
                                            %
                                        </span>
                                        <USelectMenu
                                            :model-value="bonuspriceA_SelItems.find(i => i.value === String((props.form as Record<string, unknown>).bonuspriceA_Sel ?? '1'))"
                                            :items="bonuspriceA_SelItems"
                                            value-attribute="value"
                                            option-attribute="label"
                                            class="inline-block w-40"
                                            @update:model-value="(v: { value: string; label: string } | null) => (props.form as Record<string, unknown>).bonuspriceA_Sel = v?.value ?? '1'" />
                                    </div>
                                </div>
                            </div>
                            <div class="webprice_block_item">
                                <div class="webprice_block_item-hd">
                                    <label class="webprice_block_item-label">
                                        <input
                                            type="radio"
                                            name="bonuspriceSel"
                                            value="2"
                                            :checked="
                                                String(
                                                    props.form.bonuspriceSel ??
                                                        '1'
                                                ) === '2'
                                            "
                                            class="h-4 w-4 shrink-0 cursor-pointer rounded-full border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-0 dark:border-gray-600 dark:focus:ring-primary/50"
                                            @change="(e: Event) => (props.form as Record<string, unknown>).bonuspriceSel = (e.target as HTMLInputElement).value" />
                                        <span
                                            class="webprice_block_item-label-txt">
                                            Rule (B)
                                        </span>
                                    </label>
                                </div>
                                <div class="webprice_block_item-bd">
                                    <span class="webprice_block_item-field">
                                        網路市價 = 產品市價 +
                                        <UInput
                                            :model-value="String((props.form as Record<string, unknown>).bonuspriceB_Plus ?? '')"
                                            type="number"
                                            step="0.01"
                                            class="inline-block w-24"
                                            placeholder="0"
                                            @update:model-value="(v: unknown) => (props.form as Record<string, unknown>).bonuspriceB_Plus = v" />
                                        元
                                    </span>
                                </div>
                            </div>
                            <div class="webprice_block_item">
                                <div class="webprice_block_item-hd">
                                    <label class="webprice_block_item-label">
                                        <input
                                            type="radio"
                                            name="bonuspriceSel"
                                            value="0"
                                            :checked="
                                                String(
                                                    props.form.bonuspriceSel ??
                                                        '1'
                                                ) === '0'
                                            "
                                            class="h-4 w-4 shrink-0 cursor-pointer rounded-full border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-0 dark:border-gray-600 dark:focus:ring-primary/50"
                                            @change="(e: Event) => (props.form as Record<string, unknown>).bonuspriceSel = (e.target as HTMLInputElement).value" />
                                        <span
                                            class="webprice_block_item-label-txt">
                                            No rule
                                        </span>
                                    </label>
                                </div>
                                <div class="webprice_block_item-bd">
                                    <span class="webprice_block_item-field">
                                        <UInput
                                            :model-value="String((props.form as Record<string, unknown>).bonuspriceC ?? '')"
                                            type="number"
                                            step="0.01"
                                            class="inline-block w-24"
                                            placeholder="直接輸入金額"
                                            @update:model-value="(v: unknown) => (props.form as Record<string, unknown>).bonuspriceC = v" />
                                        元
                                    </span>
                                </div>
                            </div>
                            <USeparator />
                            <div class="webprice_block_item">
                                <div class="webprice_block_item-bd">
                                    <div
                                        class="flex flex-col items-start gap-2">
                                        <span class="webprice_block_item-field">
                                            網路市價 Web Price:
                                            <UInput
                                                :model-value="String((props.form as Record<string, unknown>).bonusprice ?? '')"
                                                class="inline-block w-24"
                                                readonly
                                                placeholder="—" />
                                            元
                                        </span>
                                        <UButton
                                            label="Calculate"
                                            size="xs"
                                            color="primary"
                                            variant="outline"
                                            @click="calculateBonusprice()" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UFormField>

                    <UFormField
                        :label="`產品會員價\nMember price`"
                        name="memberprice">
                        <UInput
                            :model-value="String((props.form as Record<string, unknown>).memberprice ?? '')"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="選填"
                            @update:model-value="(v: unknown) => (props.form as Record<string, unknown>).memberprice = v" />
                    </UFormField>
                    <UFormField
                        :label="`產品供應商價\nSupplier price`"
                        name="providerprice">
                        <UInput
                            :model-value="String((props.form as Record<string, unknown>).providerprice ?? '')"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="選填"
                            @update:model-value="(v: unknown) => (props.form as Record<string, unknown>).providerprice = v" />
                    </UFormField>
                    <!-- 編輯時顯示：系統推算成本（唯讀，來自 DB） -->
                    <UFormField
                        v-if="props.mode === 'edit' && (props.form as Record<string, unknown>).cost != null"
                        :label="`系統推算成本\nSystem Cost`"
                        name="cost">
                        <UInput
                            :model-value="String((props.form as Record<string, unknown>).cost ?? '')"
                            readonly
                            placeholder="—" />
                    </UFormField>
                </UCard>
                <UCard
                    :ui="{
                        body: 'flex flex-col gap-4'
                    }">
                    <!-- Color 上下架 / Color 設定 -->
                    <UFormField
                        :label="`Color 上下架設定\nColor Online/Offline`"
                        name="color_on_off">
                        <URadioGroup
                            :model-value="Number((props.form as Record<string, unknown>).color_on_off ?? 0)"
                            :items="onOffRadioItems"
                            orientation="horizontal"
                            variant="table"
                            size="sm"
                            @update:model-value="(v: number) => (props.form as Record<string, unknown>).color_on_off = v" />
                    </UFormField>
                    <UFormField
                        :label="`Color 設定\nColor Setting`"
                        name="color">
                        <UInput
                            :model-value="String((props.form as Record<string, unknown>).color ?? '')"
                            placeholder="選填"
                            @update:model-value="(v: string | number | null) => (props.form as Record<string, unknown>).color = String(v ?? '')" />
                    </UFormField>
                    <!-- Size 上下架 / Size 設定 -->
                    <UFormField
                        :label="`Size 上下架設定\nSize Online/Offline`"
                        name="size_on_off">
                        <URadioGroup
                            :model-value="Number((props.form as Record<string, unknown>).size_on_off ?? 0)"
                            :items="onOffRadioItems"
                            orientation="horizontal"
                            variant="table"
                            size="sm"
                            @update:model-value="(v: number) => (props.form as Record<string, unknown>).size_on_off = v" />
                    </UFormField>
                    <UFormField :label="`Size 設定\nSize Setting`" name="size">
                        <UInput
                            :model-value="String((props.form as Record<string, unknown>).size ?? '')"
                            placeholder="選填"
                            @update:model-value="(v: string | number | null) => (props.form as Record<string, unknown>).size = String(v ?? '')" />
                    </UFormField>
                    <!-- Qty 上下架 / Qty 設定 -->
                    <UFormField
                        :label="`Qty 上下架設定\nQty Online/Offline`"
                        name="qty_on_off">
                        <URadioGroup
                            :model-value="Number((props.form as Record<string, unknown>).qty_on_off ?? 0)"
                            :items="onOffRadioItems"
                            orientation="horizontal"
                            variant="table"
                            size="sm"
                            @update:model-value="(v: number) => (props.form as Record<string, unknown>).qty_on_off = v" />
                    </UFormField>
                    <UFormField :label="`Qty 設定\nQty Setting`" name="qty">
                        <UInput
                            :model-value="String((props.form as Record<string, unknown>).qty ?? '')"
                            placeholder="選填"
                            @update:model-value="(v: string | number | null) => (props.form as Record<string, unknown>).qty = String(v ?? '')" />
                    </UFormField>
                </UCard>
            </div>
            <div class="frm-bd-main flex flex-col gap-4 flex-[60%] order-1">
                <UFormField
                    v-if="!props.hideCategory"
                    :label="`產品類別\nClassification`"
                    name="classID">
                    <USelectMenu
                        v-model="selectedCategory"
                        :items="categoryOptions"
                        value-attribute="value"
                        option-attribute="label"
                        placeholder="請選擇分類"
                        :ui="{ base: 'w-full' }" />
                </UFormField>
                <UFormField
                    v-if="!props.hideProductSeries"
                    :label="`產品編號\nNumber`"
                    name="productseries">
                    <UInput
                        v-model="props.form.productseries"
                        placeholder="選填，不填則自動產生" />
                </UFormField>
                <UFormField :label="`供應商\nSupplier`" name="providerseries">
                    <UInput
                        v-model="props.form.providerseries"
                        placeholder="選填" />
                </UFormField>
                <UFormField
                    :label="`產品國際條碼\nInternal Barcode`"
                    name="barcode">
                    <UInput v-model="props.form.barcode" placeholder="選填" />
                </UFormField>
                <UFormField
                    :label="`產品名稱\nName`"
                    name="productname"
                    :error="props.errors.productname"
                    required>
                    <UInput
                        v-model="props.form.productname"
                        placeholder="請輸入產品名稱"
                        @blur="props.validate()" />
                </UFormField>
                <ImageUploadSingle
                    ref="product_s_gif_upload_ref"
                    v-model="product_s_gif"
                    :label="`選擇產品照片(1)\nUpload product photo (1)`"
                    name="product_s_gif"
                    :preview-base-url="productsPreviewBase"
                    :legacy-preview-base-url="productsLegacyPreviewBase"
                    :upload-endpoint="productsUploadEndpoint(props.region, props.form.classID, props.form.productseries)"
                    preview-max-width="300px" />
                <ImageUploadSingle
                    ref="product_s_1_gif_upload_ref"
                    v-model="product_s_1_gif"
                    :label="`選擇產品照片(2)\nUpload product photo (2)`"
                    name="product_s_1_gif"
                    :preview-base-url="productsPreviewBase"
                    :legacy-preview-base-url="productsLegacyPreviewBase"
                    :upload-endpoint="productsUploadEndpoint(props.region, props.form.classID, props.form.productseries)"
                    preview-max-width="300px" />
                <ImageUploadSingle
                    ref="product_s_2_gif_upload_ref"
                    v-model="product_s_2_gif"
                    :label="`選擇產品照片(3)\nUpload product photo (3)`"
                    name="product_s_2_gif"
                    :preview-base-url="productsPreviewBase"
                    :legacy-preview-base-url="productsLegacyPreviewBase"
                    :upload-endpoint="productsUploadEndpoint(props.region, props.form.classID, props.form.productseries)"
                    preview-max-width="300px" />
                <UFormField label="Youtube URL" name="youtube">
                    <UInput v-model="props.form.youtube" placeholder="選填" />
                </UFormField>

                <UFormField :label="`單重(公克)\nWEIGHT (g)`" name="weight">
                    <UInput
                        :model-value="String((props.form as Record<string, unknown>).weight ?? '')"
                        type="text"
                        placeholder="選填"
                        @update:model-value="(v: string | number | null) => (props.form as Record<string, unknown>).weight = String(v ?? '')" />
                </UFormField>
                <UFormField :label="`庫存量\nStock`" name="stock">
                    <div class="flex gap-2 items-center">
                        <UInput
                            v-model.number="props.form.stock"
                            type="number"
                            min="0"
                            placeholder="0" />
                        <UCheckbox
                            label="CHECK STOCK"
                            :model-value="Number((props.form as Record<string, unknown>).chk_stock) === 1"
                            @update:model-value="(v: boolean | 'indeterminate') => (props.form as Record<string, unknown>).chk_stock = v === true ? 1 : 0"
                            :ui="{ wrapper: 'whitespace-nowrap' }" />
                    </div>
                </UFormField>

                <UFormField
                    :label="`產品簡述\nSimply profile`"
                    name="productsimpleprofile">
                    <UTextarea
                        v-model="props.form.productsimpleprofile"
                        placeholder="選填"
                        :rows="2"
                        autoresize />
                </UFormField>
                <UFormField :label="`產品特色\nFeature`" name="productprofile">
                    <UTextarea
                        v-model="props.form.productprofile"
                        placeholder="選填"
                        :rows="3"
                        autoresize />
                </UFormField>
                <UFormField
                    :label="`商品規格說明\nSpecifications`"
                    name="productprofile2">
                    <UTextarea
                        v-model="props.form.productprofile1"
                        placeholder="選填"
                        :rows="3"
                        autoresize />
                </UFormField>
                <UFormField
                    :label="`圖片說明\nPicture description`"
                    name="productprofile2">
                    <UTextarea
                        v-model="props.form.productprofile2"
                        placeholder="選填"
                        :rows="3"
                        autoresize />
                </UFormField>
                <UFormField
                    :label="`英文字母代表\nLetter search`"
                    name="letterSearch">
                    <UInput
                        v-model="props.form.letterSearch"
                        placeholder="選填" />
                </UFormField>
                <UFormField
                    :label="`外文字母代表\nOther language search`"
                    name="languageSearch">
                    <UInput
                        v-model="props.form.languageSearch"
                        placeholder="選填" />
                </UFormField>

                <UFormField
                    :label="`上傳產品說明\nUpload manual`"
                    name="usermanual">
                    <UInput
                        :model-value="String((props.form as Record<string, unknown>).usermanual ?? '')"
                        placeholder="選填，可填檔名或路徑"
                        @update:model-value="(v: string | number | null) => (props.form as Record<string, unknown>).usermanual = String(v ?? '')" />
                </UFormField>
                <UFormField
                    :label="`設定提供廠商 E-mail\nFactory E-mail`"
                    name="factory_email">
                    <UInput
                        :model-value="String((props.form as Record<string, unknown>).factory_email ?? '')"
                        type="email"
                        placeholder="選填"
                        @update:model-value="(v: string | number | null) => (props.form as Record<string, unknown>).factory_email = String(v ?? '')" />
                </UFormField>
            </div>
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
            <template v-if="props.mode === 'add'">
                <UButton
                    label="確定新增 Submit"
                    color="primary"
                    :loading="props.loading"
                    @click="emit('submit')" />
            </template>
            <template v-else>
                <UButton
                    label="確定儲存 Submit"
                    color="primary"
                    :loading="props.loading"
                    @click="emit('submit')" />
                <template v-if="props.prevId != null">
                    <UButton
                        label="SAVE & GO TO PREVIOUS ITEM"
                        color="neutral"
                        variant="outline"
                        :loading="props.loading"
                        @click="emit('submit_previous')" />
                    <UButton
                        label="PREVIOUS"
                        color="neutral"
                        variant="ghost"
                        :to="{
                            path: `/product/product/edit/${props.prevId}`,
                            query: { region: props.region }
                        }" />
                </template>
                <UButton
                    label="Save as new data"
                    color="neutral"
                    variant="outline"
                    :loading="props.loading"
                    @click="emit('submit_save_as_new')" />
                <template v-if="props.nextId != null">
                    <UButton
                        label="NEXT"
                        color="neutral"
                        variant="ghost"
                        :to="{
                            path: `/product/product/edit/${props.nextId}`,
                            query: { region: props.region }
                        }" />
                    <UButton
                        label="SAVE & GO TO NEXT ITEM"
                        color="neutral"
                        variant="outline"
                        :loading="props.loading"
                        @click="emit('submit_next')" />
                </template>
            </template>
        </section>
    </UForm>
</template>
<style scoped>
@import "./Form.css";
</style>
