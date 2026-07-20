import type { MaybeRefOrGetter } from "vue";
import { toValue } from "vue";

export type UnitPermissionAction =
    | "view"
    | "create"
    | "edit"
    | "delete"
    | "feedback"
    | "approve"
    | "viewAll";

/** 單元權限名稱：{unitPrefix}.{action}，例 system/admins.view */
export function unitPermissionName(
    unitPrefix: string,
    action: UnitPermissionAction
): string {
    return `${unitPrefix.replace(/\/$/, "")}.${action}`;
}

/**
 * 依單元 URL 前綴檢查權限（與 sys_structure.url、sys_permissions.name 一致）
 * 例：useUnitPermission('system/admins') → system/admins.view
 */
export function useUnitPermission(unitPrefix: MaybeRefOrGetter<string>) {
    const { hasPermission, isSuperAdmin } = usePermission();

    const prefix = computed(() => toValue(unitPrefix).replace(/\/$/, ""));

    const permissionName = (action: UnitPermissionAction) =>
        unitPermissionName(prefix.value, action);

    const check = (action: UnitPermissionAction) =>
        computed(() => isSuperAdmin() || hasPermission(permissionName(action)));

    return {
        permissionName,
        canView: check("view"),
        canCreate: check("create"),
        canEdit: check("edit"),
        canDelete: check("delete"),
        canFeedback: check("feedback"),
        canApprove: check("approve"),
        canViewAll: check("viewAll")
    };
}
