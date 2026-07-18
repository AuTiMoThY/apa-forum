/**
 * API 錯誤處理 Plugin
 * 當 API 返回 401 未授權錯誤時，自動清除認證狀態並導向登入頁
 * 
 * 此 plugin 會攔截所有 $fetch 錯誤，當檢測到 401 錯誤時自動處理登出和重定向
 */
export default defineNuxtPlugin((nuxtApp) => {
    // 只在客戶端執行
    if (!import.meta.client) {
        return;
    }

    let isProcessing = false;

    // 處理未授權錯誤
    async function handleUnauthorized() {
        // 避免重複處理（例如多個請求同時返回 401）
        if (isProcessing) {
            return;
        }
        isProcessing = true;

        try {
            const { logout } = useAuth();
            const router = useRouter();

            // 清除認證狀態（會自動導向登入頁）
            await logout();
            
            // 顯示提示訊息（logout 可能已經在導向登入頁，這裡確保顯示訊息）
            const toast = useToast();
            toast.add({
                title: '登入已過期',
                description: '請重新登入',
                color: 'warning'
            });
        } catch (error) {
            console.error('處理未授權錯誤時發生問題:', error);
            // 如果 logout 失敗，至少嘗試導向登入頁
            const router = useRouter();
            if (router.currentRoute.value.path !== '/login') {
                await router.push('/login');
            }
        } finally {
            // 延遲重置，避免短時間內重複觸發
            setTimeout(() => {
                isProcessing = false;
            }, 1000);
        }
    }

    // 檢查錯誤是否是 401 未授權錯誤
    function isUnauthorizedError(error: any): boolean {
        // 檢查狀態碼
        const status = error?.status || error?.statusCode || error?.response?.status;
        if (status !== 401) {
            return false;
        }

        // 檢查錯誤訊息
        const responseData = error?.data || error?.response?._data || error?.response?.data;
        const errorMessage = responseData?.message || error?.message || '';
        
        // 如果訊息包含 Token 相關錯誤，讓 api-interceptor 處理
        const isTokenError = errorMessage.includes('Token 無效') || 
                             errorMessage.includes('Token 已過期') ||
                             errorMessage.includes('過期') ||
                             errorMessage.includes('expired');
        
        // 如果是 Token 錯誤，讓 api-interceptor 處理，這裡不處理
        if (isTokenError) {
            return false;
        }
        
        // 其他認證相關的 401 錯誤
        return errorMessage.includes('尚未登入') || 
               errorMessage.includes('請先登入') ||
               errorMessage.includes('未授權');
    }

    // 攔截未處理的 Promise rejection（$fetch 錯誤會作為 rejection 拋出）
    // 這會處理那些在 catch 區塊中未被處理的 401 錯誤
    if (typeof window !== 'undefined') {
        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason;
            
            // 檢查是否是 401 未授權錯誤
            if (isUnauthorizedError(error)) {
                handleUnauthorized();
                event.preventDefault(); // 阻止錯誤在控制台顯示
                return;
            }
        }, true); // 使用 capture phase 以優先處理
    }

    // 創建一個全局的錯誤處理輔助函數
    // 可以在 composables 的 catch 區塊中使用
    nuxtApp.provide('handleApiError', async (error: any) => {
        if (isUnauthorizedError(error)) {
            await handleUnauthorized();
            return true; // 表示已處理
        }
        return false; // 表示未處理
    });
});

