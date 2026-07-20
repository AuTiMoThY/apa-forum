import type { MaybeRefOrGetter } from "vue";
import { toValue } from "vue";

/**
 * 系統設定單元權限（apa_forum 命名：system.{unit}.{action}）
 * 例：useSystemUnitPermission('admins') → system.admins.view
 * 相容舊名 system.admin.*
 */
export function useSystemUnitPermission(unit: MaybeRefOrGetter<string>) {
    const { hasPermission, isSuperAdmin } = usePermission();

    const unitKey = computed(() => {
        const raw = toValue(unit)
            .replace(/^\//, "")
            .replace(/^system[./]/, "");
        return raw;
    });

    const check = (action: string) =>
        computed(() => {
            if (isSuperAdmin()) return true;
            const key = unitKey.value;
            const candidates = [
                `system.${key}.${action}`,
                // 相容 app.vue / 舊命名（admins → admin）
                key === "admins" ? `system.admin.${action}` : "",
                // 相容 myanmar 斜線命名
                `system/${key}.${action}`
            ].filter(Boolean);
            return candidates.some((name) => hasPermission(name));
        });

    return {
        canView: check("view"),
        canCreate: check("create"),
        canEdit: check("edit"),
        canDelete: check("delete")
    };
}
