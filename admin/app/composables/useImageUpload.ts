export const useImageUpload = () => {
    const { public: runtimePublic } = useRuntimeConfig();
    const apiBase = runtimePublic.apiBase;
    const toast = useToast();

    const getImageDimensions = (file: File): Promise<{
        width: number;
        height: number;
        aspectRatio: number;
    }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    aspectRatio: img.naturalWidth / img.naturalHeight
                });
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await $fetch<{ success: boolean; url?: string; message?: string }>(
                `${apiBase}/upload/image`,
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        // 不要設定 Content-Type，讓瀏覽器自動設定（包含 boundary）
                    }
                }
            );

            if (response.success && response.url) {
                toast.add({
                    title: "上傳成功",
                    description: response.message || "圖片上傳成功",
                    color: "success"
                });
                return response.url;
            } else {
                toast.add({
                    title: "上傳失敗",
                    description: response.message || "圖片上傳失敗",
                    color: "error"
                });
                return null;
            }
        } catch (error: any) {
            console.error("圖片上傳錯誤:", error);
            toast.add({
                title: "上傳失敗",
                description: error.message || "圖片上傳時發生錯誤",
                color: "error"
            });
            return null;
        }
    };

    /**
     * 上傳到指定端點（如 /upload/banner、/upload/color），回傳 url 與 filename
     */
    const uploadToEndpoint = async (
        file: File,
        endpoint: string
    ): Promise<{ url: string; filename: string } | null> => {
        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await $fetch<{
                success: boolean;
                url?: string;
                filename?: string;
                message?: string;
            }>(`${endpoint}`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            if (response.success && response.url && response.filename) {
                toast.add({
                    title: "上傳成功",
                    description: response.message || "圖片上傳成功",
                    color: "success"
                });
                return { url: response.url, filename: response.filename };
            }
            toast.add({
                title: "上傳失敗",
                description: response.message || "圖片上傳失敗",
                color: "error"
            });
            return null;
        } catch (error: any) {
            console.error("圖片上傳錯誤:", error);
            toast.add({
                title: "上傳失敗",
                description: error?.message || "圖片上傳時發生錯誤",
                color: "error"
            });
            return null;
        }
    };

    const getImagePreview = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    return {
        uploadImage,
        uploadToEndpoint,
        getImagePreview,
        getImageDimensions
    };
};
