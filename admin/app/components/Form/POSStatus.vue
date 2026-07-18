<script setup lang="ts">
/**
 * POS上下架狀態（onTop）
 * 1 = 上架，0 = 下架
 */
const props = defineProps<{
    value?: string | number | null;
}>();

const emit = defineEmits<{
    (e: "update:value", value: number): void;
}>();

const posItems = [
    { label: "下架 Offline", value: 0 },
    { label: "上架 Online", value: 1 }
];

const selectedPos = computed<number>({
    get: () => Number(props.value ?? 0),
    set: (val) => emit("update:value", val)
});
</script>

<template>
    <UFormField :label="`POS上下架設定\nPOS Online/Offline`" name="onTop">
        <URadioGroup
            v-model="selectedPos"
            :items="posItems"
            orientation="horizontal"
            variant="table"
            size="sm" />
    </UFormField>
</template>
