<template>
  <div>
    <label v-if="label_status == true" :for="id" class="block text-sm font-medium text-gray-700 mb-2">{{ label }}</label>
    <input
      :id="id"
      type="text"
      :value="value"
      readonly
      class="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
    />
    <p v-if="note" class="text-xs text-gray-600 mt-2">{{ note }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  id: String,
  label: String,
  value: String,
  note: String,
  label_status : { type : Boolean, default : true }
})
</script>
