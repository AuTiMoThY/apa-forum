<script lang="ts" setup>
import {
    cloneExampleData,
    formatSlotRange,
    nextExampleId,
    sortByOrder,
} from "./_mock";
import AgendaPreview from "./_AgendaPreview.vue";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "試作 2：分層表單清單" });

const { tracks, timeSlots, sessions } = cloneExampleData();
const tracksRef = ref(tracks);
const timeSlotsRef = ref(timeSlots);
const sessionsRef = ref(sessions);

const activeTab = ref("tracks");

const trackForm = ref({ name: "", color: "#6366f1" });
const slotForm = ref({ start: "", end: "" });
const sessionForm = ref({
    title: "",
    trackId: tracks[0]?.id ?? "",
    startSlotId: timeSlots[0]?.id ?? "",
    endSlotId: timeSlots[0]?.id ?? "",
    isAllTrack: false,
});

const sortedTracks = computed(() => sortByOrder(tracksRef.value));
const sortedSlots = computed(() => sortByOrder(timeSlotsRef.value));

const addTrack = () => {
    if (!trackForm.value.name.trim()) return;
    tracksRef.value.push({
        id: nextExampleId("t"),
        name: trackForm.value.name.trim(),
        color: trackForm.value.color,
        sortOrder: tracksRef.value.length,
    });
    trackForm.value = { name: "", color: "#6366f1" };
};

const removeTrack = (id: string) => {
    tracksRef.value = tracksRef.value.filter((t) => t.id !== id);
    sessionsRef.value = sessionsRef.value.filter((s) => s.trackId !== id);
};

const addSlot = () => {
    if (!slotForm.value.start || !slotForm.value.end) return;
    timeSlotsRef.value.push({
        id: nextExampleId("s"),
        start: slotForm.value.start,
        end: slotForm.value.end,
        sortOrder: timeSlotsRef.value.length,
    });
    slotForm.value = { start: "", end: "" };
};

const removeSlot = (id: string) => {
    timeSlotsRef.value = timeSlotsRef.value.filter((s) => s.id !== id);
    sessionsRef.value = sessionsRef.value.filter(
        (ses) => ses.startSlotId !== id && ses.endSlotId !== id
    );
};

const addSession = () => {
    if (!sessionForm.value.title.trim()) return;
    sessionsRef.value.push({
        id: nextExampleId("ses"),
        title: sessionForm.value.title.trim(),
        trackId: sessionForm.value.isAllTrack
            ? null
            : sessionForm.value.trackId,
        startSlotId: sessionForm.value.startSlotId,
        endSlotId: sessionForm.value.isAllTrack
            ? sessionForm.value.startSlotId
            : sessionForm.value.endSlotId,
        type: "",
    });
    sessionForm.value.title = "";
};

const removeSession = (id: string) => {
    sessionsRef.value = sessionsRef.value.filter((s) => s.id !== id);
};

const getTrackName = (trackId: string | null) => {
    if (trackId === null) return "全軌";
    return tracksRef.value.find((t) => t.id === trackId)?.name ?? "—";
};

const tabs = [
    { label: "軌道設定", value: "tracks", icon: "i-lucide-columns-3" },
    { label: "時段設定", value: "slots", icon: "i-lucide-clock" },
    { label: "場次清單", value: "sessions", icon: "i-lucide-list" },
];
</script>

