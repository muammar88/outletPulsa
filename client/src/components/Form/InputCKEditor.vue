<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label_status"
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- CKEditor -->
    <ckeditor
      :id="id"
      v-model="model"
      :editor="editor"
      :config="mergedConfig"
      class="border border-gray-300 rounded-lg shadow-sm bg-white
             focus-within:ring-2 focus-within:ring-green-900 focus-within:border-green-900
             transition-all duration-200 ease-in-out"
    />

    <!-- Error -->
    <transition name="fade">
      <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

// support v-model
const model = defineModel<string>()

const props = defineProps({
  label: { type: String, required: true },
  id: { type: String, required: true },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  label_status: { type: Boolean, default: true },
  config: { type: Object, default: () => ({}) },
  error: { type: String, default: '' },
})

const editor = ClassicEditor

const mergedConfig = computed(() => ({
  placeholder: props.placeholder,
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'underline',
    'link',
    '|',
    'bulletedList',
    'numberedList',
    'blockQuote',
    '|',
    'insertTable',
    'undo',
    'redo',
  ],
  ...props.config,
}))
</script>

<style scoped>
/* Animasi fade untuk error */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Styling CKEditor agar lebih konsisten */
.ck-editor__editable {
  min-height: 120px;
  padding: 0.75rem;
  border-radius: 0.5rem;
}
</style>
