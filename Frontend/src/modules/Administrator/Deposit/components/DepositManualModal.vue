<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Modal from '@/components/Modal/Modal.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import SecondaryButton from '@/components/Button/SecondaryButton.vue';
import { useNotification } from '@/composables/useNotification';
import { memberService } from '@/service/administrator/member';
import { depositService } from '@/service/administrator/deposit';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['close', 'success']);

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const members = ref<any[]>([]);
const isLoadingMembers = ref(false);
const isSubmitting = ref(false);

const form = ref({
  memberId: '',
  nominal: 0,
  ket: '',
});

const selectedMember = computed(() => {
  if (!form.value.memberId) return null;
  return members.value.find(m => m.id === Number(form.value.memberId));
});

const displayNominal = computed({
  get() {
    if (!form.value.nominal) return '';
    return form.value.nominal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },
  set(newValue: string) {
    const numericValue = newValue.replace(/\D/g, '');
    form.value.nominal = numericValue ? Number(numericValue) : 0;
  }
});

const fetchMembers = async () => {
  isLoadingMembers.value = true;
  try {
    const response = await memberService.getAll('', 1000, 1);
    if (response.data.data.list) {
      members.value = response.data.data.list;
    } else {
      members.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to load members', error);
  } finally {
    isLoadingMembers.value = false;
  }
};

const formatCurrency = (value: number) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const submitDeposit = async () => {
  if (!form.value.memberId) {
    displayNotification('Pilih member terlebih dahulu', 'error');
    return;
  }
  if (form.value.nominal <= 0) {
    displayNotification('Nominal harus lebih besar dari 0', 'error');
    return;
  }

  isSubmitting.value = true;
  try {
    await depositService.manualDeposit({
      memberId: Number(form.value.memberId),
      nominal: Number(form.value.nominal),
      ket: form.value.ket,
    });
    emit('success');
  } catch (error: any) {
    displayNotification('Gagal memproses deposit: ' + (error.response?.data?.message || error.message), 'error');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchMembers();
});
</script>

<template>
  <Modal :show="show" title="Tambah Saldo Member" @close="$emit('close')" max-width="md">
    <div class="space-y-4">
      
      <!-- Select Member -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Member <span class="text-red-500">*</span></label>
        <select
          v-model="form.memberId"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f2155]"
          :disabled="isLoadingMembers || isSubmitting"
        >
          <option value="" disabled>Pilih Member</option>
          <option v-for="member in members" :key="member.id" :value="member.id">
            {{ member.fullname }} ({{ member.kode }})
          </option>
        </select>
        <p v-if="isLoadingMembers" class="text-xs text-gray-500 mt-1">Memuat daftar member...</p>
      </div>

      <!-- Detail Member Info -->
      <div v-if="selectedMember" class="bg-gray-50 p-3 rounded-md border border-gray-100 flex justify-between items-center">
        <div>
          <p class="text-xs text-gray-500">Saldo Saat Ini</p>
          <p class="text-lg font-bold text-gray-900">{{ formatCurrency(selectedMember.saldo) }}</p>
        </div>
      </div>

      <!-- Nominal -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nominal Deposit (Rp) <span class="text-red-500">*</span></label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500 sm:text-sm">Rp</span>
          </div>
          <input
            type="text"
            v-model="displayNominal"
            class="w-full pl-9 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f2155]"
            placeholder="0"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <!-- Saldo Akhir Preview -->
      <div v-if="selectedMember && form.nominal > 0" class="bg-emerald-50 p-3 rounded-md border border-emerald-100 flex justify-between items-center">
        <div>
          <p class="text-xs text-emerald-600">Estimasi Saldo Baru</p>
          <p class="text-lg font-bold text-emerald-700">{{ formatCurrency((selectedMember.saldo || 0) + Number(form.nominal)) }}</p>
        </div>
      </div>

      <!-- Keterangan -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
        <textarea
          v-model="form.ket"
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f2155]"
          placeholder="Catatan penambahan saldo..."
          :disabled="isSubmitting"
        ></textarea>
      </div>

    </div>

    <!-- Notification inside Modal -->
    <div v-if="showNotification" :class="['mt-4 p-3 rounded-md text-sm', notificationType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
      {{ notificationMessage }}
    </div>

    <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
      <SecondaryButton @click="$emit('close')" :disabled="isSubmitting">Batal</SecondaryButton>
      <PrimaryButton @click="submitDeposit" :disabled="isSubmitting || !form.memberId || form.nominal <= 0" class="bg-[#0f2155] hover:bg-[#0f2155]/90">
        <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isSubmitting ? 'Menyimpan...' : 'Simpan Saldo' }}
      </PrimaryButton>
    </div>
  </Modal>
</template>