<template>
    <PageMain>
        <template #header>
            <UDashboardNavbar
                title="試作 2：分層設定 + 表單清單"
                :ui="{ right: 'gap-3', title: 'text-primary' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton
                        label="返回範例列表"
                        color="neutral"
                        variant="outline"
                        icon="i-lucide-arrow-left"
                        to="/agenda/example" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="grid gap-6 xl:grid-cols-2">
                <UCard>
                    <template #header>
                        <UTabs v-model="activeTab" :items="tabs" class="w-full" />
                    </template>

                    <!-- Tracks tab -->
                    <div v-if="activeTab === 'tracks'" class="space-y-4">
                        <div class="flex flex-wrap gap-2">
                            <UInput
                                v-model="trackForm.name"
                                placeholder="軌道名稱"
                                class="min-w-[200px] flex-1" />
                            <input
                                v-model="trackForm.color"
                                type="color"
                                class="h-9 w-12 cursor-pointer rounded border border-default" />
                            <UButton
                                label="新增軌道"
                                icon="i-lucide-plus"
                                @click="addTrack" />
                        </div>

                        <div class="space-y-2">
                            <div
                                v-for="track in sortedTracks"
                                :key="track.id"
                                class="flex items-center gap-3 rounded-lg border border-default p-3">
                                <span
                                    class="size-4 shrink-0 rounded-full"
                                    :style="{ backgroundColor: track.color }" />
                                <UInput
                                    v-model="track.name"
                                    class="flex-1"
                                    size="sm" />
                                <input
                                    v-model="track.color"
                                    type="color"
                                    class="h-8 w-10 cursor-pointer rounded border border-default" />
                                <UButton
                                    color="error"
                                    variant="ghost"
                                    icon="i-lucide-trash-2"
                                    size="sm"
                                    @click="removeTrack(track.id)" />
                            </div>
                        </div>
                    </div>

                    <!-- Slots tab -->
                    <div v-else-if="activeTab === 'slots'" class="space-y-4">
                        <div class="flex flex-wrap gap-2">
                            <UInput
                                v-model="slotForm.start"
                                placeholder="開始 13:00"
                                class="w-28" />
                            <UInput
                                v-model="slotForm.end"
                                placeholder="結束 13:30"
                                class="w-28" />
                            <UButton
                                label="新增時段"
                                icon="i-lucide-plus"
                                @click="addSlot" />
                        </div>

                        <div class="space-y-2">
                            <div
                                v-for="slot in sortedSlots"
                                :key="slot.id"
                                class="flex items-center gap-3 rounded-lg border border-default p-3">
                                <UInput
                                    v-model="slot.start"
                                    class="w-24"
                                    size="sm" />
                                <span class="text-muted">–</span>
                                <UInput
                                    v-model="slot.end"
                                    class="w-24"
                                    size="sm" />
                                <UButton
                                    color="error"
                                    variant="ghost"
                                    icon="i-lucide-trash-2"
                                    size="sm"
                                    @click="removeSlot(slot.id)" />
                            </div>
                        </div>
                    </div>

                    <!-- Sessions tab -->
                    <div v-else class="space-y-4">
                        <div class="space-y-3 rounded-lg border border-default p-4">
                            <UInput
                                v-model="sessionForm.title"
                                placeholder="場次標題"
                                class="w-full" />
                            <UCheckbox
                                v-model="sessionForm.isAllTrack"
                                label="全軌事件" />
                            <USelect
                                v-if="!sessionForm.isAllTrack"
                                v-model="sessionForm.trackId"
                                :items="
                                    sortedTracks.map((t) => ({
                                        label: t.name,
                                        value: t.id,
                                    }))
                                "
                                value-key="value"
                                class="w-full" />
                            <div class="grid gap-2 sm:grid-cols-2">
                                <USelect
                                    v-model="sessionForm.startSlotId"
                                    :items="
                                        sortedSlots.map((s) => ({
                                            label: `${s.start} – ${s.end}`,
                                            value: s.id,
                                        }))
                                    "
                                    value-key="value"
                                    placeholder="起始時段" />
                                <USelect
                                    v-model="sessionForm.endSlotId"
                                    :items="
                                        sortedSlots.map((s) => ({
                                            label: `${s.start} – ${s.end}`,
                                            value: s.id,
                                        }))
                                    "
                                    value-key="value"
                                    placeholder="結束時段"
                                    :disabled="sessionForm.isAllTrack" />
                            </div>
                            <UButton
                                label="新增場次"
                                icon="i-lucide-plus"
                                block
                                @click="addSession" />
                        </div>

                        <div class="overflow-x-auto">
                            <table
                                class="w-full min-w-[480px] border-collapse text-sm">
                                <thead>
                                    <tr
                                        class="border-b border-default bg-muted/30">
                                        <th class="px-2 py-2 text-left">
                                            軌道
                                        </th>
                                        <th class="px-2 py-2 text-left">
                                            時段
                                        </th>
                                        <th class="px-2 py-2 text-left">
                                            標題
                                        </th>
                                        <th class="px-2 py-2 w-12" />
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="ses in sessionsRef"
                                        :key="ses.id"
                                        class="border-b border-default/60">
                                        <td class="px-2 py-2">
                                            {{ getTrackName(ses.trackId) }}
                                        </td>
                                        <td class="px-2 py-2 whitespace-nowrap">
                                            {{
                                                formatSlotRange(
                                                    timeSlotsRef,
                                                    ses.startSlotId,
                                                    ses.endSlotId
                                                )
                                            }}
                                        </td>
                                        <td class="px-2 py-2">
                                            {{ ses.title }}
                                        </td>
                                        <td class="px-2 py-2">
                                            <UButton
                                                color="error"
                                                variant="ghost"
                                                size="xs"
                                                icon="i-lucide-trash-2"
                                                @click="
                                                    removeSession(ses.id)
                                                " />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </UCard>

                <UCard>
                    <template #header>
                        <h3 class="font-semibold">即時預覽</h3>
                    </template>
                    <AgendaPreview
                        :tracks="tracksRef"
                        :time-slots="timeSlotsRef"
                        :sessions="sessionsRef" />
                </UCard>
            </div>
        </template>
    </PageMain>
</template>
