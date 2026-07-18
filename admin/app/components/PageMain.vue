<script setup lang="ts">
/**
 * 包裝 UDashboardPanel，統一 style，並轉發 #header、#body、#footer slots。
 * 使用方式與 UDashboardPanel 相同，僅將標籤改為 DashboardDashboardPanel 或 DashboardPanel。
 */
const attrs = useAttrs();

// 可選：統一預設 ui，頁面傳入的 ui 會與此合併（傳入的優先）
const defaultUi = {
    root: 'dark:bg-gray-900'
};
const mergedUi = computed(() => ({
    ...defaultUi,
    ...(typeof attrs.ui === "object" && attrs.ui !== null ? attrs.ui : {}),
}));

// 傳給 UDashboardPanel 的 props，排除 ui（改用 mergedUi）
const panelAttrs = computed(() => {
    const { ui: _ui, ...rest } = attrs as Record<string, unknown>;
    return { ...rest, ui: mergedUi.value };
});
</script>

<template>
    <UDashboardPanel :ui="{ root: 'dark:bg-gray-900', body: 'page-main-body' }">
        <template v-if="$slots.header" #header>
            <slot name="header" />
        </template>
        <template v-if="$slots.body" #body>
            <slot name="body" />
        </template>
    </UDashboardPanel>
</template>
