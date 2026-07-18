// 版型類型
export type TemplateType = 
    | "text_only"           // 純文字
    | "image_only"          // 純圖片
    | "image_left_text_right"  // 左圖右文
    | "text_left_image_right"; // 左文右圖

// 媒體類型（用於純圖片版型）
export type MediaType = 
    | "image"           // 圖片
    | "video"           // 影片
    | "image_1_1_pair"  // 1:1雙圖片
    | "image_6_4_pair"  // 6:4雙圖片
    | "image_4_6_pair"; // 4:6雙圖片

// 媒體類型（用於左圖右文、左文右圖版型）
export type LayoutMediaType = 
    | "image"  // 圖片
    | "video"; // 影片

// 欄位配置
export interface ContentBlockField {
    id: string;
    type: string;  // 欄位類型：content, image, caption, video_url 等
    label: string;
    value: string | string[]; // 單一值或陣列（用於雙圖片）
}

// 區塊資料結構
export interface ContentBlockData {
    id: string;
    index: number;
    template: TemplateType | "";  // 版型（可為空字串表示未選擇）
    mediaType?: MediaType | LayoutMediaType;  // 媒體類型（純圖片、左圖右文、左文右圖需要）
    fields: ContentBlockField[];  // 欄位列表
}

// 版型選項定義
export interface TemplateOption {
    type: TemplateType;
    label: string;
    icon: string;
    description: string;
}

