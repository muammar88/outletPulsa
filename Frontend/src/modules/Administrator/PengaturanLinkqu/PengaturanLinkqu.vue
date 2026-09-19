<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNotification } from '@/composables/useNotification';
import Notification from '@/components/Modal/Notification.vue';
import BaseButton from '@/components/Button/BaseButton.vue';

// Reuse service yang sama dengan PengaturanUmum
import { pengaturanUmumService } from '../PengaturanUmum/services/pengaturanUmumService';
import type { PengaturanUmum } from '../PengaturanUmum/types/pengaturanUmum';

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
} = useNotification();

const formData = ref<Partial<PengaturanUmum>>({
  linkqu_is_active: false,
  linkqu_base_url_dev: 'https://gateway-dev.linkqu.id',
  linkqu_base_url_prod: 'https://api.linkqu.id',
  linkqu_client_id: 'testing',
  linkqu_client_secret: '123',
  linkqu_pin: '2K2NPCBBNNTovgB',
  linkqu_merchant_code: 'LI307GXIN',
  linkqu_signature_key: 'LinkQu@2020',
  linkqu_is_sandbox: true,
  linkqu_payment_va: true,
  linkqu_payment_ewallet: true,
  linkqu_payment_qris: true,
});

const showSecret = ref(false);
const showPin = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);

