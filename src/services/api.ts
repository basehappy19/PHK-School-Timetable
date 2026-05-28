import { ScheduleData } from "../types";

export const fetchSchedule = async (): Promise<ScheduleData> => {
    const res = await fetch("./schedule.json");
    if (!res.ok) throw new Error("Failed to load schedule");
    return await res.json();
};
