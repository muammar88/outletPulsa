<template>
  <header
    class="fixed top-0 left-0 w-full z-50 navbar-transition"
    :class="scrolled ? 'navbar-scrolled' : 'navbar-top'"
  >
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2 font-extrabold text-gray-800">
        <div class="w-9 h-9 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" class="w-full h-full object-contain drop-shadow" />
        </div>
        <span class="logo-text">Outlet Pulsa</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <a href="/" class="nav-link">Beranda</a>
        <a href="/#testimoni" class="nav-link">Testimoni</a>
        <a href="/price" class="nav-link">Harga</a>
        <a href="/contact" class="nav-link">Kontak Kami</a>
      </nav>

      <!-- Login & Daftar (Desktop) -->
      <div class="hidden md:flex items-center gap-3">
        <a href="/login" class="text-sm font-semibold text-gray-700 hover:text-blue-500 transition nav-link">Login</a>
        <a
          href="/registration"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm font-semibold shadow btn-primary"
        >
          Daftar
        </a>
      </div>

      <!-- Mobile Hamburger -->
      <div class="md:hidden flex items-center">
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="p-2 rounded-md hover:bg-gray-100 hamburger-btn"
          :class="{ 'hamburger-open': mobileMenuOpen }"
        >
          <IconX v-if="mobileMenuOpen" class="w-6 h-6 text-gray-700" :stroke="2" />
          <IconMenu2 v-else class="w-6 h-6 text-gray-700" :stroke="2" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-down">
      <div
        v-if="mobileMenuOpen"
        class="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur shadow-lg flex flex-col space-y-1 py-4 px-6 z-40"
      >
        <a href="/" class="block py-3 px-2 rounded-md text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition mobile-nav-item" style="--i:1">Beranda</a>
        <a href="/#testimoni" class="block py-3 px-2 rounded-md text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition mobile-nav-item" style="--i:2">Testimoni</a>
        <a href="/price" class="block py-3 px-2 rounded-md text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition mobile-nav-item" style="--i:3">Harga</a>
        <a href="/contact" class="block py-3 px-2 rounded-md text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition mobile-nav-item" style="--i:4">Kontak Kami</a>

        <div class="border-t border-gray-200 mt-2 pt-2 flex flex-col space-y-2">
          <a href="/login" class="block py-2 text-center rounded-md font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition">Login</a>
          <a href="/registration" class="block py-2 text-center rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow btn-primary">Daftar</a>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { IconMenu2, IconX } from '@tabler/icons-vue';

const mobileMenuOpen = ref(false);
const scrolled = ref(false);

const handleScroll = () => {
  scrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.navbar-transition {
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
}
.navbar-top {
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
}
.navbar-scrolled {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 4px 24px rgba(59,130,246,0.08);
}

.nav-link {
  position: relative;
  color: #4b5563;
  text-decoration: none;
  transition: color 0.25s;
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 0; bottom: -3px;
  width: 0; height: 2px;
  background: linear-gradient(to right, #3b82f6, #6366f1);
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
}
.nav-link:hover::after { width: 100%; }
.nav-link:hover { color: #3b82f6; }

.hamburger-btn { transition: all 0.3s; }
.hamburger-btn:hover { background: #eff6ff; transform: rotate(5deg); }

.mobile-nav-item {
  animation: slideInLeft 0.3s ease both;
  animation-delay: calc(var(--i) * 60ms);
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
.slide-down-enter-from { opacity: 0; transform: translateY(-12px); }
.slide-down-enter-to   { opacity: 1; transform: translateY(0); }
.slide-down-leave-from { opacity: 1; transform: translateY(0); }
.slide-down-leave-to   { opacity: 0; transform: translateY(-12px); }
</style>
