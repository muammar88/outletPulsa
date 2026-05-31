<template>
  <footer class="relative bg-white pt-20 overflow-hidden">
    <!-- ABSTRACT BACKGROUND ELEMENTS (Subtle for Footer) -->
    <div class="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-blue-50/80 to-transparent pointer-events-none"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>
    
    <div class="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-10 md:gap-8 text-sm text-gray-600 relative z-10 mb-16">
      <!-- Brand -->
      <div class="space-y-4 reveal" data-reveal>
        <a href="/" class="flex items-center gap-3 font-extrabold text-gray-800">
          <div class="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="Outlet Pulsa Logo" class="w-full h-full object-contain" />
          </div>
          <span class="text-xl tracking-tight">Outlet Pulsa</span>
        </a>
        <p class="text-gray-500 leading-relaxed max-w-xs">
          Platform penjualan pulsa, paket data, dan PPOB modern untuk membantu bisnis digital
          berkembang lebih cepat dan efisien.
        </p>
      </div>

      <!-- Navigasi -->
      <div class="reveal" data-reveal style="--delay: 100ms">
        <h3 class="font-bold text-gray-900 mb-4 text-base tracking-wide">Navigasi</h3>
        <ul class="space-y-3">
          <li><a href="/" class="footer-link">Beranda</a></li>
          <li><a href="/#testimoni" class="footer-link">Kisah Sukses</a></li>
          <li><a href="/price" class="footer-link">Daftar Harga</a></li>
        </ul>
      </div>

      <!-- Bantuan -->
      <div class="reveal" data-reveal style="--delay: 200ms">
        <h3 class="font-bold text-gray-900 mb-4 text-base tracking-wide">Pusat Bantuan</h3>
        <ul class="space-y-3">
          <li><a href="#" class="footer-link">FAQ</a></li>
          <li><a href="#" class="footer-link">Hubungi Kami</a></li>
          <li><a href="#" class="footer-link">Kebijakan Privasi</a></li>
          <li><a href="#" class="footer-link">Syarat &amp; Ketentuan</a></li>
        </ul>
      </div>

      <!-- Sosial + App -->
      <div class="reveal" data-reveal style="--delay: 300ms">
        <h3 class="font-bold text-gray-900 mb-4 text-base tracking-wide">Komunitas Kami</h3>
        <p class="text-gray-500 mb-4 leading-relaxed">
          Ikuti media sosial kami untuk update promo dan informasi terbaru.
        </p>
        <SocialMediaLinks />
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="relative z-10 border-t border-gray-200/60 bg-white/50 backdrop-blur-md">
      <div class="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="text-sm text-gray-500 font-medium">
          © 2026 Outlet Pulsa. All rights reserved.
        </div>
        <div class="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
          Dibuat dengan
          <IconHeart class="w-4 h-4 text-red-500 heart-beat" :stroke="2.5" fill="#ef4444" />
          di Indonesia
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { IconHeart } from '@tabler/icons-vue';
import SocialMediaLinks from '@/views/public/components/SocialMediaLinks.vue';

let revealObserver: IntersectionObserver;

onMounted(() => {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('footer [data-reveal]').forEach((el) => revealObserver.observe(el));
});

onUnmounted(() => {
  revealObserver?.disconnect();
});
</script>

<style scoped>
/* Abstract Blobs */
.animate-blob {
  animation: blob 10s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

/* Links */
.footer-link {
  position: relative;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
}
.footer-link::before {
  content: '→';
  position: absolute;
  left: -20px;
  opacity: 0;
  color: #3b82f6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.footer-link:hover { 
  color: #2563eb; 
  transform: translateX(16px);
}
.footer-link:hover::before { 
  opacity: 1; 
  left: -24px; 
}



/* Heart Beat */
.heart-beat {
  animation: heartBeat 1.4s ease-in-out infinite;
}
@keyframes heartBeat {
  0%   { transform: scale(1); }
  14%  { transform: scale(1.25); }
  28%  { transform: scale(1); }
  42%  { transform: scale(1.2); }
  56%  { transform: scale(1); }
}

</style>
