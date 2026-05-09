
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
  <button @click="emit('click')" :class="auto ? 'md:w-auto' : ''" class="px-4 py-2 flex justify-center items-center rounded-lg
         text-white bg-green-500 border border-green-500
         focus:outline-none hover:bg-green-600
         focus:ring-4 focus:ring-green-300
         font-medium text-sm
         dark:bg-green-600 dark:border-green-600
         dark:hover:bg-green-700 dark:focus:ring-green-800" >
    <slot></slot>
  </button>
</template>

