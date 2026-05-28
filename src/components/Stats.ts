import { AppState, Period } from "../types";

export const renderStats = (state: AppState) => {
    const now = state.now;
    const periods = (state.schedule[state.selectedWd] || []) as Period[];
    
    // We need periods enriched with dates for stats
    const enriched = periods.map(p => ({
        ...p,
        startDate: new Date(now).setHours(parseInt(p.start.split(':')[0]), parseInt(p.start.split(':')[1]), 0, 0),
        endDate: new Date(now).setHours(parseInt(p.end.split(':')[0]), parseInt(p.end.split(':')[1]), 0, 0)
    }));

    const classes = enriched.filter((p) => p.code !== "BREAK");
    const completed = classes.filter((p) => p.endDate <= now.getTime()).length;
    const total = classes.length;
    const remaining = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const el = (id: string) => document.getElementById(id);
    
    if (el("totalClasses")) el("totalClasses")!.textContent = String(total);
    if (el("completedClasses")) el("completedClasses")!.textContent = String(completed);
    if (el("remainingClasses")) el("remainingClasses")!.textContent = String(remaining);
    if (el("progressPercent")) el("progressPercent")!.textContent = percent + "%";
};
