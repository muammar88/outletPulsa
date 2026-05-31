<template>
  <section class="relative px-6 pt-24 pb-20 text-center overflow-hidden">
    <div class="max-w-4xl mx-auto space-y-6 hero-content" :class="{ 'hero-visible': heroVisible }">
      <!-- Badge -->
      <div class="hero-badge" :class="{ 'hero-badge-visible': heroVisible }">
        <span class="badge-dot"></span>
        <span>Platform Pulsa #1 di Indonesia</span>
      </div>

      <h1 class="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight hero-title" :class="{ 'hero-title-visible': heroVisible }">
        Aplikasi Pulsa Modern untuk
        <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent typed-text">
          {{ typedText }}<span class="typed-cursor" :class="{ 'cursor-blink': cursorBlink }">|</span>
        </span>
      </h1>
      <p class="text-gray-600 text-lg hero-desc" :class="{ 'hero-desc-visible': heroVisible }">
        Jual pulsa, paket data, dan PPOB dengan sistem cepat, stabil, dan keuntungan maksimal.
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center hero-btns" :class="{ 'hero-btns-visible': heroVisible }">
        <a
          href="/registration"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg btn-primary"
        >
          <IconUserPlus class="w-5 h-5" :stroke="2" />
          Daftar Sekarang
        </a>
        <a
          href="/login"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition btn-outline"
        >
          <IconLogin class="w-5 h-5" :stroke="2" />
          Login Member
        </a>
      </div>
    </div>

    <!-- decorative floating blobs -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl blob blob-1"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-300 opacity-30 rounded-full blur-3xl blob blob-2"></div>
    <div class="absolute top-1/2 left-1/4 w-48 h-48 bg-cyan-200 opacity-20 rounded-full blur-2xl blob blob-3"></div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { IconUserPlus, IconLogin } from '@tabler/icons-vue';

const heroVisible = ref(false);

const typingPhrases = ['Bisnis Digital Kamu', 'Agen Pulsa Handal', 'Konter Modern', 'Reseller Cerdas'];
const typedText = ref('');
const cursorBlink = ref(true);
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
let typingTimer: ReturnType<typeof setTimeout>;

function typeStep() {
  const current = typingPhrases[phraseIdx];
  if (!isDeleting) {
    typedText.value = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      isDeleting = true;
      typingTimer = setTimeout(typeStep, 1800);
      return;
    }
  } else {
    typedText.value = current.slice(0, --charIdx);
    if (charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % typingPhrases.length;
    }
  }
  typingTimer = setTimeout(typeStep, isDeleting ? 60 : 90);
}

onMounted(() => {
  setTimeout(() => { heroVisible.value = true; }, 100);
  typingTimer = setTimeout(typeStep, 800);
});

onUnmounted(() => {
  clearTimeout(typingTimer);
});
</script>

<style scoped>
.hero-content { position: relative; z-index: 1; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #dbeafe, #e0e7ff);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #3730a3;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.4,0,0.2,1);
  border: 1px solid rgba(99,102,241,0.2);
}
.hero-badge-visible { opacity: 1; transform: translateY(0); }

.badge-dot {
  width: 8px; height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulseDot 1.5s ease-in-out infinite;
}
@keyframes pulseDot {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
  50%       { transform: scale(1.2); box-shadow: 0 0 0 6px rgba(59,130,246,0); }
}

.hero-title {
  opacity: 0; transform: translateY(30px);
  transition: all 0.7s cubic-bezier(0.4,0,0.2,1) 0.1s;
}
.hero-title-visible { opacity: 1; transform: translateY(0); }

.hero-desc {
  opacity: 0; transform: translateY(24px);
  transition: all 0.7s cubic-bezier(0.4,0,0.2,1) 0.25s;
}
.hero-desc-visible { opacity: 1; transform: translateY(0); }

.hero-btns {
  opacity: 0; transform: translateY(24px);
  transition: all 0.7s cubic-bezier(0.4,0,0.2,1) 0.4s;
}
.hero-btns-visible { opacity: 1; transform: translateY(0); }

.typed-cursor { opacity: 1; transition: opacity 0.1s; }
.cursor-blink { animation: blink 0.8s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }

.blob { animation: blobFloat 8s ease-in-out infinite; }
.blob-1 { animation-duration: 9s; }
.blob-2 { animation-duration: 11s; animation-delay: -3s; }
.blob-3 { animation-duration: 7s; animation-delay: -5s; }
@keyframes blobFloat {
  0%, 100% { transform: translate(0,0) scale(1); }
  33%       { transform: translate(20px,-20px) scale(1.05); }
  66%       { transform: translate(-15px,15px) scale(0.97); }
}
</style>
