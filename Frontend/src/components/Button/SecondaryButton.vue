<script setup lang="ts">
const props = defineProps({
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['click']);
</script>

<template>
  <button 
    :type="type" 
    :disabled="disabled"
    @click="emit('click')" 
    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-seulanga-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    <slot></slot>
  </button>
</template>
