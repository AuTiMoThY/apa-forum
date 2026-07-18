/**
 * API 錯誤處理 Composable
 * 處理 API 錯誤，特別是 401 未授權錯誤
 */
export const useApiError = () => {
    const { logout } = useAuth();
    const router = useRouter();

    /**
     * 處理 API 錯誤
     * @param error 錯誤物件
     * @param options 處理選項
     */
    const handleApiError = async (
        error: any,
        options: {
            showToast?: boolean;
            redirectToLogin?: boolean;
        } = {}
    ) => {
        const {
            showToast = true,
            redirectToLogin = true
        } = options;

        // 檢查是否是 401 未授權錯誤
        const status = error?.status || error?.statusCode || error?.response?.status;
        const responseData = error?.data || error?.response?._data || error?.response?.data;
        const errorMessage = responseData?.message || error?.message || '';

        if (status === 401 && (
            errorMessage.includes('尚未登入') ||
            errorMessage.includes('請先登入') ||
            errorMessage.includes('未授權')
        )) {
            // 401 錯誤，需要登入
            if (redirectToLogin) {
                try {
                    // 清除認證狀態（會自動導向登入頁）
                    await logout();
                    
                    if (showToast) {
                        const toast = useToast();
                        toast.add({
                            title: '登入已過期',
                            description: '請重新登入',
                            color: 'warning'
                        });
                    }
                } catch (logoutError) {
                    console.error('登出時發生錯誤:', logoutError);
                    // 如果 logout 失敗，至少嘗試導向登入頁
                    if (router.currentRoute.value.path !== '/login') {
                        await router.push('/login');
                    }
                }
            }
            
            // 返回 true 表示已處理 401 錯誤
            return true;
        }

        // 不是 401 錯誤，返回 false 表示未處理
        return false;
    };

    /**
     * 封裝 $fetch，自動處理 401 錯誤
     * @param url API URL
     * @param options fetch 選項
     */
    const safeFetch = async <T = any>(
        url: string,
        options?: any
    ): Promise<T> => {
        try {
            return await $fetch<T>(url, options);
        } catch (error: any) {
            // 處理 401 錯誤
            const handled = await handleApiError(error);
            
            // 如果已處理 401，拋出一個特殊的錯誤，讓調用者知道已重定向
            if (handled) {
                throw new Error('UNAUTHORIZED_REDIRECTED');
            }
            
            // 其他錯誤直接拋出
            throw error;
        }
    };

    return {
        handleApiError,
        safeFetch
    };
};

