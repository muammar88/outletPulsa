<script setup lang="ts">
// Library
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Notification from '@/components/Modal/Notification.vue'
import BaseButton from '@/components/Button/BaseButton.vue'
import InputFile from '@/components/Form/InputFile.vue'
import InputText from '@/components/Form/InputText.vue'

// Composable
import { useNotification } from '@/composables/useNotification'

// Service
import { add_kecamatan } from '@/service/kecamatan'

// Composable: notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
useNotification()

interface Props {
  isModalOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: { error_msg?: string; error?: boolean }): void
}>()

// Function: Close modal
const closeModal = () => {
  if (isSubmitting.value) return
  resetForm()
  emit('close')
}


// Function: Reset form
const resetForm = () => {
  form.value.name = ''
  form.value.kode = ''

  // Reset errors
  errors.value = {}
}

// Function:
const errors = ref<Record<string, string>>({
  name: '',
  img: '',
})

const validateForm = () => {
  let isValid = true

  // Reset errors
  errors.value = {}

  if (form.value.name === '') {
    errors.value.name = 'Nama Kecamatan tidak boleh kosong.'
    isValid = false
  }

  if (form.value.kode === '') {
    errors.value.kode = 'Kode Kecamatan tidak boleh kosong.'
    isValid = false
  }


  console.log(errors.value)

  return isValid
}

// Function: Handle file
const preview = ref<string | null>(null)

// const handleFile = (file: File | null) => {
//   if (!file) {
//     form.value.img = null
//     preview.value = null
//     return
//   }

//   // Validasi ukuran file
//   const fileSizeKB = Math.round(file.size / 1024)
//   if (fileSizeKB > 1000) {
//     errors.value.img = 'Ukuran file maksimal 1000 KB'
//     return
//   }

//   form.value.img = file
//   preview.value = URL.createObjectURL(file)
// }

// Function: Handle submit
const isSubmitting = ref(false)
const form = ref<{ name: string; kode: string }>({
  name: '',
  kode: '',
})

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const payload = {
      name: form.value.name,
      kode: form.value.kode,
    }

    console.log("Payload yang dikirim:", payload)

    const response = await add_kecamatan(payload)

    console.log("Response dari server:", response)

    emit('status', {
      error_msg: response?.error_msg || '',
      error: response?.error || false
    })

    closeModal()

  } catch (error: any) {
    console.error("Error saat tambah kecamatan:", error)

    if (error.response) {
      // server balas error
      displayNotification(
        error.response.data?.error_msg || error.response.data?.message || "Terjadi kesalahan di server",
        "error"
      )
    } else if (error.request) {
      // request dikirim tapi tidak ada respon
      displayNotification("Tidak ada respon dari server", "error")
    } else {
      // error lain (setup axios, dll)
      displayNotification(error.message || "Terjadi kesalahan tidak diketahui", "error")
    }
  } finally {
    isSubmitting.value = false
    closeModal()
  }
}

// Function: Handle escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isModalOpen) closeModal()
}
onMounted(async () => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(async () => {
  document.removeEventListener('keydown', handleEscape)
})
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
      aria-labelledby="modal-title"
    >
      <div
        class="relative max-w-md w-full bg-white shadow-2xl rounded-2xl p-6 space-y-6"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 id="modal-title" class="text-xl font-bold text-gray-800">
            Tambah Kecamatan
          </h2>
          <button
            class="text-gray-400 text-lg hover:text-gray-600"
            @click="closeModal"
            aria-label="Tutup modal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Nama kecamatan -->
        <div>
          <InputText
            id="name"
            v-model="form.name"
            label="Nama Kecamatan"
            type="text"
            placeholder="Masukkan nama Kecamatan"
            :error="errors.name"
          />
        </div>

        <div>
          <InputText
            id="kode"
            v-model="form.kode"
            label="kode Kecamatan"
            type="text"
            placeholder="Masukkan kode Kecamatan"
            :error="errors.kode"
          />
        </div>

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
              :disabled="!(
                form.name.trim() &&
                form.kode.trim()
              ) || isSubmitting"
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
