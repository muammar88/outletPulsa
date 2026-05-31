<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { logout_administrator } from '@/service/auth';

const emit = defineEmits(['close-dropdown']);

// Reactive state
const showConfirmation = ref(false);
const isLoading = ref(false);
const showNotification = ref(false);

// Methods
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
    await logout_administrator({
      refresh_token: localStorage.getItem('administrator_refresh_token'),
    });

    // Clear localStorage di sisi client
    localStorage.removeItem('administrator_access_token');
    localStorage.removeItem('administrator_refresh_token');

    showConfirmation.value = false;
    showNotification.value = true;

    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  } catch (error) {
    console.error('Error during logout:', error);

    localStorage.removeItem('administrator_access_token');
    localStorage.removeItem('administrator_refresh_token');

    showConfirmation.value = false;
    showNotification.value = true;

    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  } finally {
    isLoading.value = false;
  }
};

defineExpose({
  showLogoutConfirmation,
  handleLogout,
});
import { IconLogout } from '@tabler/icons-vue';
</script>

<template>
  <div>
    <button
      @click="showLogoutConfirmation"
      class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
    >
      <div class="bg-slate-200 p-1.5 rounded-lg text-slate-600 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
        <IconLogout :size="18" :stroke="2" />
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
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div class="p-6">
              <div class="flex items-center mb-4">
                <div
                  class="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                  </svg>
                </div>
              </div>
              <p class="text-center text-gray-700 mb-6">
                Apakah Anda yakin ingin keluar dari aplikasi? Anda perlu login kembali untuk
                menggunakan aplikasi.
              </p>
            </div>

            <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                @click="hideLogoutConfirmation"
                :disabled="isLoading"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Batal
              </button>
              <button
                @click="handleLogout"
                :disabled="isLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg
                  v-if="isLoading"
                  class="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ isLoading ? 'Keluar...' : 'Ya, Keluar' }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="showNotification"
          class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
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

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
