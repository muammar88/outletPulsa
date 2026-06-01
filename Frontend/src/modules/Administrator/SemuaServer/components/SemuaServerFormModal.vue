<script setup lang="ts">
import { ref, watch } from 'vue';
import ModalForm from '@/components/Modal/Form.vue';
import { semuaServerService } from '../services/semuaServerService';
import type { Server } from '../types/semuaServer';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  serverData: Server | null;
}>();

const emit = defineEmits(['close', 'saved']);

const formData = ref({
  kode: '',
  name: '',
  status: 'active',
});

const isSubmitting = ref(false);

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.serverData) {
        formData.value = {
          kode: props.serverData.kode || '',
          name: props.serverData.name || '',
          status: props.serverData.status || 'active',
        };
      } else {
        formData.value = {
          kode: '',
          name: '',
          status: 'active',
        };
      }
    }
  },
  { immediate: true },
);

const handleClose = () => {
  emit('close');
};

const handleSave = async () => {
  if (!formData.value.kode || !formData.value.name) return;
  
  isSubmitting.value = true;
  try {
    if (props.mode === 'add') {
      await semuaServerService.create(formData.value);
    } else if (props.mode === 'edit' && props.serverData) {
      await semuaServerService.update(props.serverData.id, formData.value);
    }
    emit('saved');
  } catch (error: any) {
    console.error('Gagal menyimpan server:', error);
    throw error;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <ModalForm
    :formStatus="show"
    :label="mode === 'add' ? 'Tambah Server Baru' : 'Edit Data Server'"
    width="sm:max-w-md w-full"
    submitLabel="Simpan Data"
    @cancel="handleClose"
    @close="handleClose"
    @submit="handleSave"
  >
    <div class="space-y-5 py-2">
      <!-- Kode Server -->
      <div>
        <label for="kode" class="block text-sm font-medium text-gray-700 mb-1">
          Kode Server <span class="text-red-500">*</span>
        </label>
        <input
          id="kode"
          v-model="formData.kode"
          type="text"
          class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0f2155] focus:ring-[#0f2155] sm:text-sm"
          placeholder="Contoh: S-001"
          required
        />
      </div>

      <!-- Nama Server -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Nama Server <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0f2155] focus:ring-[#0f2155] sm:text-sm"
          placeholder="Contoh: Digiflazz"
          required
        />
      </div>

      <!-- Status -->
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
          Status <span class="text-red-500">*</span>
        </label>
        <select
          id="status"
          v-model="formData.status"
          class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#0f2155] focus:ring-[#0f2155] sm:text-sm"
        >
          <option value="active">Aktif</option>
          <option value="inactive">Non-Aktif</option>
        </select>
      </div>
    </div>
  </ModalForm>
</template>
