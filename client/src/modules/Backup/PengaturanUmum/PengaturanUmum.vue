<script setup lang="ts">
// Library
import { ref, onMounted } from 'vue'
import Notification from '@/components/Modal/Notification.vue'
import BaseButton from '@/components/Button/BaseButton.vue'
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue'
import InputFile from '@/components/Form/InputFile.vue'

// Composable
import { useNotification } from '@/composables/useNotification'

// Service API
import { get_info_pengaturan_umum, edit_pengaturan_umum } from '@/service/pengaturan_umum'

// State: Loading
const isLoading = ref(false)
const isSaving = ref(false)
const isSubmitting = ref(false)

const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification()

// State Data
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL

interface PengaturanUmum {
  icon: File | null
  logo: File | null
  nama_kabupaten_kota: string
  alamat: string
  quote: string
  nama_jabatan_1: string
  nama_pejabat_1: string
  nama_jabatan_2: string
  nama_pejabat_2: string
  nama_jabatan_3: string
  nama_pejabat_3: string
  hero_logo: File | null
}

const formData = ref<PengaturanUmum>({
  icon: null,
  logo: null,
  nama_kabupaten_kota: '',
  alamat: '',
  quote: '',
  nama_jabatan_1: '',
  nama_pejabat_1: '',
  nama_jabatan_2: '',
  nama_pejabat_2: '',
  nama_jabatan_3: '',
  nama_pejabat_3: '',
  hero_logo: null,
})

// State untuk menyimpan data awal dari server (untuk preview gambar existing)
const existingData = ref<any>({
  icon: '',
  logo: '',
  hero_logo: '',
})

// State untuk menyimpan dimensi gambar yang diload
const imageDimensions = ref<Record<string, { width: number; height: number }>>({})

const getImageUrl = (imagePath: string, type: 'icon' | 'logo' | 'hero' | 'quote') => {
  if (!imagePath || imagePath === '-' || imagePath === '') return ''

  if (imagePath.startsWith('http')) return imagePath

  const folderMapping = {
    icon: 'icons',
    logo: 'logos',
    hero: 'hero',
    quote: 'quotes',
  }

  const imageUrl = `${BASE_URL}/uploads/img/${folderMapping[type]}/${imagePath}`
  return `${imageUrl}?v=${new Date().getTime()}`
}

// Function untuk handle ketika gambar berhasil dimuat
const handleImageLoad = (event: Event, imageType: string) => {
  const img = event.target as HTMLImageElement
  imageDimensions.value[imageType] = {
    width: img.naturalWidth,
    height: img.naturalHeight,
  }
  console.log(`${imageType} loaded with dimensions:`, imageDimensions.value[imageType])
}

// Function untuk mendapatkan style container berdasarkan dimensi asli gambar
const getImageContainerStyle = (imageType: string) => {
  const dimensions = imageDimensions.value[imageType]
  if (!dimensions) {
    // Default size jika dimensi belum dimuat
    return {
      width: '128px',
      height: '80px',
      maxWidth: '300px',
      maxHeight: '200px',
    }
  }

  // Hitung rasio aspek
  const aspectRatio = dimensions.width / dimensions.height

  // ukuran maksimal berdasarkan tipe gambar
  let maxWidth = 300
  let maxHeight = 200

  switch (imageType) {
    case 'icon':
      maxWidth = 64
      maxHeight = 64
      break
    case 'logo':
      maxWidth = 300
      maxHeight = 150
      break
    case 'hero_logo':
      maxWidth = 350
      maxHeight = 200
      break
  }

  // Hitung ukuran yang proporsional dengan batasan maksimal
  let displayWidth = dimensions.width
  let displayHeight = dimensions.height

  // Jika terlalu besar, scale down sambil mempertahankan aspect ratio
  if (displayWidth > maxWidth) {
    displayWidth = maxWidth
    displayHeight = displayWidth / aspectRatio
  }

  if (displayHeight > maxHeight) {
    displayHeight = maxHeight
    displayWidth = displayHeight * aspectRatio
  }

  return {
    width: `${Math.round(displayWidth)}px`,
    height: `${Math.round(displayHeight)}px`,
    minWidth: '48px',
    minHeight: '32px',
  }
}

