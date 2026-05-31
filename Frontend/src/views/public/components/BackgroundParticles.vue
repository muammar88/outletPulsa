<template>
  <div class="particles-container" aria-hidden="true">
    <span v-for="n in 20" :key="n" class="particle" :style="particleStyle(n)"></span>
  </div>
</template>

<script setup lang="ts">
function particleStyle(n: number) {
  const size = Math.random() * 6 + 4;
  const x = Math.random() * 100;
  const delay = Math.random() * 8;
  const duration = Math.random() * 10 + 8;
  const opacity = Math.random() * 0.4 + 0.1;
  return {
    width: size + 'px',
    height: size + 'px',
    left: x + '%',
    animationDelay: delay + 's',
    animationDuration: duration + 's',
    opacity,
    '--n': n,
  };
}
</script>

<style scoped>
.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.particle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #818cf8);
  animation: floatUp linear infinite;
  bottom: -20px;
}
@keyframes floatUp {
  0%   { transform: translateY(0) scale(1); opacity: var(--op, 0.2); }
  50%  { transform: translateY(-45vh) scale(1.2); }
  100% { transform: translateY(-100vh) scale(0.8); opacity: 0; }
}
</style>
