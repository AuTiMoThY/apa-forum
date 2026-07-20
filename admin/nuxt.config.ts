// https://nuxt.com/docs/api/configuration/nuxt-config

// 判斷是否為生產環境（generate/build）
const processEnv = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
).process?.env;
const isProduction = processEnv?.NODE_ENV === "production";

// 設定 API Base URL
// 優先使用環境變數 NUXT_PUBLIC_API_BASE
// 如果沒有設定，開發環境使用 localhost，生產環境使用正式網址
// 注意：執行 generate 時，Nuxt 會自動設定 NODE_ENV=production
const apiBase =
    processEnv?.NUXT_PUBLIC_API_BASE ||
    (isProduction ? "https://apaforum.clouduns.com/api" : "http://localhost:8092");

console.log("========== apiBase ==========", apiBase);
export default defineNuxtConfig({
    modules: [
        "@nuxt/eslint",
        "@nuxt/ui",
        "@nuxt/image",
        "@vueuse/nuxt",
        "nuxt-tiptap-editor",
        "nuxt-color-picker",
        "@nuxtjs/google-fonts"
    ],

    ssr: false, // 禁用 SSR，只使用客戶端渲染

    // 設定基礎路徑：開發時為 /，生產環境為 /admin/
    app: {
        baseURL: isProduction ? "/admin/" : "/"
    },

    devtools: {
        enabled: true
    },

    css: ["~/assets/css/main.css"],

    // 前後端分離：透過環境變數或預設的 API Base URL 呼叫後端
    runtimeConfig: {
        public: {
            apiBase
        }
    },

    compatibilityDate: "2025-01-15",

    // 開發時：composables 目錄有新增/刪除/變更時重啟 dev server，讓 auto-import 重新掃描
    watch: ["composables"],

    // 開發伺服器配置（port 為實際監聽埠，url 為顯示／回調用）
    devServer: {
        port: 8091,
        url: "http://localhost:8091"
    },

    // Vite 配置（Docker 環境中的 HMR 支援）
    vite: {
        server: {
            hmr: {
                host: "localhost",
            },
            watch: {
                usePolling: true, // Docker 環境中需要輪詢來檢測文件變更
                interval: 200,
            },
        },
    },

    // 開發時將 /api 代理到後端（避免拿到 Nuxt 的 HTML）
    nitro: {
        devProxy: {
            "/api": {
                target: apiBase,
                changeOrigin: true
            }
        }
    },

    eslint: {
        config: {
            stylistic: {
                commaDangle: "never",
                braceStyle: "1tbs",
                quotes: "double"
            }
        }
    },

    tiptap: {
        prefix: "Tiptap" //prefix for Tiptap imports, composables not included
    },

    googleFonts: {
        families: {
            "Noto+Sans+TC": true,
            "Noto+Sans+apaforum": true,
        },
        display: "swap",
        preconnect: true,
        preload: true
    },

});