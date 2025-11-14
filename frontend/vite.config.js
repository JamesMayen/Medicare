import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  experimental: {
    bundler: 'rolldown', // Enable experimental Rust-based bundler
  },
  server: {
    port: 5173,
  },
})
