import { AppState, Period } from "../types";
import { fmtHM, enrichPeriods } from "../utils/time";
import { highlightHTML, isMatch, escapeHTML } from "../utils/search";

import { store } from "../state";

const WEEKDAY_THAI = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
];

export const renderTimetable = (state: AppState) => {
    renderTabs(state);
    renderTodayList(state);
    renderSearchResults(state);
};

const renderTabs = (state: AppState) => {
    const tabs = document.getElementById("weekdayTabs");
    if (!tabs) return;

    tabs.innerHTML = "";

    for (let wd = 1; wd <= 5; wd++) {
        const label = WEEKDAY_THAI[wd];
        const isActive = wd === state.selectedWd;

        const btn = document.createElement("button");
        btn.className = "tab-btn px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105";
        btn.setAttribute("aria-current", String(isActive));
        btn.innerHTML = `<span class="tab-label">${label}</span>`;
        btn.onclick = () => {
            store.setState({ selectedWd: wd });
        };

        tabs.appendChild(btn);
    }
    updateDayButtons(state.selectedWd);
};

const updateDayButtons = (selectedWd: number) => {
    const prevBtn = document.getElementById("prevDayBtn") as HTMLButtonElement;
    const nextBtn = document.getElementById("nextDayBtn") as HTMLButtonElement;
    if (!prevBtn || !nextBtn) return;

    prevBtn.disabled = selectedWd <= 1;
    nextBtn.disabled = selectedWd >= 5;

    [prevBtn, nextBtn].forEach((btn) => {
        if (btn.disabled) {
            btn.classList.add("opacity-30", "cursor-not-allowed");
        } else {
            btn.classList.remove("opacity-30", "cursor-not-allowed");
        }
    });
};

const renderTodayList = (state: AppState) => {
    const wrap = document.getElementById("todayTable");
    const title = document.getElementById("todayTitle");
    if (!wrap || !title) return;

    const isTodaySelected = state.selectedWd === state.now.getDay();
    title.innerHTML = `
        <span class="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
        ${isTodaySelected ? "ตารางวันนี้" : `ตารางวัน${WEEKDAY_THAI[state.selectedWd]}`}
    `;

    const periodsRaw = state.schedule[state.selectedWd] || [];
    const periods = enrichPeriods(periodsRaw, state.now) as Period[];

    wrap.innerHTML = "";
    if (!periods.length) {
        wrap.innerHTML = `<div class="p-8 text-center text-gray-400 dark:text-gray-400 glass-effect rounded-2xl">วันนี้ไม่มีตารางเรียน</div>`;
        return;
    }

    periods.forEach((p) => {
        const active = isTodaySelected && state.now >= p.startDate! && state.now < p.endDate!;
        const isBreak = p.code === "BREAK";
        const matched = isMatch(p, state.searchTerm);

        const bgClass = active
            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl"
            : "glass-effect hover:shadow-lg";

        const fadeClass = !matched && state.searchTerm ? "opacity-30" : "";

        const subjectHTML = isBreak ? escapeHTML(p.subject) : highlightHTML(p.subject, state.searchTerm);
        const teacherText = p.teacher ? `ครู${p.teacher}` : "";
        const teacherHTML = highlightHTML(teacherText, state.searchTerm);
        const roomText = p.room && !isBreak ? ` • ห้อง ${p.room}` : "";
        const roomHTML = escapeHTML(roomText);

        const progressPercent = active
            ? ((state.now.getTime() - p.startDate!.getTime()) / (p.endDate!.getTime() - p.startDate!.getTime())) * 100
            : 0;

        wrap.insertAdjacentHTML(
            "beforeend",
            isBreak
                ? `
            <div class="p-5 rounded-2xl ${bgClass} ${fadeClass} flex items-center justify-center text-center transition-all">
                <div>
                    <div class="font-semibold ${active ? "text-white" : "text-gray-900 dark:text-gray-100"}">
                        ${subjectHTML}
                    </div>
                    <div class="mono text-sm ${active ? "text-white/80" : "text-gray-600 dark:text-gray-400"} mt-1">
                        ${fmtHM(p.startDate!)} - ${fmtHM(p.endDate!)}
                    </div>
                </div>
            </div>
            `
                : `
            <div class="p-5 rounded-2xl ${bgClass} ${fadeClass} transition-all relative overflow-hidden">
                ${active ? `<div class="absolute bottom-0 left-0 h-1 bg-white/30 w-full"><div class="h-full bg-white transition-all duration-1000" style="width: ${progressPercent}%"></div></div>` : ""}
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            ${active ? '<span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>' : ""}
                            <div class="font-semibold text-lg ${active ? "text-white" : "text-gray-900 dark:text-gray-100"}">
                                ${subjectHTML}
                            </div>
                        </div>
                        <div class="text-sm ${active ? "text-white/80" : "text-gray-500 dark:text-gray-300"} mt-1">
                            ${teacherHTML}${roomHTML}
                        </div>
                    </div>
                    <div class="mono text-sm ${active ? "text-white/90" : "text-gray-600 dark:text-gray-300"} ml-4">
                        ${fmtHM(p.startDate!)} - ${fmtHM(p.endDate!)}
                    </div>
                </div>
            </div>
            `
        );
    });
};

