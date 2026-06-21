<script setup lang="ts">
import { ref } from 'vue';
import Modal from '@/components/Modal/Modal.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import SecondaryButton from '@/components/Button/SecondaryButton.vue';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['close', 'submit']);

const alasan = ref('');
const isSubmitting = ref(false);

const submitForm = () => {
  if (!alasan.value.trim()) return;
  
  isSubmitting.value = true;
  emit('submit', alasan.value.trim());
};

const handleClose = () => {
  if (!isSubmitting.value) {
    alasan.value = '';
    emit('close');
  }
};
</script>

<template>
  <Modal :show="show" title="Konfirmasi Penolakan Deposit" @close="handleClose" max-width="md">
    <div class="space-y-4">
      <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-amber-700">
              Deposit yang ditolak akan langsung dibatalkan dan tidak menambah saldo member. Proses ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Alasan Penolakan <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="alasan"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500"
          placeholder="Tulis alasan mengapa deposit ini ditolak..."
          :disabled="isSubmitting"
          required
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">Alasan ini akan dapat dilihat oleh member.</p>
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
      <SecondaryButton @click="handleClose" :disabled="isSubmitting">Batal</SecondaryButton>
      <PrimaryButton 
        @click="submitForm" 
        :disabled="isSubmitting || !alasan.trim()" 
        class="bg-rose-600 hover:bg-rose-700"
      >
        <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isSubmitting ? 'Memproses...' : 'Tolak Deposit' }}
      </PrimaryButton>
    </div>
  </Modal>
</template>
