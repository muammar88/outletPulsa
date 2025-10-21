<script setup lang="ts">
// Library
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Notification from '@/components/Modal/Notification.vue'
import BaseButton from '@/components/Button/BaseButton.vue'
import InputText from '@/components/Form/InputText.vue'
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue'

// Composable
import { useNotification } from '@/composables/useNotification'

// Service
import { add_syarat } from '@/service/syarat'

// Notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification()

// Props
interface Props {
  isModalOpen: boolean
}
const props = defineProps<Props>()

// Emit
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: { error_msg?: string; error?: boolean }): void
}>()

// State
const isSubmitting = ref(false)
const form = ref<{ name: string; path: string }>({ name: '', path: '' })
const errors = ref<Record<string, string>>({})

// Reset form
const resetForm = () => {
  form.value = { name: '', path: '' }
  errors.value = {}
}

// Validasi
const validateForm = () => {
  let isValid = true
  errors.value = {}

  if (!form.value.name) {
    errors.value.name = 'Nama syarat tidak boleh kosong.'
    isValid = false
  }

  if (!form.value.path) {
    errors.value.path = 'Path tidak boleh kosong.'
    isValid = false
  } else if (/\s/.test(form.value.path)) {
    errors.value.path = 'Path tidak boleh mengandung spasi, gunakan "_" sebagai pengganti.'
    isValid = false
  }

  return isValid
}

// Submit
const handleSubmit = async () => {
  if (!validateForm()) return

  // Ganti spasi menjadi _
  form.value.path = form.value.path.replace(/\s+/g, '_')

  isSubmitting.value = true
  try {
    console.log('form.value', form.value)
    const response = await add_syarat(form.value)
    emit('status', { error_msg: response.error_msg, error: response.error })
    closeModal()
  } catch (error: any) {
    const msg =
      error.response?.data?.error_msg || error.response?.data?.message || 'Terjadi kesalahan'
    displayNotification(msg, 'error')
  } finally {
    isSubmitting.value = false
    closeModal()
  }
}

// Close modal
const closeModal = () => {
  if (isSubmitting.value) return
  resetForm()
  emit('close')
}

// Escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isModalOpen) closeModal()
}
onMounted(() => document.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => document.removeEventListener('keydown', handleEscape))
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    enter-to-class="opacity-100 translate-y-0 sm:scale-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 translate-y-0 sm:scale-100"
    leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  >
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <LoadingSpinner v-if="isSubmitting" label="Menyimpan..." />
      <div v-else class="relative max-w-md w-full bg-white shadow-2xl rounded-2xl p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">TAMBAH SYARAT</h2>
          <button
            class="text-gray-400 text-lg hover:text-gray-600"
            @click="closeModal"
            aria-label="Tutup modal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Nama syarat -->
        <InputText
          v-model="form.name"
          label="Nama Syarat"
          type="text"
          placeholder="Masukkan nama syarat"
          :error="errors.name"
        />

        <!-- Path syarat -->
        <InputText
          v-model="form.path"
          label="Path"
          type="text"
          placeholder="Masukkan path"
          :error="errors.path"
        />

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-4">
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
            variant="primary"
            :disabled="!(form.name.trim() && form.path) || isSubmitting"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">Menyimpan...</span>
            <span v-else>Simpan</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
