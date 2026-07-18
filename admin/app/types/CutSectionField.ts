// 欄位類型
export type FieldType = 
    | "title" 
    | "subtitle" 
    | "content" 
    | "desktop_image" 
    | "mobile_image" 
    | "video"
    | "text"
    | "number"
    | "textarea"
    | "switch"
    | "select"
    | "image"
    | "image_multiple";

// 欄位配置
export interface FieldConfig {
    type: FieldType;
    label: string; // 欄位標題（使用者可自訂）
    value: string | number | boolean | string[]; // 欄位內容（支援多種類型）
    id: string; // 唯一識別碼
    fieldName?: string; // 對應到表單的欄位名稱（用於動態欄位映射）
    options?: { label: string; value: string | number }[]; // select 類型的選項
    placeholder?: string; // 輸入框的提示文字
}

// 欄位類型定義（用於選擇器）
export interface FieldTypeOption {
    type: FieldType;
    label: string;
    icon: string;
    description: string;
}

// 區塊資料結構
export interface CutSectionData {
    id: string;
    index: number;
    fields: FieldConfig[];
}
