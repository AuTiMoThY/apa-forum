<script lang="ts" setup>
import type { ExampleSession } from "./_mock";
import {
    cloneExampleData,
    findAllTrackSessionAt,
    findSessionAt,
    formatSlotRange,
    getSlotIndex,
    getSlotSpan,
    isSlotCovered,
    nextExampleId,
    sortByOrder,
} from "./_mock";
import AgendaPreview from "./_AgendaPreview.vue";
import SessionModal from "./_SessionModal.vue";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "試作 4：混合模式" });

const { tracks, timeSlots, sessions } = cloneExampleData();
const tracksRef = ref(tracks);
const timeSlotsRef = ref(timeSlots);
const sessionsRef = ref(sessions);

const currentStep = ref(0);

const steps = [
    { title: "結構設定", description: "軌道與時段" },
    { title: "內容編輯", description: "Grid 填場次" },
    { title: "預覽確認", description: "檢視成果" },
];

const trackForm = ref({ name: "", color: "#6366f1" });
const slotForm = ref({ start: "", end: "" });

const modalOpen = ref(false);
const editingSession = ref<ExampleSession | null>(null);
const clickTarget = ref<{ trackId: string | null; slotId: string } | null>(
    null
);

const sortedTracks = computed(() => sortByOrder(tracksRef.value));
const sortedSlots = computed(() => sortByOrder(timeSlotsRef.value));

const gridStyle = computed(() => ({
    gridTemplateColumns: `100px repeat(${sortedTracks.value.length}, minmax(120px, 1fr))`,
    gridTemplateRows: `repeat(${sortedSlots.value.length}, minmax(52px, auto))`,
}));

const canNext = computed(() => {
    if (currentStep.value === 0) {
        return tracksRef.value.length > 0 && timeSlotsRef.value.length > 0;
    }
    return true;
});

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

const openCell = (trackId: string | null, slotId: string) => {
    if (trackId) {
        const existing = findSessionAt(
            sessionsRef.value,
            trackId,
            slotId,
            timeSlotsRef.value
        );
        if (existing) {
            editingSession.value = existing;
            clickTarget.value = null;
            modalOpen.value = true;
            return;
        }
        if (
            isSlotCovered(
                sessionsRef.value,
                trackId,
                slotId,
                timeSlotsRef.value
            )
        ) {
            return;
        }
    } else {
        const existing = findAllTrackSessionAt(sessionsRef.value, slotId);
        if (existing) {
            editingSession.value = existing;
            clickTarget.value = null;
            modalOpen.value = true;
            return;
        }
    }
    editingSession.value = null;
    clickTarget.value = { trackId, slotId };
    modalOpen.value = true;
};

const handleSave = (session: ExampleSession) => {
    const idx = sessionsRef.value.findIndex((s) => s.id === session.id);
    if (idx >= 0) sessionsRef.value[idx] = session;
    else sessionsRef.value.push(session);
};

const handleRemove = (id: string) => {
    sessionsRef.value = sessionsRef.value.filter((s) => s.id !== id);
};

const summary = computed(() => ({
    trackCount: tracksRef.value.length,
    slotCount: timeSlotsRef.value.length,
    sessionCount: sessionsRef.value.length,
    allTrackCount: sessionsRef.value.filter((s) => s.trackId === null).length,
}));
</script>

