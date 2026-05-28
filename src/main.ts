import './styles/main.css';
import { store } from './state';
import { fetchSchedule } from './services/api';
import { renderStats } from './components/Stats';
import { renderCurrentBlock } from './components/CurrentBlock';
import { renderTimetable } from './components/Timetable';
import { fmt12HourWithSeconds } from './utils/time';
import { debounce } from './utils/search';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker
registerSW({
    onNeedRefresh() {
        if (confirm('มีอัปเดตใหม่ ต้องการรีโหลดเพื่อใช้งานเวอร์ชันล่าสุดหรือไม่?')) {
            location.reload();
        }
    },
    onOfflineReady() {
        console.log('แอปพร้อมใช้งานแบบออฟไลน์');
    },
});

const WEEKDAY_THAI = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
];

const render = () => {
    const state = store.getState();
    const now = state.now;

    // Update common elements
    const nowTimeEl = document.getElementById("nowTime");
    const nowDateEl = document.getElementById("nowDate");
    
    if (nowTimeEl) nowTimeEl.textContent = fmt12HourWithSeconds(now);
    if (nowDateEl) {
        nowDateEl.textContent =
            `${WEEKDAY_THAI[now.getDay()]}ที่ ` +
            now.toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
    }

    // Render components
    renderStats(state);
    renderCurrentBlock(state);
    renderTimetable(state);
};

// Initialize
const init = async () => {
    try {
        const schedule = await fetchSchedule();
        store.setState({ schedule });
        
        // Initial render
        render();
        
        // Subscribe to state changes
        store.subscribe(() => render());

        // Set up ticker
        setInterval(() => {
            store.setState({ now: new Date() });
        }, 1000);

        setupEventListeners();
    } catch (error) {
        console.error("Initialization failed:", error);
        const wrap = document.getElementById("todayTable");
        if (wrap) {
            wrap.innerHTML = `<div class="p-8 text-center text-red-500 dark:text-red-400 glass-effect rounded-2xl border border-dashed border-red-300 dark:border-red-800">ไม่สามารถโหลดตารางเรียนได้</div>`;
        }
    }
};

const setupEventListeners = () => {
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    const prevDayBtn = document.getElementById("prevDayBtn");
    const nextDayBtn = document.getElementById("nextDayBtn");

    if (searchInput) {
        const applySearch = debounce(() => {
            store.setState({ searchTerm: searchInput.value.trim() });
        }, 120);
        searchInput.addEventListener("input", applySearch);
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener("click", () => {
            searchInput.value = "";
            store.setState({ searchTerm: "" });
            searchInput.focus();
        });
    }

    if (prevDayBtn) {
        prevDayBtn.onclick = () => {
            const { selectedWd } = store.getState();
            if (selectedWd > 1) {
                store.setState({ selectedWd: selectedWd - 1 });
            }
        };
    }

    if (nextDayBtn) {
        nextDayBtn.onclick = () => {
            const { selectedWd } = store.getState();
            if (selectedWd < 5) {
                store.setState({ selectedWd: selectedWd + 1 });
            }
        };
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
            const tag = (document.activeElement?.tagName || "").toLowerCase();
            if (tag !== "input" && tag !== "textarea") {
                e.preventDefault();
                searchInput?.focus();
                searchInput?.select();
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', init);
