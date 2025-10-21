
<script setup>
  const emit = defineEmits(["click"]);

  defineProps({
    auto: { type: Boolean, default: true },
    // id: String,
    // placeholder: String,
    // type: { type: String, default: 'text' },
    // error: String,
    // note: String,
    // label_status: { type: Boolean, default: true },
    // readonly: { type: Boolean, default: false },
  })
</script>
<template>
  <button @click="emit('click')" :class="auto ? 'md:w-auto' : ''" class="px-4 py-2 flex justify-center items-center rounded-lg text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" >
    <slot></slot>
  </button>
</template>

