export default defineNuxtRouteMiddleware(async (to, _from) => {
    const { user, accessToken, isAuthenticated, initAuth } = useAuth();

    // 僅在「有 Access Token 但尚未載入使用者資料」時，才初始化認證狀態
    if (accessToken.value && !user.value) {
        try {
            const initPromise = initAuth();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("initAuth timeout")), 3000);
            });
            
            await Promise.race([initPromise, timeoutPromise]);
        } catch (error) {
            console.warn("[auth middleware] initAuth error or timeout:", error);
            // 繼續執行，不阻塞導航
        }
    }

    // 如果未登入且不是前往登入頁，則導向登入頁
    if (!isAuthenticated.value && to.path !== "/login") {
        console.log("[auth middleware] Redirecting to login");
        return navigateTo("/login");
    }

    // 如果已登入且前往登入頁，則導向首頁
    if (isAuthenticated.value && to.path === "/login") {
        console.log("[auth middleware] Redirecting to home");
        return navigateTo("/");
    }
});
