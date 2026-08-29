<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNotification } from '@/composables/useNotification';
import Notification from '@/components/Modal/Notification.vue';
import BaseButton from '@/components/Button/BaseButton.vue';

// Menggunakan service yang sama dengan PengaturanUmum
import { pengaturanUmumService } from '../PengaturanUmum/services/pengaturanUmumService';
import type { PengaturanUmum } from '../PengaturanUmum/types/pengaturanUmum';

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
} = useNotification();

const formData = ref<Partial<PengaturanUmum>>({
  wa_api_url: 'https://wapisender.id/api',
  wa_api_key: '',
  wa_device_key: '',
});

const isLoading = ref(false);
const isSaving = ref(false);

const fetchPengaturan = async () => {
  isLoading.value = true;
  try {
    const response = await pengaturanUmumService.get();
    const data = response.data.data;
    if (data) {
      // Jika dari backend masih null/kosong, kita tetap beri default url wapisender
      formData.value = {
        wa_api_url: data.wa_api_url || 'https://wapisender.id/api',
        wa_api_key: data.wa_api_key || '',
        wa_device_key: data.wa_device_key || '',
      };
    }
  } catch (error) {
    console.error('Gagal mengambil pengaturan WhatsApp:', error);
    displayNotification('Gagal memuat data pengaturan', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleSave = async () => {
  // Validasi form
  if (!formData.value.wa_api_key?.trim()) {
    displayNotification('API Key WhatsApp wajib diisi!', 'error');
    return;
  }
  if (!formData.value.wa_device_key?.trim()) {
    displayNotification('Device Key WhatsApp wajib diisi!', 'error');
    return;
  }

  isSaving.value = true;
  try {
    // Karena update API nya parsial (PATCH/merger field dari DTO), kita hanya lempar field wa_ saja
    // Asumsi updatePengaturanUmumDto menggunakan tipe yang sama
    await pengaturanUmumService.update(formData.value);
    displayNotification('Pengaturan WhatsApp berhasil diperbarui!', 'success');
    await fetchPengaturan(); // Refresh data
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || 'Gagal menyimpan pengaturan WhatsApp';
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
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-[#0f2155] dark:text-white mb-2 tracking-tight">
            Pengaturan WhatsApp (Wapisender)
          </h1>
          <p class="text-sm text-slate-500 font-medium">
            Kelola konfigurasi API Key dan Device Key untuk integrasi notifikasi WhatsApp.
          </p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Loading overlay -->
        <div v-if="isLoading" class="p-12 flex justify-center items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f2155]"></div>
        </div>
        
        <!-- Form Content -->
        <div v-else>
          <div class="p-8 space-y-8">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- API URL -->
              <div class="space-y-2 md:col-span-2">
                <label for="wa_api_url" class="block text-sm font-semibold text-gray-800">
                  Base API URL <span class="text-red-500">*</span>
                </label>
                <input
                  id="wa_api_url"
                  v-model="formData.wa_api_url"
                  type="url"
                  class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                  placeholder="https://wapisender.id/api"
                />
                <p class="text-xs text-gray-500">Biarkan default kecuali Anda menggunakan server kustom Wapisender.</p>
              </div>

              <!-- API Key -->
              <div class="space-y-2">
                <label for="wa_api_key" class="block text-sm font-semibold text-gray-800">
                  API Key <span class="text-red-500">*</span>
                </label>
                <input
                  id="wa_api_key"
                  v-model="formData.wa_api_key"
                  type="password"
                  class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                  placeholder="Masukkan API Secret Key"
                />
                <p class="text-xs text-gray-500">Dapatkan di dashboard profil Wapisender Anda.</p>
              </div>
              
              <!-- Device Key -->
              <div class="space-y-2">
                <label for="wa_device_key" class="block text-sm font-semibold text-gray-800">
                  Device Unique ID (Key) <span class="text-red-500">*</span>
                </label>
                <input
                  id="wa_device_key"
                  v-model="formData.wa_device_key"
                  type="text"
                  class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                  placeholder="Contoh: WAPI-ABC1234"
                />
                <p class="text-xs text-gray-500">Pastikan device sudah berstatus Connected.</p>
              </div>
            </div>
            
          </div>
          
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
