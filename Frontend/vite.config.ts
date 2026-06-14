import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import { imagetools } from 'vite-imagetools';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools(), imagetools()],
  resolve: {
    alias: {
      // '@': path.resolve(__dirname, './src'),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0', // Agar bisa diakses dari luar container
    port: 5173, // Port default Vite dev server
    // watch: {
    //   usePolling: true, // Penting agar perubahan file terdeteksi dalam Docker
    //   interval: 1000, // Biar pollingnya gak seberat itu
    //   ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    // },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'vue',
            'vue-router',
            'pinia',
            'axios',
            'primevue',
            'sweetalert2',
            '@fortawesome/vue-fontawesome',
            'apexcharts',
            'vue3-apexcharts'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1500,
  },
});
