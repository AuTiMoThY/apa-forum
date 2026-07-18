<script setup lang="ts">
const props = defineProps<{
    timeStats: any;
    type: "today" | "week" | "month" | "processed";
}>();

const title = computed(() => {
    return props.type === "today"
        ? "今日新增"
        : props.type === "week"
        ? "本週新增"
        : props.type === "month"
        ? "本月新增"
        : "已處理";
});

const icon = computed(() => {
    return props.type === "today"
        ? "i-lucide-calendar"
        : props.type === "week"
        ? "i-lucide-calendar"
        : props.type === "month"
        ? "i-lucide-calendar"
        : "i-lucide-check-circle";
});

const color = computed(() => {
    return props.type === "today"
        ? "green"
        : props.type === "week"
        ? "blue"
        : props.type === "month"
        ? "purple"
        : "success";
});
</script>
<template>
    <UCard
        :ui="{
            root: 'hover:shadow-lg transition-shadow duration-300',
            body: 'flex flex-col gap-4'
        }">
        <div class="flex items-center gap-3 justify-between">
            <div
                :class="`flex items-center p-2 rounded-lg bg-${ color }-500/10 dark:bg-${ color }-400/20`">
                <UIcon
                    :name="icon"
                    :class="`w-5 h-5 text-${ color }-600 dark:text-${ color }-400`" />
            </div>
            <div class="flex justify-between items-center gap-2 w-full">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ title }}
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {{ props.timeStats[props.type].total }}
                </p>
            </div>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400">
            <div class="flex justify-between">
                <span>
                    聯絡表單:
                    {{ props.timeStats[props.type].contact }}
                </span>
                <span>
                    預約賞屋:
                    {{ props.timeStats[props.type].caseMsg }}
                </span>
            </div>
        </div>
    </UCard>
</template>
