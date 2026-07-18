import type {
    BreakoutGroupForm,
    BreakoutGroupFormErrors,
    BreakoutGroupItem,
    BreakoutGroupListItem,
    BreakoutLecturerForm,
    BreakoutLecturerFormErrors,
    BreakoutLecturerItem,
    BreakoutLecturerListItem
} from "~/types/BreakoutSessionForm";

const defaultGroupForm = (): BreakoutGroupForm => ({
    code: "",
    title: "",
    content: "",
    sort_order: 0
});

const defaultLecturerForm = (): BreakoutLecturerForm => ({
    name: "",
    image: "",
    title: "",
    intro: "",
    sort_order: 0
});

export const useAppBreakoutSession = () => {
    const { public: runtimePublic } = useRuntimeConfig();
    const apiBase = runtimePublic.apiBase as string;
    const toast = useToast();
    const router = useRouter();

    const data = useState<BreakoutGroupListItem[]>("breakout-session-data", () => []);
    const loading = useState("breakout-session-loading", () => false);
    const submitError = ref("");

    const form = reactive<BreakoutGroupForm>(defaultGroupForm());
    const errors = reactive<BreakoutGroupFormErrors>({
        code: false,
        title: false
    });

    const lecturerForm = reactive<BreakoutLecturerForm>(defaultLecturerForm());
    const lecturerErrors = reactive<BreakoutLecturerFormErrors>({
        name: false
    });
    const lecturerSubmitError = ref("");

    const fetchData = async () => {
        loading.value = true;
        try {
            const res = await $fetch<{
                success: boolean;
                data?: BreakoutGroupListItem[];
                message?: string;
            }>(`${apiBase}/breakout-session/get`, {
                method: "GET",
                credentials: "include"
            });

            if (res?.success && Array.isArray(res.data)) {
                data.value = res.data;
            } else {
                toast.add({
                    title: res?.message || "取得組別列表失敗",
                    color: "error"
                });
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            toast.add({
                title: err?.data?.message || err?.message || "取得組別列表失敗",
                color: "error"
            });
        } finally {
            loading.value = false;
        }
    };

    const getById = async (id: number): Promise<BreakoutGroupItem | null> => {
        loading.value = true;
        try {
            const res = await $fetch<{
                success: boolean;
                data?: BreakoutGroupItem;
                message?: string;
            }>(`${apiBase}/breakout-session/get-by-id?id=${id}`, {
                method: "GET",
                credentials: "include"
            });

            if (res?.success && res.data) {
                return res.data;
            }

            toast.add({
                title: res?.message || "取得組別資料失敗",
                color: "error"
            });
            return null;
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            toast.add({
                title: err?.data?.message || err?.message || "取得組別資料失敗",
                color: "error"
            });
            return null;
        } finally {
            loading.value = false;
        }
    };

    const fetchLecturers = async (
        groupId: number
    ): Promise<BreakoutLecturerListItem[]> => {
        try {
            const res = await $fetch<{
                success: boolean;
                data?: BreakoutLecturerListItem[];
                message?: string;
            }>(`${apiBase}/breakout-session/get-lecturers?group_id=${groupId}`, {
                method: "GET",
                credentials: "include"
            });

            if (res?.success && Array.isArray(res.data)) {
                return res.data;
            }

            toast.add({
                title: res?.message || "取得講師列表失敗",
                color: "error"
            });
            return [];
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            toast.add({
                title: err?.data?.message || err?.message || "取得講師列表失敗",
                color: "error"
            });
            return [];
        }
    };

    const getLecturerById = async (
        id: number
    ): Promise<BreakoutLecturerItem | null> => {
        try {
            const res = await $fetch<{
                success: boolean;
                data?: BreakoutLecturerItem;
                message?: string;
            }>(`${apiBase}/breakout-session/get-lecturer-by-id?id=${id}`, {
                method: "GET",
                credentials: "include"
            });

            if (res?.success && res.data) {
                return res.data;
            }

            toast.add({
                title: res?.message || "取得講師資料失敗",
                color: "error"
            });
            return null;
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            toast.add({
                title: err?.data?.message || err?.message || "取得講師資料失敗",
                color: "error"
            });
            return null;
        }
    };

    const resetForm = () => {
        Object.assign(form, defaultGroupForm());
        errors.code = false;
        errors.title = false;
        submitError.value = "";
    };

    const loadFormData = (item: BreakoutGroupItem) => {
        form.code = item.code ?? "";
        form.title = item.title ?? "";
        form.content = item.content ?? "";
        form.sort_order = item.sort_order ?? 0;
    };

    const clearError = (field: keyof BreakoutGroupFormErrors) => {
        errors[field] = false;
    };

    const validateForm = (): boolean => {
        let valid = true;

        if (!form.code?.trim()) {
            errors.code = "請輸入代號";
            valid = false;
        } else {
            errors.code = false;
        }

        if (!form.title?.trim()) {
            errors.title = "請輸入標題";
            valid = false;
        } else {
            errors.title = false;
        }

        return valid;
    };

    const buildGroupPayload = () => ({
        code: form.code.trim(),
        title: form.title.trim(),
        content: form.content?.trim() || null,
        sort_order: Number(form.sort_order) || 0
    });

    const addGroup = async (options?: {
        onSuccess?: (id: number) => void;
    }): Promise<boolean> => {
        if (!validateForm()) {
            return false;
        }

        loading.value = true;
        submitError.value = "";

        try {
            const res = await $fetch<{
                success: boolean;
                message?: string;
                data?: { id: number };
            }>(`${apiBase}/breakout-session/add`, {
                method: "POST",
                body: buildGroupPayload(),
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (res?.success) {
                toast.add({
                    title: res.message || "新增組別成功",
                    color: "success"
                });
                options?.onSuccess?.(res.data?.id ?? 0);
                return true;
            }

            submitError.value = res?.message || "新增組別失敗";
            toast.add({ title: submitError.value, color: "error" });
            return false;
        } catch (error: unknown) {
            const err = error as {
                data?: { errors?: Record<string, string | string[]>; message?: string };
                message?: string;
            };
            const errData = err?.data;
            if (errData?.errors) {
                Object.entries(errData.errors).forEach(([k, v]) => {
                    if (k in errors) {
                        (errors as Record<string, string | boolean>)[k] = Array.isArray(v)
                            ? v.join(", ")
                            : v;
                    }
                });
            }
            submitError.value = errData?.message || err?.message || "新增組別失敗";
            toast.add({ title: submitError.value, color: "error" });
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateGroup = async (
        id: number,
        options?: { onSuccess?: () => void }
    ): Promise<boolean> => {
        if (!validateForm()) {
            return false;
        }

        loading.value = true;
        submitError.value = "";

        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/breakout-session/update`,
                {
                    method: "POST",
                    body: { id, ...buildGroupPayload() },
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );

            if (res?.success) {
                toast.add({
                    title: res.message || "更新組別成功",
                    color: "success"
                });
                options?.onSuccess?.();
                return true;
            }

            submitError.value = res?.message || "更新組別失敗";
            toast.add({ title: submitError.value, color: "error" });
            return false;
        } catch (error: unknown) {
            const err = error as {
                data?: { errors?: Record<string, string | string[]>; message?: string };
                message?: string;
            };
            const errData = err?.data;
            if (errData?.errors) {
                Object.entries(errData.errors).forEach(([k, v]) => {
                    if (k in errors) {
                        (errors as Record<string, string | boolean>)[k] = Array.isArray(v)
                            ? v.join(", ")
                            : v;
                    }
                });
            }
            submitError.value = errData?.message || err?.message || "更新組別失敗";
            toast.add({ title: submitError.value, color: "error" });
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateSortOrder = async (
        id: number,
        sortOrder: number
    ): Promise<boolean> => {
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/breakout-session/update-sort-order`,
                {
                    method: "POST",
                    body: { id, sort_order: sortOrder },
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );

            if (res?.success) {
                toast.add({
                    title: res.message || "更新排序成功",
                    color: "success"
                });
                return true;
            }

            toast.add({
                title: res?.message || "更新排序失敗",
                color: "error"
            });
            return false;
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            toast.add({
                title: err?.data?.message || err?.message || "更新排序失敗",
                color: "error"
            });
            return false;
        }
    };

    const deleteGroup = async (
        item: BreakoutGroupListItem | { id: number },
        options?: { onSuccess?: () => void }
    ): Promise<boolean> => {
        const id = item?.id;
        if (!id) {
            return false;
        }

        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/breakout-session/delete`,
                {
                    method: "POST",
                    body: { id },
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );

            if (res?.success) {
                toast.add({
                    title: res.message || "刪除組別成功",
                    color: "success"
                });
                options?.onSuccess?.();
                return true;
            }

            toast.add({
                title: res?.message || "刪除組別失敗",
                color: "error"
            });
            return false;
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            toast.add({
                title: err?.data?.message || err?.message || "刪除組別失敗",
                color: "error"
            });
            return false;
        }
    };

    const resetLecturerForm = () => {
        Object.assign(lecturerForm, defaultLecturerForm());
        lecturerErrors.name = false;
        lecturerSubmitError.value = "";
    };

    const loadLecturerFormData = (item: BreakoutLecturerItem) => {
        lecturerForm.name = item.name ?? "";
        lecturerForm.image = item.image ?? "";
        lecturerForm.title = item.title ?? "";
        lecturerForm.intro = item.intro ?? "";
        lecturerForm.sort_order = item.sort_order ?? 0;
    };

    const clearLecturerError = (field: keyof BreakoutLecturerFormErrors) => {
        lecturerErrors[field] = false;
    };

    const validateLecturerForm = (): boolean => {
        let valid = true;

        if (!lecturerForm.name?.trim()) {
            lecturerErrors.name = "請輸入姓名";
            valid = false;
        } else {
            lecturerErrors.name = false;
        }

        return valid;
    };

    const buildLecturerPayload = (groupId: number) => ({
        group_id: groupId,
        name: lecturerForm.name.trim(),
        image: lecturerForm.image?.trim() || null,
        title: lecturerForm.title?.trim() || null,
        intro: lecturerForm.intro?.trim() || null,
        sort_order: Number(lecturerForm.sort_order) || 0
    });

    const addLecturer = async (
        groupId: number,
        options?: { onSuccess?: () => void }
    ): Promise<boolean> => {
        if (!validateLecturerForm()) {
            return false;
        }

        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/breakout-session/add-lecturer`,
                {
                    method: "POST",
                    body: buildLecturerPayload(groupId),
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );

            if (res?.success) {
                toast.add({
                    title: res.message || "新增講師成功",
                    color: "success"
                });
                options?.onSuccess?.();
                return true;
            }

            lecturerSubmitError.value = res?.message || "新增講師失敗";
            toast.add({ title: lecturerSubmitError.value, color: "error" });
            return false;
        } catch (error: unknown) {
            const err = error as {
                data?: { errors?: Record<string, string | string[]>; message?: string };
                message?: string;
            };
            const errData = err?.data;
            if (errData?.errors) {
                Object.entries(errData.errors).forEach(([k, v]) => {
                    if (k in lecturerErrors) {
                        (lecturerErrors as Record<string, string | boolean>)[k] =
                            Array.isArray(v) ? v.join(", ") : v;
                    }
                });
            }
            lecturerSubmitError.value =
                errData?.message || err?.message || "新增講師失敗";
            toast.add({ title: lecturerSubmitError.value, color: "error" });
            return false;
        }
    };

    const updateLecturer = async (
        id: number,
        groupId: number,
        options?: { onSuccess?: () => void }
    ): Promise<boolean> => {
        if (!validateLecturerForm()) {
            return false;
        }

        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/breakout-session/update-lecturer`,
                {
                    method: "POST",
                    body: { id, ...buildLecturerPayload(groupId) },
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );

            if (res?.success) {
                toast.add({
                    title: res.message || "更新講師成功",
                    color: "success"
                });
                options?.onSuccess?.();
                return true;
            }

            lecturerSubmitError.value = res?.message || "更新講師失敗";
            toast.add({ title: lecturerSubmitError.value, color: "error" });
            return false;
        } catch (error: unknown) {
            const err = error as {
                data?: { errors?: Record<string, string | string[]>; message?: string };
                message?: string;
            };
            const errData = err?.data;
            if (errData?.errors) {
                Object.entries(errData.errors).forEach(([k, v]) => {
                    if (k in lecturerErrors) {
                        (lecturerErrors as Record<string, string | boolean>)[k] =
                            Array.isArray(v) ? v.join(", ") : v;
                    }
                });
            }
            lecturerSubmitError.value =
                errData?.message || err?.message || "更新講師失敗";
            toast.add({ title: lecturerSubmitError.value, color: "error" });
            return false;
        }
    };

    const updateLecturerSortOrder = async (
        id: number,
        sortOrder: number
    ): Promise<boolean> => {
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/breakout-session/update-lecturer-sort-order`,
                {
                    method: "POST",
                    body: { id, sort_order: sortOrder },
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );

            if (res?.success) {
                toast.add({
                    title: res.message || "更新排序成功",
                    color: "success"
                });
                return true;
            }

            toast.add({
                title: res?.message || "更新排序失敗",
                color: "error"
            });
            return false;
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            toast.add({
                title: err?.data?.message || err?.message || "更新排序失敗",
                color: "error"
            });
            return false;
        }
    };

    const deleteLecturer = async (
        item: BreakoutLecturerListItem | { id: number },
        options?: { onSuccess?: () => void }
    ): Promise<boolean> => {
        const id = item?.id;
        if (!id) {
            return false;
        }

        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/breakout-session/delete-lecturer`,
                {
                    method: "POST",
                    body: { id },
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );

            if (res?.success) {
                toast.add({
                    title: res.message || "刪除講師成功",
                    color: "success"
                });
                options?.onSuccess?.();
                return true;
            }

            toast.add({
                title: res?.message || "刪除講師失敗",
                color: "error"
            });
            return false;
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            toast.add({
                title: err?.data?.message || err?.message || "刪除講師失敗",
                color: "error"
            });
            return false;
        }
    };

    const loadGroupData = async (id: number) => {
        const item = await getById(id);
        if (item) {
            loadFormData(item);
            return item;
        }

        router.push("/breakout-session");
        return null;
    };

    return {
        data,
        loading,
        submitError,
        form,
        errors,
        lecturerForm,
        lecturerErrors,
        lecturerSubmitError,
        fetchData,
        getById,
        fetchLecturers,
        getLecturerById,
        resetForm,
        loadFormData,
        clearError,
        validateForm,
        addGroup,
        updateGroup,
        updateSortOrder,
        deleteGroup,
        resetLecturerForm,
        loadLecturerFormData,
        clearLecturerError,
        addLecturer,
        updateLecturer,
        updateLecturerSortOrder,
        deleteLecturer,
        loadGroupData
    };
};
