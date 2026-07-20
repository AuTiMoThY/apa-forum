<script setup lang="ts">
definePageMeta({
    layout: false, // 不使用預設 layout
    middleware: "auth" // 使用 auth middleware（會在已登入時導向首頁）
});

useSeoMeta({
  title: '登入'
})

const router = useRouter();
const { login } = useAuth();

const REMEMBER_KEY = "remembered_username";

const form = reactive({
    username: "",
    password: ""
});

const loading = ref(false);
const errorMessage = ref("");
const isShowPassword = ref(false);
const rememberAccount = ref(false);

// 進入頁面時，若有儲存的帳號則帶入（在 client 掛載後讀取，避免 SSR 水合不一致）
onMounted(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
        form.username = saved;
        rememberAccount.value = true;
    }
});

const handleLogin = async () => {
    loading.value = true;
    errorMessage.value = "";

    try {
        const result = await login(form.username, form.password);

        if (result.success) {
            if (rememberAccount.value && import.meta.client) {
                localStorage.setItem(REMEMBER_KEY, form.username);
            } else if (import.meta.client) {
                localStorage.removeItem(REMEMBER_KEY);
            }
            // 登入成功，導向首頁
            await router.push("/");
        } else {
            // 顯示錯誤訊息
            errorMessage.value = result.message;
        }
    } catch (error: any) {
        errorMessage.value = error.message || "登入時發生錯誤";
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div
        class="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <h1 class="text-3xl text-primary-900 dark:text-white">2026 國際動物保護論壇</h1>
        <UCard class="w-full max-w-md">
            <template #header>
                <div class="text-center">
                    <h2
                        class="text-2xl font-bold text-gray-600 dark:text-white">
                        後台管理系統
                    </h2>
                </div>
            </template>

            <UForm :state="form" @submit="handleLogin" class="space-y-4">
                <UFormField label="帳號" name="username" required>
                    <UInput
                        v-model="form.username"
                        placeholder="請輸入帳號"
                        size="lg"
                        :disabled="loading"
                        class="w-full" />
                </UFormField>

                <UFormField label="密碼" name="password" required>
                    <UInput
                        v-model="form.password"
                        :type="isShowPassword ? 'text' : 'password'"
                        placeholder="請輸入密碼"
                        size="lg"
                        :disabled="loading"
                        class="w-full">
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

                <div class="flex items-center gap-2">
                    <UCheckbox
                        v-model="rememberAccount"
                        :disabled="loading"
                        label="記住我的帳號" />
                </div>

                <div v-if="errorMessage" class="text-sm text-red-500">
                    {{ errorMessage }}
                </div>

                <UButton
                    type="submit"
                    block
                    size="lg"
                    :loading="loading"
                    :disabled="loading">
                    登入
                </UButton>
            </UForm>
        </UCard>
    </div>
</template>
