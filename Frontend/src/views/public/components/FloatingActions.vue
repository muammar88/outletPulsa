<template>
  <div>
    <!-- SCROLL TO TOP -->
    <transition name="fade-scale">
      <button
        v-show="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-24 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:scale-110 hover:shadow-xl transition-all duration-300 scroll-top-btn"
      >
        <IconChevronUp class="w-6 h-6" :stroke-width="2.5" />
      </button>
    </transition>

    <!-- FLOATING WHATSAPP -->
    <a
      href="https://wa.me/6281234567890"
      target="_blank"
      class="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 hover:scale-110 hover:shadow-xl transition-all duration-300 wa-btn"
      title="Chat WhatsApp"
    >
      <IconBrandWhatsapp class="w-7 h-7" :stroke-width="1.8" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { IconChevronUp, IconBrandWhatsapp } from '@/components/Icons';

const showScrollTop = ref(false);

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* SCROLL TOP BUTTON */
.scroll-top-btn {
  animation: scrollBtnFloat 3s ease-in-out infinite;
}
@keyframes scrollBtnFloat {
  0%, 100% { box-shadow: 0 8px 24px rgba(59,130,246,0.3); }
  50%       { box-shadow: 0 12px 32px rgba(99,102,241,0.45); transform: translateY(-4px) scale(1.05); }
}
.scroll-top-btn:hover { animation: none; }

/* WA BUTTON */
.wa-btn {
  animation: waPulse 2.5s ease-in-out infinite;
}
@keyframes waPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4), 0 8px 24px rgba(34,197,94,0.3); }
  50%       { box-shadow: 0 0 0 12px rgba(34,197,94,0), 0 8px 24px rgba(34,197,94,0.4); }
}
.wa-btn:hover { animation: none; }

/* TRANSITIONS */
.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
.fade-scale-enter-from { opacity: 0; transform: scale(0.7) translateY(12px); }
.fade-scale-enter-to   { opacity: 1; transform: scale(1) translateY(0); }
.fade-scale-leave-from { opacity: 1; transform: scale(1) translateY(0); }
.fade-scale-leave-to   { opacity: 0; transform: scale(0.7) translateY(12px); }
</style>
