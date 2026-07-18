export type AdminForm = {
    permission_name?: string; // 保留以向後兼容
    status: string | boolean; // '0' | '1' 或 boolean
    username: string;
    password: string;
    password_confirmation: string;
    name: string;
    photo: string; // 頭像/照片（URL 或檔名）
    profile?: string; // 個人簡介
    expiration_date?: string | null; // 帳號到期日（YYYY-MM-DD，null 表示無期限）
    note_finance?: string;
    note_deliver?: string;
    note_purchase?: string;
    role_ids?: number[]; // RBAC 角色 ID 列表
    permission_ids?: number[]; // RBAC 直接權限 ID 列表
};

export type AdminFormErrors = {
    permission_name?: string | boolean;
    status: string | boolean;
    username: string | boolean;
    password: string | boolean;
    password_confirmation: string | boolean;
    name: string | boolean;
    photo?: string | boolean;
    profile?: string | boolean;
    expiration_date?: string | boolean;
    note_finance?: string | boolean;
    note_deliver?: string | boolean;
    note_purchase?: string | boolean;
    role_ids?: string | boolean;
    permission_ids?: string | boolean;
};

