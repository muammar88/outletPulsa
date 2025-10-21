<script setup lang="ts">
import BaseButton from '@/components/Button/BaseButton.vue'
import { ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue'
import { getBank } from '@/service/bank_pengumpulan'
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue'
import type { PropType } from 'vue'

interface BankPengumpulan {
  id: number
  bank_id: number
  tipe: string
  nomor_akun_bank: string
  nama_akun_bank: string
}

interface BankOption {
  id: number
  name: string
}

const props = defineProps({
  showModal: { type: Boolean, required: true },
  editData: { type: Object as PropType<BankPengumpulan | null>, default: null },
  isLoading: { type: Boolean, default: false },
})

const emit = defineEmits<{
  close: []
  save: [data: BankPengumpulan]
  notification: [message: string, type: 'success' | 'error']
}>()

const formBank = ref<BankPengumpulan>({
  id: 0,
  bank_id: 0,
  tipe: '',
  nama_akun_bank: '',
  nomor_akun_bank: '',
})

const serverErrors = reactive({
  bank_id: '',
  tipe: '',
  nama_akun_bank: '',
  nomor_akun_bank: '',
  general: '',
})

const errors = reactive({
  bank_id: '',
  tipe: '',
  nama_akun_bank: '',
  nomor_akun_bank: '',
})

const bankOptions = ref<BankOption[]>([])
const isLoadingBanks = ref(false)
const jenisPemasukanOptions = ['zakat', 'infaq', 'donasi']

const fetchBanks = async () => {
  if (bankOptions.value.length > 0) return
  isLoadingBanks.value = true
  try {
    const response = await getBank()
    if (response && Array.isArray(response.data)) {
      bankOptions.value = response.data
    }
  } catch (err) {
    console.error('Error fetching banks:', err)
  } finally {
    isLoadingBanks.value = false
  }
}

watch(
  () => props.showModal,
  (isVisible) => {
    if (isVisible && props.editData) {
      fetchBanks()
      formBank.value = { ...props.editData }
      resetErrors()
    } else if (!isVisible) {
      resetForm()
    }
  },
)

watch(
  () => props.editData,
  (newData) => {
    if (newData && props.showModal) {
      formBank.value = { ...newData }
      resetErrors()
    }
  },
)

const resetForm = () => {
  formBank.value = { id: 0, bank_id: 0, tipe: '', nama_akun_bank: '', nomor_akun_bank: '' }
  resetErrors()
}

const resetErrors = () => {
  Object.keys(errors).forEach((key) => (errors[key] = ''))
  Object.keys(serverErrors).forEach((key) => (serverErrors[key] = ''))
}

const parseServerErrors = (error: any) => {
  Object.keys(serverErrors).forEach((key) => (serverErrors[key] = ''))

  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach((err: any) => {
      const field = err.path || err.param
      if (field && serverErrors.hasOwnProperty(field)) {
        serverErrors[field] = err.msg || err.message
      } else {
        serverErrors.general = err.msg || err.message
      }
    })
  } else if (error.response?.data?.message) {
    serverErrors.general = error.response.data.message
  } else {
    serverErrors.general = 'Terjadi kesalahan pada server'
  }
}

const validateForm = (): boolean => {
  Object.keys(errors).forEach((key) => (errors[key] = ''))
  let isValid = true

  if (!formBank.value.bank_id) {
    errors.bank_id = 'Daftar Bank harus dipilih'
    isValid = false
  }
  if (!formBank.value.tipe) {
    errors.tipe = 'Jenis Pemasukan harus dipilih'
    isValid = false
  }
  if (!formBank.value.nama_akun_bank.trim()) {
    errors.nama_akun_bank = 'Nama Akun Bank tidak boleh kosong'
    isValid = false
  } else if (formBank.value.nama_akun_bank.trim().length < 3) {
    errors.nama_akun_bank = 'Nama Akun Bank minimal 3 karakter'
    isValid = false
  }
  if (!formBank.value.nomor_akun_bank.trim()) {
    errors.nomor_akun_bank = 'Nomor Akun Bank tidak boleh kosong'
    isValid = false
  } else {
    const nomorRekening = formBank.value.nomor_akun_bank.trim().replace(/\D/g, '')
    if (nomorRekening.length < 8) {
      errors.nomor_akun_bank = 'Nomor Akun Bank minimal 8 digit'
      isValid = false
    }
  }
  return isValid
}

const handleSubmit = () => {
  if (props.isLoading) return

  Object.keys(serverErrors).forEach((key) => (serverErrors[key] = ''))

  if (!validateForm()) {
    return
  }

  emit('save', { ...formBank.value })
}

const closeModal = () => {
  if (props.isLoading) return
  emit('close')
}

const formatNomorRekening = (event: Event) => {
  const input = event.target as HTMLInputElement
  formBank.value.nomor_akun_bank = input.value.replace(/\D/g, '')
}

defineExpose({
  parseServerErrors,
})

