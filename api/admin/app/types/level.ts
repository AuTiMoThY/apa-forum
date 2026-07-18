export type LevelForm = {
    label: string;
    alias: string;
    module_id: number | string | null;
    url: string | null;
    status: boolean;
    parent_id?: number | string | null;
};

export type LevelFormErrors = {
    label: string | boolean;
    alias: string | boolean;
    module_id: string | boolean;
    status: string | boolean;
    url: string | boolean;
};