<template>
  <div>
    <!-- Label -->
    <label v-if="label" :for="id" class="block text-sm font-semibold text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input File (Hidden) -->
    <input
      :id="id"
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      @change="onFileChange"
    />

    <!-- Upload Area -->
    <label
      :for="id"
      class="block w-full text-sm text-gray-700 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-center"
      :class="{ 'border-red-300 bg-red-50': errorMessage }"
    >
      <div class="flex flex-col items-center space-y-2">
        <!-- Icon Upload -->
        <svg
          class="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <div>
          <span class="text-blue-600 font-medium">{{ buttonText }}</span>
          <span class="text-gray-500"> atau drag & drop</span>
        </div>
        <p class="text-xs text-gray-500">
          {{ acceptText }} • Maks {{ maxFiles }} file
          <span v-if="maxSizePerFile"> • {{ maxSizePerFile }} KB/file</span>
        </p>
      </div>
    </label>

    <!-- Error Message -->
    <p v-if="errorMessage" class="text-red-500 text-sm mt-2">
      {{ errorMessage }}
    </p>

    <!-- File List Preview -->
    <div
      v-if="fileList.length > 0"
      class="mt-4 bg-gray-50 rounded-lg divide-y divide-gray-200 border border-gray-200"
    >
      <div
        v-for="(file, index) in fileList"
        :key="index"
        class="flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors duration-150"
      >
        <!-- File Info -->
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <!-- Icon berdasarkan tipe file -->
          <svg
            v-if="file.type.includes('pdf')"
            class="w-8 h-8 text-red-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <svg
            v-else-if="file.type.includes('image')"
            class="w-8 h-8 text-blue-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <svg
            v-else
            class="w-8 h-8 text-gray-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>

          <!-- File Details -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-700 truncate" :title="file.name">
              {{ file.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatFileSize(file.size) }}
            </p>
          </div>
        </div>

        <!-- Delete Button -->
        <button
          @click="removeFile(index)"
          type="button"
          class="ml-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all duration-150"
          title="Hapus file"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Summary -->
      <div class="px-4 py-2 bg-gray-100 text-xs text-gray-600">
        Total: {{ fileList.length }} file ({{ formatFileSize(totalSize) }})
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({
  id: { type: String, default: 'file-list-upload' },
  label: { type: String, default: '' },
  buttonText: { type: String, default: 'Pilih File' },
  accept: { type: String, default: '*' },
  acceptText: { type: String, default: 'Semua file' },
  multiple: { type: Boolean, default: true },
  maxFiles: { type: Number, default: 10 },
  maxSizePerFile: { type: Number, default: 0 }, // KB, 0 = no limit
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },

  // Support initial files (untuk edit mode)
  initialFiles: { type: Array as () => File[], default: () => [] },
});

const emit = defineEmits<{
  (e: 'files-changed', files: File[]): void;
}>();

const fileList = ref<File[]>([...props.initialFiles]);
const internalError = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const errorMessage = computed(() => {
  return props.error || internalError.value;
});

const totalSize = computed(() => {
  return fileList.value.reduce((sum, file) => sum + file.size, 0);
});

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const newFiles = Array.from(target.files || []);

  if (newFiles.length === 0) return;

  internalError.value = '';

  // Validasi jumlah file total
  const totalFiles = fileList.value.length + newFiles.length;
  if (totalFiles > props.maxFiles) {
    internalError.value = `Maksimal ${props.maxFiles} file. Kamu sudah punya ${fileList.value.length} file.`;
    if (fileInput.value) fileInput.value.value = '';
    return;
  }

  // Validasi ukuran per file
  if (props.maxSizePerFile > 0) {
    for (const file of newFiles) {
      const fileSizeKB = Math.round(file.size / 1024);
      if (fileSizeKB > props.maxSizePerFile) {
        internalError.value = `File "${file.name}" terlalu besar (maks ${props.maxSizePerFile} KB)`;
        if (fileInput.value) fileInput.value.value = '';
        return;
      }
    }
  }

  // Tambahkan file ke list
  fileList.value.push(...newFiles);
  emit('files-changed', fileList.value);

  // Reset input value agar bisa upload file yang sama lagi
  if (fileInput.value) fileInput.value.value = '';
}

function removeFile(index: number) {
  fileList.value.splice(index, 1);
  emit('files-changed', fileList.value);
  internalError.value = '';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Expose methods untuk parent component
defineExpose({
  clearFiles: () => {
    fileList.value = [];
    if (fileInput.value) fileInput.value.value = '';
    internalError.value = '';
    emit('files-changed', []);
  },
  getFiles: () => fileList.value,
});
</script>
