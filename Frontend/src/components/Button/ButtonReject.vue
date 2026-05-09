<script setup>
const emit = defineEmits(['click'])

defineProps({
  auto: { type: Boolean, default: true },
})
</script>

<template>
  <button
    @click="emit('click')"
    :class="auto ? 'md:w-auto' : ''"
    class="px-4 py-2 flex justify-center items-center rounded-lg text-white bg-red-500 border border-red-500 focus:outline-none hover:bg-red-600 focus:ring-4 focus:ring-red-300 font-medium text-sm dark:bg-red-600 dark:border-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
  >
    <slot></slot>
  </button>
</template>
