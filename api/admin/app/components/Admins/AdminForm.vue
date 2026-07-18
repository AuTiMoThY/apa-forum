<script lang="ts" setup>
import type { AdminForm, AdminFormErrors } from "~/types/admin";
import ImageUploadSingle from "~/components/Form/ImageUploadSingle.vue";
import FormDateField from "~/components/Form/DateField.vue";

const props = withDefaults(
    defineProps<{
        mode: "add" | "edit";
        initialData?: any;
        loading?: boolean;
    }>(),
    {
        loading: false
    }
);

const emit = defineEmits<{
    (e: "submit", data: AdminForm): void;
}>();

const password1Show = ref(false);
const password2Show = ref(false);

// RBAC 相關
const { data: roleData, fetchData: fetchRoles } = useRole();
const { data: permissionData, fetchData: fetchPermissions } =
    usePermissionData();
const { isSuperAdmin } = usePermission();

const { public: runtimePublic } = useRuntimeConfig();
const apiBase = runtimePublic.apiBase as string;

// 過濾角色列表：一般管理員不可選擇 super_admin
const filteredRoleData = computed(() => {
    if (isSuperAdmin()) {
        // 超級管理員可以看到所有角色
        return roleData.value || [];
    }
    // 一般管理員過濾掉 super_admin 角色
    return (roleData.value || []).filter(
        (role: any) => role.name !== "super_admin"
    );
});

const {
    addAdmin,
    editAdmin,
    loading,
    submitError,
    errors,
    form,
    clearError,
    loadDataToForm,
    validateFormForEdit
} = useUsers();

// 監聽角色資料變化，確保一般管理員無法選擇 super_admin
watch(
    [filteredRoleData, () => form.role_ids],
    () => {
        if (!isSuperAdmin() && roleData.value && form.role_ids) {
            // 找出 super_admin 角色的 ID
            const superAdminRole = roleData.value.find(
                (role: any) => role.name === "super_admin"
            );
            if (
                superAdminRole &&
                Array.isArray(form.role_ids) &&
                form.role_ids.includes(superAdminRole.id)
            ) {
                // 從表單中移除 super_admin 角色
                form.role_ids = form.role_ids.filter(
                    (id: number) => id !== superAdminRole.id
                );
            }
        }
    },
    { deep: true, immediate: true }
);

// 載入初始資料
const loadInitialData = (data: any) => {
    if (data) {
        loadDataToForm(data);
    }
};

// 監聽 initialData 變化
watch(
    () => props.initialData,
    (data) => {
        if (data) {
            loadInitialData(data);
        }
    },
    { immediate: true, deep: true }
);

const handleSubmit = async (event?: Event) => {
    if (event) event.preventDefault();

    // 若有頭像待上傳，先執行上傳再送出
    const photoRef = photoUploadRef.value as any;
    if (photoRef?.upload && typeof photoRef.upload === "function") {
        const ok = await photoRef.upload();
        if (ok === false) return;
    }

    if (props.mode === "edit") {
        // 編輯模式：使用 editAdmin，驗證時密碼可選
        if (!validateFormForEdit()) {
            return;
        }
        // 需要從 initialData 或路由獲取 adminId
        const adminId = props.initialData?.id;
        if (!adminId) {
            submitError.value = "缺少管理員 ID";
            return;
        }
        editAdmin(form, adminId);
    } else {
        // 新增模式：使用 addAdmin
        addAdmin(form);
    }
};

// 載入角色和權限資料
onMounted(async () => {
    await fetchRoles();
    await fetchPermissions();
});


// 暴露方法給父組件
const photoUploadRef = ref<InstanceType<typeof ImageUploadSingle> | null>(null);

defineExpose({
    loading,
    submit: handleSubmit
});
</script>

