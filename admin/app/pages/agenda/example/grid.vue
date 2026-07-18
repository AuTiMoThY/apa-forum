<script lang="ts" setup>
import type { ExampleSession } from "./_mock";
import {
    cloneExampleData,
    findAllTrackSessionAt,
    findSessionAt,
    getSlotIndex,
    getSlotSpan,
    isSlotCovered,
    sortByOrder,
} from "./_mock";
import AgendaPreview from "./_AgendaPreview.vue";
import SessionModal from "./_SessionModal.vue";

definePageMeta({ middleware: ["auth"] });
useSeoMeta({ title: "試作 1：Grid 編輯器" });

const { tracks, timeSlots, sessions } = cloneExampleData();
const tracksRef = ref(tracks);
const timeSlotsRef = ref(timeSlots);
const sessionsRef = ref(sessions);

const modalOpen = ref(false);
const editingSession = ref<ExampleSession | null>(null);
const clickTarget = ref<{ trackId: string | null; slotId: string } | null>(
    null
);

const sortedTracks = computed(() => sortByOrder(tracksRef.value));
const sortedSlots = computed(() => sortByOrder(timeSlotsRef.value));

const gridStyle = computed(() => ({
    gridTemplateColumns: `120px repeat(${sortedTracks.value.length}, minmax(140px, 1fr))`,
    gridTemplateRows: `repeat(${sortedSlots.value.length}, minmax(56px, auto))`,
}));

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
    if (idx >= 0) {
        sessionsRef.value[idx] = session;
    } else {
        sessionsRef.value.push(session);
    }
};

const handleRemove = (id: string) => {
    sessionsRef.value = sessionsRef.value.filter((s) => s.id !== id);
};
</script>

<template>
    <PageMain>
        <template #header>
            <UDashboardNavbar
                title="試作 1：WYSIWYG Grid 編輯器"
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
                icon="i-lucide-mouse-pointer-click"
                title="操作說明"
                description="點擊空白格子新增場次；點擊已有場次可編輯。跨時段場次會自動合併儲存格（rowspan）。"
                class="mb-4" />

            <div class="grid gap-6 xl:grid-cols-2">
                <!-- Editable grid -->
                <UCard>
                    <template #header>
                        <h3 class="font-semibold">編輯區（可點擊）</h3>
                    </template>

                    <div class="overflow-x-auto">
                        <div class="min-w-[800px]">
                            <div
                                class="mb-2 grid gap-1"
                                :style="{
                                    gridTemplateColumns: `120px repeat(${sortedTracks.length}, minmax(140px, 1fr))`,
                                }">
                                <div class="text-muted text-xs">時段</div>
                                <div
                                    v-for="track in sortedTracks"
                                    :key="track.id"
                                    class="truncate rounded px-2 py-1 text-center text-xs font-medium text-white"
                                    :style="{ backgroundColor: track.color }">
                                    {{ track.name }}
                                </div>
                            </div>

                            <div class="grid gap-1" :style="gridStyle">
                                <template
                                    v-for="(slot, rowIndex) in sortedSlots"
                                    :key="slot.id">
                                    <div
                                        class="flex items-center border-t border-default pt-2 text-sm text-muted"
                                        :style="{
                                            gridRow: `${rowIndex + 1}`,
                                            gridColumn: '1',
                                        }">
                                        {{ slot.start }} – {{ slot.end }}
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
                                            class="rounded border border-primary/40 bg-primary/10 px-2 py-2 text-left text-sm transition hover:bg-primary/20"
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
                                                class="rounded border border-default bg-elevated px-2 py-2 text-left text-sm transition hover:border-primary hover:bg-primary/5"
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
                                                class="min-h-[52px] rounded border border-dashed border-default text-muted transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                                                :style="{
                                                    gridRow: `${rowIndex + 1}`,
                                                    gridColumn: `${colIndex + 2}`,
                                                }"
                                                @click="
                                                    openCell(track.id, slot.id)
                                                ">
                                                <UIcon
                                                    name="i-lucide-plus"
                                                    class="mx-auto size-4" />
                                            </button>
                                        </template>
                                    </template>
                                </template>
                            </div>
                        </div>
                    </div>
                </UCard>

                <!-- Preview -->
                <UCard>
                    <template #header>
                        <h3 class="font-semibold">前台預覽</h3>
                    </template>
                    <AgendaPreview
                        :tracks="tracksRef"
                        :time-slots="timeSlotsRef"
                        :sessions="sessionsRef" />
                </UCard>
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
