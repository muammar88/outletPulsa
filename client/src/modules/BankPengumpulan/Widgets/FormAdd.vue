<script setup lang="ts">
import BaseButton from '@/components/Button/BaseButton.vue'
import { ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue'
import { getBank } from '@/service/bank_pengumpulan'

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [
    data: {
      bank_id: number | null
      jenisPemasukan: string
      namaAkunBank: string
      nomorAkunBank: string
    },
  ]
}>()

interface BankOption {
  id: number
  name: string
}

const formBank = ref({
  bank_id: null as number | null,
  jenisPemasukan: '',
  namaAkunBank: '',
  nomorAkunBank: '',
})

const serverErrors = reactive({
  bank_id: '',
  tipe: '',
  nama_akun_bank: '',
  nomor_akun_bank: '',
  general: '',
})

// VALIDASI LOKAL
const errors = reactive({
  bank_id: '',
  jenisPemasukan: '',
  namaAkunBank: '',
  nomorAkunBank: '',
})

const isSubmitting = ref(false)
const bankOptions = ref<BankOption[]>([])
const isLoadingBanks = ref(false)

const jenisPemasukanOptions = ['Zakat', 'Infaq', 'Donasi']

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
  (newValue) => {
    if (newValue) {
      fetchBanks()
    } else {
      resetForm()
    }
  },
)

const resetForm = () => {
  formBank.value = { bank_id: null, jenisPemasukan: '', namaAkunBank: '', nomorAkunBank: '' }
  resetErrors()
  isSubmitting.value = false
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
  if (!formBank.value.jenisPemasukan) {
    errors.jenisPemasukan = 'Jenis Pemasukan harus dipilih'
    isValid = false
  }
  if (!formBank.value.namaAkunBank.trim()) {
    errors.namaAkunBank = 'Nama Akun Bank tidak boleh kosong'
    isValid = false
  } else if (formBank.value.namaAkunBank.trim().length < 3) {
    errors.namaAkunBank = 'Nama Akun Bank minimal 3 karakter'
    isValid = false
  }
  if (!formBank.value.nomorAkunBank.trim()) {
    errors.nomorAkunBank = 'Nomor Akun Bank tidak boleh kosong'
    isValid = false
  } else {
    const nomorRekening = formBank.value.nomorAkunBank.trim().replace(/\D/g, '')
    if (nomorRekening.length < 8) {
      errors.nomorAkunBank = 'Nomor Akun Bank minimal 8 digit'
      isValid = false
    }
  }
  return isValid
}

const handleSubmit = () => {
  if (isSubmitting.value) return
  Object.keys(serverErrors).forEach((key) => (serverErrors[key] = ''))

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  const formData = {
    bank_id: formBank.value.bank_id,
    jenisPemasukan: formBank.value.jenisPemasukan.toLowerCase(),
    namaAkunBank: formBank.value.namaAkunBank.trim(),
    nomorAkunBank: formBank.value.nomorAkunBank.trim(),
  }
  emit('save', formData)

  setTimeout(() => {
    if (props.showModal) {
      isSubmitting.value = false
    }
  }, 1000)
}

const closeModal = () => {
  if (isSubmitting.value) return
  emit('close')
}

const formatNomorRekening = (event: Event) => {
  const input = event.target as HTMLInputElement
  formBank.value.nomorAkunBank = input.value.replace(/\D/g, '')
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
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-75 backdrop-blur-sm"
      role="dialog"
    >
      <div class="w-full max-w-lg mx-4 p-6 bg-white rounded-lg shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">Tambah Bank Pemasukan</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
            :disabled="isSubmitting"
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
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Daftar Bank -->
          <div>
            <label for="daftarBank" class="block text-sm font-medium text-gray-700 mb-1"
              >Daftar Bank <span class="text-red-500">*</span></label
            >
            <select
              id="daftarBank"
              v-model="formBank.bank_id"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.bank_id || serverErrors.bank_id ? 'border-red-500' : 'border-gray-300',
              ]"
              :disabled="isSubmitting || isLoadingBanks"
            >
              <option :value="null" disabled>
                {{ isLoadingBanks ? 'Memuat...' : 'Pilih Bank' }}
              </option>
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
            <label for="jenisPemasukan" class="block text-sm font-medium text-gray-700 mb-1"
              >Jenis Pemasukan <span class="text-red-500">*</span></label
            >
            <select
              id="jenisPemasukan"
              v-model="formBank.jenisPemasukan"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.jenisPemasukan || serverErrors.tipe ? 'border-red-500' : 'border-gray-300',
              ]"
              :disabled="isSubmitting"
            >
              <option value="" disabled>Pilih Jenis Pemasukan</option>
              <option v-for="jenis in jenisPemasukanOptions" :key="jenis" :value="jenis">
                {{ jenis }}
              </option>
            </select>
            <p v-if="errors.jenisPemasukan" class="mt-1 text-xs text-red-600">
              {{ errors.jenisPemasukan }}
            </p>
            <p v-else-if="serverErrors.tipe" class="mt-1 text-xs text-red-600">
              {{ serverErrors.tipe }}
            </p>
          </div>

          <!-- Nama Akun Bank -->
          <div>
            <label for="namaAkunBank" class="block text-sm font-medium text-gray-700 mb-1"
              >Nama Akun Bank <span class="text-red-500">*</span></label
            >
            <input
              id="namaAkunBank"
              v-model="formBank.namaAkunBank"
              type="text"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.namaAkunBank || serverErrors.nama_akun_bank
                  ? 'border-red-500'
                  : 'border-gray-300',
              ]"
              placeholder="Nama Akun Bank"
              :disabled="isSubmitting"
            />
            <p v-if="errors.namaAkunBank" class="mt-1 text-xs text-red-600">
              {{ errors.namaAkunBank }}
            </p>
            <p v-else-if="serverErrors.nama_akun_bank" class="mt-1 text-xs text-red-600">
              {{ serverErrors.nama_akun_bank }}
            </p>
          </div>

          <!-- Nomor Akun Bank -->
          <div>
            <label for="nomorAkunBank" class="block text-sm font-medium text-gray-700 mb-1"
              >Nomor Akun Bank <span class="text-red-500">*</span></label
            >
            <input
              id="nomorAkunBank"
              :value="formBank.nomorAkunBank"
              @input="formatNomorRekening"
              type="text"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.nomorAkunBank || serverErrors.nomor_akun_bank
                  ? 'border-red-500'
                  : 'border-gray-300',
              ]"
              placeholder="Nomor Akun Bank"
              :disabled="isSubmitting"
            />
            <p v-if="errors.nomorAkunBank" class="mt-1 text-xs text-red-600">
              {{ errors.nomorAkunBank }}
            </p>
            <p v-else-if="serverErrors.nomor_akun_bank" class="mt-1 text-xs text-red-600">
              {{ serverErrors.nomor_akun_bank }}
            </p>
          </div>

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
                formBank.bank_id &&
                formBank.jenisPemasukan &&
                formBank.namaAkunBank.trim() &&
                formBank.nomorAkunBank.trim()
              ) || isSubmitting"
              @click="handleSubmit"
            >
              <span v-if="isSubmitting">Menyimpan...</span>
              <span v-else>Simpan</span>
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
