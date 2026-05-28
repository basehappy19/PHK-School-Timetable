import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/PHK-School-Timetable/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon_io/*'],
      manifest: {
        name: 'ตารางเรียน ม.6/1',
        short_name: 'ตารางเรียน',
        description: 'ตารางเรียนชั้นมัธยมศึกษาปีที่ 6/1 โรงเรียนภูเขียว',
        theme_color: '#3b82f6',
        icons: [
          {
            src: 'favicon_io/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon_io/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
