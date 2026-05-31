<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white gap-4">
      <!-- Logo -->
      <img src="/logo.png" alt="Logo" class="w-14 h-14 object-contain" />

      <!-- Spinner -->
      <div class="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin"></div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const show = ref(true);

onMounted(() => {
  if (document.readyState === 'complete') {
    setTimeout(() => (show.value = false), 1000);
  } else {
    window.addEventListener('load', () => setTimeout(() => (show.value = false), 1000), {
      once: true,
    });
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
