<script lang="ts" setup>
import type { ExampleSession, ExampleTimeSlot, ExampleTrack } from "./_mock";
import { checkSessionConflict, nextExampleId, sortByOrder } from "./_mock";

const props = defineProps<{
    tracks: ExampleTrack[];
    timeSlots: ExampleTimeSlot[];
    sessions: ExampleSession[];
    open: boolean;
    editing: ExampleSession | null;
    defaultTrackId?: string | null;
    defaultSlotId?: string;
}>();

const emit = defineEmits<{
    "update:open": [value: boolean];
    save: [session: ExampleSession];
    remove: [id: string];
}>();

const form = ref<ExampleSession>({
    id: "",
    title: "",
    trackId: null,
    startSlotId: "",
    endSlotId: "",
    type: "",
});

const error = ref("");

const sortedSlots = computed(() => sortByOrder(props.timeSlots));

const slotOptions = computed(() =>
    sortedSlots.value.map((s) => ({
        label: `${s.start} – ${s.end}`,
        value: s.id,
    }))
);

const trackOptions = computed(() => [
    { label: "全軌（Break / 全員）", value: "__all__" },
    ...sortByOrder(props.tracks).map((t) => ({
        label: t.name,
        value: t.id,
    })),
]);

watch(
    () => props.open,
    (isOpen) => {
        if (!isOpen) return;
        error.value = "";
        if (props.editing) {
            form.value = { ...props.editing };
        } else {
            const firstSlot = sortedSlots.value[0];
            form.value = {
                id: nextExampleId("new"),
                title: "",
                trackId: props.defaultTrackId ?? props.tracks[0]?.id ?? null,
                startSlotId: props.defaultSlotId ?? firstSlot?.id ?? "",
                endSlotId: props.defaultSlotId ?? firstSlot?.id ?? "",
                type: "",
            };
        }
    },
    { immediate: true }
);

const isAllTrack = computed({
    get: () => form.value.trackId === null,
    set: (val: boolean) => {
        form.value.trackId = val
            ? null
            : props.tracks[0]?.id ?? null;
    },
});

const handleSave = () => {
    error.value = "";
    if (!form.value.title.trim()) {
        error.value = "請輸入標題";
        return;
    }
    const candidate = {
        ...form.value,
        title: form.value.title.trim(),
        startSlotId: form.value.startSlotId,
        endSlotId: form.value.endSlotId || form.value.startSlotId,
    };
    if (candidate.trackId === null) {
        candidate.endSlotId = candidate.startSlotId;
    }
    const conflict = checkSessionConflict(
        props.sessions,
        candidate,
        props.timeSlots
    );
    if (conflict) {
        error.value = conflict;
        return;
    }
    emit("save", candidate);
    emit("update:open", false);
};

const handleRemove = () => {
    emit("remove", form.value.id);
    emit("update:open", false);
};
</script>

<template>
    <UModal
        :open="open"
        :title="editing ? '編輯場次' : '新增場次'"
        @update:open="emit('update:open', $event)">
        <template #body>
            <div class="space-y-4">
                <UFormField label="標題">
                    <UInput
                        v-model="form.title"
                        placeholder="場次標題"
                        class="w-full" />
                </UFormField>

                <UFormField label="類型">
                    <UInput
                        v-model="form.type"
                        placeholder="如 Keynote、Break（選填）"
                        class="w-full" />
                </UFormField>

                <UCheckbox v-model="isAllTrack" label="全軌事件（橫跨所有 track）" />

                <UFormField v-if="!isAllTrack" label="軌道">
                    <USelect
                        :model-value="form.trackId ?? undefined"
                        :items="trackOptions.filter((o) => o.value !== '__all__')"
                        value-key="value"
                        class="w-full"
                        @update:model-value="form.trackId = $event as string" />
                </UFormField>

                <div class="grid gap-3 sm:grid-cols-2">
                    <UFormField label="起始時段">
                        <USelect
                            v-model="form.startSlotId"
                            :items="slotOptions"
                            value-key="value"
                            class="w-full" />
                    </UFormField>
                    <UFormField label="結束時段">
                        <USelect
                            v-model="form.endSlotId"
                            :items="slotOptions"
                            value-key="value"
                            class="w-full"
                            :disabled="isAllTrack" />
                    </UFormField>
                </div>

                <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

                <div class="flex justify-between gap-2 pt-2">
                    <UButton
                        v-if="editing"
                        label="刪除"
                        color="error"
                        variant="ghost"
                        icon="i-lucide-trash-2"
                        @click="handleRemove" />
                    <div v-else />
                    <div class="flex gap-2">
                        <UButton
                            label="取消"
                            color="neutral"
                            variant="outline"
                            @click="emit('update:open', false)" />
                        <UButton
                            label="確定"
                            color="primary"
                            @click="handleSave" />
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>
