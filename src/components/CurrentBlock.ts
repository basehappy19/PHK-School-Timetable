import { AppState, Period } from "../types";
import { fmtHM, humanizeMs, enrichPeriods } from "../utils/time";

export const renderCurrentBlock = (state: AppState) => {
    const { schedule, selectedWd, now } = state;
    const isTodaySelected = selectedWd === now.getDay();
    
    const currentBlock = document.getElementById("currentBlock");
    const adjacentBlock = document.getElementById("adjacentBlock");
    
    if (!currentBlock || !adjacentBlock) return;

    if (!isTodaySelected) {
        currentBlock.style.display = "none";
        adjacentBlock.style.display = "none";
        return;
    }

    currentBlock.style.display = "";
    adjacentBlock.style.display = "";

    const todayRaw = schedule[selectedWd] || [];
    const today = enrichPeriods(todayRaw, now) as Period[];

    const { current, prev, next } = findNowPrevNext(today, now);

    renderCurrentCard(current, now);
    renderAdjacentCards(prev, next, now);
};

const findNowPrevNext = (periods: Period[], now: Date) => {
    const N = periods.length;
    let current: Period | null = null,
        prev: Period | null = null,
        next: Period | null = null;
    
    for (let i = 0; i < N; i++) {
        const p = periods[i];
        if (now >= p.startDate! && now < p.endDate!) {
            current = p;
            prev = periods[i - 1] ?? null;
            let nextIndex = i + 1;
            while (
                nextIndex < N &&
                periods[nextIndex].code &&
                current.code &&
                periods[nextIndex].code === current.code
            )
                nextIndex++;
            next = periods[nextIndex] ?? null;
            break;
        }
    }
    
    if (!current) {
        prev = periods.filter((p) => p.endDate! <= now).slice(-1)[0] ?? null;
        const firstUpcomingIndex = periods.findIndex((p) => p.startDate! > now);
        if (firstUpcomingIndex !== -1) {
            let nextIndex = firstUpcomingIndex;
            if (prev && periods[nextIndex].code === prev.code) {
                let j = nextIndex;
                while (j < N && periods[j].code === prev.code) j++;
                nextIndex = j;
            }
            next = periods[nextIndex] ?? null;
        }
    }
    return { current, prev, next };
};

const renderCurrentCard = (current: Period | null, now: Date) => {
    const card = document.getElementById("currentCard");
    const subjectEl = document.getElementById("currentSubject");
    const teacherEl = document.getElementById("currentTeacher");
    const timeEl = document.getElementById("currentTime");
    const statusEl = document.getElementById("currentStatus");
    const progressEl = document.getElementById("currentProgress");

    if (!card || !subjectEl || !teacherEl || !timeEl || !statusEl || !progressEl) return;

    if (current) {
        const isBreak = current.code === "BREAK";
        card.className = isBreak
            ? "p-8 bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-700 dark:to-gray-800 rounded-3xl shadow-2xl text-white relative overflow-hidden"
            : "p-8 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl shadow-2xl text-white current-period-glow relative overflow-hidden";

        const progressPercent = ((now.getTime() - current.startDate!.getTime()) / (current.endDate!.getTime() - current.startDate!.getTime())) * 100;
        progressEl.style.width = progressPercent + "%";

        subjectEl.textContent = current.subject;
        teacherEl.textContent = current.teacher
            ? `ครู${current.teacher}${current.room ? ` • ห้อง ${current.room}` : ""}`
            : current.room
            ? `ห้อง ${current.room}`
            : "";
        timeEl.textContent = `${fmtHM(current.startDate!)} - ${fmtHM(current.endDate!)}`;
        const left = current.endDate!.getTime() - now.getTime();
        statusEl.textContent = `เหลือเวลาอีก ${humanizeMs(left)}`;
    } else {
        card.className = "p-8 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl text-white relative overflow-hidden";
        progressEl.style.width = "0%";
        subjectEl.textContent = "ไม่มีคาบในขณะนี้";
        teacherEl.textContent = "—";
        timeEl.textContent = "—";
        statusEl.textContent = "พักผ่อน";
    }
};

const renderAdjacentCards = (prev: Period | null, next: Period | null, now: Date) => {
    const prevSub = document.getElementById("prevSubject");
    const prevTea = document.getElementById("prevTeacher");
    const prevTime = document.getElementById("prevTime");
    const prevEnd = document.getElementById("prevEnded");

    if (prevSub && prevTea && prevTime && prevEnd) {
        if (prev) {
            prevSub.textContent = prev.subject;
            prevTea.textContent = prev.teacher ? `ครู${prev.teacher}` : "";
            prevTime.textContent = `${fmtHM(prev.startDate!)} - ${fmtHM(prev.endDate!)}`;
            prevEnd.innerHTML = `
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
                <span>จบไปแล้ว ${humanizeMs(now.getTime() - prev.endDate!.getTime())}</span>
            `;
        } else {
            prevSub.textContent = "—";
            prevTea.textContent = "—";
            prevTime.textContent = "—";
            prevEnd.innerHTML = "—";
        }
    }

    const nextSub = document.getElementById("nextSubject");
    const nextTea = document.getElementById("nextTeacher");
    const nextTime = document.getElementById("nextTime");
    const nextCount = document.getElementById("nextCountdown");

    if (nextSub && nextTea && nextTime && nextCount) {
        if (next) {
            nextSub.textContent = next.subject;
            nextTea.textContent = next.teacher ? `ครู${next.teacher}` : "";
            nextTime.textContent = `${fmtHM(next.startDate!)} - ${fmtHM(next.endDate!)}`;
            const msUntil = Math.max(0, next.startDate!.getTime() - now.getTime());
            nextCount.innerHTML = `
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                </svg>
                <span>เริ่มในอีก ${humanizeMs(msUntil)}</span>
            `;
        } else {
            nextSub.textContent = "—";
            nextTea.textContent = "—";
            nextTime.textContent = "—";
            nextCount.innerHTML = "—";
        }
    }
};
