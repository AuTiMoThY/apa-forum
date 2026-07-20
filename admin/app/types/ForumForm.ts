export interface ForumForm {
    content_tw: string | null;
    content_en: string | null;
}

export interface ForumFormErrors {
    content_tw: string | false;
    content_en: string | false;
}
