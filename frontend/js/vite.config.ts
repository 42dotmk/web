// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: resolve(__dirname, '../wwwroot/js/'),
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'Base42',
      fileName: 'site',
    },
  },
})