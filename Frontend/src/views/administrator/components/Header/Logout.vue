<script setup lang="ts">
import { ref } from 'vue';
import api from '@/service/api_administrator';
import { setAdminLoggedIn } from '@/utils/cookies';
import { useMenuStore } from '@/stores/menu';
import { IconLogout } from '@/components/Icons';

const emit = defineEmits(['close-dropdown']);

const showConfirmation = ref(false);
const isLoading = ref(false);
const showNotification = ref(false);

const menuStore = useMenuStore();

const showLogoutConfirmation = () => {
  showConfirmation.value = true;
};

const hideLogoutConfirmation = () => {
  if (!isLoading.value) {
    showConfirmation.value = false;
    emit('close-dropdown');
  }
};

const handleLogout = async () => {
  isLoading.value = true;

  try {
    // Kirim request ke backend — server akan clearCookie access_token & refresh_token
    await api.post('/administrator/auth/logout');
  } catch (error) {
    // Lanjutkan logout di sisi client walau request gagal
    console.error('Error during logout request:', error);
  } finally {
    // Bersihkan flag login di cookie client-side
    setAdminLoggedIn(false);

    // Reset menu store agar tidak ada data lama saat login ulang
    menuStore.resetMenus();

    isLoading.value = false;
    showConfirmation.value = false;
    showNotification.value = true;

    setTimeout(() => {
      window.location.href = '/login-backbone';
    }, 1500);
  }
};

defineExpose({ showLogoutConfirmation, handleLogout });
</script>

<template>
  <div>
    <button
      @click="showLogoutConfirmation"
      class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      <div class="bg-slate-200 p-1.5 rounded-lg text-slate-600 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
        <IconLogout :size="18" :stroke-width="2" />
      </div>
      Log Out
    </button>
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
          v-if="showConfirmation"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          @click.self="hideLogoutConfirmation"
        >
          <div class="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4">
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Konfirmasi Logout</h3>
              <button
                @click="hideLogoutConfirmation"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="p-6">
              <div class="flex items-center justify-center mb-4">
                <div class="flex-shrink-0 w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
              </div>
              <p class="text-center text-gray-700 mb-2 font-medium">Keluar dari Aplikasi?</p>
              <p class="text-center text-gray-500 text-sm">
                Sesi Anda akan diakhiri. Anda perlu login kembali untuk mengakses area administrator.
              </p>
            </div>

            <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                @click="hideLogoutConfirmation"
                :disabled="isLoading"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Batal
              </button>
              <button
                @click="handleLogout"
                :disabled="isLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg
                  v-if="isLoading"
                  class="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? 'Keluar...' : 'Ya, Keluar' }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="showNotification"
          class="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Berhasil logout. Mengalihkan ke halaman login...
        </div>
      </Teleport>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
