export const pad = (n: number): string => String(n).padStart(2, "0");

export const parseHM = (hm: string, base: Date = new Date()): Date => {
    const [H, M] = hm.split(":").map(Number);
    const d = new Date(base);
    d.setHours(H, M, 0, 0);
    return d;
};

export const fmtHM = (d: Date): string => {
    let h = d.getHours();
    const m = pad(d.getMinutes());
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${pad(h)}:${m} ${ampm}`;
};

export const fmt12HourWithSeconds = (d: Date): string => {
    let h = d.getHours();
    const m = pad(d.getMinutes());
    const s = pad(d.getSeconds());
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${pad(h)}:${m}:${s} ${ampm}`;
};

export const humanizeMs = (ms: number): string => {
    if (ms <= 0) return "ถึงเวลาแล้ว";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h} ชม. ${m} นาที`;
    if (m > 0) return `${m} นาที ${s} วินาที`;
    return `${s} วินาที`;
};

export const enrichPeriods = (periods: any[], baseDate: Date = new Date()): any[] =>
    periods
        .map((p) => ({
            ...p,
            startDate: parseHM(p.start, baseDate),
            endDate: parseHM(p.end, baseDate),
        }))
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
