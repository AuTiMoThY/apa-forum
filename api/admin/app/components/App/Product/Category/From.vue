<script setup lang="ts">
import type {
    ProductCategoryForm,
    ProductCategoryFormErrors
} from "~/types/ProductCategoryForm";
import ImageUploadSingle from "~/components/Form/ImageUploadSingle.vue";

const props = defineProps<{
    form: ProductCategoryForm;
    errors: ProductCategoryFormErrors;
    loading?: boolean;
    region: any;
    mode: "add" | "edit";
    previewBaseUrl?: string;
    /** 上傳 API（如 /upload/product-category），未傳則使用預設 /upload/image */
    uploadEndpoint?: string;
    validate: () => boolean;
}>();

const emit = defineEmits<{
    (e: "submit"): void;
}>();

const pic_upload_ref = ref<InstanceType<typeof ImageUploadSingle> | null>(null);

const handleSubmitClick = () => {
    emit("submit");
};

const uploadPic = async () => {
    const picUploadRef = pic_upload_ref.value as any;
    if (picUploadRef?.upload && typeof picUploadRef.upload === "function") {
        const ok = await picUploadRef.upload();
        if (ok === false) return false;
    }
    return true;
};

defineExpose({
    uploadPic
});
</script>

<template>
    <UForm :state="props.form" class="space-y-4 w-full">
        <section class="frm-bd flex gap-4 w-full">
            <UCard
                :ui="{
                    body: 'flex flex-col gap-4 ',
                    root: 'flex-[40%] order-2'
                }">
                <template #header>
                    <h3 class="text-lg font-bold">
                        狀態/排序
                    </h3>
                </template>
                <FormOnlineStatus
                    :value="props.form.chkdel"
                    @update:value="(val: number) => (props.form.chkdel = val)" />
                <FormPOSStatus
                    :value="props.form.onTop"
                    @update:value="(val: number) => (props.form.onTop = val)" />
                <FormSortField
                    :value="props.form.classordernum"
                    @update:value="(val: number) => (props.form.classordernum = val)" />
            </UCard>
            <UCard
                :ui="{
                    body: 'flex flex-col gap-4',
                    root: 'flex-[60%] order-1'
                }">
                <template #header>
                    <h3 class="text-lg font-bold">
                        基本資料
                    </h3>
                </template>
                <UFormField :label="`產品圖片資料夾名稱\nFolder name`" name="folderName">
                    <UInput
                        v-model="props.form.folderName"
                        placeholder="選填" />
                </UFormField>
                <UFormField :label="`類別編號\nNumbers`" name="classseries" required>
                    <UInput
                        v-model="props.form.classseries"
                        :placeholder="props.mode === 'add' ? '選填' : '選填'"
                    />
                </UFormField>
                <UFormField
                    :label="`類別名稱\nName`"
                    name="classname"
                    :error="props.errors.classname"
                    required>
                    <UInput
                        v-model="props.form.classname"
                        placeholder="請輸入類別名稱"
                        @blur="props.validate()" />
                </UFormField>
                <ImageUploadSingle
                    ref="pic_upload_ref"
                    v-model="props.form.pic"
                    :label="`類別圖片\nPicture`"
                    name="pic"
                    :preview-base-url="props.previewBaseUrl"
                    :upload-endpoint="props.uploadEndpoint"
                    preview-max-width="300px" />
            </UCard>
        </section>
        <section class="frm-ft">
            <div class="flex gap-2 justify-end">
                <UButton
                    label="取消 Cancel"
                    color="neutral"
                    variant="ghost"
                    :to="{
                        path: '/product/category',
                        query: { region: props.region }
                    }" />
                <UButton
                    :label="props.mode === 'add' ? '確定新增 Submit' : '確定儲存 Submit'"
                    color="primary"
                    :loading="props.loading"
                    @click="handleSubmitClick" />
            </div>
        </section>
    </UForm>
</template>

