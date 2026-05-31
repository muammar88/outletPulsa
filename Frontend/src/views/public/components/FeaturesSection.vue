<template>
  <section class="px-6 py-16 bg-white/70 backdrop-blur features-section">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12 reveal" data-reveal>
        <h2 class="text-3xl font-extrabold text-gray-800">Kenapa Pilih Kami?</h2>
        <p class="text-gray-500 mt-2">Fitur unggulan yang mendukung bisnis kamu setiap saat</p>
        <div class="section-underline"></div>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="(item, idx) in features"
          :key="item.title"
          class="feature-card reveal"
          data-reveal
          :style="{ '--delay': idx * 150 + 'ms' }"
          @mouseenter="onCardHover($event, true)"
          @mouseleave="onCardHover($event, false)"
          @mousemove="onCardMove($event)"
        >
          <div class="feature-icon-wrap">
            <component :is="item.icon" class="w-8 h-8 text-blue-600 feature-icon" :stroke="1.8" />
          </div>
          <h3 class="font-bold text-lg text-gray-800 mt-4">{{ item.title }}</h3>
          <p class="text-gray-600 text-sm mt-2">{{ item.desc }}</p>
          <div class="feature-card-glow"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { IconBolt, IconCoin, IconDeviceMobile } from '@tabler/icons-vue';

const features = [
  { icon: IconBolt,         title: 'Transaksi Cepat',   desc: 'Proses hitungan detik dengan sistem stabil dan andal.' },
  { icon: IconCoin,         title: 'Harga Kompetitif',  desc: 'Margin keuntungan lebih besar untuk setiap mitra kami.' },
  { icon: IconDeviceMobile, title: 'Semua Operator',    desc: 'Pulsa, paket data, dan PPOB lengkap semua operator.' },
];

function onCardHover(e: MouseEvent, entering: boolean) {
  const card = e.currentTarget as HTMLElement;
  if (!entering) {
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  }
}

function onCardMove(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement;
  const rect = card.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / (rect.width / 2);
  const dy = (e.clientY - cy) / (rect.height / 2);
  card.style.transform = `perspective(800px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) scale(1.03)`;
}

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
  document.querySelectorAll('.features-section [data-reveal]').forEach((el) => revealObserver.observe(el));
});

onUnmounted(() => {
  revealObserver?.disconnect();
});
</script>

<style scoped>
.feature-card {
  position: relative;
  padding: 28px 24px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  cursor: default;
  transition: box-shadow 0.4s, transform 0.2s;
  overflow: hidden;
}
.feature-card:hover {
  box-shadow: 0 12px 40px rgba(59,130,246,0.18);
}
.feature-card-glow {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: radial-gradient(circle at 50% 0%, rgba(59,130,246,0.08), transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.feature-card:hover .feature-card-glow { opacity: 1; }

.feature-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px; height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #dbeafe, #e0e7ff);
  transition: transform 0.3s, box-shadow 0.3s;
}
.feature-card:hover .feature-icon-wrap {
  transform: rotate(-5deg) scale(1.1);
  box-shadow: 0 8px 20px rgba(99,102,241,0.25);
}
.feature-icon {
  transition: transform 0.3s;
}
.feature-card:hover .feature-icon { transform: scale(1.15); }
</style>
