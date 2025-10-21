<script setup lang="ts">
import BaseButton from '@/components/Button/BaseButton.vue'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

// Interface data running text
interface RunningText {
  id: number
  content: string
  is_active: boolean
  order: number
}

// Props dan Emits
const props = defineProps<{
  showModal: boolean
  editData?: RunningText | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: { id: number; content: string }]
}>()

const formEdit = ref({ content: '' })
const error = ref('')
const isSubmitting = ref(false)

watch(
  () => props.showModal,
  (newValue) => {
    if (newValue && props.editData) {
      formEdit.value.content = props.editData.content
      console.log('[FormEdit.vue] Modal opened with data:', props.editData)
    } else {
      resetForm()
    }
  },
)

// Watcher untuk data edit
watch(
  () => props.editData,
  (newData) => {
    if (newData && props.showModal) {
      formEdit.value.content = newData.content
    }
  },
)

// Fungsi untuk reset form
const resetForm = () => {
  formEdit.value.content = ''
  error.value = ''
  isSubmitting.value = false
}

const validateForm = (): boolean => {
  error.value = ''
  const content = formEdit.value.content.trim()

  if (!content) {
    error.value = 'Isi teks tidak boleh kosong'
    return false
  }

  if (content.length < 5) {
    error.value = 'Isi teks minimal 5 karakter'
    return false
  }

  if (content.length > 500) {
    error.value = 'Isi teks maksimal 500 karakter'
    return false
  }

  return true
}

// Fungsi untuk menangani penyimpanan
const handleSubmit = () => {
  if (isSubmitting.value || !props.editData) return

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const formData = {
    id: props.editData.id,
    content: formEdit.value.content.trim(),
  }

  console.log('[FormEdit.vue] Mengirim event "save" dengan data:', formData)

  // Emit save event to parent component
  emit('save', formData)

  // Reset submitting state after delay
  setTimeout(() => {
    if (props.showModal) {
      isSubmitting.value = false
    }
  }, 1000)
}

// Fungsi untuk menutup modal
const closeModal = () => {
  if (isSubmitting.value) return
  console.log('[FormEdit.vue] Closing modal')
  emit('close')
}

// Function: Handle escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.showModal) closeModal()
}

onMounted(async () => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(async () => {
  document.removeEventListener('keydown', handleEscape)
})

// Handle backdrop click
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-75 backdrop-blur-sm"
      @click="handleBackdropClick"
      @keydown.esc="closeModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="w-full max-w-lg mx-4 p-6 bg-white rounded-lg shadow-xl" @click.stop>
        <!-- Header Modal -->
        <div class="flex justify-between items-center mb-4">
          <h2 id="modal-title" class="text-xl font-bold text-gray-800">Edit Teks</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
            :disabled="isSubmitting"
            aria-label="Close modal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="editRunningText" class="block text-sm font-medium text-gray-700 mb-2">
              Isi Teks <span class="text-red-500">*</span>
            </label>
            <textarea
              id="editRunningText"
              v-model="formEdit.content"
              rows="4"
              class="mt-1 block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-900 focus:border-green-900 transition-colors"
              :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': error }"
              placeholder="Ketik teks yang akan ditampilkan di running text..."
              :disabled="isSubmitting"
              maxlength="500"
              required
              aria-required="true"
              :aria-invalid="!!error"
              aria-describedby="text-error counter-info"
            ></textarea>

            <div class="flex justify-between items-center mt-1">
              <p id="text-error" v-if="error" class="text-sm text-red-600">{{ error }}</p>
              <p id="counter-info" class="text-sm text-gray-500 ml-auto">
                {{ formEdit.content.length }}/500
              </p>
            </div>
          </div>

          <!-- Tombol Aksi -->
          <div class="flex justify-end gap-3">
            <BaseButton
              @click="closeModal"
              type="button"
              :disabled="isSubmitting"
              variant="secondary"
            >
              Batal
            </BaseButton>
            <BaseButton
              type="submit"
              :disabled="!formEdit.content.trim() || isSubmitting"
              variant="primary"
            >
              <span v-if="isSubmitting">Menyimpan...</span>
              <span v-else>Simpan Perubahan</span>
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
