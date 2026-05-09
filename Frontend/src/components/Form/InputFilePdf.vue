<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  id: string;
  label: string;
  buttonText?: string;
  accept?: string;
  error?: string;
  maxSize?: number; // dalam KB
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Pilih File',
  accept: '.pdf',
  maxSize: 1000,
  required: false,
});

const emit = defineEmits<{
  (e: 'file-selected', file: File | null): void;
}>();

const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const fileSize = computed(() => {
  if (!selectedFile.value) return '';
  const sizeKB = Math.round(selectedFile.value.size / 1024);
  if (sizeKB > 1024) {
    return `${(sizeKB / 1024).toFixed(2)} MB`;
  }
  return `${sizeKB} KB`;
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;

  if (!file) {
    selectedFile.value = null;
    emit('file-selected', null);
    return;
  }

  // Validasi tipe file
  if (!file.type.includes('pdf')) {
    alert('File harus berformat PDF');
    target.value = '';
    return;
  }

  // Validasi ukuran file
  const fileSizeKB = Math.round(file.size / 1024);
  if (fileSizeKB > props.maxSize) {
    alert(`Ukuran file maksimal ${props.maxSize} KB`);
    target.value = '';
    return;
  }

  selectedFile.value = file;
  emit('file-selected', file);
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const removeFile = () => {
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  emit('file-selected', null);
};
</script>

<template>
  <div class="input-file-pdf">
    <label :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <div class="relative">
      <input
        :id="id"
        ref="fileInputRef"
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileChange"
      />

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="triggerFileInput"
          class="px-4 py-2 bg-gray-400 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          {{ buttonText }}
        </button>

        <div v-if="selectedFile" class="flex items-center gap-2 flex-1">
          <div
            class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 flex-1"
          >
            <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-700 truncate font-medium">
                {{ selectedFile.name }}
              </p>
              <p class="text-xs text-gray-500">{{ fileSize }}</p>
            </div>
          </div>

          <button
            type="button"
            @click="removeFile"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus file"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <span v-else class="text-sm text-gray-400">Belum ada file dipilih</span>
      </div>

      <p v-if="maxSize" class="mt-1 text-xs text-gray-500">
        Maksimal ukuran file: {{ maxSize }} KB
      </p>
    </div>

    <p v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.input-file-pdf {
  width: 100%;
}
</style>