<template>
    <PageMain>
        <template #header>
            <UDashboardNavbar
                title="試作 4：混合模式（三步驟）"
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
            <!-- Stepper -->
            <div class="mb-6 flex flex-wrap items-center gap-2">
                <button
                    v-for="(step, index) in steps"
                    :key="step.title"
                    type="button"
                    class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition"
                    :class="
                        currentStep === index
                            ? 'border-primary bg-primary/10 text-primary'
                            : currentStep > index
                              ? 'border-success/50 bg-success/5 text-success'
                              : 'border-default text-muted hover:border-primary/50'
                    "
                    @click="currentStep = index">
                    <span
                        class="flex size-6 items-center justify-center rounded-full text-xs font-bold"
                        :class="
                            currentStep >= index
                                ? 'bg-primary text-white'
                                : 'bg-muted text-muted'
                        ">
                        {{ index + 1 }}
                    </span>
                    <span>
                        <span class="font-medium">{{ step.title }}</span>
                        <span class="text-muted ml-1 hidden sm:inline">
                            — {{ step.description }}
                        </span>
                    </span>
                </button>
            </div>

            <!-- Step 1 -->
            <div v-if="currentStep === 0" class="grid gap-6 lg:grid-cols-2">
                <UCard>
                    <template #header>
                        <h3 class="font-semibold">軌道設定</h3>
                    </template>
                    <div class="mb-4 flex gap-2">
                        <UInput
                            v-model="trackForm.name"
                            placeholder="軌道名稱"
                            class="flex-1" />
                        <input
                            v-model="trackForm.color"
                            type="color"
                            class="h-9 w-12 rounded border border-default" />
                        <UButton icon="i-lucide-plus" @click="addTrack" />
                    </div>
                    <div class="space-y-2">
                        <div
                            v-for="track in sortedTracks"
                            :key="track.id"
                            class="flex items-center gap-2 rounded border border-default p-2">
                            <span
                                class="size-4 rounded-full"
                                :style="{ backgroundColor: track.color }" />
                            <span class="flex-1 text-sm">{{ track.name }}</span>
                        </div>
                    </div>
                </UCard>

                <UCard>
                    <template #header>
                        <h3 class="font-semibold">時段設定</h3>
                    </template>
                    <div class="mb-4 flex gap-2">
                        <UInput
                            v-model="slotForm.start"
                            placeholder="13:00"
                            class="w-24" />
                        <UInput
                            v-model="slotForm.end"
                            placeholder="13:30"
                            class="w-24" />
                        <UButton icon="i-lucide-plus" @click="addSlot" />
                    </div>
                    <div class="space-y-1">
                        <div
                            v-for="slot in sortedSlots"
                            :key="slot.id"
                            class="rounded border border-default px-3 py-2 text-sm">
                            {{ slot.start }} – {{ slot.end }}
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Step 2 -->
            <UCard v-else-if="currentStep === 1">
                <template #header>
                    <h3 class="font-semibold">Grid 填寫場次</h3>
                </template>
                <div class="overflow-x-auto">
                    <div class="min-w-[760px]">
                        <div
                            class="mb-2 grid gap-1"
                            :style="{
                                gridTemplateColumns: `100px repeat(${sortedTracks.length}, minmax(120px, 1fr))`,
                            }">
                            <div />
                            <div
                                v-for="track in sortedTracks"
                                :key="track.id"
                                class="truncate rounded px-2 py-1 text-center text-xs text-white"
                                :style="{ backgroundColor: track.color }">
                                {{ track.name }}
                            </div>
                        </div>
                        <div class="grid gap-1" :style="gridStyle">
                            <template
                                v-for="(slot, rowIndex) in sortedSlots"
                                :key="slot.id">
                                <div
                                    class="flex items-center border-t border-default pt-2 text-xs text-muted"
                                    :style="{
                                        gridRow: `${rowIndex + 1}`,
                                        gridColumn: '1',
                                    }">
                                    {{ slot.start }}–{{ slot.end }}
                                </div>
                                <template
                                    v-if="
                                        findAllTrackSessionAt(
                                            sessionsRef,
                                            slot.id
                                        )
                                    ">
                                    <button
                                        type="button"
                                        class="rounded border border-primary/40 bg-primary/10 px-2 py-2 text-left text-xs"
                                        :style="{
                                            gridRow: `${rowIndex + 1}`,
                                            gridColumn: `2 / ${sortedTracks.length + 2}`,
                                        }"
                                        @click="openCell(null, slot.id)">
                                        {{
                                            findAllTrackSessionAt(
                                                sessionsRef,
                                                slot.id
                                            )?.title
                                        }}
                                    </button>
                                </template>
                                <template v-else>
                                    <template
                                        v-for="(track, colIndex) in sortedTracks"
                                        :key="`${slot.id}-${track.id}`">
                                        <div
                                            v-if="
                                                isSlotCovered(
                                                    sessionsRef,
                                                    track.id,
                                                    slot.id,
                                                    timeSlotsRef
                                                )
                                            "
                                            :style="{
                                                gridRow: `${rowIndex + 1}`,
                                                gridColumn: `${colIndex + 2}`,
                                            }" />
                                        <button
                                            v-else-if="
                                                findSessionAt(
                                                    sessionsRef,
                                                    track.id,
                                                    slot.id,
                                                    timeSlotsRef
                                                ) &&
                                                getSlotIndex(
                                                    timeSlotsRef,
                                                    slot.id
                                                ) ===
                                                    getSlotIndex(
                                                        timeSlotsRef,
                                                        findSessionAt(
                                                            sessionsRef,
                                                            track.id,
                                                            slot.id,
                                                            timeSlotsRef
                                                        )!.startSlotId
                                                    )
                                            "
                                            type="button"
                                            class="rounded border border-default bg-elevated px-2 py-2 text-left text-xs hover:border-primary"
                                            :style="{
                                                gridRow: `${rowIndex + 1} / span ${getSlotSpan(
                                                    timeSlotsRef,
                                                    findSessionAt(
                                                        sessionsRef,
                                                        track.id,
                                                        slot.id,
                                                        timeSlotsRef
                                                    )!.startSlotId,
                                                    findSessionAt(
                                                        sessionsRef,
                                                        track.id,
                                                        slot.id,
                                                        timeSlotsRef
                                                    )!.endSlotId
                                                )}`,
                                                gridColumn: `${colIndex + 2}`,
                                            }"
                                            @click="
                                                openCell(track.id, slot.id)
                                            ">
                                            {{
                                                findSessionAt(
                                                    sessionsRef,
                                                    track.id,
                                                    slot.id,
                                                    timeSlotsRef
                                                )?.title
                                            }}
                                        </button>
                                        <button
                                            v-else
                                            type="button"
                                            class="min-h-[48px] rounded border border-dashed border-default hover:border-primary"
                                            :style="{
                                                gridRow: `${rowIndex + 1}`,
                                                gridColumn: `${colIndex + 2}`,
                                            }"
                                            @click="
                                                openCell(track.id, slot.id)
                                            " />
                                    </template>
                                </template>
                            </template>
                        </div>
                    </div>
                </div>
            </UCard>

            <!-- Step 3 -->
            <div v-else class="space-y-4">
                <div class="grid gap-3 sm:grid-cols-4">
                    <UCard :ui="{ body: 'p-4 text-center' }">
                        <p class="text-2xl font-bold text-primary">
                            {{ summary.trackCount }}
                        </p>
                        <p class="text-muted text-sm">軌道數</p>
                    </UCard>
                    <UCard :ui="{ body: 'p-4 text-center' }">
                        <p class="text-2xl font-bold text-primary">
                            {{ summary.slotCount }}
                        </p>
                        <p class="text-muted text-sm">時段數</p>
                    </UCard>
                    <UCard :ui="{ body: 'p-4 text-center' }">
                        <p class="text-2xl font-bold text-primary">
                            {{ summary.sessionCount }}
                        </p>
                        <p class="text-muted text-sm">場次數</p>
                    </UCard>
                    <UCard :ui="{ body: 'p-4 text-center' }">
                        <p class="text-2xl font-bold text-primary">
                            {{ summary.allTrackCount }}
                        </p>
                        <p class="text-muted text-sm">全軌事件</p>
                    </UCard>
                </div>

                <UCard>
                    <template #header>
                        <h3 class="font-semibold">前台預覽</h3>
                    </template>
                    <AgendaPreview
                        :tracks="tracksRef"
                        :time-slots="timeSlotsRef"
                        :sessions="sessionsRef" />
                </UCard>

                <UCard>
                    <template #header>
                        <h3 class="font-semibold">場次摘要</h3>
                    </template>
                    <ul class="space-y-2 text-sm">
                        <li
                            v-for="ses in sessionsRef"
                            :key="ses.id"
                            class="rounded border border-default px-3 py-2">
                            <span class="font-medium">{{ ses.title }}</span>
                            <span class="text-muted">
                                — {{
                                    ses.trackId
                                        ? sortedTracks.find(
                                              (t) => t.id === ses.trackId
                                          )?.name
                                        : "全軌"
                                }}，
                                {{
                                    formatSlotRange(
                                        timeSlotsRef,
                                        ses.startSlotId,
                                        ses.endSlotId
                                    )
                                }}
                            </span>
                        </li>
                    </ul>
                </UCard>
            </div>

            <!-- Navigation -->
            <div class="mt-6 flex justify-between">
                <UButton
                    label="上一步"
                    color="neutral"
                    variant="outline"
                    icon="i-lucide-arrow-left"
                    :disabled="currentStep === 0"
                    @click="currentStep -= 1" />
                <UButton
                    v-if="currentStep < steps.length - 1"
                    label="下一步"
                    color="primary"
                    trailing-icon="i-lucide-arrow-right"
                    :disabled="!canNext"
                    @click="currentStep += 1" />
                <UButton
                    v-else
                    label="完成（mock）"
                    color="success"
                    icon="i-lucide-check"
                    disabled />
            </div>

            <SessionModal
                v-model:open="modalOpen"
                :tracks="tracksRef"
                :time-slots="timeSlotsRef"
                :sessions="sessionsRef"
                :editing="editingSession"
                :default-track-id="clickTarget?.trackId"
                :default-slot-id="clickTarget?.slotId"
                @save="handleSave"
                @remove="handleRemove" />
        </template>
    </PageMain>
</template>
