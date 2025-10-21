<script setup lang="ts">
// Library
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import Notification from '@/components/Modal/Notification.vue'
import BaseButton from '@/components/Button/BaseButton.vue'
import InputText from '@/components/Form/InputText.vue'
import SelectField from '@/components/Form/SelectField.vue'
import InputDate from '@/components/Form/InputDate.vue'

// Composable
import { useNotification } from '@/composables/useNotification'

// Service
import { add, list_desa, list_kecamatan } from '@/service/kegiatan_keseketariatan'

// Notification
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

// Form state
const form = ref({
  kode: '',
  nama_kegiatan: '',
  sumber_dana: '',
  penerima: '',
  jenis_penerima: '',
  area_penyaluran: '',
  kecamatan_id: '',
  desa_id: '',
  nominal_kegiatan: '',
  tanggal_penyaluran: '',
})

// Errors
const errors = ref<Record<string, string>>({})

// Dropdowns
const kecamatans = ref<{ id: number; name: string }[]>([])
const desas = ref<{ id: number; name: string }[]>([])

// Fetch kecamatan
const loadKecamatan = async () => {
  try {
    kecamatans.value = await list_kecamatan()
  } catch (err: any) {
    displayNotification('Gagal load kecamatan', 'error')
  }
}

// Fetch desa sesuai kecamatan
watch(
  () => form.value.kecamatan_id,
  async (val) => {
    if (!val) {
      desas.value = []
      form.value.desa_id = ''
      return
    }
    try {
      console.log(val)
      desas.value = await list_desa({ kecamatan_id: val })
      form.value.desa_id = ''
    } catch (err: any) {
      displayNotification('Gagal load desa', 'error')
    }
  },
)

// Reset form
const resetForm = () => {
  form.value = {
    kode: '',
    nama_kegiatan: '',
    sumber_dana: '',
    penerima: '',
    jenis_penerima: '',
    area_penyaluran: '',
    kecamatan_id: '',
    desa_id: '',
    nominal_kegiatan: '',
    tanggal_penyaluran: '',
  }
  errors.value = {}
}

// Close modal
const closeModal = () => {
  if (isSubmitting.value) return
  resetForm()
  emit('close')
}

// Validation
const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.kode) {
    errors.value.kode = 'Kode program wajib diisi'
    isValid = false
  }
  if (!form.value.nama_kegiatan) {
    errors.value.nama_kegiatan = 'Nama kegiatan wajib diisi'
    isValid = false
  }
  if (!form.value.sumber_dana) {
    errors.value.sumber_dana = 'Sumber dana wajib dipilih'
    isValid = false
  }
  if (!form.value.penerima) {
    errors.value.penerima = 'Nama penerima wajib diisi'
    isValid = false
  }
  if (!form.value.jenis_penerima) {
    errors.value.jenis_penerima = 'Jenis penerima wajib dipilih'
    isValid = false
  }
  if (!form.value.area_penyaluran) {
    errors.value.area_penyaluran = 'Area penyaluran wajib dipilih'
    isValid = false
  }
  if (form.value.area_penyaluran === 'kecamatan' && !form.value.kecamatan_id) {
    errors.value.kecamatan_id = 'Kecamatan wajib dipilih'
    isValid = false
  }
  if (form.value.area_penyaluran === 'kecamatan' && !form.value.desa_id) {
    errors.value.desa_id = 'Desa wajib dipilih'
    isValid = false
  }
  if (!form.value.nominal_kegiatan) {
    errors.value.nominal_kegiatan = 'Nominal wajib diisi'
    isValid = false
  }
  if (!form.value.tanggal_penyaluran) {
    errors.value.tanggal_penyaluran = 'Tanggal penyaluran wajib diisi'
    isValid = false
  }

  return isValid
}

// Submit
const isSubmitting = ref(false)
const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const payload = { ...form.value }
    const response = await add(payload)
    emit('status', { error_msg: response.error_msg || '', error: response.error })
    closeModal()
  } catch (err: any) {
    displayNotification(err.response?.data?.message || 'Gagal simpan', 'error')
  } finally {
    isSubmitting.value = false
    closeModal()
  }
}

// Escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isModalOpen) closeModal()
}
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  loadKecamatan()
})
onBeforeUnmount(() => document.removeEventListener('keydown', handleEscape))

const nominalRaw = ref<number | null>(null)

const nominalFormatted = computed({
  get: () => {
    if (nominalRaw.value == null) return ''
    return nominalRaw.value.toLocaleString('id-ID')
  },
  set: (val: string) => {
    // Hapus semua karakter selain angka
    const angka = val.replace(/\D/g, '')
    nominalRaw.value = angka ? parseInt(angka) : null
  },
})

// Watch nominalRaw untuk sinkron ke form.nominal_kegiatan
watch(nominalRaw, (val) => {
  form.value.nominal_kegiatan = val ? val.toString() : ''
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
    >
      <div
        class="relative max-w-md w-full bg-white shadow-2xl rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-auto"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">Tambah Program</h2>
          <button class="text-gray-400 text-lg hover:text-gray-600" @click="closeModal">
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Form -->
        <div class="space-y-4">
          <InputText
            v-model="form.kode"
            label="Kode Program"
            :error="errors.kode"
            placeholder="Masukkan kode program"
          />
          <InputText
            v-model="form.nama_kegiatan"
            label="Nama Program Kegiatan"
            :error="errors.nama_kegiatan"
            placeholder="Masukkan nama program kegiatan"
          />
          
          <SelectField
            v-model="form.sumber_dana"
            label="Sumber Dana"
            :error="errors.sumber_dana"
            :options="[
              { id: '', name: '-- Pilih Sumber Dana --' },
              { id: 'zakat', name: 'Zakat' },
              { id: 'infaq', name: 'Infaq' },
              { id: 'operasional_apbk', name: 'Operasional APBK' },
            ]"
          />

          <InputText
            v-model="form.penerima"
            label="Nama Penerima"
            :error="errors.penerima"
            placeholder="Masukkan nama penerima"
          />
          <SelectField
            v-model="form.jenis_penerima"
            label="Jenis Penerima"
            :error="errors.jenis_penerima"
            :options="[
              { id: '', name: '-- Pilih Jenis Penerima --' },
              { id: 'perorangan', name: 'Perorangan' },
              { id: 'instansi', name: 'Instansi' },
            ]"
          />
          <SelectField
            v-model="form.area_penyaluran"
            label="Area Penyaluran"
            :error="errors.area_penyaluran"
            :options="[
              { id: '', name: '-- Pilih Area Penyaluran --' },
              { id: 'kecamatan', name: 'Kecamatan' },
              { id: 'kabupaten', name: 'Kabupaten' },
            ]"
          />
          <SelectField
            v-if="form.area_penyaluran === 'kecamatan'"
            v-model="form.kecamatan_id"
            label="Pilih Kecamatan"
            :error="errors.kecamatan_id"
            :options="[
              { id: '', name: '-- Pilih Kecamatan --' },
              ...kecamatans.map((k) => ({ id: k.id, name: k.name })),
            ]"
          />

          <SelectField
            v-if="form.area_penyaluran === 'kecamatan' && form.kecamatan_id !== ''"
            v-model="form.desa_id"
            label="Pilih Desa"
            :error="errors.desa_id"
            :options="[
              { id: '', name: '-- Pilih Desa --' },
              ...desas.map((d) => ({ id: d.id, name: d.name })),
            ]"
          />

          <InputText
            v-model="nominalFormatted"
            label="Nominal Biaya Program"
            type="text"
            :error="errors.nominal_kegiatan"
            placeholder="Masukkan nominal"
          />

          <InputDate
            v-model="form.tanggal_penyaluran"
            label="Tanggal Penyaluran"
            :error="errors.tanggal_penyaluran"
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
            :disabled="
              !(
                form.kode &&
                form.nama_kegiatan &&
                form.sumber_dana &&
                form.penerima &&
                form.jenis_penerima &&
                form.area_penyaluran &&
                form.nominal_kegiatan &&
                form.tanggal_penyaluran
              ) || isSubmitting
            "
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