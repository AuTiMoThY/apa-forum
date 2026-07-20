<script setup lang="ts">
import {
    usePermissionStructureTree,
    type PermissionTreeChild,
    type PermissionTreeGroup
} from "~/composables/usePermissionStructureTree";

const props = withDefaults(
    defineProps<{
        modelValue?: number[];
        disabled?: boolean;
    }>(),
    {
        modelValue: () => [],
        disabled: false
    }
);

const emit = defineEmits<{
    "update:modelValue": [value: number[]];
}>();

const { data: permissionData, fetchData: fetchPermissions } =
    usePermissionData();
const { data: structureData, fetchData: fetchStructures } = useStructure();

const searchKeyword = ref("");

const filteredPermissionData = computed(() => {
    const list = permissionData.value || [];
    if (!searchKeyword.value.trim()) return list;
    const kw = searchKeyword.value.toLowerCase();
    return list.filter(
        (p: any) =>
            String(p.label ?? "")
                .toLowerCase()
                .includes(kw) ||
            String(p.name ?? "")
                .toLowerCase()
                .includes(kw) ||
            String(p.description ?? "")
                .toLowerCase()
                .includes(kw)
    );
});

const { permissionTree, totalPermissionCount } = usePermissionStructureTree(
    filteredPermissionData,
    structureData
);

const ACTION_LABELS: Record<string, string> = {
    view: "查看",
    edit: "編輯",
    approve: "核准",
    delete: "刪除"
};

const expansionKey = (id: number | string) => `g-${id}`;

const expandedGroups = ref<Set<string>>(new Set());

const getActionLabel = (action: string) =>
    ACTION_LABELS[action] ?? action;

const isPermissionSelected = (permissionId: number | string): boolean => {
    const id = Number(permissionId);
    return props.modelValue.some(
        (selectedId) => Number(selectedId) === id
    );
};

const updatePermissionIds = (ids: number[]) => {
    emit("update:modelValue", ids);
};

const getStructureSelectedCount = (permissions: any[]) =>
    permissions.filter((p) => isPermissionSelected(p.id)).length;

const getStructureSelectValue = (
    permissions: any[]
): boolean | "indeterminate" => {
    if (permissions.length === 0) return false;
    const selectedCount = getStructureSelectedCount(permissions);
    if (selectedCount >= permissions.length) return true;
    if (selectedCount > 0) return "indeterminate";
    return false;
};

const collectGroupPermissions = (
    group: PermissionTreeGroup | PermissionTreeChild
): any[] => {
    const list = [...(group.permissions ?? [])];
    if ("children" in group && group.children) {
        for (const child of group.children) {
            list.push(...child.permissions);
        }
    }
    return list;
};

const toggleStructureSelection = (permissions: any[], checked: boolean) => {
    const permissionIds = permissions.map((p) => Number(p.id));

    if (!checked) {
        updatePermissionIds(
            props.modelValue.filter(
                (id) => !permissionIds.includes(Number(id))
            )
        );
    } else {
        const next = [...props.modelValue];
        permissionIds.forEach((id) => {
            if (!next.some((selectedId) => Number(selectedId) === id)) {
                next.push(id);
            }
        });
        updatePermissionIds(next);
    }
};

const togglePermission = (permissionId: number, checked: boolean) => {
    if (checked) {
        if (!isPermissionSelected(permissionId)) {
            updatePermissionIds([...props.modelValue, permissionId]);
        }
    } else {
        updatePermissionIds(
            props.modelValue.filter(
                (id) => Number(id) !== permissionId
            )
        );
    }
};

const visiblePermissions = computed(() =>
    permissionTree.value.flatMap((g) => collectGroupPermissions(g))
);

const selectedCount = computed(() => props.modelValue.length);

const isAllSelected = computed(() => {
    const visible = visiblePermissions.value;
    if (visible.length === 0) return false;
    return visible.every((p) => isPermissionSelected(p.id));
});

