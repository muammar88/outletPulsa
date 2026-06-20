<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNotification } from '@/composables/useNotification';
import Notification from '@/components/Modal/Notification.vue';
import BaseButton from '@/components/Button/BaseButton.vue';

import { pengaturanUmumService } from './services/pengaturanUmumService';
import type { PengaturanUmum } from './types/pengaturanUmum';

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
} = useNotification();

const formData = ref<Partial<PengaturanUmum>>({
  nama_aplikasi: '',
  deskripsi: '',
  logo: '',
  email: '',
  telepon: '',
  alamat: '',
});

const isLoading = ref(false);
const isSaving = ref(false);

const fetchPengaturan = async () => {
  isLoading.value = true;
  try {
    const response = await pengaturanUmumService.get();
    const data = response.data.data;
    if (data) {
      formData.value = {
        nama_aplikasi: data.nama_aplikasi || '',
        deskripsi: data.deskripsi || '',
        logo: data.logo || '',
        email: data.email || '',
        telepon: data.telepon || '',
        alamat: data.alamat || '',
      };
    }
  } catch (error) {
    console.error('Gagal mengambil pengaturan:', error);
    displayNotification('Gagal memuat data pengaturan', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    await pengaturanUmumService.update(formData.value);
    displayNotification('Pengaturan berhasil diperbarui!', 'success');
    await fetchPengaturan(); // Refresh data
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || 'Gagal menyimpan pengaturan';
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
            Pengaturan Umum
          </h1>
          <p class="text-sm text-slate-500 font-medium">
            Kelola konfigurasi utama dan identitas aplikasi Anda.
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
              <!-- Nama Aplikasi -->
              <div class="space-y-2">
                <label for="nama_aplikasi" class="block text-sm font-semibold text-gray-800">
                  Nama Aplikasi
                </label>
                <input
                  id="nama_aplikasi"
                  v-model="formData.nama_aplikasi"
                  type="text"
                  class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                  placeholder="Contoh: Outlet Pulsa"
                />
              </div>

              <!-- Telepon -->
              <div class="space-y-2">
                <label for="telepon" class="block text-sm font-semibold text-gray-800">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  id="telepon"
                  v-model="formData.telepon"
                  type="text"
                  class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                  placeholder="Contoh: 081234567890"
                />
              </div>
              
              <!-- Email -->
              <div class="space-y-2">
                <label for="email" class="block text-sm font-semibold text-gray-800">
                  Alamat Email
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                  placeholder="Contoh: admin@outletpulsa.com"
                />
              </div>

              <!-- URL Logo -->
              <div class="space-y-2">
                <label for="logo" class="block text-sm font-semibold text-gray-800">
                  URL Logo Aplikasi
                </label>
                <input
                  id="logo"
                  v-model="formData.logo"
                  type="url"
                  class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                  placeholder="https://example.com/logo.webp"
                />
              </div>
            </div>

            <!-- Deskripsi -->
            <div class="space-y-2">
              <label for="deskripsi" class="block text-sm font-semibold text-gray-800">
                Deskripsi Singkat
              </label>
              <textarea
                id="deskripsi"
                v-model="formData.deskripsi"
                rows="3"
                class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                placeholder="Deskripsi platform..."
              ></textarea>
            </div>

            <!-- Alamat -->
            <div class="space-y-2">
              <label for="alamat" class="block text-sm font-semibold text-gray-800">
                Alamat Kantor
              </label>
              <textarea
                id="alamat"
                v-model="formData.alamat"
                rows="3"
                class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#0f2155] focus:ring focus:ring-[#0f2155]/10 sm:text-sm transition-all bg-gray-50/50 hover:bg-white px-4 py-3"
                placeholder="Alamat lengkap..."
              ></textarea>
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
