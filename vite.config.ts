import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {allowedHosts: ['29a4-2601-681-6201-ed20-9062-5524-4285-aa75.ngrok-free.app']},
})
