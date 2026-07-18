<script setup lang="ts">
/**
 * POS上下架狀態（onTop）
 * 1 = 上架，0 = 下架
 */
const props = defineProps<{
    value?: string | number | null;
}>();

const isOn = computed(() => Number(props.value) === 1);
const label = computed(() => (isOn.value ? "上架 Online" : "下架 Offline"));
const iconName = computed(() =>
    isOn.value ? "i-lucide-arrow-up-circle" : "i-lucide-arrow-down-circle"
);
const iconClass = computed(() =>
    isOn.value ? "text-green-600 shrink-0" : "text-amber-600 shrink-0"
);
const textClass = computed(() =>
    isOn.value ? "text-green-600" : "text-amber-600"
);
</script>

<template>
    <div class="flex items-center gap-2">
        <UIcon :name="iconName" :class="iconClass" class="size-4" />
        <span :class="textClass">{{ label }}</span>
    </div>
</template>
