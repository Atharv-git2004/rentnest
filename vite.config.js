import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // 👈 ഇവിടെയാണ് മാറ്റം വരുത്തിയത്
  define: {
    global: 'window',
  },
})