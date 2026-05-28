export interface Period {
    start: string;
    end: string;
    subject: string;
    code: string;
    teacher?: string;
    room?: string;
    startDate?: Date; // Enriched
    endDate?: Date;   // Enriched
}

export interface ScheduleData {
    [weekday: string]: Period[];
}

export interface AppState {
    schedule: ScheduleData;
    selectedWd: number;
    searchTerm: string;
    now: Date;
}
