import type { Ref } from "vue";

export type PermissionTreeChild = {
    id: number | string;
    label: string;
    alias?: string;
    url: string;
    permissions: any[];
};

export type PermissionTreeGroup = {
    id: number | string;
    label: string;
    alias?: string;
    permissions: any[];
    children: PermissionTreeChild[];
};

const ACTION_ORDER: Record<string, number> = {
    approve: 0,
    viewAll: 1,
    view: 2,
    create: 3,
    edit: 4,
    delete: 5,
    feedback: 6
};

export const getPermissionUrlKey = (name: string): string | null => {
    if (!name) return null;
    const lastDot = name.lastIndexOf(".");
    if (lastDot <= 0) return null;
    const prefix = name.substring(0, lastDot);

    // calendar.tw.view → 歸屬 calendar 單元
    const regionMatch = prefix.match(/^calendar\.(tw|sg|mm)$/);
    if (regionMatch) return "calendar";

    return prefix;
};

/** 從權限 name 解析國家分類（calendar.tw.view → tw） */
export const getPermissionRegionFromName = (name: string): string | null => {
    const match = name.match(/^calendar\.(tw|sg|mm)\./);
    return match?.[1] ?? null;
};

const permissionSortKey = (p: any) => {
    const so = Number(p.sort_order);
    if (Number.isFinite(so) && so > 0) return so;
    return ACTION_ORDER[String(p.action)] ?? 99;
};

const sortPermissionsByOrder = (list: any[]) =>
    [...list].sort((a, b) => {
        const regionA = getPermissionRegionFromName(String(a.name ?? ""));
        const regionB = getPermissionRegionFromName(String(b.name ?? ""));
        const regionOrder = { tw: 0, sg: 1, mm: 2 } as Record<string, number>;
        if (regionA !== regionB) {
            const oA = regionA ? (regionOrder[regionA] ?? 99) : -1;
            const oB = regionB ? (regionOrder[regionB] ?? 99) : -1;
            if (oA !== oB) return oA - oB;
        }
        const orderA = permissionSortKey(a);
        const orderB = permissionSortKey(b);
        if (orderA !== orderB) return orderA - orderB;
        return String(a.label ?? "").localeCompare(String(b.label ?? ""));
    });

export const permissionGroupSortKey = (groupId: number | string) =>
    `g-${groupId}`;

export const permissionOrphanSortKey = "__other__";

/**
 * 依 sys_structure 樹狀分組權限（父層 → 子層 URL → 權限列表）
 */
export const usePermissionStructureTree = (
    permissions: Ref<any[]>,
    structureTree: Ref<any[]>
) => {
    const permissionsByUrl = computed(() => {
        const map = new Map<string, any[]>();
        for (const permission of permissions.value) {
            const urlKey = permission.name
                ? getPermissionUrlKey(permission.name)
                : null;
            if (!urlKey) continue;
            const list = map.get(urlKey) ?? [];
            list.push(permission);
            map.set(urlKey, list);
        }
        for (const [key, list] of map) {
            map.set(key, sortPermissionsByOrder(list));
        }
        return map;
    });

    const orphanPermissions = computed(() => {
        const assigned = new Set<number>();
        const walk = (nodes: any[]) => {
            for (const node of nodes) {
                if (node?.url) {
                    for (const p of permissionsByUrl.value.get(node.url) ?? []) {
                        assigned.add(Number(p.id));
                    }
                }
                if (node?.children?.length) walk(node.children);
            }
        };
        walk(structureTree.value || []);

        return sortPermissionsByOrder(
            permissions.value.filter(
                (p: any) => !assigned.has(Number(p.id))
            )
        );
    });

    const permissionTree = computed((): PermissionTreeGroup[] => {
        const build = (nodes: any[]): PermissionTreeGroup[] => {
            const groups: PermissionTreeGroup[] = [];
            for (const node of nodes) {
                if (!node?.id) continue;
                const children: PermissionTreeChild[] = [];
                const childNodes = Array.isArray(node.children)
                    ? node.children
                    : [];

                for (const child of childNodes) {
                    if (!child?.url) continue;
                    const perms = permissionsByUrl.value.get(child.url) ?? [];
                    if (perms.length === 0) continue;
                    children.push({
                        id: child.id,
                        label: child.label,
                        alias: child.alias,
                        url: child.url,
                        permissions: perms
                    });
                }

                const ownPermissions = node.url
                    ? (permissionsByUrl.value.get(node.url) ?? [])
                    : [];

                const hasContent =
                    children.length > 0 || ownPermissions.length > 0;
                if (!hasContent) continue;

                groups.push({
                    id: node.id,
                    label: node.label,
                    alias: node.alias,
                    permissions: ownPermissions,
                    children
                });
            }
            return groups;
        };

        const tree = build(structureTree.value || []);
        if (orphanPermissions.value.length > 0) {
            tree.push({
                id: "other",
                label: "其他",
                alias: "",
                permissions: orphanPermissions.value,
                children: []
            });
        }
        return tree;
    });

    const flattenTreePermissions = (tree: PermissionTreeGroup[]) => {
        const result: any[] = [];
        for (const group of tree) {
            if (group.permissions.length) {
                result.push(...group.permissions);
            }
            for (const child of group.children) {
                result.push(...child.permissions);
            }
        }
        return result;
    };

    const totalPermissionCount = computed(() =>
        flattenTreePermissions(permissionTree.value).length
    );

    return {
        permissionTree,
        permissionsByUrl,
        orphanPermissions,
        flattenTreePermissions,
        totalPermissionCount,
        permissionGroupSortKey,
        permissionOrphanSortKey
    };
};
