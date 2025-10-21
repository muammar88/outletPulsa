<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { logo } from '@/service/logo'; // fungsi buat ambil logo dari backend

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
const logoUrl = ref<string | null>(null);

const getLogo = async () => {
  try {
    const res = await logo();
    // asumsikan response { data: { value: 'uploads/logo.png' } }
    logoUrl.value = res;
  } catch (err) {
    console.error('Gagal ambil logo:', err);
  }
};

onMounted(() => {
  getLogo();
});
</script>

<template>
  <div class="flex items-center justify-end ml-auto">
    <img
      v-if="logoUrl"
      :src="`${BASE_URL}/uploads/img/logos/${logoUrl}`"
      alt="App Logo"
      class="h-12 object-contain"
    />
    <!-- Skeleton / placeholder kalau belum ke-load -->
    <div v-else class="animate-pulse bg-gray-200 h-12 w-12 rounded"></div>
  </div>
</template>

<style scoped>
img {
  max-height: 48px;
}
</style>
