<script setup lang="ts">
/**
 * 網購上下架狀態（chkdel）
 * 0 = 上架，1 = 下架
 */
const props = defineProps<{
    value?: string | number | null;
}>();

const emit = defineEmits<{
    (e: "update:value", value: number): void;
}>();

const onlineItems = [
    { label: "下架 Offline", value: 1 },
    { label: "上架 Online", value: 0 },
];

const selectedOnline = computed<number>({
    get: () => Number(props.value ?? 0),
    set: (val) => emit("update:value", val),
});

</script>

<template>
    <UFormField :label="`網購上下架設定\nOnline Shopping Online/Offline`" name="chkdel">
        <URadioGroup
            v-model="selectedOnline"
            :items="onlineItems"
            orientation="horizontal"
            variant="table"
            size="sm"
        />
    </UFormField>
</template>
