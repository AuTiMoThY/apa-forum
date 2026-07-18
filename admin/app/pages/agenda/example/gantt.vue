<script lang="ts" setup>
import type { ExampleSession } from "./_mock";
import {
    cloneExampleData,
    getSessionTimelineStyle,
    getTimelineRange,
    sortByOrder,
} from "./_mock";
import SessionModal from "./_SessionModal.vue";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "試作 3：Gantt 時間軸" });

const { tracks, timeSlots, sessions } = cloneExampleData();
const tracksRef = ref(tracks);
const timeSlotsRef = ref(timeSlots);
const sessionsRef = ref(sessions);

const modalOpen = ref(false);
const editingSession = ref<ExampleSession | null>(null);

const sortedTracks = computed(() => sortByOrder(tracksRef.value));
const sortedSlots = computed(() => sortByOrder(timeSlotsRef.value));

const timelineRange = computed(() => getTimelineRange(timeSlotsRef.value));

const hourMarks = computed(() => {
    const { startMin, endMin } = timelineRange.value;
    const marks: { label: string; left: string }[] = [];
    const startHour = Math.floor(startMin / 60);
    const endHour = Math.ceil(endMin / 60);
    const total = endMin - startMin || 1;

    for (let h = startHour; h <= endHour; h++) {
        const min = h * 60;
        marks.push({
            label: `${String(h).padStart(2, "0")}:00`,
            left: `${((min - startMin) / total) * 100}%`,
        });
    }
    return marks;
});

const trackSessions = (trackId: string) =>
    sessionsRef.value.filter((s) => s.trackId === trackId);

const allTrackSessions = computed(() =>
    sessionsRef.value.filter((s) => s.trackId === null)
);

const openSession = (session: ExampleSession) => {
    editingSession.value = session;
    modalOpen.value = true;
};

const openNewForTrack = (trackId: string) => {
    editingSession.value = null;
    modalOpen.value = true;
    clickTrackId.value = trackId;
};

const clickTrackId = ref<string | undefined>();

const handleSave = (session: ExampleSession) => {
    const idx = sessionsRef.value.findIndex((s) => s.id === session.id);
    if (idx >= 0) sessionsRef.value[idx] = session;
    else sessionsRef.value.push(session);
};

const handleRemove = (id: string) => {
    sessionsRef.value = sessionsRef.value.filter((s) => s.id !== id);
};

const blockStyle = (session: ExampleSession, color?: string) => ({
    ...getSessionTimelineStyle(session, timeSlotsRef.value),
    backgroundColor: color ? `${color}33` : "rgba(255,255,255,0.08)",
    borderColor: color ?? "rgba(255,255,255,0.2)",
});
</script>

<template>
    <PageMain>
        <template #header>
            <UDashboardNavbar
                title="試作 3：時間軸 Gantt 風格"
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
            <UAlert
                color="neutral"
                variant="soft"
                icon="i-lucide-gantt-chart"
                title="操作說明"
                description="橫軸為時間、縱軸為軌道。點擊色塊編輯場次；點擊空白列可新增（mock 演示）。"
                class="mb-4" />

            <UCard>
                <div class="overflow-x-auto">
                    <div class="min-w-[900px]">
                        <!-- Time axis -->
                        <div class="relative mb-2 ml-44 h-8 border-b border-default">
                            <span
                                v-for="mark in hourMarks"
                                :key="mark.label"
                                class="absolute -translate-x-1/2 text-xs text-muted"
                                :style="{ left: mark.left }">
                                {{ mark.label }}
                            </span>
                        </div>

                        <!-- All-track lane -->
                        <div
                            v-if="allTrackSessions.length"
                            class="mb-3 flex gap-3">
                            <div
                                class="w-40 shrink-0 truncate pt-2 text-sm font-medium text-muted">
                                全軌事件
                            </div>
                            <div
                                class="relative h-12 flex-1 rounded-lg border border-default bg-muted/20">
                                <button
                                    v-for="ses in allTrackSessions"
                                    :key="ses.id"
                                    type="button"
                                    class="absolute top-1 bottom-1 truncate rounded border px-2 text-xs font-medium transition hover:brightness-110"
                                    :style="blockStyle(ses, '#64748b')"
                                    @click="openSession(ses)">
                                    {{ ses.title }}
                                </button>
                            </div>
                        </div>

                        <!-- Track rows -->
                        <div
                            v-for="track in sortedTracks"
                            :key="track.id"
                            class="mb-2 flex gap-3">
                            <div class="flex w-40 shrink-0 items-center gap-2">
                                <span
                                    class="size-3 shrink-0 rounded-full"
                                    :style="{ backgroundColor: track.color }" />
                                <span
                                    class="truncate text-sm font-medium"
                                    :title="track.name">
                                    {{ track.name }}
                                </span>
                            </div>

                            <div
                                class="relative h-14 flex-1 cursor-pointer rounded-lg border border-default bg-muted/10 transition hover:bg-muted/20"
                                @click="openNewForTrack(track.id)">
                                <!-- Grid lines -->
                                <span
                                    v-for="mark in hourMarks"
                                    :key="`${track.id}-${mark.label}`"
                                    class="absolute top-0 bottom-0 border-l border-default/40"
                                    :style="{ left: mark.left }" />

                                <button
                                    v-for="ses in trackSessions(track.id)"
                                    :key="ses.id"
                                    type="button"
                                    class="absolute top-1 bottom-1 truncate rounded border px-2 text-left text-xs leading-snug transition hover:brightness-110"
                                    :style="blockStyle(ses, track.color)"
                                    @click.stop="openSession(ses)">
                                    {{ ses.title }}
                                </button>
                            </div>
                        </div>

                        <!-- Slot markers legend -->
                        <div class="mt-4 flex flex-wrap gap-2 pl-44">
                            <UBadge
                                v-for="slot in sortedSlots"
                                :key="slot.id"
                                color="neutral"
                                variant="subtle"
                                size="sm">
                                {{ slot.start }}–{{ slot.end }}
                            </UBadge>
                        </div>
                    </div>
                </div>
            </UCard>

            <SessionModal
                v-model:open="modalOpen"
                :tracks="tracksRef"
                :time-slots="timeSlotsRef"
                :sessions="sessionsRef"
                :editing="editingSession"
                :default-track-id="clickTrackId"
                @save="handleSave"
                @remove="handleRemove" />
        </template>
    </PageMain>
</template>
