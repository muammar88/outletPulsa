<script setup lang="ts">
import ModalForm from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { transaksiPulsaService } from '@/service/administrator/transaksi_pulsa';
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  show: boolean;
  transactionId: number | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const isLoading = ref(false);
const isUpdating = ref(false);
const transactionData = ref<any>(null);

const newStatus = ref('');
const statusOptions = ['proses', 'sukses', 'gagal'];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const loadData = async () => {
  if (props.transactionId) {
    isLoading.value = true;
    try {
      const response = await transaksiPulsaService.getById(props.transactionId);
      transactionData.value = response.data.data;
      newStatus.value = transactionData.value?.status || '';
    } catch (error) {
      console.error('Gagal mengambil detail transaksi:', error);
      displayNotification('Gagal mengambil data detail transaksi', 'error');
    } finally {
      isLoading.value = false;
    }
  } else {
    transactionData.value = null;
    newStatus.value = '';
  }
};

watch(
  () => props.show,
  async (isShow) => {
    if (isShow) {
      await loadData();
    } else {
      transactionData.value = null;
      newStatus.value = '';
    }
  },
);

const handleUpdateStatus = async () => {
  if (!transactionData.value || newStatus.value === transactionData.value.status) return;

  isUpdating.value = true;
  try {
    await transaksiPulsaService.updateStatus(transactionData.value.id, newStatus.value);
    displayNotification('Status transaksi berhasil diperbarui', 'success');
    await loadData(); // Reload data
  } catch (error: any) {
    console.error('Update status error:', error);
    const errMessage = error.response?.data?.message || 'Gagal memperbarui status transaksi';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  } finally {
    isUpdating.value = false;
  }
};

const badgeColor = computed(() => {
  switch (transactionData.value?.status) {
    case 'sukses':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'gagal':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
});
</script>

<template>
  <ModalForm
    :form-status="show"
    label="Detail Transaksi Pulsa"
    submit-label=""
    width="w-full max-w-3xl"
    @close="emit('close')"
    @cancel="emit('close')"
  >
    <div v-if="isLoading" class="flex justify-center items-center py-10">
      <div class="text-gray-500">Memuat detail transaksi...</div>
    </div>

    <div v-else-if="transactionData" class="space-y-6 px-1">
      <!-- Status Banner -->
      <div 
        class="relative overflow-hidden rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all shadow-sm"
        :class="transactionData.status === 'sukses' ? 'bg-gradient-to-br from-emerald-50 to-teal-100/50 border border-emerald-100' : transactionData.status === 'gagal' ? 'bg-gradient-to-br from-rose-50 to-red-100/50 border border-rose-100' : 'bg-gradient-to-br from-amber-50 to-yellow-100/50 border border-amber-100'"
      >
        <span 
          :class="['px-4 py-1.5 text-xs font-black tracking-widest rounded-full uppercase mb-3 shadow-sm border', badgeColor]"
        >
          {{ transactionData.status }}
        </span>
        <h2 class="text-4xl font-black text-gray-800 tracking-tight mb-2">{{ transactionData.nomorTujuan || '-' }}</h2>
        <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">{{ transactionData.kode || '-' }}</p>
      </div>

      <!-- Detail Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- Member Card -->
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.1)] transition-shadow duration-300">
          <div class="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
            <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-800">Informasi Member</h3>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Detail Pelanggan</p>
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500 font-semibold">Nama Lengkap</span>
              <span class="text-sm font-bold text-gray-800">{{ transactionData.riwayatTransaksi?.member?.fullname || '-' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500 font-semibold">No. WhatsApp</span>
              <span class="text-sm font-bold text-gray-800">{{ transactionData.riwayatTransaksi?.member?.whatsappnumber || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Produk Card -->
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.1)] transition-shadow duration-300">
          <div class="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
            <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-800">Detail Produk</h3>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Layanan Dibeli</p>
            </div>
          </div>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500 font-semibold">Produk</span>
              <span class="text-sm font-bold text-gray-800">{{ transactionData.produk?.name || '-' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500 font-semibold">Operator</span>
              <span class="text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700 font-bold">{{ transactionData.produk?.operator?.name || '-' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500 font-semibold">Server</span>
              <span class="text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700 font-bold">{{ transactionData.server?.name || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Card -->
      <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.1)] transition-shadow duration-300">
         <div class="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
            <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4h16V6a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-800">Rincian Finansial</h3>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Harga & Keuntungan</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
              <span class="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Harga Modal</span>
              <span class="text-lg font-black text-gray-800">{{ formatRupiah(transactionData.purchase_price) }}</span>
            </div>
            <div class="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
              <span class="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Harga Jual</span>
              <span class="text-lg font-black text-gray-800">{{ formatRupiah(transactionData.selling_price) }}</span>
            </div>
            <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-sm">
              <div class="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <span class="text-[10px] font-bold text-emerald-600 mb-1.5 uppercase tracking-widest">Keuntungan</span>
              <span class="text-xl font-black text-emerald-600">+{{ formatRupiah(transactionData.laba) }}</span>
            </div>
          </div>
      </div>

      <!-- Keterangan & Timestamp -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <h3 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            Keterangan Tambahan
          </h3>
          <p class="text-sm text-gray-700 font-semibold leading-relaxed">
            {{ transactionData.ket || 'Tidak ada keterangan terkait transaksi ini.' }}
          </p>
        </div>
        
        <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-center">
          <h3 class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            Waktu Transaksi
          </h3>
          <p class="text-sm text-gray-800 font-bold">
            {{ formatDate(transactionData.createdAt) }}
          </p>
        </div>
      </div>

      <!-- Update Status -->
      <div class="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-center sm:text-left">
           <h3 class="text-sm font-bold text-gray-800">Update Status Manual</h3>
           <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Ubah status transaksi</p>
        </div>
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <select v-model="newStatus" class="flex-1 sm:w-40 border-gray-300 rounded-xl shadow-sm text-sm font-bold focus:ring-blue-500 focus:border-blue-500 py-2.5 text-gray-700">
            <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ opt.toUpperCase() }}</option>
          </select>
          <button 
            @click="handleUpdateStatus"
            :disabled="isUpdating || newStatus === transactionData.status"
            class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none transition-all duration-200"
          >
            {{ isUpdating ? 'Menyimpan...' : 'Perbarui' }}
          </button>
        </div>
      </div>
    </div>
  </ModalForm>

  <!-- Notification Modal -->
  <Notification
    :show-notification="showNotification"
    :notification-type="notificationType"
    :notification-message-html="notificationMessage"
    @close="hideNotification"
  />
</template>
