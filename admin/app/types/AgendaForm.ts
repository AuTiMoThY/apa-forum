export interface AgendaItemForm {
    id?: number | null;
    session: string;
    type: string;
    topic: string;
    sort_order: number;
}

export interface AgendaDayForm {
    id?: number | null;
    label: string;
    sort_order: number;
    items: AgendaItemForm[];
}

export interface AgendaPayload {
    days: AgendaDayForm[];
}
