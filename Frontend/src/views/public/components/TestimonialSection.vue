<template>
  <section id="testimoni" class="px-6 py-20 bg-white relative overflow-hidden">
    <!-- background glow -->
    <div class="absolute -top-24 -left-24 w-72 h-72 bg-blue-200 opacity-40 rounded-full blur-3xl blob blob-1"></div>
    <div class="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-200 opacity-40 rounded-full blur-3xl blob blob-2"></div>

    <div class="max-w-6xl mx-auto text-center space-y-12 relative z-10">
      <div class="space-y-3 reveal" data-reveal>
        <h2 class="text-3xl md:text-4xl font-extrabold text-gray-800">Dipercaya Banyak Mitra</h2>
        <p class="text-gray-500 max-w-2xl mx-auto">
          Ribuan agen dan konter pulsa telah menggunakan sistem kami untuk meningkatkan penjualan
          dan keuntungan setiap hari.
        </p>
        <div class="section-underline"></div>
      </div>

      <!-- slider wrapper -->
      <div class="relative overflow-hidden">
        <div
          class="flex"
          :style="{ transform: `translateX(-${currentSlide * 100}%)`, transition: isSliding ? 'transform 0.7s cubic-bezier(0.4,0,0.2,1)' : 'none' }"
        >
          <div
            v-for="(group, gIndex) in testimonialGroups"
            :key="gIndex"
            class="w-full flex-shrink-0 px-4"
          >
            <div class="grid md:grid-cols-3 gap-8">
              <div
                v-for="t in group"
                :key="t.name"
                class="testimonial-card"
              >
                <IconQuote class="testi-quote-icon" :stroke-width="1" />
                <div class="flex items-center gap-4 mb-4">
                  <div class="testi-avatar">
                    {{ t.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800 leading-none">{{ t.name }}</p>
                    <p class="text-xs text-gray-400">Mitra Outlet Pulsa</p>
                  </div>
                </div>
                <p class="text-gray-600 text-sm leading-relaxed">"{{ t.text }}"</p>
                <div class="flex gap-1 mt-4">
                  <IconStarFilled
                    v-for="i in 5"
                    :key="i"
                    class="star w-4 h-4 text-yellow-400"
                    :style="{ '--star-delay': i * 100 + 'ms' }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- dots indicator -->
        <div class="flex justify-center gap-2 mt-8">
          <button
            v-for="(_, i) in testimonialGroups"
            :key="i"
            @click="goToSlide(i)"
            class="dot-btn"
            :class="currentSlide === i ? 'dot-active' : 'dot-inactive'"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { IconQuote, IconStarFilled } from '@/components/Icons';

const testimonials = [
  { name: 'Budi - Agen',     text: 'Aplikasinya stabil dan profitnya terasa setiap hari!' },
  { name: 'Sari - Konter',   text: 'Transaksi cepat, pelanggan jadi senang dan balik lagi.' },
  { name: 'Andi - Reseller', text: 'Support responsif dan sistem mudah dipakai pemula.' },
  { name: 'Dewi - Mitra',    text: 'Harganya kompetitif, cuan makin besar tiap bulan.' },
  { name: 'Rudi - Agen',     text: 'Daftar mudah, langsung bisa transaksi. Keren!' },
  { name: 'Lina - Konter',   text: 'PPOB-nya lengkap banget, semua tagihan bisa lewat sini.' },
];

const testimonialGroups = computed(() => {
  const groups: (typeof testimonials)[] = [];
  for (let i = 0; i < testimonials.length; i += 3) {
    groups.push(testimonials.slice(i, i + 3));
  }
  return groups;
});

const isSliding = ref(true);
const currentSlide = ref(0);

function goToSlide(i: number) {
  isSliding.value = true;
  currentSlide.value = i;
}

let slideTimer: ReturnType<typeof setInterval>;
let revealObserver: IntersectionObserver;

onMounted(() => {
  slideTimer = setInterval(() => {
    isSliding.value = true;
    currentSlide.value = (currentSlide.value + 1) % testimonialGroups.value.length;
  }, 5000);

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
  document.querySelectorAll('#testimoni [data-reveal]').forEach((el) => revealObserver.observe(el));
});

onUnmounted(() => {
  clearInterval(slideTimer);
  revealObserver?.disconnect();
});
</script>

<style scoped>
.testimonial-card {
  position: relative;
  max-width: 420px;
  margin: 0 auto;
  padding: 28px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  border: 1px solid #f1f5f9;
  text-align: left;
  overflow: hidden;
  transition: transform 0.35s, box-shadow 0.35s;
  animation: cardEntrance 0.5s ease-out both;
}
.testimonial-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 40px rgba(59,130,246,0.15);
}
@keyframes cardEntrance {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.testi-quote-icon {
  position: absolute;
  top: 12px; right: 16px;
  width: 48px; height: 48px;
  color: #e0e7ff;
  pointer-events: none;
}
.testi-avatar {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(99,102,241,0.35);
  transition: transform 0.3s;
}
.testimonial-card:hover .testi-avatar { transform: scale(1.1) rotate(-5deg); }

.star {
  display: inline-block;
  animation: starPop 0.4s ease-out both;
  animation-delay: var(--star-delay, 0ms);
}
@keyframes starPop {
  0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
  70%  { transform: scale(1.3) rotate(5deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.dot-btn {
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
}
.dot-active {
  width: 28px; height: 10px;
  border-radius: 5px;
  background: linear-gradient(to right, #3b82f6, #6366f1);
  box-shadow: 0 2px 8px rgba(99,102,241,0.4);
}
.dot-inactive {
  width: 10px; height: 10px;
  background: #d1d5db;
}
.dot-inactive:hover { background: #93c5fd; }
</style>
