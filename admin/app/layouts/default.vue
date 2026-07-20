<script setup lang="ts">
import type {
    CommandPaletteGroup,
    CommandPaletteItem,
    NavigationMenuItem
} from "@nuxt/ui";

import { website } from "~/constants/menu/website";
import { base } from "~/constants/menu/base";
import { system } from "~/constants/menu/system";

const route = useRoute();
const open = ref(false);
const dashboardSearchTerm = ref("");
const { productGroupItems } = useDashboardProductSearch(dashboardSearchTerm);
const { asideData: structureData, fetchDataForAside: fetchStructureForAside } =
    useStructure();
const { data: modulesData, fetchData: fetchModules } = useModule();
const { getBasePath } = useBasePath();
const { hasPermission, isSuperAdmin } = usePermission();

const getWindowWidth = () => {
    return (
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
    );
};

const windowWidth = ref(getWindowWidth());

const setWindowWidth = () => {
    document.documentElement.style.setProperty(
        "--window-width",
        windowWidth.value + "px"
    );
    window.addEventListener("resize", () => {
        windowWidth.value = getWindowWidth();
        document.documentElement.style.setProperty(
            "--window-width",
            windowWidth.value + "px"
        );
    });
};
/**
 * 檢查某個 menu item 或其子層級是否包含當前路由
 * @param item 結構項目
 * @param currentPath 當前路由
 * @returns 是否包含當前路由
 */
const hasActiveRoute = (item: any, currentPath: string): boolean => {
    // 如果當前 item 有 to 且匹配當前路由
    let itemPath =
        item?.url || item?.path || (item?.name ? `/${item.name}` : undefined);

    // 確保 itemPath 有前導斜線，與路由路徑格式一致
    if (itemPath && !itemPath.startsWith("/")) {
        itemPath = `/${itemPath}`;
    }

    if (itemPath) {
        // 完全匹配
        if (currentPath === itemPath) {
            return true;
        }
        // 檢查是否為編輯或新增頁面（例如：/about/edit 或 /about/add）
        // 取得當前路徑的基礎路徑（移除 /edit 或 /add 後綴）
        const baseCurrentPath = getBasePath(currentPath);

        // console.log("[default layout] hasActiveRoute itemPath", itemPath);
        // console.log("[default layout] hasActiveRoute baseCurrentPath", baseCurrentPath);
        // 完全匹配基礎路徑
        if (baseCurrentPath === itemPath) {
            return true;
        }
        // 檢查基礎路徑是否以 itemPath 開頭（例如：/new-case/case_form 匹配 /new-case）
        if (baseCurrentPath.startsWith(itemPath + "/")) {
            return true;
        }
    }

    // 檢查子層級
    if (item?.children && item.children.length > 0) {
        return item.children.some((child: any) =>
            hasActiveRoute(child, currentPath)
        );
    }

    return false;
};

/**
 * 解析模組路徑
 * @param item 結構項目
 * @returns 模組路徑
 */
const resolveModulePath = (item: any): string | undefined => {
    // 優先使用自訂 URL
    if (item?.url) {
        return item.url.startsWith("/") ? item.url : `/${item.url}`;
    }

    // 如果沒有自訂 URL，使用模組的 name
    if (item?.module_id) {
        const found = modulesData.value?.find(
            (m: any) => String(m.id) === String(item.module_id)
        );
        return found?.name ? `/${found.name}` : undefined;
    }

    return undefined;
};

/**
 * 檢查項目是否啟用
 * @param item 結構項目
 * @returns 是否啟用
 */
const isItemActive = (item: any): boolean => {
    const status = item?.status;
    return status === 1 || status === "1" || status === true;
};

/**
 * 檢查項目是否有權限
 * @param item 結構項目
 * @returns 是否有權限
 */
const hasItemPermission = (item: any): boolean => {
    // 超級管理員擁有所有權限
    if (isSuperAdmin()) {
        return true;
    }

    // 如果沒有關聯模組，則不需要檢查權限（例如父層級）
    if (!item?.module_id) {
        return true;
    }

    // 如果沒有 url，表示不是實際的單元（可能是父層級），不需要檢查權限
    if (!item?.url) {
        return true;
    }

    // 根據單元的 url 構建權限名稱（格式：{url}.view）
    // 例如：url='about' → 權限名稱='about.view'
    // 例如：url='media' → 權限名稱='media.view'
    const permissionName = `${item.url}.view`;

    // 檢查是否有權限
    return hasPermission(permissionName);
};

/**
 * 將結構項目轉換為選單項目
 * @param item 結構項目
 * @param sidebarOpen 側邊欄是否展開
 * @returns 選單項目
 */
