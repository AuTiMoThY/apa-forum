import type { OrganizerForm, OrganizerFormErrors } from "~/types/OrganizerForm";

export const useAppOrganizer = () => {
    const { public: runtimePublic } = useRuntimeConfig();
    const apiBase = runtimePublic.apiBase;
    const toast = useToast();

    const data = useState<any | null>("app-organizer-data", () => null);
    const loading = useState("app-organizer-loading", () => false);
    const submitError = ref("");

    const form = reactive<OrganizerForm>({
        content_tw: null,
        content_en: null,
    });

    const errors = reactive<OrganizerFormErrors>({
        content_tw: false,
        content_en: false,
    });

    const fetchData = async () => {
        loading.value = true;
        try {
            const res = await $fetch<{
                success: boolean;
                data: any | null;
                message?: string;
            }>(`${apiBase}/organizer/get`, {
                method: "GET",
                credentials: "include",
            });

            if (res?.success) {
                data.value = res.data;
                if (res.data) {
                    loadFormData(res.data);
                }
            } else {
                toast.add({
                    title: res.message || "取得主辦單位介紹失敗",
                    color: "error",
                });
            }
        } catch (error: any) {
            console.error("fetchOrganizer error", error);
            toast.add({
                title: error.message || "取得主辦單位介紹失敗，請稍後再試",
                color: "error",
            });
        } finally {
            loading.value = false;
        }
    };

    const loadFormData = (row: any) => {
        if (!row) return;
        form.content_tw = row.content_tw ?? null;
        form.content_en = row.content_en ?? null;
    };

    const clearError = (field: keyof typeof errors) => {
        errors[field] = false;
    };

    const save = async (event?: Event) => {
        if (event) event.preventDefault();

        submitError.value = "";
        Object.keys(errors).forEach((key) => {
            // @ts-ignore
            errors[key] = false;
        });

        loading.value = true;
        try {
            const response = await $fetch<{
                success: boolean;
                message: string;
            }>("/organizer/save", {
                baseURL: apiBase,
                method: "POST",
                body: form,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (response.success) {
                toast.add({
                    title: response.message,
                    color: "success",
                });
                await fetchData();
                return true;
            }

            toast.add({
                title: response.message,
                color: "error",
            });
            return false;
        } catch (error: any) {
            const errData = error?.data || error?.response?._data;
            const fieldErrors =
                errData?.errors && typeof errData.errors === "object"
                    ? errData.errors
                    : null;

            if (fieldErrors) {
                Object.entries(fieldErrors).forEach(([key, val]) => {
                    const msg = Array.isArray(val)
                        ? val.join(", ")
                        : String(val);
                    // @ts-ignore
                    errors[key] = msg;
                });
            }

            const msg =
                (typeof errData?.message === "string" && errData.message) ||
                (typeof errData === "string" ? errData : null) ||
                error?.message ||
                "儲存主辦單位介紹失敗，請稍後再試";

            submitError.value = msg;
            toast.add({ title: msg, color: "error" });
            console.error("saveOrganizer error", error);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        data,
        loading,
        fetchData,
        form,
        errors,
        submitError,
        clearError,
        loadFormData,
        save,
    };
};
