<script setup>
  const emit = defineEmits(["click"]);

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false, // menonaktifkan tombol
  },
});

</script>

<template>
  <button
    :disabled="props.disabled"
    @click="!props.disabled && emit('click')"
    class="w-[40px] h-[40px] mx-[0.1rem] my-[0.15rem] flex justify-center items-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
    :class="props.disabled ? 'disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed' : ''"
  >
    <slot></slot>
  </button>
</template>

