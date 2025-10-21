<template>
  <div class="flex flex-col justify-center items-center w-full h-full">
    <div
      class="animate-spin rounded-full border-4 border-gray-300 border-t-green-900 h-10 w-10"
    ></div>
    <span v-if="label" class="mt-3 text-gray-600 text-sm">{{ label }}</span>
  </div>
</template>

  <script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>