const fetchPengaturan = async () => {
  isLoading.value = true;
  try {
    const response = await pengaturanUmumService.get();
    const data = response.data.data;
    if (data) {
      formData.value = {
        linkqu_is_active: data.linkqu_is_active ?? false,
        linkqu_base_url_dev: data.linkqu_base_url_dev || 'https://gateway-dev.linkqu.id',
        linkqu_base_url_prod: data.linkqu_base_url_prod || 'https://api.linkqu.id',
        linkqu_client_id: data.linkqu_client_id || 'testing',
        linkqu_client_secret: data.linkqu_client_secret || '123',
        linkqu_pin: data.linkqu_pin || '2K2NPCBBNNTovgB',
        linkqu_merchant_code: data.linkqu_merchant_code || 'LI307GXIN',
        linkqu_signature_key: data.linkqu_signature_key || 'LinkQu@2020',
        linkqu_is_sandbox: data.linkqu_is_sandbox ?? true,
        linkqu_payment_va: data.linkqu_payment_va ?? true,
        linkqu_payment_ewallet: data.linkqu_payment_ewallet ?? true,
        linkqu_payment_qris: data.linkqu_payment_qris ?? true,
      };
    }
  } catch (error) {
    console.error('Gagal mengambil pengaturan LinkQu:', error);
    displayNotification('Gagal memuat data pengaturan LinkQu', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleSave = async () => {
  if (!formData.value.linkqu_client_id?.trim()) {
    displayNotification('Client ID LinkQu wajib diisi!', 'error');
    return;
  }
  if (!formData.value.linkqu_client_secret?.trim()) {
    displayNotification('Client Secret LinkQu wajib diisi!', 'error');
    return;
  }
  if (!formData.value.linkqu_pin?.trim()) {
    displayNotification('PIN LinkQu wajib diisi!', 'error');
    return;
  }

  isSaving.value = true;
  try {
    await pengaturanUmumService.update(formData.value);
    displayNotification('Pengaturan LinkQu berhasil diperbarui!', 'success');
    await fetchPengaturan();
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || 'Gagal menyimpan pengaturan LinkQu';
    displayNotification(errMsg, 'error');
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  fetchPengaturan();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <!-- Header -->
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-[#0f2155] dark:text-white mb-2 tracking-tight">
            Pengaturan LinkQu
          </h1>
          <p class="text-sm text-slate-500 font-medium">
            Kelola konfigurasi kredensial API untuk integrasi payment gateway LinkQu.
          </p>
        </div>

        <!-- Badge Mode -->
        <div
          :class="[
            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border',
            formData.linkqu_is_sandbox
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-green-50 text-green-700 border-green-200',
          ]"
        >
          <span
            :class="[
              'w-2 h-2 rounded-full',
              formData.linkqu_is_sandbox ? 'bg-amber-400' : 'bg-green-500 animate-pulse',
            ]"
          ></span>
          {{ formData.linkqu_is_sandbox ? 'Mode Sandbox' : 'Mode Production' }}
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Loading -->
        <div v-if="isLoading" class="p-12 flex justify-center items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f2155]"></div>
        </div>

        <!-- Form Content -->
        <div v-else>
          <div class="p-8 space-y-8">

            <!-- Section: Aktivasi -->
            <div class="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all cursor-pointer" @click="formData.linkqu_is_active = !formData.linkqu_is_active">
              <div>
                <p class="text-base font-bold text-gray-800">Aktivasi Payment Gateway</p>
                <p class="text-xs text-gray-400 mt-1">Jika aktif, metode pembayaran via LinkQu akan muncul di aplikasi.</p>
              </div>
              <div :class="['relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 flex-shrink-0', formData.linkqu_is_active ? 'bg-green-500' : 'bg-gray-200']">
                <span :class="['inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200', formData.linkqu_is_active ? 'translate-x-6' : 'translate-x-1']"></span>
              </div>
            </div>

            <!-- Section: Koneksi -->
            <div>
              <h3 class="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
                <svg class="w-4 h-4 text-[#0f2155]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Konfigurasi Koneksi
              </h3>
              <p class="text-xs text-gray-400 mb-5">Pengaturan dasar URL dan mode operasi LinkQu.</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Base URL Dev -->
                <div class="space-y-2">
                  <label for="linkqu_base_url_dev" class="block text-sm font-semibold text-gray-700">
                    Base URL (Sandbox / Dev)
                  </label>
                  <input
                    id="linkqu_base_url_dev"
                    v-model="formData.linkqu_base_url_dev"
                    type="url"
                    class="block w-full rounded-xl border border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                    placeholder="https://gateway-dev.linkqu.id"
                  />
                </div>

                <!-- Base URL Prod -->
                <div class="space-y-2">
                  <label for="linkqu_base_url_prod" class="block text-sm font-semibold text-gray-700">
                    Base URL (Production)
                  </label>
                  <input
                    id="linkqu_base_url_prod"
                    v-model="formData.linkqu_base_url_prod"
                    type="url"
                    class="block w-full rounded-xl border border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                    placeholder="https://api.linkqu.id"
                  />
                </div>

                <!-- Sandbox Toggle -->
                <div class="space-y-2 md:col-span-2">
                  <div
                    class="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all cursor-pointer"
                    @click="formData.linkqu_is_sandbox = !formData.linkqu_is_sandbox"
                  >
                    <div>
                      <p class="text-sm font-semibold text-gray-800">Mode Sandbox</p>
                      <p class="text-xs text-gray-400 mt-0.5">
                        Aktifkan saat pengembangan/testing. Nonaktifkan untuk transaksi nyata (production).
                      </p>
                    </div>
                    <!-- Toggle Switch -->
                    <div
                      :class="[
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0',
                        formData.linkqu_is_sandbox ? 'bg-amber-400' : 'bg-gray-200',
                      ]"
                    >
                      <span
                        :class="[
                          'inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200',
                          formData.linkqu_is_sandbox ? 'translate-x-6' : 'translate-x-1',
                        ]"
                      ></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-100"></div>

            <!-- Section: Kredensial -->
            <div>
              <h3 class="text-base font-bold text-gray-800 mb-1 flex items-center gap-2">
                <svg class="w-4 h-4 text-[#0f2155]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Kredensial API
              </h3>
              <p class="text-xs text-gray-400 mb-5">Dapatkan nilai ini dari dashboard merchant LinkQu Anda.</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Client ID -->
                <div class="space-y-2">
                  <label for="linkqu_client_id" class="block text-sm font-semibold text-gray-700">
                    Client ID <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="linkqu_client_id"
                    v-model="formData.linkqu_client_id"
                    type="text"
                    class="block w-full rounded-xl border border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                    placeholder="Masukkan Client ID"
                  />
                </div>

                <!-- Username / Corporate ID -->
                <div class="space-y-2">
                  <label for="linkqu_merchant_code" class="block text-sm font-semibold text-gray-700">
                    Username / Corporate ID
                  </label>
                  <input
                    id="linkqu_merchant_code"
                    v-model="formData.linkqu_merchant_code"
                    type="text"
                    class="block w-full rounded-xl border border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                    placeholder="Contoh: LI731RV5G"
                  />
                </div>

                <!-- Client Secret -->
                <div class="space-y-2 relative">
                  <label for="linkqu_client_secret" class="block text-sm font-semibold text-gray-700">
                    Client Secret <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="linkqu_client_secret"
                      v-model="formData.linkqu_client_secret"
                      :type="showSecret ? 'text' : 'password'"
                      class="block w-full rounded-xl border border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3 pr-12"
                      placeholder="Masukkan Client Secret"
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      @click="showSecret = !showSecret"
                    >
                      <svg v-if="showSecret" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  <p class="text-xs text-gray-400">Jangan bagikan Client Secret kepada siapapun.</p>
                </div>

                <!-- PIN -->
                <div class="space-y-2 relative">
                  <label for="linkqu_pin" class="block text-sm font-semibold text-gray-700">
                    PIN Transaksi <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="linkqu_pin"
                      v-model="formData.linkqu_pin"
                      :type="showPin ? 'text' : 'password'"
                      maxlength="6"
                      class="block w-full rounded-xl border border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3 pr-12 tracking-widest"
                      placeholder="Masukkan PIN (6 digit)"
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      @click="showPin = !showPin"
                    >
                      <svg v-if="showPin" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  <p class="text-xs text-gray-400">PIN 6 digit yang digunakan untuk otorisasi transaksi disbursement.</p>
                </div>

                <!-- Signature Key -->
                <div class="space-y-2 relative md:col-span-2">
                  <label for="linkqu_signature_key" class="block text-sm font-semibold text-gray-700">
                    Signature Key
                  </label>
                  <div class="relative">
                    <input
                      id="linkqu_signature_key"
                      v-model="formData.linkqu_signature_key"
                      :type="showSecret ? 'text' : 'password'"
                      class="block w-full rounded-xl border border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3 pr-12"
                      placeholder="Masukkan Signature Key"
                    />
                  </div>
                  <p class="text-xs text-gray-400">Credential tersimpan. Kosongkan field ini jika tidak ingin mengubahnya.</p>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-100"></div>

            <!-- Section: Metode Penerimaan Dana -->
            <div>
              <h3 class="text-base font-bold text-gray-800 mb-1">
                Metode Penerimaan Dana LinkQu
              </h3>
              <p class="text-xs text-gray-400 mb-5">Aktifkan metode pembayaran yang ingin tersedia untuk transaksi.</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Virtual Account -->
                <div class="flex items-center gap-4 cursor-pointer" @click="formData.linkqu_payment_va = !formData.linkqu_payment_va">
                  <div :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200', formData.linkqu_payment_va ? 'bg-green-500' : 'bg-gray-200']">
                    <span :class="['inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200', formData.linkqu_payment_va ? 'translate-x-6' : 'translate-x-1']"></span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">Virtual Account</p>
                    <p class="text-xs text-gray-400">Mengaktifkan pembayaran melalui Virtual Account Bank.</p>
                  </div>
                </div>

                <!-- QRIS -->
                <div class="flex items-center gap-4 cursor-pointer" @click="formData.linkqu_payment_qris = !formData.linkqu_payment_qris">
                  <div :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200', formData.linkqu_payment_qris ? 'bg-green-500' : 'bg-gray-200']">
                    <span :class="['inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200', formData.linkqu_payment_qris ? 'translate-x-6' : 'translate-x-1']"></span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">QRIS</p>
                    <p class="text-xs text-gray-400">Mengaktifkan pembayaran melalui pemindaian QRIS.</p>
                  </div>
                </div>

                <!-- E-Wallet -->
                <div class="flex items-center gap-4 cursor-pointer" @click="formData.linkqu_payment_ewallet = !formData.linkqu_payment_ewallet">
                  <div :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200', formData.linkqu_payment_ewallet ? 'bg-green-500' : 'bg-gray-200']">
                    <span :class="['inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200', formData.linkqu_payment_ewallet ? 'translate-x-6' : 'translate-x-1']"></span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">E-Wallet</p>
                    <p class="text-xs text-gray-400">Mengaktifkan pembayaran melalui e-wallet (OVO, DANA, dll).</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Info Box -->
            <div class="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-sm font-semibold text-blue-800">Cara mendapatkan kredensial</p>
                <p class="text-xs text-blue-600 mt-1">
                  Login ke dashboard LinkQu → Profil → API Credential. Pastikan IP server Anda sudah di-whitelist di pengaturan keamanan dashboard LinkQu.
                </p>
              </div>
            </div>

          </div>

          <!-- Footer Action -->
          <div class="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-end">
            <BaseButton
              variant="primary"
              @click="handleSave"
              :loading="isSaving"
              :disabled="isLoading"
              class="px-8"
            >
              Simpan Pengaturan
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
