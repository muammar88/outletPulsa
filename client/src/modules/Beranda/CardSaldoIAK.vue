<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { get_saldo_iak } from '@/service/beranda'; // Impor file API
import { formatRupiah } from '@/libs/formatRupiah';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';

const saldo = ref(0);
const isLoading = ref(false);

async function fetchData() {
  isLoading.value = true;
  try {
    const response = await get_saldo_iak();
    saldo.value = response.data.saldo;
  } catch (error) {
    console.error(error);
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 500));
    isLoading.value = false;
  }
}

onMounted(async () => {
  await fetchData();
});
</script>
<template>
  <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
  <div v-else class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded" role="alert">
    <p class="font-bold">Saldo IAK</p>
    <p>{{ formatRupiah(saldo) }}</p>
    <p>Indobest Artha Kreasi : Isi Pulsa, Bayar Tagihan, API Pulsa</p>
  </div>
</template>
