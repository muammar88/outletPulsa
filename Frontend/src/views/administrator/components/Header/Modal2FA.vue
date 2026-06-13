<script setup lang="ts">
import { ref, defineEmits, watch } from 'vue'
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue'
import InputText from '@/components/Form/InputText.vue'
import { get_2fa_status, setup_2fa, enable_2fa, disable_2fa } from '@/service/auth'
import { IconShieldCheck, IconShieldX } from '@tabler/icons-vue'

const props = defineProps<{
  formStatus: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'notify', payload: { type: string; message: string }): void
}>()

// State
const isLoading = ref(false)
const isTwoFactorEnabled = ref(false)
const setupData = ref<{ qrCode: string; secret: string; otpauthUrl: string } | null>(null)

// Forms
const otpCode = ref('')
const password = ref('')

const resetState = () => {
  otpCode.value = ''
  password.value = ''
  setupData.value = null
}

const HideModal = () => {
  if (!isLoading.value) {
    resetState()
    emit('cancel')
  }
}

async function fetchStatus() {
  isLoading.value = true
  try {
    const res = await get_2fa_status()
    isTwoFactorEnabled.value = res.twoFactorEnabled
    if (!res.twoFactorEnabled) {
      await fetchSetupData()
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

async function fetchSetupData() {
  try {
    const res = await setup_2fa()
    setupData.value = res
  } catch (error) {
    console.error(error)
    emit('notify', { type: 'error', message: 'Gagal mendapatkan QR Code 2FA' })
  }
}

const handleEnable = async () => {
  if (otpCode.value.length < 6) {
    emit('notify', { type: 'error', message: 'Kode OTP tidak valid' })
    return
  }

  isLoading.value = true
  try {
    await enable_2fa({ otpCode: otpCode.value })
    isTwoFactorEnabled.value = true
    emit('notify', { type: 'success', message: '2FA berhasil diaktifkan!' })
    HideModal()
  } catch (error: any) {
    emit('notify', { type: 'error', message: error.response?.data?.message || 'Gagal mengaktifkan 2FA' })
  } finally {
    isLoading.value = false
  }
}

const handleDisable = async () => {
  if (!password.value) {
    emit('notify', { type: 'error', message: 'Password harus diisi' })
    return
  }

  isLoading.value = true
  try {
    await disable_2fa({ password: password.value })
    isTwoFactorEnabled.value = false
    emit('notify', { type: 'success', message: '2FA berhasil dinonaktifkan!' })
    HideModal()
  } catch (error: any) {
    emit('notify', { type: 'error', message: error.response?.data?.message || 'Password salah' })
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.formStatus,
  (val) => {
    if (val) {
      resetState()
      fetchStatus()
    }
  },
)
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
    <Teleport to="body">
      <div
        v-if="props.formStatus"
        class="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-999"
        @click.self="HideModal"
      >
        <LoadingSpinner v-if="isLoading" label="Memuat data keamanan..." />
        
        <div v-else class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
          <div class="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50/50">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <IconShieldCheck v-if="isTwoFactorEnabled" class="text-emerald-500 w-6 h-6" />
              <IconShieldX v-else class="text-slate-400 w-6 h-6" />
              Keamanan Akun (2FA)
            </h3>
            <button @click="HideModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div class="p-6">
            <!-- 2FA is ENABLED -->
            <div v-if="isTwoFactorEnabled" class="text-center">
              <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconShieldCheck class="w-8 h-8 text-emerald-600" />
              </div>
              <h4 class="text-lg font-semibold text-gray-800 mb-2">2FA Sedang Aktif</h4>
              <p class="text-sm text-gray-500 mb-6">Akun Anda dilindungi oleh Google Authenticator. Untuk menonaktifkannya, silakan konfirmasi password Anda.</p>
              
              <form @submit.prevent="handleDisable" class="text-left space-y-4">
                <InputText
                  id="disable-password"
                  v-model="password"
                  type="password"
                  label="Password Akun"
                  placeholder="Masukkan password Anda"
                />
                <button
                  type="submit"
                  :disabled="isLoading || !password"
                  class="w-full py-2.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                >
                  Nonaktifkan 2FA
                </button>
              </form>
            </div>

            <!-- 2FA is DISABLED -->
            <div v-else>
              <h4 class="text-md font-semibold text-gray-800 mb-2">Aktifkan Google Authenticator</h4>
              <p class="text-sm text-gray-500 mb-4">Scan QR code di bawah ini menggunakan aplikasi Google Authenticator, lalu masukkan 6 digit kode yang muncul.</p>
              
              <div v-if="setupData" class="flex flex-col items-center mb-6">
                <div class="p-2 border-2 border-dashed border-gray-200 rounded-xl mb-3 bg-white inline-block">
                  <img :src="setupData.qrCode" alt="QR Code" class="w-40 h-40" />
                </div>
                <p class="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">{{ setupData.secret }}</p>
              </div>

              <form @submit.prevent="handleEnable" class="space-y-4">
                <InputText
                  id="otp-code"
                  v-model="otpCode"
                  label="Kode Verifikasi OTP"
                  placeholder="Masukkan 6 digit kode"
                  maxlength="6"
                />
                <button
                  type="submit"
                  :disabled="isLoading || otpCode.length < 6"
                  class="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                >
                  Verifikasi & Aktifkan
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </Transition>
</template>
