import type { NavigationMenuItem } from "@nuxt/ui";

export const base: (open: Ref<boolean>) => NavigationMenuItem = (open) => ({
    label: "基本設定",
    icon: "lucide:building-2",
    to: "/base",
    onSelect: () => {
        open.value = false;
    },
});

