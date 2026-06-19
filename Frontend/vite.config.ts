import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import { imagetools } from 'vite-imagetools';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueJsx(),
    // DevTools only in development
    ...(mode === 'development' ? [vueDevTools()] : []),
    imagetools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    // Target modern browsers only - smaller output
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vue core - loaded first, smallest possible
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
            return 'vue-core';
          }
          // Vue Router & Pinia - state management
          if (id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) {
            return 'vue-router-pinia';
          }
          // Axios - HTTP
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
          // PrimeVue + PrimeIcons - UI library (large)
          if (id.includes('node_modules/primevue') || id.includes('node_modules/@primeuix') || id.includes('node_modules/primeicons')) {
            return 'primevue';
          }
          // FontAwesome
          if (id.includes('node_modules/@fortawesome')) {
            return 'fontawesome';
          }
          // Flowbite
          if (id.includes('node_modules/flowbite')) {
            return 'flowbite';
          }
          // Alertify
          if (id.includes('node_modules/alertifyjs')) {
            return 'alertify';
          }
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        },
      },
    },
    // Increase warning limit slightly but rely on proper chunking
    chunkSizeWarningLimit: 600,
  },
}));
