<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import { semuaServerService } from '@/modules/Administrator/SemuaServer/services/semuaServerService';
import { ProdukPascabayarService } from '../services/ProdukPascabayarService';

const props = defineProps({
  show: Boolean,
  produk: Object,
});

const emit = defineEmits(['close', 'refresh', 'notify']);

const isSubmitting = ref(false);
const isLoading = ref(false);
const listServer = ref<any[]>([]);
const selectedServerId = ref<number | null>(null);

const fetchServers = async () => {
  isLoading.value = true;
  try {
    const res = await semuaServerService.getAll('', 100, 1, '');
    listServer.value = res.data.data.list;
  } catch (err: any) {
    emit('notify', 'Gagal memuat daftar server', 'error');
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.show,
  (val) => {
    if (val && props.produk) {
      selectedServerId.value = props.produk.serverId || null;
      if (listServer.value.length === 0) {
        fetchServers();
      }
    } else {
      selectedServerId.value = null;
    }
  }
);

const getConnectedProducts = (server: any) => {
  if (!props.produk) return [];
  if (server.id === 1) return props.produk.iakPrabayarProduks || [];
  if (server.id === 2) return props.produk.tripayPrabayarProduks || [];
  if (server.id === 3) return props.produk.digiflazzProducts || [];
  return [];
};

const handleSelect = async (server: any) => {
  if (isSubmitting.value) return;
  const connected = getConnectedProducts(server);
  if (connected.length === 0) return;

  isSubmitting.value = true;
  try {
    await ProdukPascabayarService.update(props.produk!.id, { serverId: server.id });
    emit('notify', `Server berhasil diubah ke ${server.name}`, 'success');
    emit('refresh');
    emit('close');
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Gagal mengubah server';
    emit('notify', msg, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val || 0);
};
</script>

<template>
  <BaseFormModal
    :formStatus="show"
    label="Pilih Server Aktif"
    width="sm:w-full sm:max-w-3xl"
    submitLabel=""
    @close="emit('close')"
    @cancel="emit('close')"
  >
    <div class="space-y-4">
      <div v-if="isLoading" class="flex justify-center p-6">
        <svg class="animate-spin w-8 h-8 text-[#0f2155]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else-if="listServer.length === 0" class="text-center p-4 text-gray-500">
        Daftar server kosong.
      </div>

      <div v-else class="grid grid-cols-1 gap-4">
        <div 
          v-for="server in listServer" 
          :key="server.id"
          class="border rounded-xl p-4 transition-all"
          :class="[
            selectedServerId === server.id 
              ? 'border-emerald-400 bg-emerald-50/30 ring-1 ring-emerald-400/50 shadow-sm' 
              : 'border-gray-200 hover:border-gray-300 bg-white'
          ]"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-bold text-gray-800">{{ server.name }}</h3>
                <span 
                  class="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider"
                  :class="server.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                >
                  {{ server.status === 'active' ? 'Aktif' : 'Tidak Aktif' }}
                </span>
                <span v-if="selectedServerId === server.id" class="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
                  Saat Ini
                </span>
              </div>
              <div class="mt-3">
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Produk Terkoneksi:</p>
                <ul class="space-y-1.5" v-if="getConnectedProducts(server).length > 0">
                  <li v-for="conn in getConnectedProducts(server)" :key="conn.id" class="flex items-center text-sm font-medium text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded border border-gray-100">
                    <span class="truncate">{{ conn.name }}</span>
                    <span v-if="server.id === 1 && conn.nominal" class="ml-2 px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 font-bold rounded">
                      Nominal: {{ conn.nominal }}
                    </span>
                  </li>
                </ul>
                <div v-else class="text-xs text-rose-600 font-medium italic">
                  Tidak ada produk yang terhubung
                </div>
              </div>
            </div>

            <button
              @click="handleSelect(server)"
              :disabled="getConnectedProducts(server).length === 0 || isSubmitting"
              class="px-4 py-2 text-sm font-bold rounded-lg transition-all focus:outline-none"
              :class="[
                getConnectedProducts(server).length === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : selectedServerId === server.id
                    ? 'bg-emerald-100 text-emerald-700 cursor-default'
                    : 'bg-[#0f2155] text-white hover:bg-opacity-90 shadow-sm'
              ]"
            >
              <span v-if="isSubmitting && selectedServerId !== server.id">Menyimpan...</span>
              <span v-else>{{ selectedServerId === server.id ? 'Terpilih' : 'Pilih' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseFormModal>
</template>
