import type {
    LecturerForm,
    LecturerFormErrors,
    LecturerItem,
    LecturerListItem
} from "~/types/LecturerForm";

const defaultForm = (): LecturerForm => ({
    name: "",
    image: "",
    title: "",
    intro: "",
    heading: "",
    content: "",
    sort_order: 0
});

export const useAppLecturer = () => {
    const { public: runtimePublic } = useRuntimeConfig();
    const apiBase = runtimePublic.apiBase as string;
    const toast = useToast();
    const router = useRouter();

    const data = useState<LecturerListItem[]>("lecturer-data", () => []);
    const loading = useState("lecturer-loading", () => false);
    const submitError = ref("");

    const form = reactive<LecturerForm>(defaultForm());
    const errors = reactive<LecturerFormErrors>({
        name: false
    });

    const fetchData = async () => {
        loading.value = true;
        try {
            const res = await $fetch<{
                success: boolean;
                data?: LecturerListItem[];
                message?: string;
            }>(`${apiBase}/lecturer/get`, {
                method: "GET",
                credentials: "include"
            });

            if (res?.success && Array.isArray(res.data)) {
                data.value = res.data;
            } else {
                toast.add({
                    title: res?.message || "取得講師列表失敗",
                    color: "error"
                });
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            toast.add({
                title: err?.data?.message || err?.message || "取得講師列表失敗",
                color: "error"
            });
        } finally {
            loading.value = false;
        }
    };

    const getById = async (id: number): Promise<LecturerItem | null> => {
        loading.value = true;
        try {
            const res = await $fetch<{
                success: boolean;
                data?: LecturerItem;
                message?: string;
            }>(`${apiBase}/lecturer/get-by-id?id=${id}`, {
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
        } finally {
            loading.value = false;
        }
    };

    const resetForm = () => {
        Object.assign(form, defaultForm());
        errors.name = false;
        submitError.value = "";
    };

    const loadFormData = (item: LecturerItem) => {
        form.name = item.name ?? "";
        form.image = item.image ?? "";
        form.title = item.title ?? "";
        form.intro = item.intro ?? "";
        form.heading = item.heading ?? "";
        form.content = item.content ?? "";
        form.sort_order = item.sort_order ?? 0;
    };

    const clearError = (field: keyof LecturerFormErrors) => {
        errors[field] = false;
    };

    const validateForm = (): boolean => {
        let valid = true;

        if (!form.name?.trim()) {
            errors.name = "請輸入姓名";
            valid = false;
        } else {
            errors.name = false;
        }

        return valid;
    };

    const buildPayload = () => ({
        name: form.name.trim(),
        image: form.image?.trim() || null,
        title: form.title?.trim() || null,
        intro: form.intro?.trim() || null,
        heading: form.heading?.trim() || null,
        content: form.content?.trim() || null,
        sort_order: Number(form.sort_order) || 0
    });

    const addLecturer = async (options?: {
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
            }>(`${apiBase}/lecturer/add`, {
                method: "POST",
                body: buildPayload(),
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (res?.success) {
                toast.add({
                    title: res.message || "新增講師成功",
                    color: "success"
                });
                options?.onSuccess?.(res.data?.id ?? 0);
                return true;
            }

            submitError.value = res?.message || "新增講師失敗";
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
            submitError.value = errData?.message || err?.message || "新增講師失敗";
            toast.add({ title: submitError.value, color: "error" });
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateLecturer = async (
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
                `${apiBase}/lecturer/update`,
                {
                    method: "POST",
                    body: { id, ...buildPayload() },
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

            submitError.value = res?.message || "更新講師失敗";
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
            submitError.value = errData?.message || err?.message || "更新講師失敗";
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
                `${apiBase}/lecturer/update-sort-order`,
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
        item: LecturerListItem | { id: number },
        options?: { onSuccess?: () => void }
    ): Promise<boolean> => {
        const id = item?.id;
        if (!id) {
            return false;
        }

        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `${apiBase}/lecturer/delete`,
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

    const loadLecturerData = async (id: number) => {
        const item = await getById(id);
        if (item) {
            loadFormData(item);
            return item;
        }

        router.push("/lecturer");
        return null;
    };

    return {
        data,
        loading,
        submitError,
        form,
        errors,
        fetchData,
        getById,
        resetForm,
        loadFormData,
        clearError,
        validateForm,
        addLecturer,
        updateLecturer,
        updateSortOrder,
        deleteLecturer,
        loadLecturerData
    };
};
