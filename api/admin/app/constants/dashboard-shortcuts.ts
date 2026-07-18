/** 單一快捷入口項目 */
export interface DashboardShortcutItem {
    label: string;
    to: string;
    icon: string;
    /** 系統項目需檢查權限，未設定表示不需權限 */
    permission?: string;
}

/** 依類型分組的快捷入口 */
export interface DashboardShortcutGroup {
    label: string;
    icon: string;
    items: DashboardShortcutItem[];
}

/** 首頁管理、商品、內容與門市、基本設定、系統設定 */
export const DASHBOARD_SHORTCUT_GROUPS: DashboardShortcutGroup[] = [
    {
        label: "首頁管理",
        icon: "i-lucide-home",
        items: [
            { label: "首頁設定", to: "/home", icon: "i-lucide-layout-dashboard" },
        ],
    },
    {
        label: "商品管理",
        icon: "i-lucide-box",
        items: [
            { label: "產品分類", to: "/products-category", icon: "i-lucide-bookmark" },
            { label: "顏色清單", to: "/color-list", icon: "i-lucide-swatch-book" },
            { label: "產品顏色", to: "/products-color", icon: "i-lucide-palette" },
            { label: "產品標籤", to: "/products-label", icon: "i-lucide-tags" },
            { label: "產品管理", to: "/products", icon: "i-lucide-box" },
            { label: "新產品", to: "/new-products", icon: "i-lucide-circle-star" },
        ],
    },
    {
        label: "內容與門市",
        icon: "i-lucide-file-text",
        items: [
            { label: "關於我們", to: "/about", icon: "i-lucide-info" },
            { label: "常見問題", to: "/faq", icon: "i-lucide-help-circle" },
            { label: "法規條款", to: "/legal", icon: "i-lucide-scale" },
            { label: "經銷據點", to: "/store", icon: "i-lucide-map-pin" },
            { label: "自行車", to: "/bicycle", icon: "i-lucide-bike" },
        ],
    },
    {
        label: "基本設定",
        icon: "i-lucide-building-2",
        items: [
            { label: "公司資訊與 SEO", to: "/base", icon: "i-lucide-building-2" },
        ],
    },
    {
        label: "系統設定",
        icon: "i-lucide-settings",
        items: [
            { label: "管理員設定", to: "/system/admins", icon: "i-lucide-user-cog" },
            { label: "模組設定", to: "/system/module", icon: "i-lucide-package", permission: "system.module.view" },
            { label: "系統架構設定", to: "/system/structure", icon: "i-lucide-network", permission: "system.structure.view" },
            { label: "權限設定", to: "/system/permissions", icon: "i-lucide-shield", permission: "system.permissions.view" },
            { label: "角色設定", to: "/system/roles", icon: "i-lucide-shield", permission: "system.roles.view" },
        ],
    },
];
