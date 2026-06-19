<script setup lang="ts">
defineProps<{
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}>();
</script>

<template>
  <div class="tooltip-wrapper">
    <slot></slot>
    <span class="tooltip-text tooltip-top" role="tooltip">{{ text }}</span>
  </div>
</template>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tooltip-text {
  visibility: hidden;
  opacity: 0;
  background-color: #1e293b;
  color: #f1f5f9;
  text-align: center;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 6px;
  position: absolute;
  z-index: 9999;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform: translateY(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

/* Arrow */
.tooltip-text::after {
  content: '';
  position: absolute;
  border-width: 4px;
  border-style: solid;
}

/* Top (default) */
.tooltip-top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
}
.tooltip-top::after {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-color: #1e293b transparent transparent transparent;
}

.tooltip-wrapper:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
