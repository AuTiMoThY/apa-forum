<script lang="ts" setup>
definePageMeta({
    middleware: ["auth"],
});

useSeoMeta({ title: "議程 UI 試作範例" });

const examples = [
    {
        to: "/agenda/example/grid",
        title: "方式 1：WYSIWYG Grid 編輯器",
        description:
            "所見即所得的多軌時程表。點擊格子新增/編輯場次，支援跨時段（rowspan）與全軌事件（Break）。",
        icon: "i-lucide-layout-grid",
        color: "primary" as const,
    },
    {
        to: "/agenda/example/form-list",
        title: "方式 2：分層設定 + 表單清單",
        description:
            "以 Tab 分開管理軌道、時段、場次清單，右側即時預覽前台排版。適合快速上線。",
        icon: "i-lucide-list-tree",
        color: "info" as const,
    },
    {
        to: "/agenda/example/gantt",
        title: "方式 3：時間軸 Gantt 風格",
        description:
            "以時間軸為橫軸、軌道為縱軸，區塊長度反映場次時間。適合時段長度不一的情境。",
        icon: "i-lucide-gantt-chart",
        color: "warning" as const,
    },
    {
        to: "/agenda/example/hybrid",
        title: "方式 4：混合模式（三步驟）",
        description:
            "Step 1 設定結構 → Step 2 Grid 填內容 → Step 3 預覽確認。結合表單與 Grid 優點。",
        icon: "i-lucide-layers",
        color: "success" as const,
    },
];
</script>

<template>
    <PageMain>
        <template #header>
            <UDashboardNavbar
                title="議程 UI 試作範例"
                :ui="{ right: 'gap-3', title: 'text-primary' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton
                        label="返回議程管理"
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-arrow-left"
                        to="/agenda" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UAlert
                color="info"
                variant="soft"
                icon="i-lucide-flask-conical"
                title="純前端試作"
                description="以下四種 UI 使用 mock 資料，不串接 API / 資料庫，僅供評估管理介面方向。"
                class="mb-6" />

            <div class="grid gap-4 md:grid-cols-2">
                <UCard
                    v-for="item in examples"
                    :key="item.to"
                    :ui="{ body: 'space-y-3' }">
                    <div class="flex items-start gap-3">
                        <div
                            class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <UIcon
                                :name="item.icon"
                                class="size-5 text-primary" />
                        </div>
                        <div class="min-w-0 flex-1">
                            <h3 class="font-semibold">{{ item.title }}</h3>
                            <p class="text-muted mt-1 text-sm">
                                {{ item.description }}
                            </p>
                        </div>
                    </div>
                    <UButton
                        :label="`開啟試作`"
                        :color="item.color"
                        variant="soft"
                        icon="i-lucide-external-link"
                        :to="item.to"
                        block />
                </UCard>
            </div>
        </template>
    </PageMain>
</template>
