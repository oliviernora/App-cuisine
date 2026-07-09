import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Horodatage de construction, affiché dans le panneau Foyer : permet de
  // vérifier d'un coup d'œil quelle version tourne sur un appareil.
  define: {
    __BUILD__: JSON.stringify(new Intl.DateTimeFormat('fr-FR',
      { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(new Date()))
  },
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Garde-manger',
        short_name: 'Garde-manger',
        description: 'Stocks et courses du foyer',
        lang: 'fr',
        display: 'standalone',
        start_url: '/',
        background_color: '#FFFFFF',
        theme_color: '#C73E36',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  test: {
    include: ['tests/**/*.test.js']
  }
})
