export interface OrganizerForm {
    content_tw: string | null;
    content_en: string | null;
}

export interface OrganizerFormErrors {
    content_tw: string | false;
    content_en: string | false;
}
