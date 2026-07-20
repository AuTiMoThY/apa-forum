<script setup>
const route = useRoute();
const router = useRouter();

const { getUserPermissions, hasPermission, isSuperAdmin } = usePermission();
console.group("[app.vue]");
console.log("所有權限:", getUserPermissions());
console.log("是否超級管理員:", isSuperAdmin());
console.log("是否有 system.admins.view:", hasPermission("system.admins.view"));
console.log("是否有 system.admin.view:", hasPermission("system.admin.view"));
console.groupEnd();


// 使用 Nuxt 的路由鉤子來監聽路由變化
router.afterEach((to, from) => {
    console.log(
        "[app.vue] Route changed (afterEach):",
        from.path,
        "->",
        to.path
    );
});

router.beforeEach((to, from) => {
    console.log(
        "[app.vue] Route changing (beforeEach):",
        from.path,
        "->",
        to.path
    );
    return true;
});
// 也保留 watch 作為備用
watch(
    () => route.path,
    (newPath, oldPath) => {
        // 只在 oldPath 存在時記錄（避免初始化時的觸發）
        if (oldPath !== undefined) {
            console.log("[app.vue] Route changed (watch):", oldPath, "->", newPath);
        }
    }
);

onMounted(() => {
    // console.log("[app.vue] App mounted, current route:", route.path);
});

const colorMode = useColorMode();

// 確保初始模式為 light
if (colorMode.preference !== "light") {
    colorMode.preference = "light";
}

// 監聽 colorMode 的變化，確保 HTML class 同步（只在客戶端執行）
if (process.client) {
    watchEffect(() => {
        const currentValue = colorMode.value;

        // console.log("colorMode preference:", colorMode.preference);
        // console.log("colorMode value:", currentValue);
        // console.log("HTML class:", document.documentElement.className);

        // 確保 HTML class 與 colorMode.value 同步
        if (currentValue === "light") {
            document.documentElement.classList.remove("dark");
        } else if (currentValue === "dark") {
            document.documentElement.classList.add("dark");
        }
    });

    // 在 mounted 時確保設定正確
    onMounted(() => {
        // 確保 preference 為 light
        if (colorMode.preference !== "light") {
            colorMode.preference = "light";
        }

        // 立即同步 HTML class
        if (colorMode.value === "light") {
            document.documentElement.classList.remove("dark");
        } else {
            document.documentElement.classList.add("dark");
        }
    });
}

useHead({
    meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" }
    ],
    link: [{ rel: "icon", href: "" }],
    htmlAttrs: {
        lang: "zh-TW"
    }
});


const title = "2026 國際動物保護論壇 後台管理系統";
useSeoMeta({
  titleTemplate: '%s - ' + title,
})


</script>

<template>
    <UApp>
        <NuxtLoadingIndicator />

        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>
