import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// setup语法糖name增强，使vue3语法糖支持name属性
import vueSetupExtend from 'vite-plugin-vue-setup-extend'

// element-plus
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// SVG
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  define: {},
  server: {
    host: true,
    port: 8080,
    proxy: {}
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'], // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      resolvers: [ElementPlusResolver()],
      // 解决自动导入后 eslint 报错
      eslintrc: {
        enabled: false,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      }
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svg')],
      symbolId: 'icon-[dir]-[name]'
    }),
    vueSetupExtend()
  ],
  // 打包相关配置
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        pure_funcs: ['console.log'], // 只删除 console.log
        drop_debugger: true // 删除 debugger
      }
    },
    rollupOptions: {
      output: {
        entryFileNames: 'js/entry-[hash].js',
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.includes('vendor')) {
            return 'libs/[name]-[hash].js'
          }
          return 'js/chunk-[hash].js'
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] || ''
          const ext = name.split('.').pop()?.toLowerCase()
          if (!ext) return 'assets/[name]-[hash][extname]'
          if (['css'].includes(ext)) return 'css/chunk-[hash][extname]'
          if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'images/[name]-[hash][extname]'
          if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) return 'fonts/[name]-[hash][extname]'
          if (['mp4', 'webm', 'ogg'].includes(ext)) return 'videos/[name]-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue-router')) return 'vendor-vue-router'
            if (id.includes('axios')) return 'vendor-axios'
            if (id.includes('markdown-it')) return 'vendor-markdown-it'
            if (id.includes('highlight.js')) return 'vendor-highlight'
            return 'vendor-other'
          }
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger']
  },
  // CSS 预处理器
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        javascriptEnabled: true
      }
    }
  }
})
