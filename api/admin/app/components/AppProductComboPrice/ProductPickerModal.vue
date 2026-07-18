<script setup lang="ts">
import type { ProductRegion } from "~/constants/product";
import type { ProductItem } from "~/composables/useAppProduct";
import type { TableColumn } from "@nuxt/ui";
import { h } from "vue";

const open = defineModel<boolean>("open", { default: false });

const props = withDefaults(
    defineProps<{
        region: ProductRegion;
        /** 已在組合內的 productID，這些不顯示或禁用 */
        excludeProductIds?: number[];
    }>(),
    { excludeProductIds: () => [] }
);

const emit = defineEmits<{
    (e: "confirm", productIDs: number[]): void;
}>();

const { fetchList } = useAppProduct();
const { fetchList: fetchCategoryList } = useAppProductCategory();

const categoryOptions = ref<{ label: string; value: number }[]>([]);
const selectedClassId = ref<{ label: string; value: number } | undefined>(undefined);
const productList = ref<ProductItem[]>([]);
const loading = ref(false);
const selectedIds = ref<number[]>([]);

const loadCategories = async () => {
    const tops = await fetchCategoryList(props.region, 0);
    const options: { label: string; value: number }[] = [
        { label: "（全部）", value: 0 }
    ];
    if (tops.length > 0) {
        const childrenArrays = await Promise.all(
            tops.map((p) => fetchCategoryList(props.region, p.classlistID))
        );
        tops.forEach((parent, i) => {
            (childrenArrays[i] ?? []).forEach(
                (child: { classname: string; classlistID: number }) => {
                    options.push({
                        label: `${parent.classname} - ${child.classname}`,
                        value: child.classlistID
                    });
                }
            );
        });
    }
    categoryOptions.value = options;
};

const loadProducts = async () => {
    loading.value = true;
    try {
        const classId =
            selectedClassId.value && selectedClassId.value.value !== 0
                ? selectedClassId.value.value
                : undefined;
        const list = await fetchList(props.region, classId);
        productList.value = list;
    } finally {
        loading.value = false;
    }
};

watch(open, (v) => {
    if (v) {
        selectedIds.value = [];
        loadCategories();
        selectedClassId.value = categoryOptions.value[0] ?? undefined;
        nextTick(() => loadProducts());
    }
});

watch(selectedClassId, () => {
    loadProducts();
});

const filteredList = computed(() => {
    const exclude = new Set(props.excludeProductIds ?? []);
    return productList.value.filter((p) => !exclude.has(p.productID));
});

const toggleAll = (checked: boolean) => {
    if (checked) {
        selectedIds.value = filteredList.value.map((p) => p.productID);
    } else {
        selectedIds.value = [];
    }
};

const toggleOne = (productID: number, checked: boolean) => {
    if (checked) {
        selectedIds.value = [...selectedIds.value, productID];
    } else {
        selectedIds.value = selectedIds.value.filter((id) => id !== productID);
    }
};

const allSelected = computed(
    () =>
        filteredList.value.length > 0 &&
        selectedIds.value.length === filteredList.value.length
);

const columns: TableColumn<ProductItem>[] = [
    {
        id: "select",
        header: () =>
            h("input", {
                type: "checkbox",
                checked: allSelected.value,
                onChange: (e: Event) => {
                    toggleAll((e.target as HTMLInputElement).checked);
                }
            }),
        cell: ({ row }) =>
            h("input", {
                type: "checkbox",
                checked: selectedIds.value.includes(row.original.productID),
                onChange: (e: Event) => {
                    toggleOne(
                        row.original.productID,
                        (e.target as HTMLInputElement).checked
                    );
                }
            })
    },
    {
        accessorKey: "wholeseries",
        header: "產品編號"
    },
    {
        accessorKey: "productname",
        header: "產品名稱"
    }
];

const handleConfirm = () => {
    emit("confirm", [...selectedIds.value]);
    open.value = false;
};
</script>

<template>
    <UModal
        v-model:open="open"
        title="選擇要加入的商品"
        description="勾選商品後按確定加入組合">
        <template #body>
            <div class="space-y-3">
                <div class="flex gap-2 items-center">
                    <span class="text-sm">分類篩選：</span>
                    <USelectMenu
                        v-model="selectedClassId"
                        :items="categoryOptions"
                        value-attribute="value"
                        option-attribute="label"
                        placeholder="全部"
                        class="w-56" />
                    <UButton
                        label="重新載入"
                        size="xs"
                        variant="outline"
                        :loading="loading"
                        @click="loadProducts" />
                </div>
                <div class="max-h-96 overflow-auto border rounded">
                    <UTable
                        :data="filteredList"
                        :columns="columns"
                        :loading="loading"
                        :ui="{
                            base: 'table-fixed border-separate border-spacing-0',
                            thead: 'bg-gray-100 dark:bg-gray-800 [&>tr]:after:content-none',
                            tbody: '[&>tr]:last:[&>td]:border-b-0',
                            th: 'py-2 first:rounded-tl-lg last:rounded-tr-lg border border-default',
                            td: 'border-b border-default'
                        }">
                        <template #empty>
                            <div class="p-4 text-center text-gray-500">
                                尚無商品，或請選擇分類
                            </div>
                        </template>
                    </UTable>
                </div>
                <p class="text-sm text-gray-500">
                    已選 {{ selectedIds.length }} 項 / 共 {{ filteredList.length }} 項
                </p>
                <div class="flex justify-end gap-2">
                    <UButton
                        label="取消"
                        color="neutral"
                        variant="outline"
                        @click="open = false" />
                    <UButton
                        label="確定加入"
                        color="primary"
                        :disabled="selectedIds.length === 0"
                        @click="handleConfirm" />
                </div>
            </div>
        </template>
    </UModal>
</template>

