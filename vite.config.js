// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Firebase
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage'
          ],

          // UI Libraries
          'vendor-ui': [
            '@headlessui/react',
            'react-hot-toast',
            'lucide-react'
          ],

          // Charts (ya lazy loaded, pero separado)
          'vendor-charts': ['recharts'],

          // Forms
          'vendor-forms': ['react-select', 'react-number-format'],

          // PDF (ya lazy loaded, mantener separado)
          'vendor-pdf': ['@react-pdf/renderer'],
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Aumentar límite a 1MB
  }
})