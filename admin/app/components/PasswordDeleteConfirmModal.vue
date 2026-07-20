<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });

interface Props {
    title?: string;
    description?: string;
    loading?: boolean;
    confirmLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: "確認刪除",
    confirmLabel: "確認刪除",
    loading: false
});

const emit = defineEmits<{
    confirm: [password: string];
}>();

const password = ref("");
const isShowPassword = ref(false);
const toast = useToast();

watch(open, (isOpen) => {
    if (isOpen) {
        password.value = "";
        isShowPassword.value = false;
    }
});

function submit() {
    if (!password.value.trim()) {
        toast.add({ title: "請輸入登入密碼", color: "warning" });
        return;
    }
    emit("confirm", password.value);
}
</script>

<template>
    <UModal v-model:open="open" :title="props.title">
        <template #body>
            <div>
                <p v-if="props.description" class="mb-4 text-sm text-muted">
                    {{ props.description }}
                </p>
                <UFormField label="登入密碼" required>
                    <UInput
                        v-model="password"
                        :type="isShowPassword ? 'text' : 'password'"
                        placeholder="請輸入登入密碼"
                        size="lg"
                        :disabled="props.loading"
                        class="w-full"
                        data-autofocus
                        @keydown.enter.prevent="submit">
                        <template #trailing>
                            <UButton
                                color="neutral"
                                variant="link"
                                size="sm"
                                :icon="
                                    isShowPassword
                                        ? 'i-lucide-eye-off'
                                        : 'i-lucide-eye'
                                "
                                :aria-label="
                                    isShowPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                "
                                :aria-pressed="isShowPassword"
                                aria-controls="password"
                                @click="isShowPassword = !isShowPassword" />
                        </template>
                    </UInput>
                </UFormField>
                <div class="mt-4 flex justify-end gap-2">
                    <UButton
                        variant="outline"
                        color="neutral"
                        label="取消"
                        :disabled="props.loading"
                        @click="open = false" />
                    <UButton
                        color="error"
                        icon="i-lucide-trash-2"
                        :label="props.confirmLabel"
                        :loading="props.loading"
                        @click="submit" />
                </div>
            </div>
        </template>
    </UModal>
</template>
