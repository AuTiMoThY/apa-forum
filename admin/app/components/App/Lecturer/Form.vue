<script setup lang="ts">
import ImageUploadSingle from "~/components/Form/ImageUploadSingle.vue";
import type { LecturerForm, LecturerFormErrors } from "~/types/LecturerForm";

const props = withDefaults(
    defineProps<{
        mode: "add" | "edit";
        initialData?: any;
        returnTo?: string;
    }>(),
    {}
);

const emit = defineEmits<{
    (e: "success"): void;
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
    addLecturer,
    updateLecturer
} = useAppLecturer();

const imageUploadRef = ref<InstanceType<typeof ImageUploadSingle> | null>(null);

const lecturerUploadEndpoint = `${apiBase}/upload/lecturer`;
const lecturerPreviewBase = `${apiBase}/uploads/lecturer/`;

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
    const imageRef = imageUploadRef.value as any;
    if (imageRef?.upload && typeof imageRef.upload === "function") {
        const ok = await imageRef.upload();
        if (ok === false) return;
    }

    if (props.mode === "edit") {
        const id = props.initialData?.id;
        if (!id) {
            submitError.value = "缺少講師 ID";
            return;
        }

        const success = await updateLecturer(Number(id), {
            onSuccess: () => {
                emit("success");
                router.push(props.returnTo || "/lecturer");
            }
        });
        if (!success) return;
    } else {
        const success = await addLecturer({
            onSuccess: () => {
                emit("success");
                router.push(props.returnTo || "/lecturer");
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
    <PageLoading v-if="loading && !form.name && mode === 'edit'" />

    <UForm v-else :state="form" class="space-y-6" @submit="handleSubmit">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <UCard class="lg:col-span-1" :ui="{ body: 'space-y-4' }">
                <template #header>
                    <h3 class="text-lg font-semibold">照片</h3>
                </template>

                <ImageUploadSingle
                    ref="imageUploadRef"
                    v-model="form.image"
                    label="講師照片"
                    name="image"
                    :error="errors.image"
                    :disabled="loading"
                    :upload-endpoint="lecturerUploadEndpoint"
                    :preview-base-url="lecturerPreviewBase"
                    preview-max-width="240px"
                    preview-aspect-ratio="3/4" />
            </UCard>

            <UCard class="lg:col-span-2" :ui="{ body: 'space-y-4' }">
                <template #header>
                    <h3 class="text-lg font-semibold">基本資料</h3>
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
                        label="姓名"
                        name="name"
                        :error="errors.name"
                        required
                        class="">
                        <UInput
                            v-model="form.name"
                            placeholder="請輸入講師姓名"
                            size="lg"
                            class="w-full"
                            :disabled="loading"
                            @input="clearError('name')" />
                    </UFormField>

                    <UFormField label="頭銜" name="title" :error="errors.title">
                        <UInput
                            v-model="form.title"
                            placeholder="請輸入講師頭銜"
                            size="lg"
                            class="w-full"
                            :disabled="loading"
                            @input="clearError('title')" />
                    </UFormField>



                    <UFormField
                        label="介紹"
                        name="intro"
                        :error="errors.intro"
                        class="">
                        <UTextarea
                            v-model="form.intro"
                            placeholder="請輸入講師簡介"
                            :rows="4"
                            autoresize
                            class="w-full"
                            :disabled="loading"
                            @input="clearError('intro')" />
                    </UFormField>
                </div>
            </UCard>
        </div>

        <UCard :ui="{ body: 'space-y-4' }">
            <template #header>
                <h3 class="text-lg font-semibold">演講主題</h3>
            </template>
            <UFormField
                label="標題"
                name="heading"
                :error="errors.heading"
                class="sm:col-span-2">
                <UInput
                    v-model="form.heading"
                    placeholder=""
                    size="lg"
                    class="w-full"
                    :disabled="loading"
                    @input="clearError('heading')" />
            </UFormField>
            <UFormField label="內文" name="content" :error="errors.content">
                <TiptapEditor
                    v-model="form.content"
                    :upload-endpoint="`${apiBase}/upload/image`" />
            </UFormField>
        </UCard>

        <div v-if="submitError" class="text-sm text-red-500 dark:text-red-400">
            {{ submitError }}
        </div>
    </UForm>
</template>