const renderSearchResults = (state: AppState) => {
    const box = document.getElementById("searchResults");
    if (!box) return;

    if (!state.searchTerm || !state.searchTerm.trim()) {
        box.classList.add("hidden");
        box.innerHTML = "";
        return;
    }

    const results: { wd: number; p: Period }[] = [];
    for (let wd = 1; wd <= 5; wd++) {
        const dayPeriods = state.schedule[wd] || [];
        for (const p of dayPeriods) {
            if (isMatch(p, state.searchTerm)) {
                results.push({ wd, p });
            }
        }
    }

    if (!results.length) {
        box.classList.remove("hidden");
        box.innerHTML = `<div class="p-4 rounded-xl glass-effect text-gray-500 dark:text-gray-300 text-center">ไม่พบผลลัพธ์ที่ตรงในสัปดาห์นี้</div>`;
        return;
    }

    const header = `<div class="p-3 rounded-xl glass-effect text-sm text-gray-600 dark:text-gray-200">ผลการค้นหา: <span class="font-semibold text-blue-600 dark:text-blue-400">${results.length}</span> รายการ</div>`;

    const itemsHTML = results
        .map(({ wd, p }) => {
            const subjectHTML = highlightHTML(p.subject, state.searchTerm);
            const teacherText = p.teacher ? `ครู${p.teacher}` : "";
            const teacherHTML = highlightHTML(teacherText, state.searchTerm);
            const roomHTML = p.room ? ` • ห้อง ${escapeHTML(p.room)}` : "";

            const pad = (n: number) => String(n).padStart(2, "0");
            const fmtStr = (hm: string) => {
                if (!hm) return "";
                const [H, M] = hm.split(":").map(Number);
                const ampm = H >= 12 ? "PM" : "AM";
                const h12 = H % 12 || 12;
                return `${pad(h12)}:${pad(M)} ${ampm}`;
            };

            return `
        <div class="p-4 rounded-xl glass-effect flex items-center justify-between hover:shadow-lg transition-all">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                        ${WEEKDAY_THAI[wd]}
                    </span>
                    <div class="font-semibold text-gray-900 dark:text-gray-100">${subjectHTML}</div>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-300">${teacherHTML}${roomHTML}</div>
            </div>
            <div class="mono text-sm text-gray-600 dark:text-gray-300 ml-4">${fmtStr(p.start)} - ${fmtStr(p.end)}</div>
        </div>
    `;
        })
        .join("");

    box.classList.remove("hidden");
    box.innerHTML = header + itemsHTML;
};
