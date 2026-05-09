<template>
  <div>
    <label v-if="label_status == true " :for="id" class="block text-sm font-medium text-gray-700 mb-2">{{ label }}</label>
    <input type="datetime-local" :id="id" v-model="model" :class="['text-gray-700 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-900 focus:border-green-900', error ? 'border-red-500' : 'border-gray-300']"/>
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
    <p v-if="note" class="text-xs text-gray-600 mt-2">{{ note }}</p>
  </div>
</template>

<script setup>
const model = defineModel()
defineProps({
  label: String,
  id: String,
  error: String,
  note: String,
  label_status : { type : Boolean, default : true }
})
</script>
