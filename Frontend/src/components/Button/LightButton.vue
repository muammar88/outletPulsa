
<script setup>
  const emit = defineEmits(["click"]);
</script>
<template>
  <button @click="emit('click')" class="w-[40px] h-[40px] mx-[0.1rem] my-[0.15rem] flex justify-center items-center rounded-lg text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
    <slot></slot>
  </button>
</template>

