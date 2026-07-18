/**
 * API 請求攔截器 Plugin
 *
 * 功能：
 * 1. 自動在所有 API 請求中加入 Authorization header
 * 2. 自動處理 Token 過期（401 錯誤）並刷新 Token（單次只執行一次 refresh，其餘請求等待）
 * 3. 刷新成功後以「新 token」重試原始請求
 *
 * 此 plugin 適用於 Nuxt 4
 */
export default defineNuxtPlugin(() => {
    // 只在客戶端執行
    if (!import.meta.client) {
        return;
    }

    // 儲存原始 $fetch
    const originalFetch = globalThis.$fetch;

    // 單次只執行一次 refresh，多個 401 請求共用同一次刷新結果
    let refreshPromise: Promise<boolean> | null = null;

    // 不需帶 Token 的靜態資源路徑（Nuxt 內部請求等）
    const isStaticAsset = (urlStr: string) => {
        const u = urlStr.split("?")[0] ?? "";
        return u.includes("/_nuxt/") || u.includes("_nuxt/builds/meta");
    };

    // 預期不會帶 Token 的 API（例如登入）
    const isNoTokenExpected = (urlStr: string) => urlStr.includes("admins/login");

    // 攔截所有 $fetch 請求
    // @ts-ignore - 覆蓋 $fetch 類型以添加攔截功能
    globalThis.$fetch = async (url: string, options: any = {}) => {
        const urlStr = typeof url === "string" ? url : (url as any)?.url ?? "";
        if (isStaticAsset(urlStr)) {
            return await originalFetch(url, options);
        }

        const { accessToken, refreshToken } = useAuth();

        // 確保 options.headers 存在（不直接 mutate 傳入的 options，複製一層）
        const headers = { ...(options.headers || {}) };
        if (accessToken.value) {
            if (!headers["Authorization"]) {
                headers["Authorization"] = `Bearer ${accessToken.value}`;
            }
            // 主機常 strip Authorization，同時用自訂 header 傳 token（後端優先讀 X-Access-Token）
            headers["X-Access-Token"] = accessToken.value;
        } else if (!isNoTokenExpected(urlStr)) {
            console.warn("[api-interceptor] ⚠️ 沒有 Access Token，請求可能失敗:", url);
        }
        const requestOptions = { ...options, headers };

        try {
            return await originalFetch(url, requestOptions);
        } catch (error: any) {
            const status = error?.status ?? error?.statusCode;
            const errorMessage = error?.data?.message ?? error?.message ?? "";

            // 詳細錯誤日誌（方便除錯 500 等）
            console.error("[api-interceptor] 請求失敗:", {
                url: urlStr,
                method: options?.method ?? "GET",
                status,
                message: errorMessage,
                data: error?.data,
                error
            });

            // 處理 401 錯誤（Token 過期或無效）
            if (status === 401) {
                const isAuthEndpoint = urlStr.includes("admins/refresh") || urlStr.includes("admins/logout");
                if (isAuthEndpoint) {
                    if (urlStr.includes("admins/refresh")) {
                        console.warn("[api-interceptor] Refresh Token 無效或已過期，執行登出");
                        const { logout } = useAuth();
                        await logout();
                    }
                    throw error;
                }

                const isTokenError =
                    errorMessage.includes("過期") ||
                    errorMessage.includes("expired") ||
                    errorMessage.includes("Token 無效") ||
                    errorMessage.includes("Token 已過期") ||
                    errorMessage.includes("尚未登入") ||
                    errorMessage.includes("未登入") ||
                    errorMessage.includes("請先登入") ||
                    errorMessage.includes("Unauthorized");

                if (isTokenError && accessToken.value) {
                    // 單次只執行一次 refresh，多個並發 401 共用同一個 Promise
                    if (!refreshPromise) {
                        console.log("[api-interceptor] Token 過期，嘗試刷新...");
                        refreshPromise = refreshToken().finally(() => {
                            refreshPromise = null;
                        });
                    }
                    const refreshed = await refreshPromise;

                    if (refreshed && accessToken.value) {
                        // 重試時使用「新的 options」與「目前最新的 token」，並帶上 X-Access-Token
                        const retryOptions = {
                            ...options,
                            headers: {
                                ...(options.headers || {}),
                                Authorization: `Bearer ${accessToken.value}`,
                                "X-Access-Token": accessToken.value
                            }
                        };
                        return await originalFetch(url, retryOptions);
                    } else {
                        console.warn("[api-interceptor] Token 刷新失敗，執行登出");
                        const { logout } = useAuth();
                        await logout();
                    }
                } else if (!accessToken.value) {
                    console.warn("[api-interceptor] 沒有 Access Token，導向登入頁");
                    const { logout } = useAuth();
                    await logout();
                }
            }

            throw error;
        }
    };
});
