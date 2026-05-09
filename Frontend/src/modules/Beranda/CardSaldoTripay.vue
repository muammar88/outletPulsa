<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { get_saldo_tripay } from '@/service/beranda'; // Impor file API
import { formatRupiah } from '@/libs/formatRupiah';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';

const saldo = ref(0);
const isLoading = ref(false);

async function fetchData() {
  isLoading.value = true;
  try {
    const response = await get_saldo_tripay();
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
  <div
    v-else
    class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded"
    role="alert"
  >
    <p class="font-bold">Saldo Tripay</p>
    <p>{{ formatRupiah(saldo) }}</p>
    <p>Distributor & Server Pulsa h2h</p>
  </div>
</template>
