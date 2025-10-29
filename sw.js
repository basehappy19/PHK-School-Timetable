// sw.js
const VERSION = "v1.0.0";
const PRECACHE = `precache-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;

const CORE_ASSETS = [
    "/", // ถ้าโฮสต์มี index.html ที่ root
    "/index.html",
    "/schedule.json",
    "/favicon_io/favicon-16x16.png",
    "/favicon_io/favicon-32x32.png",
    "/favicon_io/apple-touch-icon.png",
    "/favicon_io/android-chrome-192x192.png",
    "/favicon_io/android-chrome-512x512.png",
    "/site.webmanifest",
];

// ไว้แมตช์โดเมน CDN
const TAILWIND_CDN = "https://cdn.tailwindcss.com";
const FONTS_CSS = "https://fonts.googleapis.com/";
const FONTS_STATIC = "https://fonts.gstatic.com/";

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(PRECACHE).then((cache) => cache.addAll(CORE_ASSETS))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            // ลบแคชเวอร์ชันเก่า
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter((k) => k !== PRECACHE && k !== RUNTIME)
                    .map((k) => caches.delete(k))
            );
            await self.clients.claim();
        })()
    );
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // ข้ามพวก extension/devtools
    if (req.method !== "GET") return;

    // HTML (navigation) → network-first
    if (
        req.mode === "navigate" ||
        (req.headers.get("accept") || "").includes("text/html")
    ) {
        event.respondWith(networkFirst(req));
        return;
    }

    // schedule.json → network-first + fallback cache
    if (url.pathname.endsWith("/schedule.json")) {
        event.respondWith(networkFirst(req));
        return;
    }

    // CDN (Tailwind/Google Fonts) → stale-while-revalidate
    if (
        url.href.startsWith(TAILWIND_CDN) ||
        url.href.startsWith(FONTS_CSS) ||
        url.href.startsWith(FONTS_STATIC)
    ) {
        event.respondWith(staleWhileRevalidate(req));
        return;
    }

    // อื่น ๆ → cache-first
    event.respondWith(cacheFirst(req));
});

async function networkFirst(request) {
    const cache = await caches.open(RUNTIME);
    try {
        const fresh = await fetch(request);
        cache.put(request, fresh.clone());
        return fresh;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        // เผื่อกรณี navigation แล้วไม่มีแคช → เสิร์ฟ index.html จากแคช
        if (request.mode === "navigate") {
            const fallback = await caches.match("/index.html");
            if (fallback) return fallback;
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME);
    const cached = await cache.match(request);
    const fetchPromise = fetch(request)
        .then((response) => {
            cache.put(request, response.clone());
            return response;
        })
        .catch(() => null);
    return cached || fetchPromise || new Response("", { status: 504 });
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const fresh = await fetch(request);
        const cache = await caches.open(RUNTIME);
        cache.put(request, fresh.clone());
        return fresh;
    } catch (err) {
        return new Response("", { status: 504 });
    }
}