// Function: Handle escape & Fetch Data
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.showModal) closeModal()
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
    enter-active-class="transition duration-200 ease-out"
    leave-active-class="transition duration-200 ease-in"
    enter-from-class="transform scale-95 opacity-0"
    leave-to-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-from-class="transform scale-100 opacity-100"
  >
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-75 backdrop-blur-sm"
      @click.self="closeModal"
      role="dialog"
    >
      <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
      <div v-else class="w-full max-w-lg mx-4 p-6 bg-white rounded-lg shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">Edit Bank Pemasukan</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
            :disabled="isLoading"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4" v-if="editData">
          <!-- Daftar Bank -->
          <div>
            <label for="editDaftarBank" class="block text-sm font-medium text-gray-700 mb-1"
              >Daftar Bank <span class="text-red-500">*</span></label
            >
            <select
              id="editDaftarBank"
              v-model="formBank.bank_id"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.bank_id || serverErrors.bank_id ? 'border-red-500' : 'border-gray-300',
              ]"
              :disabled="isLoading || isLoadingBanks"
            >
              <option :value="0" disabled>{{ isLoadingBanks ? 'Memuat...' : 'Pilih Bank' }}</option>
              <option v-for="bank in bankOptions" :key="bank.id" :value="bank.id">
                {{ bank.name }}
              </option>
            </select>
            <p v-if="errors.bank_id" class="mt-1 text-xs text-red-600">{{ errors.bank_id }}</p>
            <p v-else-if="serverErrors.bank_id" class="mt-1 text-xs text-red-600">
              {{ serverErrors.bank_id }}
            </p>
          </div>

          <!-- Jenis Pemasukan -->
          <div>
            <label for="editJenisPemasukan" class="block text-sm font-medium text-gray-700 mb-1"
              >Jenis Pemasukan <span class="text-red-500">*</span></label
            >
            <select
              id="editJenisPemasukan"
              v-model="formBank.tipe"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.tipe || serverErrors.tipe ? 'border-red-500' : 'border-gray-300',
              ]"
              :disabled="isLoading"
            >
              <option value="" disabled>Pilih Jenis Pemasukan</option>
              <option
                v-for="jenis in jenisPemasukanOptions"
                :key="jenis"
                :value="jenis"
                class="capitalize"
              >
                {{ jenis }}
              </option>
            </select>
            <p v-if="errors.tipe" class="mt-1 text-xs text-red-600">{{ errors.tipe }}</p>
            <p v-else-if="serverErrors.tipe" class="mt-1 text-xs text-red-600">
              {{ serverErrors.tipe }}
            </p>
          </div>

          <!-- Nama Akun Bank -->
          <div>
            <label for="editNamaAkunBank" class="block text-sm font-medium text-gray-700 mb-1"
              >Nama Akun Bank <span class="text-red-500">*</span></label
            >
            <input
              id="editNamaAkunBank"
              v-model="formBank.nama_akun_bank"
              type="text"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.nama_akun_bank || serverErrors.nama_akun_bank
                  ? 'border-red-500'
                  : 'border-gray-300',
              ]"
              placeholder="Nama Akun Bank"
              :disabled="isLoading"
            />
            <p v-if="errors.nama_akun_bank" class="mt-1 text-xs text-red-600">
              {{ errors.nama_akun_bank }}
            </p>
            <p v-else-if="serverErrors.nama_akun_bank" class="mt-1 text-xs text-red-600">
              {{ serverErrors.nama_akun_bank }}
            </p>
          </div>

          <!-- Nomor Akun Bank -->
          <div>
            <label for="editNomorAkunBank" class="block text-sm font-medium text-gray-700 mb-1"
              >Nomor Akun Bank <span class="text-red-500">*</span></label
            >
            <input
              id="editNomorAkunBank"
              :value="formBank.nomor_akun_bank"
              @input="formatNomorRekening"
              type="text"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.nomor_akun_bank || serverErrors.nomor_akun_bank
                  ? 'border-red-500'
                  : 'border-gray-300',
              ]"
              placeholder="Nomor Akun Bank"
              :disabled="isLoading"
            />
            <p v-if="errors.nomor_akun_bank" class="mt-1 text-xs text-red-600">
              {{ errors.nomor_akun_bank }}
            </p>
            <p v-else-if="serverErrors.nomor_akun_bank" class="mt-1 text-xs text-red-600">
              {{ serverErrors.nomor_akun_bank }}
            </p>
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <BaseButton
              @click="closeModal"
              type="button"
              :disabled="isLoading"
              variant="secondary"
            >
              Batal
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="!(
                formBank.bank_id &&
                formBank.tipe &&
                formBank.nama_akun_bank.trim() &&
                formBank.nomor_akun_bank.trim()
              ) || isLoading"
              @click="handleSubmit"
            >
              <span v-if="isLoading">Menyimpan...</span>
              <span v-else>Simpan Perubahan</span>
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
