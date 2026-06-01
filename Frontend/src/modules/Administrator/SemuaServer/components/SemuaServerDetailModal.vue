<script setup lang="ts">
import ModalForm from '@/components/Modal/Form.vue';
import type { Server } from '../types/semuaServer';

defineProps<{
  show: boolean;
  serverData: Server | null;
}>();

defineEmits(['close']);
</script>

<template>
  <ModalForm
    :formStatus="show"
    label="Detail Server"
    width="sm:max-w-md w-full"
    submitLabel=""
    @cancel="$emit('close')"
    @close="$emit('close')"
  >
    <div v-if="serverData" class="space-y-0 divide-y divide-gray-100 p-2">
      <!-- ID -->
      <div class="py-3 flex justify-between items-center">
        <span class="text-sm font-medium text-gray-500">ID System</span>
        <span class="text-sm font-bold text-gray-900">#{{ serverData.id }}</span>
      </div>

      <!-- Kode -->
      <div class="py-3 flex justify-between items-center">
        <span class="text-sm font-medium text-gray-500">Kode Server</span>
        <span class="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">{{ serverData.kode }}</span>
      </div>

      <!-- Name -->
      <div class="py-3 flex justify-between items-center">
        <span class="text-sm font-medium text-gray-500">Nama Server</span>
        <span class="text-sm font-semibold text-gray-900">{{ serverData.name }}</span>
      </div>

      <!-- Status -->
      <div class="py-3 flex justify-between items-center">
        <span class="text-sm font-medium text-gray-500">Status</span>
        <span 
          :class="serverData.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'"
          class="px-2.5 py-1 text-xs font-bold rounded-full border"
        >
          {{ serverData.status === 'active' ? 'Aktif' : 'Non-Aktif' }}
        </span>
      </div>

      <!-- Tanggal Dibuat -->
      <div class="py-3 flex flex-col gap-1">
        <span class="text-sm font-medium text-gray-500">Didaftarkan Pada</span>
        <span class="text-sm text-gray-700">{{ new Date(serverData.createdAt).toLocaleString('id-ID') }}</span>
      </div>
      
      <!-- Terakhir Update -->
      <div class="py-3 flex flex-col gap-1">
        <span class="text-sm font-medium text-gray-500">Terakhir Diperbarui</span>
        <span class="text-sm text-gray-700">{{ new Date(serverData.updatedAt).toLocaleString('id-ID') }}</span>
      </div>
    </div>
  </ModalForm>
</template>
