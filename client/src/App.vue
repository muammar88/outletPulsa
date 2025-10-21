<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import { useHead } from '@vueuse/head'

useHead({
  title: 'Aplikasi Muzakki & Mustahik Kabupaten Aceh Tengah',
  link: [{ rel: 'icon', type: 'image/png', href: 'public/favicon.png' }],
  meta: [
    {
      name: 'Aplikasi Muzakki & Mustahik',
      content: 'Aplikasi Muzakki & Mustahik Kabupaten Aceh Tengah',
    },
  ],
})
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
