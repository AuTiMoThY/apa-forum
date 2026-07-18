export interface LecturerListItem {
    id: number;
    name: string;
    image?: string | null;
    image_url?: string | null;
    title?: string | null;
    intro?: string | null;
    heading?: string | null;
    sort_order?: number;
}

export interface LecturerItem extends LecturerListItem {
    content?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface LecturerForm {
    name: string;
    image: string;
    title: string;
    intro: string;
    heading: string;
    content: string;
    sort_order: number;
}

export interface LecturerFormErrors {
    name?: string | boolean;
    image?: string | boolean;
    title?: string | boolean;
    intro?: string | boolean;
    heading?: string | boolean;
    content?: string | boolean;
    sort_order?: string | boolean;
}
