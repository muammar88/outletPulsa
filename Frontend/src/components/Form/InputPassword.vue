<template>
  <div>
    <label v-if="label_status == true" :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :type="showPassword ? 'text' : 'password'"
        :id="id"
        v-model="model"
        :placeholder="placeholder"
        :class="[
          'text-gray-700 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-900 focus:border-green-900 pr-10',
          error ? 'border-red-500' : 'border-gray-300'
        ]"
      />
      <button 
        type="button"
        @click="showPassword = !showPassword"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      </button>
    </div>
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
    <p v-if="note" class="text-xs text-gray-600 mt-2">{{ note }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showPassword = ref(false)
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
  label_status : { type : Boolean, default : true },
  required: { type: Boolean, default: false }
})
</script>
