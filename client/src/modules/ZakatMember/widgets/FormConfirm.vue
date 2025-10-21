<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import { getZakatBanks, confirmZakatPayment } from '@/service/zakat_member';

const props = defineProps<{
  isModalOpen: boolean;
  selectedZakat: any;
}>();

const emit = defineEmits(['close', 'status']);

const isLoading = ref(false);
const isBankLoading = ref(false);

interface Bank {
  bankName: string;
  accountName: string;
  accountNumber: string;
}
const zakatBanks = ref<Bank[]>([]);

const fetchZakatBanks = async () => {
  isBankLoading.value = true;
  try {
    const response = await getZakatBanks();
    if (response && response.data) {
      zakatBanks.value = response.data;
    }
  } catch (error: any) {
    emit('status', { error: true, error_msg: 'Gagal memuat daftar bank.' });
  } finally {
    isBankLoading.value = false;
  }
};

watch(
  () => props.isModalOpen,
  (newValue) => {
    if (newValue) {
      fetchZakatBanks();
    }
  },
);

const handleConfirmPayment = async () => {
  isLoading.value = true;
  try {
    await confirmZakatPayment(props.selectedZakat.invoice);

    emit('status', { error: false, error_msg: 'Konfirmasi pembayaran berhasil dikirim.' });
    emit('close');
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Terjadi kesalahan saat mengirim konfirmasi.';
    emit('status', { error: true, error_msg: errorMsg });
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  if (isLoading.value) return;
  emit('close');
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">
              {{
                selectedZakat?.status === 'success'
                  ? 'Detail Pembayaran Zakat'
                  : 'Konfirmasi Pembayaran Zakat'
              }}
            </h2>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
              :disabled="isLoading"
            >
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>

          <!-- Detail Pembayaran -->
          <div class="space-y-6">
            <div class="bg-gray-50 p-4 rounded-lg text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Tanggal Transaksi:</span>
                <span class="font-medium text-gray-800">{{
                  selectedZakat?.tanggal_pembayaran
                }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span class="text-gray-600">Invoice ZAKAT:</span>
                <span class="font-bold text-green-700">{{ selectedZakat?.invoice }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span class="text-gray-600">Nominal:</span>
                <span class="font-bold text-gray-800">{{
                  formatRupiah(selectedZakat?.nominal || 0)
                }}</span>
              </div>
              <div class="flex justify-between mt-1">
                <span class="text-gray-600">Status Pembayaran:</span>
                <span
                  class="font-medium px-2 py-0.5 rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-600': selectedZakat?.status === 'process',
                    'bg-green-100 text-green-600': selectedZakat?.status === 'success',
                    'bg-red-100 text-red-600': selectedZakat?.status === 'failed',
                  }"
                >
                  {{ selectedZakat?.status }}
                </span>
              </div>
            </div>

            <!-- Tampilan untuk status SUCCESS -->
            <div v-if="selectedZakat?.status === 'success'" class="text-center space-y-4">
              <div class="flex justify-center">
                <div class="rounded-full bg-green-100 p-4">
                  <font-awesome-icon
                    icon="fa-solid fa-check-circle"
                    class="text-green-600 text-5xl"
                  />
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h3>
                <p class="text-gray-600">
                  Alhamdulillah, pembayaran zakat Anda sebesar
                  <strong class="text-green-700">{{
                    formatRupiah(selectedZakat?.nominal || 0)
                  }}</strong>
                  telah berhasil diverifikasi.
                </p>
              </div>
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <p class="text-green-800 font-medium">
                  Jazakallahu khairan atas kontribusi Anda. Semoga menjadi amal jariyah dan mendapat
                  balasan yang berlipat ganda dari Allah SWT.
                </p>
              </div>
            </div>

            <!-- Tampilan untuk konfirmasi sudah dikirim (status PROCESS & konfirmasi sudah_dikirim) -->
            <div
              v-else-if="selectedZakat?.konfirmasi_pembayaran === 'sudah_dikirim'"
              class="text-center space-y-4"
            >
              <div class="flex justify-center">
                <div class="rounded-full bg-blue-100 p-4">
                  <font-awesome-icon
                    icon="fa-solid fa-paper-plane"
                    class="text-blue-600 text-5xl"
                  />
                </div>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Konfirmasi Terkirim</h3>
                <p class="text-gray-600">
                  Anda sudah mengirimkan konfirmasi pembayaran untuk zakat sebesar
                  <strong class="text-blue-700">{{
                    formatRupiah(selectedZakat?.nominal || 0)
                  }}</strong>
                </p>
              </div>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex">
                  <font-awesome-icon icon="fa-solid fa-spinner" class="text-blue-600 mt-0.5 mr-2" />
                  <div class="text-left">
                    <p class="text-blue-800 font-medium mb-1">Menunggu Verifikasi Admin</p>
                    <p class="text-blue-700 text-sm">
                      Konfirmasi pembayaran Anda sedang dalam proses verifikasi oleh admin. Mohon
                      tunggu beberapa saat, status pembayaran akan diperbarui setelah diverifikasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tampilan untuk status belum konfirmasi -->
            <template v-else>
              <div class="text-center">
                <p class="text-gray-700">
                  Silakan lakukan pembayaran Zakat anda sebesar
                  <strong class="text-lg">{{ formatRupiah(selectedZakat?.nominal || 0) }}</strong>
                  ke nomor rekening di bawah ini.
                </p>
              </div>

              <!-- Tabel Bank -->
              <div class="border rounded-lg overflow-hidden">
                <table class="w-full text-sm">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="p-2 text-left font-medium text-gray-600">Bank</th>
                      <th class="p-2 text-left font-medium text-gray-600">Atas Nama</th>
                      <th class="p-2 text-left font-medium text-gray-600">Nomor Rekening</th>
                    </tr>
                  </thead>
                  <tbody v-if="isBankLoading">
                    <tr>
                      <td colspan="3" class="p-4 text-center">
                        <LoadingSpinner label="Memuat data bank..." />
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else-if="zakatBanks.length > 0">
                    <tr v-for="bank in zakatBanks" :key="bank.accountNumber" class="border-t">
                      <td class="p-2 font-medium">{{ bank.bankName }}</td>
                      <td class="p-2">{{ bank.accountName }}</td>
                      <td class="p-2 font-mono">{{ bank.accountNumber }}</td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr>
                      <td colspan="3" class="p-4 text-center text-gray-500">
                        Tidak ada data bank yang tersedia.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Informasi -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div class="flex">
                  <font-awesome-icon
                    icon="fa-solid fa-info-circle"
                    class="text-blue-500 mt-0.5 mr-2"
                  />
                  <div class="text-xs text-blue-800">
                    <p class="font-semibold mb-1">Informasi Penting:</p>
                    <ul class="list-disc list-inside space-y-1">
                      <li>Pastikan nominal yang ditransfer sesuai dengan yang tertera</li>
                      <li>Setelah melakukan transfer, klik tombol konfirmasi di bawah</li>
                      <li>Konfirmasi akan dikirim ke admin untuk diverifikasi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </template>

            <!-- Tombol Aksi -->
            <div class="pt-2">
              <div
                v-if="
                  selectedZakat?.status === 'success' ||
                  selectedZakat?.konfirmasi_pembayaran === 'sudah_dikirim'
                "
                class="flex justify-end"
              >
                <BaseButton
                  @click="closeModal"
                  variant="secondary"
                  :disabled="isLoading"
                  class="w-full sm:w-auto"
                >
                  Tutup
                </BaseButton>
              </div>
              <div v-else class="flex justify-between gap-3">
                <BaseButton @click="closeModal" variant="secondary" :disabled="isLoading">
                  Batal
                </BaseButton>
                <BaseButton @click="handleConfirmPayment" variant="primary" :loading="isLoading">
                  {{ isLoading ? 'Mengirim...' : 'Konfirmasi Pembayaran' }}
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
