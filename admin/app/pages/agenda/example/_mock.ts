/** Breakout 時程表 UI 試作用 mock 資料（純前端，不串 DB） */

export type ExampleTrack = {
    id: string;
    name: string;
    color: string;
    sortOrder: number;
};

export type ExampleTimeSlot = {
    id: string;
    start: string;
    end: string;
    sortOrder: number;
};

export type ExampleSession = {
    id: string;
    title: string;
    /** null 表示全軌事件（如 Break） */
    trackId: string | null;
    startSlotId: string;
    endSlotId: string;
    type?: string;
};

export const EXAMPLE_TRACKS: ExampleTrack[] = [
    {
        id: "t1",
        name: "Custom IC Design & Verification",
        color: "#9333ea",
        sortOrder: 0,
    },
    {
        id: "t2",
        name: "Digital IC Functional Design",
        color: "#2563eb",
        sortOrder: 1,
    },
    {
        id: "t3",
        name: "Digital IC Functional Verification",
        color: "#06b6d4",
        sortOrder: 2,
    },
    {
        id: "t4",
        name: "IC Physical Design & Verification",
        color: "#eab308",
        sortOrder: 3,
    },
    {
        id: "t5",
        name: "Manufacturing & Test",
        color: "#f97316",
        sortOrder: 4,
    },
];

export const EXAMPLE_TIME_SLOTS: ExampleTimeSlot[] = [
    { id: "s1", start: "13:00", end: "13:30", sortOrder: 0 },
    { id: "s2", start: "13:30", end: "14:00", sortOrder: 1 },
    { id: "s3", start: "14:00", end: "14:30", sortOrder: 2 },
    { id: "s4", start: "14:30", end: "14:50", sortOrder: 3 },
    { id: "s5", start: "14:50", end: "15:20", sortOrder: 4 },
    { id: "s6", start: "15:20", end: "15:50", sortOrder: 5 },
];

export const EXAMPLE_SESSIONS: ExampleSession[] = [
    {
        id: "ses1",
        title: "Accelerating Custom IC Design with AI-powered flows",
        trackId: "t1",
        startSlotId: "s1",
        endSlotId: "s1",
    },
    {
        id: "ses2",
        title: "Next-gen RTL synthesis for complex SoCs",
        trackId: "t2",
        startSlotId: "s1",
        endSlotId: "s1",
    },
    {
        id: "ses3",
        title: "Formal verification strategies at scale",
        trackId: "t3",
        startSlotId: "s1",
        endSlotId: "s1",
    },
    {
        id: "ses4",
        title: "Advanced place-and-route for 3nm",
        trackId: "t4",
        startSlotId: "s1",
        endSlotId: "s1",
    },
    {
        id: "ses5",
        title: "Smart manufacturing analytics",
        trackId: "t5",
        startSlotId: "s1",
        endSlotId: "s1",
    },
    {
        id: "ses6",
        title: "A holistic approach to SoC and system design complexity with Veloce Ecosystem",
        trackId: "t3",
        startSlotId: "s2",
        endSlotId: "s3",
    },
    {
        id: "ses7",
        title: "Low-power design methodologies",
        trackId: "t2",
        startSlotId: "s2",
        endSlotId: "s2",
    },
    {
        id: "ses8",
        title: "Break",
        trackId: null,
        startSlotId: "s4",
        endSlotId: "s4",
        type: "break",
    },
    {
        id: "ses9",
        title: "DFT best practices for automotive ICs",
        trackId: "t5",
        startSlotId: "s5",
        endSlotId: "s5",
    },
];

let idCounter = 100;

export const nextExampleId = (prefix: string) => {
    idCounter += 1;
    return `${prefix}${idCounter}`;
};

export const cloneExampleData = () => ({
    tracks: structuredClone(EXAMPLE_TRACKS),
    timeSlots: structuredClone(EXAMPLE_TIME_SLOTS),
    sessions: structuredClone(EXAMPLE_SESSIONS),
});

export const sortByOrder = <T extends { sortOrder: number }>(items: T[]) =>
    [...items].sort((a, b) => a.sortOrder - b.sortOrder);

export const getSlotIndex = (
    slots: ExampleTimeSlot[],
    slotId: string
): number => sortByOrder(slots).findIndex((s) => s.id === slotId);

