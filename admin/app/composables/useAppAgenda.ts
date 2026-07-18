import type { AgendaDayForm, AgendaItemForm } from "~/types/AgendaForm";

let tempIdCounter = 0;

const nextTempId = () => {
    tempIdCounter -= 1;
    return tempIdCounter;
};

const createEmptyItem = (sortOrder = 0): AgendaItemForm => ({
    id: nextTempId(),
    session: "",
    type: "",
    topic: "",
    sort_order: sortOrder,
});

const createEmptyDay = (sortOrder = 0): AgendaDayForm => ({
    id: nextTempId(),
    label: "",
    sort_order: sortOrder,
    items: [createEmptyItem(0)],
});

const normalizeItem = (item: any, index: number): AgendaItemForm => ({
    id: item?.id ?? nextTempId(),
    session: item?.session ?? "",
    type: item?.type ?? "",
    topic: item?.topic ?? "",
    sort_order: item?.sort_order ?? index,
});

const normalizeDay = (day: any, index: number): AgendaDayForm => {
    const items = Array.isArray(day?.items) ? day.items : [];

    return {
        id: day?.id ?? nextTempId(),
        label: day?.label ?? "",
        sort_order: day?.sort_order ?? index,
        items: items.length
            ? items.map(normalizeItem)
            : [createEmptyItem(0)],
    };
};

export const useAppAgenda = () => {
    const { public: runtimePublic } = useRuntimeConfig();
    const apiBase = runtimePublic.apiBase;
    const toast = useToast();

    const loading = ref(false);
    const submitError = ref("");
    const days = ref<AgendaDayForm[]>([]);

    const fetchData = async () => {
        loading.value = true;
        submitError.value = "";

        try {
            const res = await $fetch<{
                success: boolean;
                data: any[];
                message?: string;
            }>(`${apiBase}/agenda/get`, {
                method: "GET",
                credentials: "include",
            });

            if (res?.success) {
                const list = Array.isArray(res.data) ? res.data : [];
                days.value = list.length
                    ? list.map(normalizeDay)
                    : [createEmptyDay(0)];
                return;
            }

            toast.add({
                title: res.message || "取得議程失敗",
                color: "error",
            });
        } catch (error: any) {
            console.error("fetchAgenda error", error);
            toast.add({
                title: error.message || "取得議程失敗，請稍後再試",
                color: "error",
            });
        } finally {
            loading.value = false;
        }
    };

    const addDay = () => {
        days.value.push(createEmptyDay(days.value.length));
    };

    const removeDay = (dayIndex: number) => {
        days.value.splice(dayIndex, 1);
        days.value.forEach((day, index) => {
            day.sort_order = index;
        });
    };

    const addRow = (dayIndex: number) => {
        const day = days.value[dayIndex];
        if (!day) return;

        day.items.push(createEmptyItem(day.items.length));
    };

    const removeRow = (dayIndex: number, rowIndex: number) => {
        const day = days.value[dayIndex];
        if (!day) return;

        day.items.splice(rowIndex, 1);
        if (!day.items.length) {
            day.items.push(createEmptyItem(0));
        }

        day.items.forEach((item, index) => {
            item.sort_order = index;
        });
    };

    const getDayTitle = (day: AgendaDayForm, index: number) => {
        const trimmed = day.label?.trim();
        return trimmed || `Day ${index + 1}`;
    };

    const buildPayload = () => ({
        days: days.value.map((day, dayIndex) => ({
            id: typeof day.id === "number" && day.id > 0 ? day.id : null,
            label: day.label?.trim() || null,
            sort_order: dayIndex,
            items: day.items.map((item, itemIndex) => ({
                id: typeof item.id === "number" && item.id > 0 ? item.id : null,
                session: item.session?.trim() || null,
                type: item.type?.trim() || null,
                topic: item.topic?.trim() || null,
                sort_order: itemIndex,
            })),
        })),
    });

    const save = async () => {
        loading.value = true;
        submitError.value = "";

        try {
            const response = await $fetch<{
                success: boolean;
                message: string;
            }>("/agenda/save", {
                baseURL: apiBase,
                method: "POST",
                body: buildPayload(),
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

            submitError.value = response.message;
            toast.add({
                title: response.message,
                color: "error",
            });
            return false;
        } catch (error: any) {
            const data = error?.data || error?.response?._data;
            const msg =
                (typeof data?.message === "string" && data.message) ||
                error?.message ||
                "儲存議程失敗，請稍後再試";

            submitError.value = msg;
            toast.add({ title: msg, color: "error" });
            console.error("saveAgenda error", error);
            return false;
        } finally {
            loading.value = false;
        }
    };

    return {
        days,
        loading,
        submitError,
        fetchData,
        addDay,
        removeDay,
        addRow,
        removeRow,
        getDayTitle,
        save,
    };
};
