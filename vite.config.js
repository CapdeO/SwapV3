import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'; // Importa la función 'resolve' desde el módulo 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Utiliza 'path.resolve' aquí
      'jsbi': path.resolve(__dirname, '.', 'node_modules', 'jsbi', 'dist', 'jsbi-cjs.js')
    }
  }
})
