<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useNotification } from '@/composables/useNotification';
import Modal from '@/components/Modal/Modal.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import SecondaryButton from '@/components/Button/SecondaryButton.vue';
import { emoneyLinkquService } from '../services/emoneyLinkquService';
import type { EmoneyLinkqu } from '../types/emoneyLinkqu';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: EmoneyLinkqu | null;
  loading?: boolean;
}>();

const emit = defineEmits(['close', 'saved']);

const { displayNotification } = useNotification();

const formData = ref<EmoneyLinkqu>({
  name: '',
  kode: '',
  image: '',
  harga_jual: 0,
  status: false,
});

const isSaving = ref(false);

const modalTitle = computed(() => (props.mode === 'add' ? 'Tambah E-Money' : 'Edit E-Money'));

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.initialData) {
        formData.value = { ...props.initialData };
      } else {
        formData.value = {
          name: '',
          kode: '',
          image: '',
          harga_jual: 0,
          status: false,
        };
      }
    }
  }
);

const handleSave = async () => {
  if (!formData.value.name?.trim() || !formData.value.kode?.trim()) {
    displayNotification('Nama dan Kode E-Money wajib diisi!', 'error');
    return;
  }

  isSaving.value = true;
  try {
    const payload = { ...formData.value, harga_jual: Number(formData.value.harga_jual) };
    if (props.mode === 'add') {
      await emoneyLinkquService.create(payload);
      displayNotification('E-Money berhasil ditambahkan!', 'success');
    } else {
      await emoneyLinkquService.update(payload.id!, payload);
      displayNotification('E-Money berhasil diperbarui!', 'success');
    }
    emit('saved');
    emit('close');
  } catch (error: any) {
    const errMsg = error?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
    displayNotification(errMsg, 'error');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <Modal :show="show" :title="modalTitle" @close="$emit('close')">
    <div class="space-y-4">
      <!-- Nama E-Money -->
      <div class="space-y-1">
        <label class="block text-sm font-semibold text-gray-700">Nama E-Money <span class="text-red-500">*</span></label>
        <input
          v-model="formData.name"
          type="text"
          class="block w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Contoh: OVO, DANA, GoPay"
        />
      </div>

      <!-- Kode -->
      <div class="space-y-1">
        <label class="block text-sm font-semibold text-gray-700">Kode <span class="text-red-500">*</span></label>
        <input
          v-model="formData.kode"
          type="text"
          class="block w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Contoh: OVO, DANA"
        />
      </div>

      <!-- Harga Jual -->
      <div class="space-y-1">
        <label class="block text-sm font-semibold text-gray-700">Harga Jual / Biaya</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 text-sm font-semibold">Rp</span>
          <input
            v-model="formData.harga_jual"
            type="number"
            class="block w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="0"
          />
        </div>
      </div>

      <!-- Image URL -->
      <div class="space-y-1">
        <label class="block text-sm font-semibold text-gray-700">URL Gambar/Logo</label>
        <input
          v-model="formData.image"
          type="text"
          class="block w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="https://..."
        />
      </div>

      <!-- Status Aktif -->
      <div class="flex items-center gap-3 pt-2">
        <div
          class="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out"
          :class="formData.status ? 'bg-green-500' : 'bg-gray-200'"
          @click="formData.status = !formData.status"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out"
            :class="formData.status ? 'translate-x-6' : 'translate-x-1'"
          />
        </div>
        <span class="text-sm font-semibold text-gray-700">Status Aktif</span>
      </div>
    </div>
    
    <template #footer>
      <SecondaryButton @click="$emit('close')" :disabled="isSaving">
        Batal
      </SecondaryButton>
      <PrimaryButton @click="handleSave" :disabled="isSaving">
        Simpan
      </PrimaryButton>
    </template>
  </Modal>
</template>
