<template>
  <div>
    <label v-if="label_status == true" :for="id" class="block text-sm font-medium text-gray-700 mb-2">{{ label }}</label>
    <input
      :type="type"
      :id="id"
      v-model="model"
      :placeholder="placeholder"
      :class="[
        'text-gray-700 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-900 focus:border-green-900',
        error ? 'border-red-500' : 'border-gray-300'
      ]"
    />
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
    <p v-if="note" class="text-xs text-gray-600 mt-2">{{ note }}</p>
  </div>
</template>

<script setup>
const model = defineModel() // jika Vue <3.4 belum mendukung ini, gunakan props & emits

defineProps({
  id: {
    type: String,
    default: 'password'
  },
  label: {
    type: String,
    default: 'Password'
  },
  placeholder: {
    type: String,
    default: 'Password'
  },
  type: {
    type: String,
    default: 'password'
  },
  error: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: 'Password hanya terdiri dari alpha numeric.'
  },
  label_status : { type : Boolean, default : true }
})
</script>
