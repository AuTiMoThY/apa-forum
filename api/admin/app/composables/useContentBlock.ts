import type { MediaType, TemplateType } from "~/types/ContentBlock";

export const useContentBlock = () => {
    const getTemplateLabel = (template: TemplateType | "") => {
        if (!template) return "";
        const labels: Record<TemplateType, string> = {
            text_only: "純文字",
            image_only: "純圖片",
            image_left_text_right: "左圖右文",
            text_left_image_right: "左文右圖"
        };
        return labels[template];
    };
    const getMediaTypeLabel = (mediaType: MediaType | "") => {
        if (!mediaType) return "";
        const labels: Record<MediaType, string> = {
            image: "圖片",
            video: "影片",
            image_1_1_pair: "1:1雙圖片",
            image_6_4_pair: "6:4雙圖片",
            image_4_6_pair: "4:6雙圖片"
        };
        return labels[mediaType];
    };
    return { getTemplateLabel, getMediaTypeLabel };
};