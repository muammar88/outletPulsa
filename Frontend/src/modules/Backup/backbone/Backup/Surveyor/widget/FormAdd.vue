<script setup lang="ts">
// Library
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Notification from '@/components/Modal/Notification.vue'
import BaseButton from '@/components/Button/BaseButton.vue'
import InputText from '@/components/Form/InputText.vue'

// Composable
import { useNotification } from '@/composables/useNotification'

// Service
import { add_surveyor } from '@/service/surveyor'

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
const form = ref<{ name: string; nik: string; whatsapp_number: string }>({
  name: '',
  nik: '',
  whatsapp_number: '',
})
const errors = ref<Record<string, string>>({})

// Reset form
const resetForm = () => {
  form.value = { name: '', nik: '', whatsapp_number: '' }
  errors.value = {}
}

// Validasi
const validateForm = () => {
  let isValid = true
  errors.value = {}

  if (!form.value.name) {
    errors.value.name = 'Nama surveyor tidak boleh kosong.'
    isValid = false
  }

  if (!form.value.nik) {
    errors.value.nik = 'NIK surveyor tidak boleh kosong.'
    isValid = false
  }

  if (!form.value.whatsapp_number) {
    errors.value.whatsapp = 'Nomor Whatsapp surveyor tidak boleh kosong.'
    isValid = false
  } else if (!/^(\+62|62|0)[0-9]{9,15}$/.test(form.value.whatsapp_number)) {
    errors.value.whatsapp = 'Nomor Whatsapp tidak valid.'
    isValid = false
  }

  return isValid
}

// Submit
const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    console.log('form.value', form.value)
    const response = await add_surveyor(form.value)
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
          <h2 class="text-xl font-bold text-gray-800">TAMBAH SURVEYOR</h2>
          <button
            class="text-gray-400 text-lg hover:text-gray-600"
            @click="closeModal"
            aria-label="Tutup modal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Nama Surveyor -->
        <InputText
          v-model="form.name"
          label="Nama Surveyor"
          type="text"
          placeholder="Masukkan nama surveyor"
          :error="errors.name"
        />

        <!-- NIK Surveyor -->
        <InputText
          v-model="form.nik"
          label="NIK Surveyor"
          type="text"
          placeholder="Masukkan NIK surveyor"
          :error="errors.nik"
        />

        <!-- Nomor Whatsapp Surveyor -->
        <InputText
          v-model="form.whatsapp_number"
          label="Nomor Whatsapp Surveyor"
          type="text"
          placeholder="Masukkan nomor whatsapp surveyor"
          :error="errors.whatsapp"
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
            :disabled="!(form.name && form.nik && form.whatsapp_number) || isSubmitting"
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
