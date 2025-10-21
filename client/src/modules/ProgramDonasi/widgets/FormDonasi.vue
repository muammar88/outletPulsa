<script setup lang="ts">
// Library
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import Notification from '@/components/Modal/Notification.vue'
import BaseButton from '@/components/Button/BaseButton.vue'
import InputText from '@/components/Form/InputText.vue'
// Composable
import { useNotification } from '@/composables/useNotification'

// Service
import { add_donasi, daftar_member } from '@/service/program_donasi'
import SelectField from '@/components/Form/SelectField.vue'
import { formatRupiah } from '@/libs/formatRupiah'

// Notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification()

// Props
interface Props {
  isModalOpen: boolean
  id_donasi: number
}
const props = defineProps<Props>()

// Emit
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'status', payload: { error_msg?: string; error?: boolean }): void
}>()

// Form state

const form = ref({
  donasi_id: '',
  member_id: '',
  nominal: '',
  status: '',
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const isLoading = ref(false)

// Reset form
const resetForm = () => {
  form.value = { donasi_id: '', member_id: '', nominal: '', status: '' }
  errors.value = {}
}

// Validasi
const validateForm = () => {
  let isValid = true
  errors.value = {}

  if (!form.value.member_id) {
    errors.value.member_id = 'Donatur tidak boleh kosong.'
    isValid = false
  }
  if (!form.value.nominal) {
    errors.value.nominal = 'Nominal tidak boleh kosong.'
    isValid = false
  }

  if (!form.value.status) {
    errors.value.status = 'Status tidak boleh kosong.'
    isValid = false
  }
  return isValid
}

interface Member {
  id: number
  name: string
}

const member = ref<Member[]>([])

// Ambil data syarat untuk edit
const fetchData = async () => {
  isLoading.value = true
  try {
    const response = await daftar_member()
    member.value = response
  } catch (error) {
    displayNotification('Gagal mengambil data member', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

const handleSubmit = async () => {
  if (!validateForm()) return

  // Pastikan data sudah di-fetch
  if (!props.id_donasi) {
    displayNotification('ID donasi tidak valid', 'error')
    return
  }

  isSubmitting.value = true

  try {
    const payload = {
      program_donasi_id: Number(props.id_donasi),
      member_id: String(form.value.member_id),
      nominal: String(form.value.nominal),
      status: String(form.value.status),
    }

    console.log('Payload dikirim ke backend:', payload)

    const response = await add_donasi(payload)

    const msg = response.message || response.error_msg || 'Berhasil'
    const isError = response.error || false

    emit('status', { error_msg: msg, error: isError })
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

// Tutup modal
const closeModal = () => {
  if (isSubmitting.value) return
  resetForm()
  emit('close')
}

// Escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isModalOpen) closeModal()
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
})

const nominalDisplay = computed({
  get: () => (form.value.nominal ? formatRupiah(form.value.nominal) : ''),
  set: (val: string) => {
    // ambil angka murni doang, buang selain digit
    form.value.nominal = val.replace(/[^0-9]/g, '')
  },
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
      <div class="relative max-w-md w-full bg-white shadow-2xl rounded-2xl p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 id="modal-title" class="text-xl font-bold text-gray-800">Tambah Donasi</h2>
          <button
            class="text-gray-400 text-lg hover:text-gray-600"
            @click="closeModal"
            aria-label="Tutup modal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Input -->
        <!-- pilih member -->
        <SelectField
          id="member"
          v-model="form.member_id"
          :options="[{ id: '', name: '-- Pilih Donatur --' }, ...member]"
          label="Pilih Donatur"
          :error="errors.member_id"
        />

        <!-- nominal -->
        <InputText
          id="nominal"
          v-model="nominalDisplay"
          label="Nominal"
          placeholder="Masukkan nominal"
          :error="errors.nominal"
        />

        <!-- status -->
        <SelectField
          id="status"
          v-model="form.status"
          :options="[
            { id: '', name: '-- Pilih Status --' },
            { id: 'success', name: 'success' },
            { id: 'process', name: 'pending' },
            { id: 'sailed', name: 'failed' },
          ]"
          label="Status"
          :error="errors.status"
        />

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
            :disabled="!(form.member_id && form.nominal && form.status) || isSubmitting"
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
