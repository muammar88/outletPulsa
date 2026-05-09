<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Notification from '@/components/Modal/Notification.vue'
import BaseButton from '@/components/Button/BaseButton.vue'
import InputText from '@/components/Form/InputText.vue'
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue'
import { useNotification } from '@/composables/useNotification'
import { add_daftar_pengguna, list_grup } from '@/service/daftar_pengguna'
import SelectField from '@/components/Form/SelectField.vue'

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
const form = ref({
  name: '',
  username: '',
  grup_id: '',
  password: '',
  password_confirmation: '',
})
const errors = ref<Record<string, string>>({})
const grupData = ref<{ id: string | number; name: string }[]>([])

// Reset form
const resetForm = () => {
  form.value = { name: '', username: '', grup_id: '', password: '', password_confirmation: '' }
  errors.value = {}
}

// Fetch grup data
const fetch_grup = async () => {
  try {
    const response = await list_grup()
    grupData.value = response.data.map((grup: any) => ({
      id: grup.id,
      name: grup.name,
    }))
  } catch (error) {
    console.error('Failed to fetch grup data:', error)
  }
}

// Validasi
const validateForm = () => {
  let isValid = true
  errors.value = {}

  if (!form.value.name) {
    errors.value.name = 'Nama pengguna tidak boleh kosong.'
    isValid = false
  }
  if (!form.value.username) {
    errors.value.username = 'Username tidak boleh kosong.'
    isValid = false
  }
  if (!form.value.grup_id) {
    errors.value.grup_id = 'Grup tidak boleh kosong.'
    isValid = false
  }
  if (!form.value.password) {
    errors.value.password = 'Password tidak boleh kosong.'
    isValid = false
  }
  if (form.value.password !== form.value.password_confirmation) {
    errors.value.password_confirmation = 'Konfirmasi password tidak sama.'
    isValid = false
  }

  return isValid
}

// Submit
const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const response = await add_daftar_pengguna(form.value)
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

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  fetch_grup()
})

onBeforeUnmount(() => {
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
    >
      <LoadingSpinner v-if="isSubmitting" label="Menyimpan..." />
      <div v-else class="relative max-w-md w-full bg-white shadow-2xl rounded-2xl p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">TAMBAH PENGGUNA BARU</h2>
          <button
            class="text-gray-400 text-lg hover:text-gray-600"
            @click="closeModal"
            aria-label="Tutup modal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Nama pengguna -->
        <InputText
          v-model="form.name"
          label="Nama Pengguna"
          type="text"
          placeholder="Masukkan nama pengguna"
          :error="errors.name"
        />

        <!-- Username -->
        <InputText
          v-model="form.username"
          label="Username"
          type="text"
          placeholder="Masukkan username"
          :error="errors.username"
        />
        <!-- Grup -->
        <!-- <div class="flex flex-col">
          <label class="mb-1 text-gray-700">Grup</label>
          <select v-model="form.grup_id" class="border rounded px-3 py-2">
            <option disabled value="">Pilih grup</option>
            <option v-for="grup in grupData" :key="grup.id" :value="grup.id">
              {{ grup.name }}
            </option>
          </select>
          <p v-if="errors.grup_id" class="text-red-500 text-sm mt-1">{{ errors.grup_id }}</p>
        </div> -->

        <SelectField
          v-model="form.grup_id"
          label="Grup"
          :options="[{ id: '', name: '-- Pilih Grup --' }, ...grupData]"
          :error="errors.grup_id"
        />

        <!-- Password -->
        <InputText
          v-model="form.password"
          label="Password"
          type="password"
          placeholder="Masukkan password"
          :error="errors.password"
        />

        <!-- Konfirmasi Password -->
        <InputText
          v-model="form.password_confirmation"
          label="Konfirmasi Password"
          type="password"
          placeholder="Ulangi password"
          :error="errors.password_confirmation"
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
            :disabled="
              !(
                form.grup_id &&
                form.name &&
                form.username &&
                form.password &&
                form.password_confirmation
              ) || isSubmitting
            "
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">Menyimpan...</span>
            <span v-else>Simpan Perubahan</span>
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
