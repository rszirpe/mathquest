import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Resolve "@" -> ./src without importing node:url (keeps tsc happy with no @types/node).
// decodeURIComponent handles the space in the project folder name.
const srcDir = decodeURIComponent(new URL('./src', import.meta.url).pathname)

export default defineConfig({
  // Relative asset paths so the built site works under any sub-folder
  // (GitHub Pages project sites, etc.) instead of rendering blank.
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
})
