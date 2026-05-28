# PHK School Timetable (Enterprise Refactor)

A modern, high-performance school timetable application for Grade 12/1 students at Phu Khiao School.

## 🚀 Key Improvements (Refactor)

- **Architecture:** Transitioned from a single-file Vanilla JS setup to a modular, enterprise-grade architecture using **Vite** and **TypeScript**.
- **Performance:** Optimized rendering logic and state management. Moved from CDN-based Tailwind CSS to a compiled PostCSS pipeline for faster load times and smaller bundles.
- **Type Safety:** Implemented full TypeScript interfaces for data structures, ensuring a bug-resistant development experience.
- **Modularity:** Extracted logic into specialized modules:
  - `src/components/`: Modular UI rendering functions.
  - `src/services/`: Data fetching and external API interaction.
  - `src/utils/`: Pure utility functions for time and search.
  - `src/state.ts`: Centralized state management using a predictable Store pattern.
- **PWA:** Integrated `vite-plugin-pwa` for robust offline support and service worker management.

## 🛠 Tech Stack

- **Frontend:** Vanilla TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS (PostCSS)
- **PWA:** Workbox (via vite-plugin-pwa)
- **Data:** JSON

## 📂 Project Structure

```
├── public/                 # Static assets (schedule.json, icons)
├── src/
│   ├── components/         # UI Components (modular functions)
│   ├── services/           # API and data services
│   ├── styles/             # Tailwind & custom CSS
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Helper functions (Time, Search)
│   ├── state.ts            # Application state management
│   └── main.ts             # Entry point
├── index.html              # Minimal HTML shell
├── tailwind.config.ts      # Tailwind configuration
└── vite.config.ts          # Vite & PWA configuration
```

## 🏁 Getting Started

### Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```
The production-ready files will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
