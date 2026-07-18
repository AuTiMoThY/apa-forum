export const useAuth = () => {
    // const config = useRuntimeConfig();
    const router = useRouter();
    const { public: runtimePublic } = useRuntimeConfig();
    const apiBase = runtimePublic.apiBase;

    // 狀態管理
    const user = useState<any>("user", () => {
        if (import.meta.client) {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        }
        return null;
    });
    const accessToken = useState<string | null>("accessToken", () => {
        if (import.meta.client) {
            return localStorage.getItem("access_token");
        }
        return null;
    });
    const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

    /**
     * 解析並顯示 JWT Token 資訊
     */
    const logJWTInfo = (context: string, token: string | null) => {
        if (!import.meta.client || !token) {
            return;
        }

        try {
            // JWT 格式：header.payload.signature
            const parts = token.split('.');
            if (parts.length !== 3 || !parts[1]) {
                console.log(`[JWT ${context}] Token 格式不正確`);
                return;
            }

            // 解析 payload（base64url 解碼）
            const payload = JSON.parse(
                atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
            ) as Record<string, any>;

            // 計算過期時間
            const now = Math.floor(Date.now() / 1000);
            const exp = payload.exp;
            const iat = payload.iat;
            const expiresIn = exp ? exp - now : null;
            const expiresAt = exp ? new Date(exp * 1000).toLocaleString('zh-TW') : null;
            const issuedAt = iat ? new Date(iat * 1000).toLocaleString('zh-TW') : null;
            const isExpired = exp ? now >= exp : false;

            console.group(`🔐 [JWT ${context}]`);
            console.log('Token:', token.substring(0, 50) + '...');
            console.log('Payload:', payload);
            console.log('使用者 ID (sub):', payload.sub || 'N/A');
            console.log('Token 類型:', payload.type || 'access');
            console.log('發行時間 (iat):', issuedAt || 'N/A');
            console.log('過期時間 (exp):', expiresAt || 'N/A');
            console.log('剩餘有效時間:', expiresIn ? `${Math.floor(expiresIn / 60)} 分鐘` : 'N/A');
            console.log('是否已過期:', isExpired ? '❌ 是' : '✅ 否');
            console.log('發行者 (iss):', payload.iss || 'N/A');
            console.log('接收者 (aud):', payload.aud || 'N/A');
            console.groupEnd();
        } catch (error) {
            console.error(`[JWT ${context}] 解析 Token 時發生錯誤:`, error);
            console.log(`[JWT ${context}] Token:`, token.substring(0, 50) + '...');
        }
    };

    /**
     * 登入
     */
    const login = async (username: string, password: string) => {
        try {
            const response = await $fetch<{
                success: boolean;
                message: string;
                data?: {
                    user: any;
                    access_token: string;
                    token_type: string;
                    expires_in: number;
                };
            }>(`${apiBase}/admins/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // 重要：允許傳送 Cookie（Refresh Token）
                body: {
                    username,
                    password,
                },
            });

            if (response.success && response.data) {
                accessToken.value = response.data.access_token;
                user.value = response.data.user;

                if (import.meta.client) {
                    localStorage.setItem("access_token", response.data.access_token);
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                }

                // 顯示 JWT 資訊
                logJWTInfo("登入成功", response.data.access_token);

                return {
                    success: true,
                    message: response.message,
                };
            }

            return {
                success: false,
                message: response.message || "登入失敗",
            };
        } catch (error: any) {
            console.error("登入錯誤:", error.data);
            // $fetch 在非 2xx 狀態碼時會拋出錯誤，錯誤資料可能在 error.data 或 error.response._data
            // fail() 方法回傳格式: { status, error, messages: { error: "..." } }
            // 其他錯誤回傳格式: { success: false, message: "..." }
            const errorMessage = 
                error?.data?.messages?.error ||  // fail() 方法的回傳格式
                error?.data?.message ||          // 其他錯誤回傳格式
                error?.response?._data?.messages?.error ||  // fail() 方法的備用路徑
                error?.response?._data?.message ||          // 其他錯誤的備用路徑
                error?.message || 
                "登入失敗，請稍後再試";
            return {
                success: false,
                message: errorMessage,
            };
        }
    };

    /**
     * 刷新 Access Token
     */
    const refreshToken = async (): Promise<boolean> => {
        try {
            const response = await $fetch<{
                success: boolean;
                message: string;
                data?: {
                    access_token: string;
                    token_type: string;
                    expires_in: number;
                };
            }>(`${apiBase}/admins/refresh`, {
                method: "POST",
                credentials: "include", // 重要：自動傳送 Refresh Token Cookie
            });

            if (response.success && response.data) {
                accessToken.value = response.data.access_token;

                if (import.meta.client) {
                    localStorage.setItem("access_token", response.data.access_token);
                }

                // 顯示 JWT 資訊
                logJWTInfo("Token 刷新成功", response.data.access_token);

                return true;
            }

            return false;
        } catch (error) {
            console.error("刷新 Token 錯誤:", error);
            return false;
        }
    };

    /**
     * 登出
     */
    const logout = async () => {
        try {
            await $fetch(`${apiBase}/admins/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("登出錯誤:", error);
        } finally {
            // 清除狀態
            accessToken.value = null;
            user.value = null;

            // 清除 localStorage
            if (import.meta.client) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
            }

            // 導向登入頁
            await router.push("/login");
        }
    };

    /**
     * 取得當前使用者資料
     */
    const fetchUser = async () => {
        if (!accessToken.value) {
            return false;
        }

        try {
            const response = await $fetch<{
                success: boolean;
                data?: any;
                message?: string;
            }>(`${apiBase}/admins/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken.value}`,
                },
                credentials: "include",
            });

            if (response.success && response.data) {
                user.value = response.data;

                if (import.meta.client) {
                    localStorage.setItem("user", JSON.stringify(response.data));
                }

                return true;
            }

            return false;
        } catch (error: any) {
            console.error("取得使用者資料錯誤:", error);
            
            // 如果是 401 錯誤，嘗試刷新 Token
            if (error?.status === 401 || error?.statusCode === 401) {
                const refreshed = await refreshToken();
                if (refreshed) {
                    // 重新嘗試取得使用者資料
                    return await fetchUser();
                }
            }
            
            // 刷新失敗，執行登出
            await logout();
            return false;
        }
    };

    /**
     * 初始化認證狀態
     */
    const initAuth = async () => {
        if (accessToken.value) {
            // 顯示 JWT 資訊（重新整理頁面時）
            logJWTInfo("頁面重新整理", accessToken.value);

            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("認證請求超時")), 5000);
                });
                
                await Promise.race([fetchUser(), timeoutPromise]);
            } catch (error) {
                console.error("initAuth error:", error);
                if (error instanceof Error && error.message === "認證請求超時") {
                    console.warn("認證請求超時，繼續載入頁面");
                }
            }
        } else {
            console.log("[JWT 頁面重新整理] 沒有找到 Access Token");
        }
    };

    /**
     * 檢查登入狀態（詳細診斷工具）
     * 用於除錯和診斷認證問題
     */
    const checkLoginStatus = () => {
        const status = {
            hasAccessToken: !!accessToken.value,
            hasUser: !!user.value,
            isAuthenticated: isAuthenticated.value,
            tokenInfo: null as any,
            localStorage: {
                accessToken: null as string | null,
                user: null as any
            },
            timestamp: new Date().toISOString()
        };

        // 檢查 localStorage
        if (import.meta.client) {
            status.localStorage.accessToken = localStorage.getItem("access_token");
            const storedUser = localStorage.getItem("user");
            status.localStorage.user = storedUser ? JSON.parse(storedUser) : null;
        }

        // 解析 Token 資訊
        if (accessToken.value) {
            try {
                const parts = accessToken.value.split('.');
                if (parts.length === 3 && parts[1]) {
                    const payload = JSON.parse(
                        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
                    ) as Record<string, any>;
                    
                    const now = Math.floor(Date.now() / 1000);
                    const exp = payload.exp;
                    const isExpired = exp ? now >= exp : false;
                    const expiresIn = exp ? exp - now : null;
                    const expiresAt = exp ? new Date(exp * 1000).toLocaleString('zh-TW') : null;

                    status.tokenInfo = {
                        userId: payload.user_id || payload.sub || 'N/A',
                        username: payload.username || 'N/A',
                        type: payload.type || 'access',
                        issuedAt: payload.iat ? new Date(payload.iat * 1000).toLocaleString('zh-TW') : 'N/A',
                        expiresAt,
                        expiresIn: expiresIn ? `${Math.floor(expiresIn / 60)} 分鐘` : 'N/A',
                        isExpired,
                        payload
                    };
                }
            } catch (error) {
                status.tokenInfo = { error: '無法解析 Token' };
            }
        }

        // 只在開發環境或 Token 有問題時輸出詳細資訊
        if (import.meta.dev || !status.hasAccessToken || status.tokenInfo?.isExpired) {
            console.group('🔍 [useAuth] 登入狀態檢查');
            console.log('認證狀態:', {
                hasAccessToken: status.hasAccessToken,
                hasUser: status.hasUser,
                isAuthenticated: status.isAuthenticated
            });
            if (status.tokenInfo) {
                if (status.tokenInfo.isExpired) {
                    console.warn('⚠️ Token 已過期！', status.tokenInfo.expiresAt);
                } else {
                    console.log('✅ Token 有效，剩餘時間:', status.tokenInfo.expiresIn);
                }
            } else if (!status.hasAccessToken) {
                console.warn('⚠️ 沒有 Token');
            }
            console.groupEnd();
        }

        return status;
    };

    return {
        user: readonly(user),
        accessToken: readonly(accessToken),
        isAuthenticated,
        login,
        logout,
        refreshToken,
        fetchUser,
        initAuth,
        checkLoginStatus,
    };
};
