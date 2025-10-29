<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';

import { useHead } from '@vueuse/head';

useHead({
  title: 'Outlet Pulsa :: Aplikasi Manajemen Transaksi PPOB',
  link: [{ rel: 'icon', type: 'image/png', href: 'public/favicon.png' }],
  meta: [
    {
      name: 'Aplikasi Outlet Pulsa',
      content: 'Aplikasi Outlet Pulsa',
    },
  ],
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
