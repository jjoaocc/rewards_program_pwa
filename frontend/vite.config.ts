import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    rollupOptions: {
      // Multi-page: o painel admin é um app React separado, com seu próprio bundle
      // (não faz parte da SPA principal nem compartilha rota com ela).
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: false,
    testTimeout: 10000,
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest', // ← era generateSW (default), agora controlamos o SW
      srcDir: 'src',
      filename: 'sw.ts',            // ← aponta para o arquivo que acabou de criar
      registerType: 'autoUpdate',
      injectManifest: {
        swDest: 'dist/sw.js',
        // admin.html é um app separado (painel interno), não faz parte do PWA
        // instalável do cliente — não precisa ficar no cache offline dele.
        globIgnores: ['admin.html', '**/admin-*.js'],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Rewards Program',
        short_name: 'Rewards',
        description: 'Meu programa de fidelidade',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})