<script setup>
const emit = defineEmits(['click']);
</script>

<template>
  <button
    @click="emit('click')"
    class="w-[40px] h-[40px] mx-[0.1rem] my-[0.15rem] flex justify-center items-center rounded-lg bg-green-600 text-white hover:bg-green-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
  >
    <slot></slot>
  </button>
</template>