const toggleAllSelection = () => {
    const visibleIds = visiblePermissions.value.map((p) => Number(p.id));
    if (isAllSelected.value) {
        updatePermissionIds(
            props.modelValue.filter(
                (id) => !visibleIds.includes(Number(id))
            )
        );
    } else {
        const next = [...props.modelValue];
        visibleIds.forEach((id) => {
            if (!next.some((selectedId) => Number(selectedId) === id)) {
                next.push(id);
            }
        });
        updatePermissionIds(next);
    }
};

const toggleGroupExpansion = (id: number | string) => {
    const key = expansionKey(id);
    if (expandedGroups.value.has(key)) {
        expandedGroups.value.delete(key);
    } else {
        expandedGroups.value.add(key);
    }
};

const expandAllGroups = () => {
    expandedGroups.value = new Set(
        permissionTree.value.map((g) => expansionKey(g.id))
    );
};

const collapseAllGroups = () => {
    expandedGroups.value = new Set();
};

onMounted(async () => {
    await Promise.all([fetchPermissions(), fetchStructures()]);
});
</script>

<template>
    <div
        class="overflow-hidden rounded-lg border border-default/60 bg-default/20">
        <div
            v-if="permissionData.length > 0"
            class="flex flex-wrap items-center gap-3 border-b border-default/40 px-4 py-3">
            <div class="min-w-[200px] flex-1">
                <UInput
                    v-model="searchKeyword"
                    placeholder="搜尋權限名稱、代碼…"
                    icon="i-lucide-search"
                    size="md"
                    :disabled="disabled" />
            </div>
            <div class="flex flex-wrap items-center gap-2 text-sm text-muted">
                <span>
                    已選擇：{{ selectedCount }} /
                    {{ totalPermissionCount }}
                </span>
                <UButton
                    size="xs"
                    variant="soft"
                    color="neutral"
                    :disabled="disabled"
                    @click="collapseAllGroups">
                    全部收合
                </UButton>
                <UButton
                    size="xs"
                    variant="soft"
                    color="neutral"
                    :disabled="disabled"
                    @click="expandAllGroups">
                    全部展開
                </UButton>
                <UButton
                    size="xs"
                    variant="soft"
                    color="primary"
                    :disabled="disabled"
                    @click="toggleAllSelection">
                    {{ isAllSelected ? "取消全選" : "全選可見" }}
                </UButton>
            </div>
        </div>

        <div
            v-if="permissionData.length === 0"
            class="p-8 text-center text-sm text-muted">
            暫無權限資料
        </div>
        <div
            v-else-if="permissionTree.length === 0"
            class="p-8 text-center text-sm text-muted">
            找不到符合條件的權限
        </div>
        <div
            v-else
            class="max-h-96 divide-y divide-default/40 overflow-y-auto">
            <section
                v-for="group in permissionTree"
                :key="group.id"
                class="border-default/30">
                <div
                    class="flex cursor-pointer items-center gap-3 bg-elevated/40 px-4 py-3 transition-colors hover:bg-elevated/70"
                    @click="toggleGroupExpansion(group.id)">
                    <UCheckbox
                        :model-value="
                            getStructureSelectValue(
                                collectGroupPermissions(group)
                            )
                        "
                        :disabled="disabled"
                        :ui="{ base: 'bg-white' }"
                        @click.stop
                        @update:model-value="
                            (value: boolean | 'indeterminate') =>
                                toggleStructureSelection(
                                    collectGroupPermissions(group),
                                    value === true
                                )
                        " />
                    <UIcon
                        :name="
                            expandedGroups.has(expansionKey(group.id))
                                ? 'i-lucide-chevron-down'
                                : 'i-lucide-chevron-right'
                        "
                        class="h-4 w-4 shrink-0 text-muted" />
                    <div class="min-w-0 flex-1">
                        <div
                            class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span class="font-semibold text-default">
                                {{ group.label }}
                            </span>
                            <span
                                v-if="group.alias"
                                class="text-xs text-muted">
                                {{ group.alias }}
                            </span>
                            <span class="text-xs text-muted">
                                ({{
                                    getStructureSelectedCount(
                                        collectGroupPermissions(group)
                                    )
                                }}
                                /
                                {{
                                    collectGroupPermissions(group).length
                                }})
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    v-show="expandedGroups.has(expansionKey(group.id))"
                    class="pb-2">
                    <ul
                        v-if="group.permissions.length > 0"
                        class="space-y-1 border-t border-default/20 px-4 py-2">
                        <li
                            v-for="permission in group.permissions"
                            :key="permission.id"
                            class="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-elevated/50">
                            <UCheckbox
                                :model-value="
                                    isPermissionSelected(permission.id)
                                "
                                :disabled="disabled"
                                :ui="{ base: 'bg-white' }"
                                @update:model-value="
                                    (v: boolean | 'indeterminate') =>
                                        togglePermission(
                                            Number(permission.id),
                                            v === true
                                        )
                                " />
                            <UBadge
                                v-if="permission.action"
                                size="xs"
                                variant="subtle"
                                color="neutral">
                                {{ getActionLabel(permission.action) }}
                            </UBadge>
                            <span class="min-w-0 flex-1 text-sm">
                                {{ permission.label }}
                            </span>
                            <code
                                v-if="permission.name"
                                class="max-w-[40%] truncate font-mono text-xs text-muted">
                                {{ permission.name }}
                            </code>
                        </li>
                    </ul>

                    <div
                        v-for="child in group.children"
                        :key="child.id"
                        class="border-t border-default/20">
                        <div
                            class="flex items-center gap-3 bg-default/30 px-6 py-2.5">
                            <UCheckbox
                                :model-value="
                                    getStructureSelectValue(child.permissions)
                                "
                                :disabled="disabled"
                                :ui="{ base: 'bg-white' }"
                                @update:model-value="
                                    (v: boolean | 'indeterminate') =>
                                        toggleStructureSelection(
                                            child.permissions,
                                            v === true
                                        )
                                " />
                            <div class="min-w-0 flex-1">
                                <div
                                    class="flex flex-wrap items-baseline gap-x-2">
                                    <span class="text-sm font-medium">
                                        {{ child.label }}
                                    </span>
                                    <span
                                        v-if="child.alias"
                                        class="text-xs text-muted">
                                        {{ child.alias }}
                                    </span>
                                    <span class="text-xs text-muted">
                                        ({{
                                            getStructureSelectedCount(
                                                child.permissions
                                            )
                                        }}
                                        / {{ child.permissions.length }})
                                    </span>
                                </div>
                                <div
                                    v-if="child.url"
                                    class="mt-0.5 font-mono text-xs text-muted">
                                    {{ child.url }}
                                </div>
                            </div>
                        </div>
                        <ul class="space-y-1 px-6 pb-3">
                            <li
                                v-for="permission in child.permissions"
                                :key="permission.id"
                                class="flex items-center gap-3 rounded-md border-l-2 border-primary/20 py-2 pl-8 pr-3 hover:bg-elevated/50">
                                <UCheckbox
                                    :model-value="
                                        isPermissionSelected(permission.id)
                                    "
                                    :disabled="disabled"
                                    :ui="{ base: 'bg-white' }"
                                    @update:model-value="
                                        (v: boolean | 'indeterminate') =>
                                            togglePermission(
                                                Number(permission.id),
                                                v === true
                                            )
                                    " />
                                <UBadge
                                    v-if="permission.action"
                                    size="xs"
                                    variant="subtle"
                                    :color="
                                        permission.action === 'approve'
                                            ? 'warning'
                                            : permission.action === 'delete'
                                              ? 'error'
                                              : 'neutral'
                                    ">
                                    {{ getActionLabel(permission.action) }}
                                </UBadge>
                                <span class="min-w-0 flex-1 text-sm">
                                    {{ permission.label }}
                                </span>
                                <code
                                    v-if="permission.name"
                                    class="max-w-[36%] truncate font-mono text-xs text-muted">
                                    {{ permission.name }}
                                </code>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
