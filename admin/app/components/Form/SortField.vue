<script setup lang="ts">
const props = defineProps<{
    value?: string | number | null;
}>();

const emit = defineEmits<{
    (e: "update:value", value: number): void;
}>();

</script>
<template>
    <UFormField :label="`顯示順序\nSort Order`" name="classordernum">
        <UInput v-model.number="props.value" type="number" @update:value="(val: number) => emit('update:value', val)" />
    </UFormField>
</template>
