<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden" ref="pageRoot">
    <BackgroundParticles />
    <Navbar />
    
    <!-- spacer for fixed header -->
    <div class="h-20"></div>

    <HeroSection />
    <FeaturesSection />
    <StatsSection />
    <TestimonialSection />
    <CtaSection />
    <Footer />
    
    <FloatingActions />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BackgroundParticles from './components/BackgroundParticles.vue';
import Navbar from './components/Navbar.vue';
import HeroSection from './components/HeroSection.vue';
import FeaturesSection from './components/FeaturesSection.vue';
import StatsSection from './components/StatsSection.vue';
import TestimonialSection from './components/TestimonialSection.vue';
import CtaSection from './components/CtaSection.vue';
import Footer from './components/Footer.vue';
import FloatingActions from './components/FloatingActions.vue';

const pageRoot = ref<HTMLElement | null>(null);
</script>

<style>
/* ─── GOOGLE FONT ─────────────────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

* { font-family: 'Poppins', sans-serif; }

/* ─── GLOBAL UTILITIES ──────────────────────────────────────────────── */
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.65s cubic-bezier(0.4,0,0.2,1) var(--delay, 0ms),
              transform 0.65s cubic-bezier(0.4,0,0.2,1) var(--delay, 0ms);
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

.section-underline {
  width: 60px; height: 4px;
  background: linear-gradient(to right, #3b82f6, #6366f1);
  border-radius: 2px;
  margin: 16px auto 0;
  animation: underlineGrow 0.6s ease-out both;
}
@keyframes underlineGrow {
  from { width: 0; opacity: 0; }
  to   { width: 60px; opacity: 1; }
}

.btn-primary {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.btn-primary:hover::before { opacity: 1; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,0.4); }
.btn-primary:active { transform: translateY(0); }

.btn-outline {
  transition: all 0.3s ease;
}
.btn-outline:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59,130,246,0.15);
}
</style>
