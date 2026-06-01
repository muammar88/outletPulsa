<script setup lang="ts">
import BaseFormModal from '@/components/Modal/Form.vue';
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
      return 'bg-green-100 text-green-800';
    case 'gagal':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
});
</script>

<template>
  <BaseFormModal
    :show="show"
    title="Detail Transaksi Pulsa"
    :loading="isLoading"
    :submit-label="''"
    :showSubmitButton="false"
    :cancel-label="'Tutup'"
    @close="emit('close')"
    @cancel="emit('close')"
    :size="`max-w-3xl`"
  >
    <div v-if="isLoading" class="flex justify-center items-center py-10">
      <div class="text-gray-500">Memuat detail transaksi...</div>
    </div>

    <div v-else-if="transactionData" class="space-y-6">
      <!-- Section Info Transaksi -->
      <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label class="block text-xs text-gray-500 uppercase">Nomor Transaksi</label>
          <div class="font-semibold text-gray-800">{{ transactionData.kode || '-' }}</div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 uppercase">Tanggal</label>
          <div class="text-gray-800">{{ formatDate(transactionData.createdAt) }}</div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 uppercase">Status</label>
          <div :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase mt-1', badgeColor]">
            {{ transactionData.status }}
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 uppercase">Nomor Tujuan</label>
          <div class="font-semibold text-blue-600">{{ transactionData.nomorTujuan || '-' }}</div>
        </div>
      </div>

      <!-- Section Info Member & Produk -->
      <div class="grid grid-cols-2 gap-6">
        <div>
          <h3 class="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Informasi Member</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li><strong>Nama:</strong> {{ transactionData.riwayatTransaksi?.member?.fullname || '-' }}</li>
            <li><strong>No. WhatsApp:</strong> {{ transactionData.riwayatTransaksi?.member?.whatsappnumber || '-' }}</li>
          </ul>
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Detail Produk</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li><strong>Produk:</strong> {{ transactionData.produk?.name || '-' }}</li>
            <li><strong>Operator:</strong> {{ transactionData.produk?.operator?.name || '-' }}</li>
            <li><strong>Server:</strong> {{ transactionData.server?.name || '-' }}</li>
          </ul>
        </div>
      </div>

      <!-- Section Finansial -->
      <div>
        <h3 class="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Rincian Finansial</h3>
        <div class="grid grid-cols-3 gap-4 text-sm bg-white border rounded-lg p-4 shadow-sm">
          <div>
            <span class="block text-gray-500">Harga Modal</span>
            <span class="font-bold text-gray-800">{{ formatRupiah(transactionData.purchase_price) }}</span>
          </div>
          <div>
            <span class="block text-gray-500">Harga Jual</span>
            <span class="font-bold text-gray-800">{{ formatRupiah(transactionData.selling_price) }}</span>
          </div>
          <div>
            <span class="block text-gray-500">Keuntungan</span>
            <span class="font-bold text-green-600">{{ formatRupiah(transactionData.laba) }}</span>
          </div>
        </div>
      </div>

      <!-- Keterangan & Digiflazz Info (If any) -->
      <div>
        <h3 class="text-sm font-bold text-gray-700 border-b pb-2 mb-3">Keterangan Tambahan</h3>
        <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
          {{ transactionData.ket || 'Tidak ada keterangan' }}
        </div>
      </div>

      <!-- Update Status Manual Action -->
      <div class="mt-8 border-t pt-4">
        <h3 class="text-sm font-bold text-gray-700 mb-2">Update Status Manual</h3>
        <div class="flex items-center gap-4">
          <select v-model="newStatus" class="border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500">
            <option v-for="opt in statusOptions" :key="opt" :value="opt">{{ opt.toUpperCase() }}</option>
          </select>
          <button 
            @click="handleUpdateStatus"
            :disabled="isUpdating || newStatus === transactionData.status"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ isUpdating ? 'Menyimpan...' : 'Perbarui Status' }}
          </button>
        </div>
      </div>
    </div>
  </BaseFormModal>

  <!-- Notification Modal -->
  <Notification
    :show-notification="showNotification"
    :notification-type="notificationType"
    :notification-message-html="notificationMessage"
    @close="hideNotification"
  />
</template>
