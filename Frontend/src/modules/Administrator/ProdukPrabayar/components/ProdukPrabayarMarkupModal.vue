<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import InputCurrency from '@/components/Form/InputCurrency.vue';
import { ProdukPrabayarService } from '../services/ProdukPrabayarService';

const props = defineProps({
  show: Boolean,
  produk: Object,
});

const emit = defineEmits(['close', 'refresh', 'notify']);

const isSubmitting = ref(false);
const markupValue = ref<number>(0);

watch(
  () => props.show,
  (val) => {
    if (val && props.produk) {
      markupValue.value = props.produk.markup || 0;
    } else {
      markupValue.value = 0;
    }
  }
);

const handleSave = async () => {
  if (isSubmitting.value || !props.produk) return;
  
  if (markupValue.value < 0) {
    emit('notify', 'Nilai markup tidak valid', 'error');
    return;
  }

  isSubmitting.value = true;
  try {
    await ProdukPrabayarService.update(props.produk.id, { markup: markupValue.value });
    emit('notify', `Markup untuk ${props.produk.name} berhasil diperbarui`, 'success');
    emit('refresh');
    emit('close');
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Gagal mengubah markup';
    emit('notify', msg, 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <BaseFormModal
    :formStatus="show"
    label="Ubah Markup Produk"
    width="sm:w-full sm:max-w-md"
    submitLabel="Simpan Perubahan"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="handleSave"
  >
    <div class="space-y-4 p-2" v-if="produk">
      <div class="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4">
        <p class="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Info Produk</p>
        <p class="text-sm font-bold text-gray-900">{{ produk.name }}</p>
        <p class="text-[10px] text-gray-500 font-mono mt-0.5">{{ produk.kode }}</p>
      </div>

      <InputCurrency
        id="markup"
        label="Markup (Margin Keuntungan)"
        v-model="markupValue"
        placeholder="0"
        :required="true"
      />
      <p class="text-xs text-gray-500 italic mt-1">
        Nilai ini akan ditambahkan ke harga beli (harga server) untuk menjadi harga jual.
      </p>
    </div>
  </BaseFormModal>
</template>
