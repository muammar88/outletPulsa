<script setup lang="ts">
import BaseFormModal from '@/components/Modal/Form.vue';
import InputText from '@/components/Form/InputText.vue';
import { useNotification } from '@/composables/useNotification';
import { operatorService, type Operator } from '@/service/administrator/operator';
import IconPlus from '@/components/Icons/IconPlus.vue';
import IconTrash from '@/components/Icons/IconTrash.vue';
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  operator: Operator | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const { displayNotification } = useNotification();
const isLoading = ref(false);
const prefixes = ref<string[]>(['']);

watch(() => props.show, (newVal) => {
  if (newVal && props.operator) {
    if (props.operator.prefixes && props.operator.prefixes.length > 0) {
      prefixes.value = props.operator.prefixes.map(p => p.prefix);
    } else {
      prefixes.value = [''];
    }
  } else {
    prefixes.value = [''];
  }
});

const addPrefix = () => {
  prefixes.value.push('');
};

const removePrefix = (index: number) => {
  prefixes.value.splice(index, 1);
  if (prefixes.value.length === 0) {
    prefixes.value.push('');
  }
};

const handleSubmit = async () => {
  if (!props.operator?.id) return;
  
  isLoading.value = true;
  try {
    const prefixesArray = prefixes.value
      .map(p => p.trim())
      .filter(p => p.length > 0);
      
    await operatorService.update(props.operator.id, {
      prefixes: prefixesArray
    });
    
    displayNotification('Prefix berhasil diperbarui', 'success');
    emit('saved');
    emit('close');
  } catch (error: any) {
    const errMessage = error.response?.data?.message || 'Gagal memperbarui prefix';
    displayNotification(errMessage, 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    label="Kelola Prefix Operator"
    submit-label="Simpan"
    width="w-full max-w-md"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="handleSubmit"
  >
    <div class="mb-4">
      <div class="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-4">
        <h3 class="text-sm font-semibold text-indigo-900 mb-1">Operator: {{ operator?.name }}</h3>
        <p class="text-xs text-indigo-700">Kode: {{ operator?.kode }}</p>
      </div>

      <div class="space-y-3">
        <label class="block text-sm font-medium text-gray-700">Daftar Prefix</label>
        
        <div v-for="(prefix, index) in prefixes" :key="index" class="flex items-center gap-2">
          <InputText
            v-model="prefixes[index]"
            :id="'prefix-' + index"
            :label_status="false"
            placeholder="Cth: 0812"
            class="flex-1"
          />
          <button 
            type="button" 
            @click="removePrefix(index)"
            class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
            title="Hapus Prefix"
          >
            <IconTrash class="w-5 h-5" />
          </button>
        </div>

        <button 
          type="button" 
          @click="addPrefix"
          class="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors mt-2"
        >
          <IconPlus class="w-4 h-4" />
          Tambah Prefix Lainnya
        </button>
      </div>
    </div>
  </BaseFormModal>
</template>
