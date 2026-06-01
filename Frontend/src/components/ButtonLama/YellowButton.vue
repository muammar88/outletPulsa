
<script setup>
  const emit = defineEmits(["click"]);
</script>
<template>
  <button @click="emit('click')" class="w-[40px] h-[40px] mx-[0.1rem] my-[0.15rem] flex justify-center items-center rounded-lg text-yellow-900 bg-yellow-200 border border-yellow-300 focus:outline-none hover:bg-yellow-300 focus:ring-4 focus:ring-yellow-100 font-medium rounded-lg text-sm dark:bg-yellow-800 dark:text-white dark:border-yellow-600 dark:hover:bg-yellow-700 dark:hover:border-yellow-600 dark:focus:ring-yellow-700">
    <slot></slot>
  </button>
</template>

