<script setup lang="ts">
import { ref } from 'vue';
import TransaksiHariIni from './TransaksiHariIni.vue';
import RequestSaldo from './RequestSaldo.vue';
import CardSaldoIAK from './CardSaldoIAK.vue';
import CardSaldoTripay from './CardSaldoTripay.vue';
// TransaksiHariIni
// RequestSaldo
const isLoading = ref(false);
</script>
<template>
  <div class="mx-auto p-4">
    <!-- Header -->
    <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
    <div v-else class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <CardSaldoIAK />
        </div>
        <div>
          <CardSaldoTripay />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <TransaksiHariIni />
        </div>
        <div>
          <RequestSaldo />
        </div>
      </div>
    </div>
  </div>
</template>
