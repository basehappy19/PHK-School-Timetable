import { Period } from "../types";

export const escapeHTML = (s: string | null | undefined): string =>
    s == null
        ? ""
        : String(s)
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");

export const makeQueryRegex = (q: string): RegExp | null => {
    if (!q) return null;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
        return new RegExp(escaped, "gi");
    } catch {
        return null;
    }
};

export const highlightHTML = (text: string, q: string): string => {
    if (!q) return escapeHTML(text || "");
    const rx = makeQueryRegex(q);
    if (!rx) return escapeHTML(text || "");
    const raw = String(text || "");
    let out = "";
    let last = 0;
    for (const m of raw.matchAll(rx)) {
        const i = m.index ?? 0;
        out += escapeHTML(raw.slice(last, i));
        out += `<mark class="px-1 rounded bg-yellow-200 text-gray-900 dark:bg-yellow-500/70">${escapeHTML(
            m[0]
        )}</mark>`;
        last = i + m[0].length;
    }
    out += escapeHTML(raw.slice(last));
    return out;
};

export const isMatch = (p: Period, q: string): boolean => {
    if (!q) return true;
    const t = q.toLowerCase();
    return (
        (p.subject || "").toLowerCase().includes(t) ||
        (p.teacher || "").toLowerCase().includes(t)
    );
};

export const debounce = <T extends (...args: any[]) => any>(fn: T, ms = 120) => {
    let h: any;
    return (...args: Parameters<T>) => {
        clearTimeout(h);
        h = setTimeout(() => fn(...args), ms);
    };
};
