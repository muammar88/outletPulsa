<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center max-w-lg px-6">
      <!-- Icon -->
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            class="w-10 h-10 text-blue-600"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-5xl font-bold text-gray-800 mb-2">404</h1>

      <h2 class="text-xl font-semibold text-gray-700 mb-3">Halaman Tidak Ditemukan</h2>

      <p class="text-gray-500 text-sm leading-relaxed mb-8">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan. Periksa kembali alamat
        URL atau kembali ke halaman utama.
      </p>

      <!-- Actions -->
      <div class="flex justify-center gap-3">
        <button
          @click="goHome"
          class="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition"
        >
          Kembali ke Beranda
        </button>

        <button
          @click="goBack"
          class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition"
        >
          Halaman Sebelumnya
        </button>
      </div>

      <!-- Footer -->
      <p class="text-xs text-gray-400 mt-10">© {{ new Date().getFullYear() }} Selanga Platform</p>
    </div>
  </div>
</template>
