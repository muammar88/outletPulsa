<script setup lang="ts">
import { computed } from 'vue';
import type { Device } from '@/service/administrator/device';

const props = defineProps<{
  show: boolean;
  device: Device | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 class="text-lg font-semibold text-gray-800">Detail Device</h3>
        <button 
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-6 overflow-y-auto flex-1">
        <div v-if="device" class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          
          <!-- Basic Info -->
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Nama Device</p>
              <p class="text-base text-gray-900 font-medium">{{ device.device_name || '-' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Kode Device</p>
              <p class="text-base text-gray-900 font-mono text-sm">{{ device.device_code }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Brand & Model</p>
              <p class="text-base text-gray-900">{{ device.device_brand || '-' }} {{ device.device_model || '-' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Sistem Operasi</p>
              <p class="text-base text-gray-900">{{ device.os_name || '-' }} {{ device.os_version || '-' }}</p>
            </div>
          </div>

          <!-- App Info -->
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Versi Aplikasi</p>
              <p class="text-base text-gray-900">{{ device.app_version || '-' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Pemilik / User</p>
              <p class="text-base text-gray-900 font-medium text-primary-600">
                {{ device.member?.fullname || '-' }}
              </p>
              <p class="text-sm text-gray-500" v-if="device.member?.whatsappnumber">
                {{ device.member.whatsappnumber }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Status</p>
              <span :class="[
                  'px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center',
                  device.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                ]">
                <span :class="[
                  'w-1.5 h-1.5 rounded-full mr-1.5',
                  device.status === 'Online' ? 'bg-emerald-500' : 'bg-gray-500'
                ]"></span>
                {{ device.status }}
              </span>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="col-span-1 md:col-span-2 pt-4 mt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Terakhir Login</p>
              <p class="text-base text-gray-900">{{ formatDate(device.last_login) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Tanggal Registrasi Device</p>
              <p class="text-base text-gray-900">{{ formatDate(device.createdAt) }}</p>
            </div>
          </div>

        </div>
        <div v-else class="py-12 flex justify-center items-center">
          <p class="text-gray-500">Memuat data...</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
        <button 
          @click="emit('close')"
          class="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm transition-colors"
        >
          Tutup
        </button>
      </div>

    </div>
  </div>
</template>