<template>
    <PageLoading v-if="loading" />
    <template v-else>
        <UForm :state="form" @submit="handleSubmit" class="">
            <section class="frm-bd grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <UCard :ui="{ body: 'space-y-4' }">
                    <template #header>
                        <h3 class="text-lg font-semibold">基本資訊</h3>
                    </template>

                    <FormStatusField
                        v-model="form.status"
                        label="狀態"
                        name="status"
                        :error="errors.status"
                        :disabled="loading" />

                    <UFormField
                        label="帳號"
                        name="username"
                        :error="errors.username"
                        required>
                        <UInput
                            v-model="form.username"
                            placeholder="請輸入帳號"
                            size="lg"
                            :disabled="loading"
                            class="w-full"
                            @input="clearError('username')" />
                    </UFormField>

                    <UFormField
                        :label="
                            mode === 'add' ? '密碼' : '密碼（留空則不修改）'
                        "
                        name="password"
                        :error="errors.password"
                        :required="mode === 'add'">
                        <UInput
                            v-model="form.password"
                            :type="password1Show ? 'text' : 'password'"
                            :placeholder="
                                mode === 'add'
                                    ? '請輸入密碼'
                                    : '請輸入新密碼（選填）'
                            "
                            size="lg"
                            :disabled="loading"
                            class="w-full"
                            @input="clearError('password')">
                            <template #trailing>
                                <UButton
                                    color="neutral"
                                    variant="link"
                                    size="sm"
                                    :icon="
                                        password1Show
                                            ? 'i-lucide-eye-off'
                                            : 'i-lucide-eye'
                                    "
                                    :aria-label="
                                        password1Show
                                            ? 'Hide password'
                                            : 'Show password'
                                    "
                                    :aria-pressed="password1Show"
                                    aria-controls="password"
                                    @click="password1Show = !password1Show" />
                            </template>
                        </UInput>
                    </UFormField>

                    <UFormField
                        :label="
                            mode === 'add'
                                ? '再次輸入密碼'
                                : '再次輸入密碼（選填）'
                        "
                        name="password_confirmation"
                        :error="errors.password_confirmation"
                        :required="mode === 'add'">
                        <UInput
                            v-model="form.password_confirmation"
                            :type="password2Show ? 'text' : 'password'"
                            :placeholder="
                                mode === 'add'
                                    ? '請再次輸入密碼'
                                    : '請再次輸入新密碼（選填）'
                            "
                            size="lg"
                            :disabled="loading"
                            class="w-full"
                            @input="clearError('password_confirmation')">
                            <template #trailing>
                                <UButton
                                    color="neutral"
                                    variant="link"
                                    size="sm"
                                    :icon="
                                        password2Show
                                            ? 'i-lucide-eye-off'
                                            : 'i-lucide-eye'
                                    "
                                    :aria-label="
                                        password2Show
                                            ? 'Hide password'
                                            : 'Show password'
                                    "
                                    :aria-pressed="password2Show"
                                    aria-controls="password"
                                    @click="password2Show = !password2Show" />
                            </template>
                        </UInput>
                    </UFormField>

                    <UFormField
                        label="帳目使用者"
                        name="name"
                        required
                        :error="errors.name">
                        <UInput
                            v-model="form.name"
                            type="text"
                            placeholder="請輸入姓名"
                            size="lg"
                            :disabled="loading"
                            class="w-full"
                            @input="clearError('name')" />
                    </UFormField>

                    <ImageUploadSingle
                        ref="photoUploadRef"
                        v-model="form.photo"
                        label="頭像／照片"
                        name="photo"
                        :error="errors.photo"
                        :disabled="loading"
                        upload-endpoint="/upload/admins"
                        :preview-base-url="`${apiBase}/uploads/admins/`"
                        preview-max-width="200px" />

                    <UFormField
                        label="個人簡介"
                        name="profile"
                        :error="errors.profile">
                        <UTextarea
                            v-model="form.profile"
                            :disabled="loading"
                            placeholder="可選，輸入管理員簡介"
                            autoresize
                            :ui="{ root: 'w-full' }"
                            @input="clearError('profile')" />
                    </UFormField>

                    <FormDateField
                        v-model="form.expiration_date"
                        label="帳號到期日"
                        name="expiration_date"
                        :error="errors.expiration_date"
                        :disabled="loading" />

                    <UFormField
                        label="財務備註"
                        name="note_finance"
                        :error="errors.note_finance">
                        <UTextarea
                            v-model="form.note_finance"
                            :disabled="loading"
                            placeholder="可選，與財務相關的說明"
                            autoresize
                            :ui="{ root: 'w-full' }"
                            @input="clearError('note_finance')" />
                    </UFormField>

                    <UFormField
                        label="寄貨備註"
                        name="note_deliver"
                        :error="errors.note_deliver">
                        <UTextarea
                            v-model="form.note_deliver"
                            :disabled="loading"
                            placeholder="可選，與寄貨相關的說明"
                            autoresize
                            :ui="{ root: 'w-full' }"
                            @input="clearError('note_deliver')" />
                    </UFormField>

                    <UFormField
                        label="採購備註"
                        name="note_purchase"
                        :error="errors.note_purchase">
                        <UTextarea
                            v-model="form.note_purchase"
                            :disabled="loading"
                            placeholder="可選，與採購相關的說明"
                            autoresize
                            :ui="{ root: 'w-full' }"
                            @input="clearError('note_purchase')" />
                    </UFormField>
                </UCard>

                <UCard :ui="{ body: 'space-y-4' }">
                    <template #header>
                        <h3 class="text-lg font-semibold">角色&權限</h3>
                    </template>

                    <UFormField
                        label="角色"
                        name="role_ids"
                        :error="errors.role_ids">
                        <div
                            class="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                            <div
                                v-if="filteredRoleData.length === 0"
                                class="text-sm text-gray-500">
                                暫無角色資料
                            </div>
                            <div v-else class="space-y-2">
                                <label
                                    v-for="role in filteredRoleData"
                                    :key="role.id"
                                    class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                    <input
                                        type="checkbox"
                                        :value="role.id"
                                        v-model="form.role_ids"
                                        :disabled="loading"
                                        class="rounded" />
                                    <span class="text-sm"
                                        >{{ role.label }} ({{
                                            role.name
                                        }})</span
                                    >
                                </label>
                            </div>
                        </div>
                    </UFormField>

                    <UFormField
                        label="直接權限（可選，會覆蓋角色權限）"
                        name="permission_ids"
                        :error="errors.permission_ids">
                        <div
                            class="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                            <div
                                v-if="permissionData.length === 0"
                                class="text-sm text-gray-500">
                                暫無權限資料
                            </div>
                            <div v-else class="space-y-2">
                                <label
                                    v-for="permission in permissionData"
                                    :key="permission.id"
                                    class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                    <input
                                        type="checkbox"
                                        :value="permission.id"
                                        v-model="form.permission_ids"
                                        :disabled="loading"
                                        class="rounded" />
                                    <span class="text-sm"
                                        >{{ permission.label }} ({{
                                            permission.name
                                        }})</span
                                    >
                                </label>
                            </div>
                        </div>
                    </UFormField>
                </UCard>
            </section>
            <section class="frm-ft">
                <div v-if="submitError" class="mt-4 text-sm text-red-500">
                    {{ submitError }}
                </div>

                <div class="mt-6 flex gap-4 justify-end">
                    <UButton
                        type="button"
                        color="neutral"
                        variant="ghost"
                        :disabled="loading"
                        to="/system/admins"
                        label="取消" />
                    <UButton
                        type="button"
                        :color="mode === 'add' ? 'primary' : 'success'"
                        :icon="mode === 'add' ? 'lucide:plus' : 'lucide:save'"
                        :loading="loading"
                        :disabled="loading"
                        @click="handleSubmit()"
                        :label="mode === 'add' ? '新增管理員' : '更新管理員'" />
                </div>
            </section>
        </UForm>
    </template>
</template>
