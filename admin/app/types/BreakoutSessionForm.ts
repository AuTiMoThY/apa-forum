export interface BreakoutGroupListItem {
    id: number;
    code: string;
    title: string;
    content?: string | null;
    sort_order?: number;
    lecturer_count?: number;
    lecturer_summary?: string;
}

export interface BreakoutGroupItem extends BreakoutGroupListItem {
    created_at?: string;
    updated_at?: string;
}

export interface BreakoutGroupForm {
    code: string;
    title: string;
    content: string;
    sort_order: number;
}

export interface BreakoutGroupFormErrors {
    code?: string | boolean;
    title?: string | boolean;
    content?: string | boolean;
    sort_order?: string | boolean;
}

export interface BreakoutLecturerListItem {
    id: number;
    group_id: number;
    name: string;
    image?: string | null;
    image_url?: string | null;
    title?: string | null;
    intro?: string | null;
    sort_order?: number;
}

export interface BreakoutLecturerItem extends BreakoutLecturerListItem {
    created_at?: string;
    updated_at?: string;
}

export interface BreakoutLecturerForm {
    name: string;
    image: string;
    title: string;
    intro: string;
    sort_order: number;
}

export interface BreakoutLecturerFormErrors {
    name?: string | boolean;
    image?: string | boolean;
    title?: string | boolean;
    intro?: string | boolean;
    sort_order?: string | boolean;
}
