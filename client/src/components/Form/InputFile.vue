<template>
  <div>
    <!-- Label -->
    <label v-if="label_status" :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input File -->
    <div class="flex items-center">
      <input
        type="file"
        class="hidden"
        :id="id"
        :accept="accept"
        @change="onFileChange"
        ref="fileInput"
      />
      <label
        :for="id"
        class="px-4 py-2 bg-gray-100 border text-gray-700 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-150"
      >
        {{ buttonText }}
      </label>

      <!-- File Name & Remove Button -->
      <div class="ml-4 flex items-center space-x-2">
        <span
          class="text-gray-500 text-sm truncate max-w-[200px]"
          :class="{ 'text-gray-700 font-medium': fileName && fileName !== 'No file chosen' }"
          :title="fileName || 'No file chosen'"
        >
          {{ fileName || 'No file chosen' }}
        </span>

        <!-- Remove Button (only show if file is selected) -->
        <button
          v-if="fileName && fileName !== 'No file chosen'"
          @click="clearFile"
          type="button"
          class="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all duration-150"
          title="Hapus file"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Error -->
    <p v-if="errorMessage" class="text-red-500 text-sm mt-1">
      {{ errorMessage }}
    </p>

    <!-- Info -->
    <p v-if="!hideInfo" class="text-xs text-gray-600 mt-2">
      Ukuran maksimum: {{ maxSize }} KB. Tipe file: {{ accept }}.
    </p>
    <p v-if="!hideInfo && dimensionsInfo !== '-'" class="text-xs text-gray-500">
      Dimensi: {{ dimensionsInfo }}
    </p>

    <!-- Preview (opsional) -->
    <div v-if="showPreview && previewUrl && previewUrl !== ''" class="mt-3">
      <p class="text-sm text-gray-500 mb-2 font-semibold">Preview:</p>
      <div class="relative inline-block">
        <img
          :src="previewUrl"
          alt="Preview"
          class="h-32 rounded-md border border-gray-300 object-contain bg-gray-50"
        />
        <!-- Remove preview button -->
        <button
          @click="clearFile"
          type="button"
          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors duration-150"
          title="Hapus file"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
  id: { type: String, default: 'photo-upload' },
  label: { type: String, default: 'Upload Photo' },
  buttonText: { type: String, default: 'Choose File' },
  accept: { type: String, default: '.jpg,.jpeg,.png' },
  error: { type: String, default: '' },
  label_status: { type: Boolean, default: true },
  maxSize: { type: Number, default: 600 }, // KB
  dimensionsInfo: { type: String, default: '-' },
  required: { type: Boolean, default: false },
  hideInfo: { type: Boolean, default: false },

  // Support edit
  initialFileName: { type: String, default: '' },
  initialPreview: { type: String, default: '' },

  // Toggle preview
  showPreview: { type: Boolean, default: true },
});

const emit = defineEmits<{
  (e: 'file-selected', file: File | null): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const fileName = ref(props.initialFileName);
const internalError = ref('');
const previewUrl = ref(props.initialPreview);
const currentFile = ref<File | null>(null);

// Combine parent + internal error
const errorMessage = computed(() => {
  return props.error || internalError.value;
});

// Update kalau props berubah
watch(
  () => props.initialFileName,
  (val) => {
    fileName.value = val || '';
  },
);

watch(
  () => props.initialPreview,
  (val) => {
    // Revoke old preview URL if it was created by createObjectURL
    if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = val || '';
  },
);

// Cleanup blob URLs on unmount
onUnmounted(() => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value);
  }
});

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0] || null;

  if (!file) {
    clearFile();
    return;
  }

  // Validasi ukuran
  const fileSizeKB = Math.round(file.size / 1024);
  if (fileSizeKB > props.maxSize) {
    internalError.value = `Ukuran file terlalu besar (maks ${props.maxSize} KB)`;
    fileName.value = props.initialFileName || '';

    // Revoke old preview URL
    if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl.value);
    }
    previewUrl.value = props.initialPreview || '';

    // Reset input
    if (fileInput.value) {
      fileInput.value.value = '';
    }

    emit('file-selected', null);
    return;
  }

  // Clear previous error
  internalError.value = '';

  // Store current file
  currentFile.value = file;
  fileName.value = file.name;

  // Revoke old preview URL before creating new one
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value);
  }

  // Create new preview URL
  previewUrl.value = URL.createObjectURL(file);

  emit('file-selected', file);
}

function clearFile() {
  // Reset to initial values
  fileName.value = props.initialFileName || '';
  internalError.value = '';
  currentFile.value = null;

  // Revoke blob URL
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrl.value = props.initialPreview || '';

  // Reset input element
  if (fileInput.value) {
    fileInput.value.value = '';
  }

  emit('file-selected', null);
}

// Expose method untuk parent component
defineExpose({
  clearFile,
  getFile: () => currentFile.value,
});
</script>
