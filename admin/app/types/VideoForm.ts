export interface VideoForm {
    title: string;
    text: string;
    url: string;
    status: number;
}

export interface VideoFormErrors {
    title: boolean | string;
    text: boolean | string;
    url: boolean | string;
    status: boolean | string;
}
