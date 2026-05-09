<template>
  <div>
    <label v-if="label_status" :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <textarea
      :id="id"
      v-model="model"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :rows="rows"
      :class="[
        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-900 focus:border-green-900 text-gray-700 resize-none',
        error ? 'border-red-500' : 'border-gray-300',
      ]"
    ></textarea>
    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
    <p v-if="note" class="text-xs text-gray-500 mt-1 mb-2">{{ note }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String,
  id: String,
  placeholder: {
    type: String,
    default: 'Tulis pesan di sini...',
  },
  error: String,
  rows: {
    type: Number,
    default: 5,
  },
  note: String,
  label_status : { type : Boolean, default : true },
  required: { type: Boolean, default: false },
})

const model = defineModel()
defineEmits(['update:modelValue'])
</script>
