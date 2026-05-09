
<script setup>
  const emit = defineEmits(["click"]);

  defineProps({
    auto: { type: Boolean, default: true },
  })
</script>
<template>
  <button @click="emit('click')" :class="auto ? 'md:w-auto' : ''" class="px-4 py-2 flex justify-center items-center rounded-lg bg-red-400 text-white hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400" >
    <slot></slot>
  </button>
</template>

