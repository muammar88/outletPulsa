
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
  <button @click="emit('click')" :class="auto ? 'md:w-auto' : ''" class="bg-[#455494] text-white px-4 py-2 rounded-lg hover:bg-[#3a477d] transition-colors duration-200 ease-in-out flex items-center gap-2 w-full  justify-center" >
    <slot></slot>
  </button>
</template>

