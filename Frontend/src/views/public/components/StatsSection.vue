<template>
  <section class="px-6 py-16 stats-section" ref="statsSection">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-10 reveal" data-reveal>
        <h2 class="text-3xl font-extrabold text-gray-800">Angka yang Bicara</h2>
        <div class="section-underline"></div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div
          v-for="(s, i) in stats"
          :key="s.label"
          class="stat-card reveal"
          data-reveal
          :style="{ '--delay': i * 100 + 'ms' }"
        >
          <div class="stat-icon">
            <component :is="s.icon" class="w-8 h-8" :stroke-width="1.8" />
          </div>
          <p class="text-3xl font-extrabold text-blue-600 stat-number">{{ statsStarted ? s.display : '0' }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ s.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { IconUsers, IconRefresh, IconRocket, IconMessageCircle } from '@/components/Icons';

const statsSection = ref<HTMLElement | null>(null);
const statsStarted = ref(false);

const stats = ref([
  { value: 10000,   display: '0', suffix: 'K+',  label: 'Member Aktif',   icon: IconUsers },
  { value: 1000000, display: '0', suffix: 'Jt+', label: 'Transaksi',      icon: IconRefresh },
  { value: 99.9,    display: '0', suffix: '%',   label: 'Uptime Server',  icon: IconRocket },
  { value: 24,      display: '0', suffix: '/7',  label: 'Support',        icon: IconMessageCircle },
]);

function animateStats() {
  statsStarted.value = true;
  stats.value.forEach((s) => {
    const target = s.value;
    const duration = 1800;
    const step = 16;
    const totalSteps = Math.ceil(duration / step);
    let current = 0;
    let stepCount = 0;
    const timer = setInterval(() => {
      stepCount++;
      current = target * (stepCount / totalSteps);
      if (stepCount >= totalSteps) {
        current = target;
        clearInterval(timer);
      }
      if (s.suffix === 'K+') {
        s.display = (current / 1000).toFixed(0) + s.suffix;
      } else if (s.suffix === 'Jt+') {
        s.display = (current / 1000000).toFixed(0) + s.suffix;
      } else if (s.suffix === '%') {
        s.display = current.toFixed(1) + s.suffix;
      } else {
        s.display = Math.round(current) + s.suffix;
      }
    }, step);
  });
}

let revealObserver: IntersectionObserver;
let statsObserver: IntersectionObserver;

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
  document.querySelectorAll('.stats-section [data-reveal]').forEach((el) => revealObserver.observe(el));

  statsObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !statsStarted.value) {
        animateStats();
        statsObserver.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  if (statsSection.value) statsObserver.observe(statsSection.value);
});

onUnmounted(() => {
  revealObserver?.disconnect();
  statsObserver?.disconnect();
});
</script>

<style scoped>
.stat-card {
  padding: 24px 16px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  transition: transform 0.3s, box-shadow 0.3s;
}
.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(59,130,246,0.15);
}
.stat-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
  color: #3b82f6;
  animation: statIconBounce 2s ease-in-out infinite;
}
@keyframes statIconBounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}
.stat-number {
  font-variant-numeric: tabular-nums;
  transition: all 0.3s;
}
</style>
