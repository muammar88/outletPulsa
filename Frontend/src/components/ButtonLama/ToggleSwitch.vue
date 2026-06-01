<script setup lang="ts">
defineProps<{
  id: string | number
  checked: boolean
}>()

defineEmits(['change'])
</script>

<template>
  <label :for="'toggle-' + id" class="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      :id="'toggle-' + id"
      class="sr-only peer"
      :checked="checked"
      @change="$emit('change')"
    />
    <div
      class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"
    ></div>
  </label>
</template>
