import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or '@vitejs/plugin-vue' depending on your framework

export default defineConfig({
  plugins: [react()],
  base: '/', // This forces absolute routing paths instead of relative ones
})