// Function: Fetch Data
async function fetchData() {
  isLoading.value = true
  try {
    const response = await get_info_pengaturan_umum()
    console.log('Response data:', response.data)

    if (response.data) {
      const data = response.data

      formData.value = {
        ...formData.value,
        nama_kabupaten_kota: data.nama_kabupaten_kota || '',
        alamat: data.alamat || '',
        quote: data.quote || '',
        nama_jabatan_1: data.nama_jabatan1 || '',
        nama_pejabat_1: data.nama_pejabat1 || '',
        nama_jabatan_2: data.nama_jabatan2 || '',
        nama_pejabat_2: data.nama_pejabat2 || '',
        nama_jabatan_3: data.nama_jabatan3 || '',
        nama_pejabat_3: data.nama_pejabat3 || '',
        icon: null,
        logo: null,
        hero_logo: null,
      }

      existingData.value = {
        icon: data.icon || '',
        logo: data.logo || '',
        hero_logo: data.hero_logo || '',
      }
    }
  } catch (error: any) {
    console.error('Error fetching data:', error)
    displayNotification('Gagal mengambil data pengaturan umum', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchData()
})

const errors = ref<Record<string, string>>({})

const validateForm = () => {
  let isValid = true
  errors.value = {}

  if (formData.value.nama_kabupaten_kota === '') {
    errors.value.nama_kabupaten_kota = 'Nama kabupaten/kota tidak boleh kosong.'
    isValid = false
  }
  if (formData.value.alamat === '') {
    errors.value.alamat = 'Alamat tidak boleh kosong.'
    isValid = false
  }
  if (formData.value.quote === '') {
    errors.value.quote = 'Quote tidak boleh kosong.'
    isValid = false
  }
  if (formData.value.nama_jabatan_1 === '') {
    errors.value.nama_jabatan_1 = 'Nama jabatan 1 tidak boleh kosong.'
    isValid = false
  }
  if (formData.value.nama_pejabat_1 === '') {
    errors.value.nama_pejabat_1 = 'Nama pejabat 1 tidak boleh kosong.'
    isValid = false
  }
  if (formData.value.nama_jabatan_2 === '') {
    errors.value.nama_jabatan_2 = 'Nama jabatan 2 tidak boleh kosong.'
    isValid = false
  }
  if (formData.value.nama_pejabat_2 === '') {
    errors.value.nama_pejabat_2 = 'Nama pejabat 2 tidak boleh kosong.'
    isValid = false
  }
  if (formData.value.nama_jabatan_3 === '') {
    errors.value.nama_jabatan_3 = 'Nama jabatan 3 tidak boleh kosong.'
    isValid = false
  }
  if (formData.value.nama_pejabat_3 === '') {
    errors.value.nama_pejabat_3 = 'Nama pejabat 3 tidak boleh kosong.'
    isValid = false
  }

  // File validation
  if (!formData.value.icon && !existingData.value.icon) {
    errors.value.icon = 'Icon wajib diisi.'
    isValid = false
  }
  if (!formData.value.logo && !existingData.value.logo) {
    errors.value.logo = 'Logo wajib diisi.'
    isValid = false
  }
  if (!formData.value.hero_logo && !existingData.value.hero_logo) {
    errors.value.hero_logo = 'Hero Logo wajib diisi.'
    isValid = false
  }

  return isValid
}

// File handlers
const handleIconFile = (file: File | null) => {
  formData.value.icon = file
  if (file) errors.value.icon = ''
}

const handleLogoFile = (file: File | null) => {
  formData.value.logo = file
  if (file) errors.value.logo = ''
}

const handleHeroLogoFile = (file: File | null) => {
  formData.value.hero_logo = file
  if (file) errors.value.hero_logo = ''
}

const handleSubmit = async () => {
  if (!validateForm()) {
    displayNotification('Mohon lengkapi semua field yang wajib diisi', 'error')
    return
  }

  isSubmitting.value = true
  isSaving.value = true

  const submitFormData = new FormData()

  // Append text fields
  submitFormData.append('nama_kabupaten_kota', formData.value.nama_kabupaten_kota)
  submitFormData.append('alamat', formData.value.alamat)
  submitFormData.append('quote', formData.value.quote)
  submitFormData.append('nama_jabatan_1', formData.value.nama_jabatan_1)
  submitFormData.append('nama_pejabat_1', formData.value.nama_pejabat_1)
  submitFormData.append('nama_jabatan_2', formData.value.nama_jabatan_2)
  submitFormData.append('nama_pejabat_2', formData.value.nama_pejabat_2)
  submitFormData.append('nama_jabatan_3', formData.value.nama_jabatan_3)
  submitFormData.append('nama_pejabat_3', formData.value.nama_pejabat_3)

  // Append file fields
  if (formData.value.icon) submitFormData.append('icon', formData.value.icon)
  if (formData.value.logo) submitFormData.append('logo', formData.value.logo)
  if (formData.value.hero_logo) submitFormData.append('hero_logo', formData.value.hero_logo)

  try {
    const response = await edit_pengaturan_umum(submitFormData)

    if (response.error === false) {
      displayNotification('Pengaturan umum berhasil diperbarui', 'success')
      await fetchData()
    } else {
      displayNotification(response.error_msg || 'Terjadi kesalahan saat menyimpan data', 'error')
    }
  } catch (error: any) {
    console.error('Submit error:', error)
    displayNotification(
      error.response?.data?.error_msg ||
        error.response?.data?.message ||
        'Terjadi kesalahan saat menyimpan data',
      'error',
    )
  } finally {
    isSubmitting.value = false
    closeModal()
    isSaving.value = false
  }
}
</script>

<template>
  <div class="mx-auto p-4">
    <!-- Header -->
    <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
    <div v-else class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Edit Pengaturan Umum</h1>
      </div>

      <!-- Form Container -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-6">
              <!-- Icon Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Icon <span class="text-red-500">*</span>
                </label>

                <div class="mb-3">
                  <p class="text-sm text-gray-600 mb-2">Icon saat ini:</p>
                  <div
                    v-if="
                      existingData.icon && existingData.icon !== '-' && existingData.icon !== ''
                    "
                    class="relative rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-300"
                    :style="getImageContainerStyle('icon')"
                  >
                    <img
                      :src="getImageUrl(existingData.icon, 'icon')"
                      :alt="`Icon ${existingData.icon}`"
                      class="object-contain max-w-full max-h-full mx-auto"
                      @error="
                        (e) => {
                          console.log('Icon load error:', e)
                          existingData.icon = '-'
                        }
                      "
                      @load="(e) => handleImageLoad(e, 'icon')"
                    />
                    <!-- Info dimensi -->
                  </div>
                  <div
                    v-else
                    class="bg-gray-200 text-gray-500 text-center px-2 py-2 relative rounded-lg flex items-center justify-center overflow-hidden border border-gray-300 z-0"
                    style="width: 64px; height: 64px"
                  >
                    <p class="text-xs font-medium">Tidak ada</p>
                  </div>
                </div>

                <InputFile
                  id="icon"
                  label="Upload Icon"
                  buttonText="Pilih File"
                  accept=".ico"
                  dimensionsInfo="48x48 piksel"
                  :showPreview="true"
                  :label_status="false"
                  :maxSize="1000"
                  :error="errors.icon"
                  @file-selected="handleIconFile"
                />
              </div>

              <!-- Logo Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Logo <span class="text-red-500">*</span>
                </label>

                <div class="mb-3">
                  <p class="text-sm text-gray-600 mb-2">Logo saat ini:</p>
                  <div
                    v-if="
                      existingData.logo && existingData.logo !== '-' && existingData.logo !== ''
                    "
                    class="relative rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-300 z-0"
                    :style="getImageContainerStyle('logo')"
                  >
                    <img
                      :src="getImageUrl(existingData.logo, 'logo')"
                      :alt="`Logo ${existingData.logo}`"
                      class="object-contain max-w-full max-h-full mx-auto"
                      @error="
                        (e) => {
                          console.log('Logo load error:', e)
                          existingData.logo = '-'
                        }
                      "
                      @load="(e) => handleImageLoad(e, 'logo')"
                    />
                  </div>
                  <div
                    v-else
                    class="bg-gray-200 text-gray-500 text-center px-2 py-2 relative rounded-lg flex items-center justify-center overflow-hidden border border-gray-300"
                    style="width: 96px; height: 96px"
                  >
                    <p class="text-xs font-medium">Tidak ada</p>
                  </div>
                </div>

                <InputFile
                  id="logo"
                  label="Upload Logo"
                  buttonText="Pilih File"
                  accept=".png"
                  dimensionsInfo="779x161 piksel"
                  :showPreview="true"
                  :label_status="false"
                  :maxSize="1000"
                  :error="errors.logo"
                  @file-selected="handleLogoFile"
                />
              </div>

              <!-- Hero Logo Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Hero Logo <span class="text-red-500">*</span>
                </label>

                <div class="mb-3">
                  <p class="text-sm text-gray-600 mb-2">Hero Logo saat ini:</p>
                  <div
                    v-if="
                      existingData.hero_logo &&
                      existingData.hero_logo !== '-' &&
                      existingData.hero_logo !== ''
                    "
                    class="relative rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-300"
                    :style="getImageContainerStyle('hero_logo')"
                  >
                    <img
                      :src="getImageUrl(existingData.hero_logo, 'hero')"
                      :alt="`Hero Logo ${existingData.hero_logo}`"
                      class="object-contain max-w-full max-h-full mx-auto"
                      @error="
                        (e) => {
                          console.log('Hero logo load error:', e)
                          existingData.hero_logo = '-'
                        }
                      "
                      @load="(e) => handleImageLoad(e, 'hero_logo')"
                    />
                  </div>
                  <div
                    v-else
                    class="bg-gray-200 text-gray-500 text-center px-2 py-2 relative rounded-lg flex items-center justify-center overflow-hidden border border-gray-300"
                    style="width: 128px; height: 80px"
                  >
                    <p class="text-xs font-medium">Tidak ada</p>
                  </div>
                </div>

                <InputFile
                  id="hero_logo"
                  label="Upload Hero Logo"
                  buttonText="Pilih File"
                  accept=".png,.jpeg,.jpg"
                  :showPreview="true"
                  :label_status="false"
                  :maxSize="1000"
                  :error="errors.hero_logo"
                  @file-selected="handleHeroLogoFile"
                />
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Nama Kabupaten/Kota -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kabupaten / Kota <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  v-model="formData.nama_kabupaten_kota"
                  placeholder="Masukkan Nama Kabupaten / Kota..."
                  class="w-full px-3 py-2 border rounded-lg shadow-sm focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
                  :class="errors.nama_kabupaten_kota ? 'border-red-500' : 'border-gray-300'"
                />
                <p v-if="errors.nama_kabupaten_kota" class="mt-1 text-sm text-red-600">
                  {{ errors.nama_kabupaten_kota }}
                </p>
              </div>

              <!-- Alamat -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Alamat <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="formData.alamat"
                  rows="3"
                  placeholder="Masukkan Alamat..."
                  class="w-full px-3 py-2 border rounded-lg shadow-sm focus:border-green-900 focus:ring-2 focus:ring-green-900 transition resize-none"
                  :class="errors.alamat ? 'border-red-500' : 'border-gray-300'"
                ></textarea>
                <p v-if="errors.alamat" class="mt-1 text-sm text-red-600">
                  {{ errors.alamat }}
                </p>
              </div>

              <!-- Quote -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Quote <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="formData.quote"
                  rows="2"
                  placeholder="Masukkan Quote..."
                  class="w-full px-3 py-2 border rounded-lg shadow-sm focus:border-green-900 focus:ring-2 focus:ring-green-900 transition resize-none"
                  :class="errors.quote ? 'border-red-500' : 'border-gray-300'"
                ></textarea>
                <p v-if="errors.quote" class="mt-1 text-sm text-red-600">
                  {{ errors.quote }}
                </p>
              </div>

              <div class="mt-8 pt-6 border-t border-gray-200">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Data Pejabat</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Pejabat 1 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nama Jabatan 1 <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="formData.nama_jabatan_1"
                      placeholder="Jabatan 1"
                      class="w-full px-3 py-2 border rounded-lg shadow-sm focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
                      :class="errors.nama_jabatan_1 ? 'border-red-500' : 'border-gray-300'"
                    />
                    <p v-if="errors.nama_jabatan_1" class="mt-1 text-sm text-red-600">
                      {{ errors.nama_jabatan_1 }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nama Pejabat 1 <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="formData.nama_pejabat_1"
                      placeholder="Pejabat 1"
                      class="w-full px-3 py-2 border rounded-lg shadow-sm focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
                      :class="errors.nama_pejabat_1 ? 'border-red-500' : 'border-gray-300'"
                    />
                    <p v-if="errors.nama_pejabat_1" class="mt-1 text-sm text-red-600">
                      {{ errors.nama_pejabat_1 }}
                    </p>
                  </div>

                  <!-- Pejabat 2 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nama Jabatan 2 <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="formData.nama_jabatan_2"
                      placeholder="Jabatan 2"
                      class="w-full px-3 py-2 border rounded-lg shadow-sm focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
                      :class="errors.nama_jabatan_2 ? 'border-red-500' : 'border-gray-300'"
                    />
                    <p v-if="errors.nama_jabatan_2" class="mt-1 text-sm text-red-600">
                      {{ errors.nama_jabatan_2 }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nama Pejabat 2 <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="formData.nama_pejabat_2"
                      placeholder="Pejabat 2"
                      class="w-full px-3 py-2 border rounded-lg shadow-sm focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
                      :class="errors.nama_pejabat_2 ? 'border-red-500' : 'border-gray-300'"
                    />
                    <p v-if="errors.nama_pejabat_2" class="mt-1 text-sm text-red-600">
                      {{ errors.nama_pejabat_2 }}
                    </p>
                  </div>

                  <!-- Pejabat 3 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nama Jabatan 3 <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="formData.nama_jabatan_3"
                      placeholder="Jabatan 3"
                      class="w-full px-3 py-2 border rounded-lg shadow-sm focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
                      :class="errors.nama_jabatan_3 ? 'border-red-500' : 'border-gray-300'"
                    />
                    <p v-if="errors.nama_jabatan_3" class="mt-1 text-sm text-red-600">
                      {{ errors.nama_jabatan_3 }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nama Pejabat 3 <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      v-model="formData.nama_pejabat_3"
                      placeholder="Pejabat 3"
                      class="w-full px-3 py-2 border rounded-lg shadow-sm focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
                      :class="errors.nama_pejabat_3 ? 'border-red-500' : 'border-gray-300'"
                    />
                    <p v-if="errors.nama_pejabat_3" class="mt-1 text-sm text-red-600">
                      {{ errors.nama_pejabat_3 }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <BaseButton
              @click="handleSubmit"
              variant="primary"
              :loading="isSaving"
              :disabled="isSubmitting"
              type="button"
              class="px-8"
            >
              <font-awesome-icon icon="fa-solid fa-save" class="mr-2" />
              Simpan Pengaturan
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
