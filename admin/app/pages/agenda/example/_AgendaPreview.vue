<script lang="ts" setup>
import type { ExampleSession, ExampleTimeSlot, ExampleTrack } from "./_mock";
import {
    findAllTrackSessionAt,
    findSessionAt,
    getSlotIndex,
    getSlotSpan,
    isSlotCovered,
    sortByOrder,
} from "./_mock";

const props = defineProps<{
    tracks: ExampleTrack[];
    timeSlots: ExampleTimeSlot[];
    sessions: ExampleSession[];
    compact?: boolean;
}>();

const sortedTracks = computed(() => sortByOrder(props.tracks));
const sortedSlots = computed(() => sortByOrder(props.timeSlots));

const gridStyle = computed(() => ({
    gridTemplateColumns: `88px repeat(${sortedTracks.value.length}, minmax(100px, 1fr))`,
    gridTemplateRows: `repeat(${sortedSlots.value.length}, minmax(52px, auto))`,
}));
</script>

<template>
    <div
        class="overflow-x-auto rounded-xl border border-default"
        :class="compact ? 'text-[10px]' : 'text-xs'">
        <div class="min-w-[720px] bg-[#0a1628] p-3 text-gray-900">
            <!-- Track headers -->
            <div
                class="mb-2 grid gap-2"
                :style="{
                    gridTemplateColumns: `88px repeat(${sortedTracks.length}, minmax(100px, 1fr))`,
                }">
                <div />
                <div
                    v-for="track in sortedTracks"
                    :key="track.id"
                    class="rounded-full px-2 py-1 text-center font-medium leading-tight"
                    :class="compact ? 'text-[9px]' : 'text-[10px]'"
                    :style="{ backgroundColor: track.color }">
                    {{ track.name }}
                </div>
            </div>

            <!-- Main grid -->
            <div class="grid gap-1.5 border-t border-white/10 pt-2" :style="gridStyle">
                <template
                    v-for="(slot, rowIndex) in sortedSlots"
                    :key="slot.id">
                    <!-- Time label -->
                    <div
                        class="flex items-start gap-1 border-t border-white/10 pt-2 text-gray-900/70"
                        :style="{ gridRow: `${rowIndex + 1}`, gridColumn: '1' }">
                        <span
                            class="mt-0.5 inline-block h-4 w-0.5 shrink-0 rounded bg-emerald-400" />
                        <span class="leading-tight">
                            {{ slot.start }}<br />{{ slot.end }}
                        </span>
                    </div>

                    <!-- All-track block -->
                    <template v-if="findAllTrackSessionAt(sessions, slot.id)">
                        <div
                            class="flex items-center justify-center rounded border border-white/20 bg-white/5 px-2 py-2 text-center font-medium"
                            :style="{
                                gridRow: `${rowIndex + 1}`,
                                gridColumn: `2 / ${sortedTracks.length + 2}`,
                            }">
                            {{
                                findAllTrackSessionAt(sessions, slot.id)?.title
                            }}
                        </div>
                    </template>

                    <!-- Track cells -->
                    <template v-else>
                        <template
                            v-for="(track, colIndex) in sortedTracks"
                            :key="`${slot.id}-${track.id}`">
                            <div
                                v-if="
                                    isSlotCovered(
                                        sessions,
                                        track.id,
                                        slot.id,
                                        timeSlots
                                    )
                                "
                                :style="{
                                    gridRow: `${rowIndex + 1}`,
                                    gridColumn: `${colIndex + 2}`,
                                }" />

                            <div
                                v-else-if="
                                    findSessionAt(
                                        sessions,
                                        track.id,
                                        slot.id,
                                        timeSlots
                                    ) &&
                                    getSlotIndex(timeSlots, slot.id) ===
                                        getSlotIndex(
                                            timeSlots,
                                            findSessionAt(
                                                sessions,
                                                track.id,
                                                slot.id,
                                                timeSlots
                                            )!.startSlotId
                                        )
                                "
                                class="flex items-center rounded border border-white/15 bg-white/5 px-2 py-2 leading-snug"
                                :style="{
                                    gridRow: `${rowIndex + 1} / span ${getSlotSpan(
                                        timeSlots,
                                        findSessionAt(
                                            sessions,
                                            track.id,
                                            slot.id,
                                            timeSlots
                                        )!.startSlotId,
                                        findSessionAt(
                                            sessions,
                                            track.id,
                                            slot.id,
                                            timeSlots
                                        )!.endSlotId
                                    )}`,
                                    gridColumn: `${colIndex + 2}`,
                                }">
                                {{
                                    findSessionAt(
                                        sessions,
                                        track.id,
                                        slot.id,
                                        timeSlots
                                    )?.title
                                }}
                            </div>

                            <div
                                v-else
                                class="min-h-[48px] rounded border border-dashed border-white/10"
                                :style="{
                                    gridRow: `${rowIndex + 1}`,
                                    gridColumn: `${colIndex + 2}`,
                                }" />
                        </template>
                    </template>
                </template>
            </div>
        </div>
    </div>
</template>