export const getSlotSpan = (
    slots: ExampleTimeSlot[],
    startSlotId: string,
    endSlotId: string
): number => {
    const sorted = sortByOrder(slots);
    const start = sorted.findIndex((s) => s.id === startSlotId);
    const end = sorted.findIndex((s) => s.id === endSlotId);
    if (start < 0 || end < 0) return 1;
    return Math.max(1, end - start + 1);
};

export const formatSlotRange = (
    slots: ExampleTimeSlot[],
    startSlotId: string,
    endSlotId: string
) => {
    const sorted = sortByOrder(slots);
    const start = sorted.find(s => s.id === startSlotId);
    const end = sorted.find(s => s.id === endSlotId);
    if (!start || !end) return "—";
    return `${start.start} – ${end.end}`;
};

/** 某 track + slot 是否被某 session 覆蓋（非起始格） */
export const isSlotCovered = (
    sessions: ExampleSession[],
    trackId: string,
    slotId: string,
    slots: ExampleTimeSlot[]
): boolean => {
    const idx = getSlotIndex(slots, slotId);
    return sessions.some((ses) => {
        if (ses.trackId !== trackId) return false;
        const start = getSlotIndex(slots, ses.startSlotId);
        const end = getSlotIndex(slots, ses.endSlotId);
        if (start < 0 || end < 0) return false;
        return idx > start && idx <= end;
    });
};

export const findSessionAt = (
    sessions: ExampleSession[],
    trackId: string,
    slotId: string,
    slots: ExampleTimeSlot[]
): ExampleSession | undefined => {
    const idx = getSlotIndex(slots, slotId);
    return sessions.find((ses) => {
        if (ses.trackId !== trackId) return false;
        const start = getSlotIndex(slots, ses.startSlotId);
        const end = getSlotIndex(slots, ses.endSlotId);
        return idx >= start && idx <= end;
    });
};

export const findAllTrackSessionAt = (
    sessions: ExampleSession[],
    slotId: string
): ExampleSession | undefined =>
    sessions.find(
        (ses) =>
            ses.trackId === null &&
            ses.startSlotId === slotId &&
            ses.endSlotId === slotId
    );

export const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
};

export const getTimelineRange = (slots: ExampleTimeSlot[]) => {
    const sorted = sortByOrder(slots);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) return { startMin: 0, endMin: 60 };
    return {
        startMin: timeToMinutes(first.start),
        endMin: timeToMinutes(last.end),
    };
};

export const getSessionTimelineStyle = (
    session: ExampleSession,
    slots: ExampleTimeSlot[]
) => {
    const sorted = sortByOrder(slots);
    const startSlot = sorted.find((s) => s.id === session.startSlotId);
    const endSlot = sorted.find((s) => s.id === session.endSlotId);
    const { startMin, endMin } = getTimelineRange(slots);
    const total = endMin - startMin || 1;
    const left = startSlot
        ? ((timeToMinutes(startSlot.start) - startMin) / total) * 100
        : 0;
    const width = startSlot && endSlot
        ? ((timeToMinutes(endSlot.end) - timeToMinutes(startSlot.start)) /
              total) *
          100
        : 10;
    return {
        left: `${Math.max(0, left)}%`,
        width: `${Math.max(4, width)}%`,
    };
};

export const checkSessionConflict = (
    sessions: ExampleSession[],
    candidate: ExampleSession,
    slots: ExampleTimeSlot[]
): string | null => {
    const cStart = getSlotIndex(slots, candidate.startSlotId);
    const cEnd = getSlotIndex(slots, candidate.endSlotId);
    if (cStart < 0 || cEnd < 0 || cStart > cEnd) {
        return "起訖時段設定不正確";
    }

    for (const ses of sessions) {
        if (ses.id === candidate.id) continue;

        const sStart = getSlotIndex(slots, ses.startSlotId);
        const sEnd = getSlotIndex(slots, ses.endSlotId);
        const overlap = cStart <= sEnd && cEnd >= sStart;
        if (!overlap) continue;

        if (candidate.trackId === null || ses.trackId === null) {
            return "全軌事件與其他場次時間重疊";
        }
        if (candidate.trackId === ses.trackId) {
            return "同一軌道時間區間不可重疊";
        }
    }
    return null;
};
