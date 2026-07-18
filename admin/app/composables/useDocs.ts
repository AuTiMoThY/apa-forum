import type { Ref } from "vue";

interface DocFile {
    path: string;
    title: string;
    description?: string;
    category?: string;
}

export const useDocs = () => {
    const { public: runtimePublic } = useRuntimeConfig();
    const apiBase = runtimePublic.apiBase;

    /**
     * 取得文件列表
     */
    const getFileList = async (): Promise<DocFile[]> => {
        try {
            const res = await $fetch<{
                success: boolean;
                data: DocFile[];
            }>(`${apiBase}/docs/list`, {
                method: "GET",
                credentials: "include"
            });

            if (res.success && res.data) {
                return res.data;
            }
            return [];
        } catch (error: any) {
            console.error("[useDocs] 取得文件列表失敗:", error?.message || error);
            return [];
        }
    };

    /**
     * 取得文件內容
     */
    const getFileContent = async (filePath: string): Promise<string> => {
        try {
            const res = await $fetch<{
                success: boolean;
                data: string;
            }>(`${apiBase}/docs/content`, {
                method: "GET",
                params: { path: filePath },
                credentials: "include"
            });

            if (res.success && res.data) {
                return res.data;
            }
            return "";
        } catch (error: any) {
            console.error("[useDocs] 取得文件內容失敗:", error?.message || error);
            throw error;
        }
    };

    return {
        getFileList,
        getFileContent
    };
};