const mapStructureToMenu = (
    item: any,
    sidebarOpen: Ref<boolean>
): NavigationMenuItem | null => {
    // 過濾停用的項目
    if (!isItemActive(item)) {
        return null;
    }

    // 過濾沒有權限的項目
    if (!hasItemPermission(item)) {
        return null;
    }

    const hasChildren = item?.children && item?.children.length > 0;
    const currentPath = route.path;
    const isActive = hasActiveRoute(item, currentPath);
    // 首頁（根路徑）時，有子選項的項目預設展開；否則僅展開包含當前路由的項目
    const isHomePage = currentPath === "/" || currentPath === "";
    const shouldDefaultOpen = isHomePage ? true : isActive;

    const baseMenu: NavigationMenuItem = {
        label: `${item?.label}\n${item?.alias || ""}`,
        icon: item?.icon || "i-lucide-network",
        slot: "item" as const
    };

    if (hasChildren) {
        // 有子層級：建立 children 陣列，並過濾停用的子項目
        const activeChildren = item.children
            .map((child: any) => mapStructureToMenu(child, sidebarOpen))
            .filter((child: any) => child !== null);

        // 如果所有子項目都被過濾掉，則不顯示此項目
        if (activeChildren.length === 0) {
            return null;
        }

        return {
            ...baseMenu,
            defaultOpen: shouldDefaultOpen, // 首頁時全部展開，其餘僅展開包含當前路由的項目
            children: activeChildren
        };
    } else {
        // 無子層級：設定 to 屬性
        return {
            ...baseMenu,
            active: isActive,
            to:
                resolveModulePath(item) ||
                item?.to ||
                item?.path ||
                (item?.name ? `/${item.name}` : undefined),
            onSelect: () => {
                sidebarOpen.value = false;
            }
        };
    }
};

/**
 * 建立結構選單
 * @param sidebarOpen 側邊欄是否展開
 * @returns 結構選單
 */
const buildStructureMenu = (
    sidebarOpen: Ref<boolean>
): NavigationMenuItem[] => {
    return (structureData.value || [])
        .map((item) => mapStructureToMenu(item, sidebarOpen))
        .filter((item): item is NavigationMenuItem => item !== null);
};

/**
 * 檢查當前路由是否在 system 子項目中
 * @returns 是否在 system 子項目中
 */
const checkSystemActive = (): boolean => {
    const currentPath = route.path;
    const systemPaths = [
        "/system/structure",
        "/system/module",
        "/system/admins",
        "/system/permissions",
        "/system/roles"
    ];
    return systemPaths.includes(currentPath);
};

const isSystemActive = computed(() => checkSystemActive());

/**
 * 建立系統選單並檢查是否有子項目
 * @returns 系統選單
 */
const systemMenu = computed(() => system(isSystemActive));

/**
 * 建立 links 選單
 * @returns links 選單
 */
const links = computed(() => {
    const structureMenuItems = buildStructureMenu(open);
    const menuItems: NavigationMenuItem[] = [...structureMenuItems, base(open)];
    // 只有當系統選單有子項目時才加入
    const systemMenuItem = systemMenu.value;
    if (systemMenuItem.children && systemMenuItem.children.length > 0) {
        menuItems.push(systemMenuItem);
    }

    return [menuItems] as NavigationMenuItem[][];
});

/**
 * 建立 groups 選單
 * @returns groups 選單
 */
 const groups = computed(() => [
    {
        id: "links",
        label: "Go to",
        items: links.value[0]
    }
]);

/**
 * 定時器 ID（用於清除定時器）
 */
let countIntervalId: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    setWindowWidth();
    console.log("[default layout] onMounted, route:", route.path);
    console.log("[default layout] structureData:", structureData.value);
    // 確保初次載入取得樹狀結構，並共享後續更新（如排序變動）
    // 使用非阻塞方式載入，避免阻塞頁面渲染
    // 注意：未處理數量會在 useUnprocessed 中通過 watch 自動獲取，無需手動調用
    if (!structureData.value?.length) {
        fetchStructureForAside().catch((err) => {
            console.error("fetchStructureForAside error:", err);
        });
    }
    if (!modulesData.value?.length) {
        fetchModules().catch((err) => {
            console.error("fetchModules error:", err);
        });
    }
});

onUnmounted(() => {
    if (countIntervalId) {
        clearInterval(countIntervalId);
        countIntervalId = null;
    }
});
</script>

<template>
    <UDashboardGroup unit="rem">
        <UDashboardSidebar
            id="default"
            v-model:open="open"
            collapsible
            resizable
            :ui="{
                root: 'border-none relative z-10 bg-gray-100 dark:bg-gray-900',
                header: 'justify-start gap-0 bg-gray-100 dark:bg-gray-200'
            }">
            <template #header="{ collapsed }">
                <NuxtLink to="/">
                    <p
                        v-if="!collapsed"
                        class="text-primary-900 dark:text-white">
                        2026 國際動物保護論壇
                    </p>
                    <span v-else class="text-2xl font-bold">A</span>
                </NuxtLink>
            </template>

            <template #default="{ collapsed }">
                <UDashboardSearchButton
                    :collapsed="collapsed"
                    class="ring-default w-full" />

                <UNavigationMenu
                    v-if="links && links[0] && links[0].length > 0"
                    :collapsed="collapsed"
                    :items="links[0]"
                    orientation="vertical"
                    tooltip
                    popover
                    variant="pill"
                    :ui="{
                        list: 'menu-list',
                        item: 'menu-item',
                        link: 'menu-item-link',
                        linkLabel: 'whitespace-pre-line'
                    }">
                </UNavigationMenu>
            </template>

            <template #footer="{ collapsed }">
                <UserMenu v-if="!collapsed" :collapsed="collapsed" />
                <UButton
                    v-else
                    color="neutral"
                    variant="ghost"
                    icon="lucide:user"
                    class="w-full" />
            </template>
        </UDashboardSidebar>
        <UDashboardSearch :groups="groups" :ui="{input:'h-auto'}" />
        <slot />
    </UDashboardGroup>
</template>
