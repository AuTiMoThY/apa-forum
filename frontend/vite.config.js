import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const hotFile = path.resolve(__dirname, 'public/hot')
const devOrigin = 'http://localhost:5173'

function ciHotFile() {
  return {
    name: 'ci-hot-file',
    configureServer(server) {
      const writeHot = () => {
        fs.writeFileSync(hotFile, devOrigin)
      }
      const removeHot = () => {
        try {
          fs.unlinkSync(hotFile)
        } catch {
          // ignore
        }
      }

      server.httpServer?.once('listening', writeHot)
      process.once('exit', removeHot)
      process.once('SIGINT', () => {
        removeHot()
        process.exit()
      })
      process.once('SIGTERM', () => {
        removeHot()
        process.exit()
      })
    },
  }
}

export default defineConfig({
  plugins: [tailwindcss(), ciHotFile()],
  base: process.env.NODE_ENV === 'production' ? '/assets/' : '/',
  publicDir: false,
  build: {
    // 只清空 JS/CSS 產物目錄；靜態圖放 public/images/，不會被 build 刪掉
    outDir: 'public/assets',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'resources/js/main.js'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    origin: devOrigin,
    cors: true,
  },
})
