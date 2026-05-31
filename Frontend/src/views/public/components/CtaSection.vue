<template>
  <div class="px-4 py-10 md:py-16">
    <section class="max-w-6xl mx-auto cta-section relative overflow-hidden rounded-[2.5rem] shadow-2xl px-8 py-20 md:px-16 md:py-24">
      <!-- ABSTRACT BACKGROUND -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 z-0"></div>
      
      <!-- GRID PATTERN OVERLAY -->
      <div class="absolute inset-0 cta-grid-pattern z-0 opacity-20"></div>

      <!-- ANIMATED ORBS / GLOWS -->
      <div class="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-blue-400 rounded-full mix-blend-screen filter blur-[100px] opacity-50 orb-anim-1 z-0"></div>
      <div class="absolute -bottom-40 -right-40 w-[35rem] h-[35rem] bg-indigo-400 rounded-full mix-blend-screen filter blur-[120px] opacity-50 orb-anim-2 z-0"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-cyan-300 rounded-[100%] mix-blend-overlay filter blur-[100px] opacity-30 orb-anim-3 z-0"></div>
      
      <!-- GLASSMORPHISM OVERLAY TO SMOOTH EVERYTHING -->
      <div class="absolute inset-0 bg-white/5 backdrop-blur-[2px] z-0"></div>

      <!-- CONTENT -->
      <div class="grid md:grid-cols-2 gap-12 items-center relative z-10">
        <!-- Text -->
        <div class="text-center md:text-left reveal" data-reveal>
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-blue-100 text-sm font-semibold mb-6 shadow-inner">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
            Akses Langsung
          </div>
          
          <h2 class="text-4xl md:text-5xl font-extrabold leading-tight text-white mb-5 tracking-tight">
            Mulai Bisnis Pulsa <br class="hidden md:block"/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">
              Sekarang Juga
            </span>
          </h2>
          
          <p class="opacity-90 max-w-md mx-auto md:mx-0 text-blue-50 text-lg leading-relaxed">
            Daftar gratis dan dapatkan akses penuh ke sistem penjualan pulsa modern yang
            cepat, stabil, dan menguntungkan.
          </p>
          
          <div class="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <a
              href="/registration"
              class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg shadow-xl btn-cta-white hover:scale-105 transition-all w-full sm:w-auto justify-center"
            >
              <IconRocket class="w-6 h-6 text-blue-500" :stroke="2" />
              Buat Akun
            </a>
            <a href="#testimoni" class="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-white font-medium hover:bg-white/10 transition-colors w-full sm:w-auto justify-center">
              Pelajari Lebih Lanjut
              <IconArrowRight class="w-5 h-5" :stroke="2" />
            </a>
          </div>
        </div>
        
        <!-- Decorative right side (Glass Card) -->
        <div class="flex justify-center md:justify-end reveal" data-reveal style="--delay: 150ms">
          <div class="relative w-full max-w-sm group perspective-1000">
            <!-- Floating Elements behind card -->
            <div class="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-cyan-300 to-blue-500 rounded-2xl shadow-lg transform rotate-12 animate-float-slow opacity-80 backdrop-blur z-0"></div>
            <div class="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full shadow-lg animate-float-delayed opacity-80 z-0"></div>
            
            <!-- Glass Card -->
            <div class="relative glass-card rounded-3xl p-8 border border-white/20 shadow-2xl backdrop-blur-xl z-10 transform transition-transform duration-500 group-hover:rotate-y-6 group-hover:rotate-x-6">
              <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 rounded-3xl pointer-events-none"></div>
              
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/90 to-white/60 flex items-center justify-center shadow-lg mb-6 mx-auto md:mx-0">
                <img src="/logo.png" alt="Outlet Pulsa Logo" class="w-10 h-10 object-contain cta-icon-pulse" />
              </div>
              
              <h3 class="text-2xl font-bold text-white mb-2 text-center md:text-left">Gabung 10K+ Mitra</h3>
              <p class="text-blue-100 text-sm text-center md:text-left mb-6 leading-relaxed">
                Platform terpercaya untuk meningkatkan omset bisnis konter dan PPOB kamu.
              </p>
              
              <!-- Mini Stats inside card -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/10 rounded-xl p-3 border border-white/10 text-center backdrop-blur">
                  <div class="text-2xl font-black text-white mb-1">99%</div>
                  <div class="text-xs text-blue-200 uppercase font-semibold">Uptime</div>
                </div>
                <div class="bg-white/10 rounded-xl p-3 border border-white/10 text-center backdrop-blur">
                  <div class="text-2xl font-black text-white mb-1">24/7</div>
                  <div class="text-xs text-blue-200 uppercase font-semibold">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { IconRocket, IconArrowRight } from '@tabler/icons-vue';

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
  document.querySelectorAll('.cta-section [data-reveal]').forEach((el) => revealObserver.observe(el));
});

onUnmounted(() => {
  revealObserver?.disconnect();
});
</script>

<style scoped>
.cta-grid-pattern {
  background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at center, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 80%);
}

.orb-anim-1 {
  animation: orbFloat1 15s ease-in-out infinite alternate;
}
.orb-anim-2 {
  animation: orbFloat2 18s ease-in-out infinite alternate-reverse;
}
.orb-anim-3 {
  animation: orbFloat3 12s ease-in-out infinite alternate;
}

@keyframes orbFloat1 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(100px, 50px) scale(1.2); }
}
@keyframes orbFloat2 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-80px, -60px) scale(1.1); }
}
@keyframes orbFloat3 {
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
  100% { transform: translate(-50%, -50%) rotate(10deg) scale(1.3); }
}

.glass-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
}

.animate-float-slow {
  animation: float 6s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float 7s ease-in-out infinite 1.5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(12deg); }
  50% { transform: translateY(-20px) rotate(8deg); }
}

.perspective-1000 {
  perspective: 1000px;
}
.rotate-y-6 {
  transform: rotateY(6deg);
}
.rotate-x-6 {
  transform: rotateX(6deg);
}

.btn-cta-white {
  position: relative;
  overflow: hidden;
}
.btn-cta-white::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59,130,246,0.12), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.btn-cta-white:hover::after { opacity: 1; }

.cta-icon-pulse {
  animation: ctaIconPulse 2s ease-in-out infinite;
}
@keyframes ctaIconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); filter: drop-shadow(0 0 10px rgba(59,130,246,0.4)); }
}
</style>
