<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        mode: "add" | "edit";
        initialData?: any;
    }>(),
    {}
);

const emit = defineEmits<{
    (e: "success", id?: number): void;
}>();

const router = useRouter();
const { public: runtimePublic } = useRuntimeConfig();
const apiBase = runtimePublic.apiBase as string;

const {
    loading,
    submitError,
    form,
    errors,
    clearError,
    resetForm,
    loadFormData,
    addGroup,
    updateGroup
} = useAppBreakoutSession();

watch(
    () => props.initialData,
    (data) => {
        if (data) {
            loadFormData(data);
        }
    },
    { immediate: true, deep: true }
);

onMounted(() => {
    if (props.mode === "add") {
        resetForm();
    }
});

const handleSubmit = async () => {
    if (props.mode === "edit") {
        const id = props.initialData?.id;
        if (!id) {
            submitError.value = "缺少組別 ID";
            return;
        }

        const success = await updateGroup(Number(id), {
            onSuccess: () => emit("success")
        });
        if (!success) return;
    } else {
        const success = await addGroup({
            onSuccess: (id) => {
                emit("success", id);
                if (id) {
                    router.push(`/breakout-session/edit/${id}`);
                } else {
                    router.push("/breakout-session");
                }
            }
        });
        if (!success) return;
    }
};

defineExpose({
    loading,
    submit: handleSubmit
});
</script>

<template>
    <PageLoading v-if="loading && !form.code && mode === 'edit'" />

    <UForm v-else :state="form" class="space-y-6" @submit="handleSubmit">
        <UCard :ui="{ body: 'space-y-4' }">
            <template #header>
                <h3 class="text-lg font-semibold">組別資料</h3>
            </template>

            <div class="grid grid-cols-1 gap-4">

                <UFormField
                    label="排序"
                    name="sort_order"
                    :error="errors.sort_order"
                    description="數字越小越前面">
                    <UInput
                        v-model.number="form.sort_order"
                        type="number"
                        min="0"
                        size="lg"
                        class="w-full"
                        :disabled="loading" />
                </UFormField>

                <UFormField
                    label="代號"
                    name="code"
                    :error="errors.code"
                    required>
                    <UInput
                        v-model="form.code"
                        placeholder="例如：A、B、C"
                        size="lg"
                        class="w-full"
                        :disabled="loading"
                        @input="clearError('code')" />
                </UFormField>


                <UFormField
                    label="標題"
                    name="title"
                    :error="errors.title"
                    required>
                    <UInput
                        v-model="form.title"
                        placeholder="請輸入組別標題"
                        size="lg"
                        class="w-full"
                        :disabled="loading"
                        @input="clearError('title')" />
                </UFormField>

                <UFormField
                    label="內文"
                    name="content"
                    :error="errors.content">
                    <TiptapEditor
                        v-model="form.content"
                        :upload-endpoint="`${apiBase}/upload/image`" />
                </UFormField>
            </div>
        </UCard>

        <div v-if="submitError" class="text-sm text-red-500 dark:text-red-400">
            {{ submitError }}
        </div>
    </UForm>
</template>
