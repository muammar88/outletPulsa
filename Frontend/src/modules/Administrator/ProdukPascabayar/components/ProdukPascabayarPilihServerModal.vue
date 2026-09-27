<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import { PascabayarProviderService } from '../services/PascabayarProviderService';
import type { ProviderPascabayar } from '../services/PascabayarProviderService';

const props = defineProps({
  show: Boolean,
  produk: { type: Object as () => any, default: null },
});

const emit = defineEmits(['close', 'refresh', 'notify']);

const isLoading = ref(false);
const isSubmitting = ref(false);
const isSyncing = ref(false);
const isSearching = ref(false);

const kandidat = ref<any[]>([]);
const asumsi = ref<string[]>([]);

const providerBaru = ref<ProviderPascabayar>('DIGIFLAZZ');
const searchKatalog = ref('');
const hasilKatalog = ref<any[]>([]);
const kodeIak = ref('');

const formatRp = (val: number | null | undefined) => {
  if (val === null || val === undefined) return 'Belum tersedia';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};

const load = async () => {
  if (!props.produk) return;
  isLoading.value = true;
  try {
    const res = await PascabayarProviderService.getPerbandingan((props.produk as any).id);
    kandidat.value = res.data.data.kandidat || [];
    asumsi.value = res.data.data.asumsi || [];
  } catch (err: any) {
    emit('notify', err.response?.data?.message || 'Gagal memuat perbandingan provider', 'error');
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.show,
  (val) => {
    if (val && props.produk) {
      hasilKatalog.value = [];
      kodeIak.value = '';
      searchKatalog.value = '';
      load();
    }
  },
);

const runAction = async (fn: () => Promise<any>, successMsg: string) => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await fn();
    emit('notify', successMsg, 'success');
    await load();
    emit('refresh');
  } catch (err: any) {
    emit('notify', err.response?.data?.message || 'Aksi gagal', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const jadikanAktif = (row: any) =>
  runAction(
    () => PascabayarProviderService.select((props.produk as any).id, row.provider),
    `Provider ${row.provider} dijadikan aktif. Berlaku untuk inquiry baru.`,
  );

const lepas = (row: any) =>
  runAction(
    () => PascabayarProviderService.disconnect((props.produk as any).id, row.provider),
    `Pemetaan ${row.provider} dilepas`,
  );

const cariKatalog = async () => {
  isSearching.value = true;
  try {
    const res = await PascabayarProviderService.listKatalogDigiflazz(searchKatalog.value, 1, 8);
    hasilKatalog.value = res.data.data.list || [];
  } catch (err: any) {
    emit('notify', err.response?.data?.message || 'Gagal mencari katalog', 'error');
  } finally {
    isSearching.value = false;
  }
};

const hubungkanDigiflazz = (item: any) =>
  runAction(
    () =>
      PascabayarProviderService.connect((props.produk as any).id, {
        provider: 'DIGIFLAZZ',
        providerSku: item.buyerSkuCode,
        digiflazzProductId: item.id,
      }),
    `SKU ${item.buyerSkuCode} dihubungkan`,
  );

const hubungkanIak = () => {
  if (!kodeIak.value) {
    emit('notify', 'Kode SKU IAK wajib diisi', 'error');
    return;
  }
  runAction(
    () => PascabayarProviderService.connect((props.produk as any).id, { provider: 'IAK', providerSku: kodeIak.value }),
    `SKU IAK ${kodeIak.value} dihubungkan`,
  );
};

const syncKatalog = async () => {
  isSyncing.value = true;
  try {
    const res = await PascabayarProviderService.syncKatalogDigiflazz();
    const d = res.data.data;
    emit('notify', `Sinkronisasi selesai. Baru: ${d.inserted}, Diperbarui: ${d.updated}`, 'success');
  } catch (err: any) {
    emit('notify', err.response?.data?.message || 'Gagal sinkronisasi katalog', 'error');
  } finally {
    isSyncing.value = false;
  }
};
</script>

<template>
  <BaseFormModal
    :formStatus="show"
    label="Pilih Provider Pascabayar"
    width="sm:w-full sm:max-w-5xl"
    submitLabel=""
    @close="emit('close')"
    @cancel="emit('close')"
  >
    <div class="space-y-5">
      <div v-if="produk" class="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
        Produk internal:
        <span class="font-semibold">{{ (produk as any).kode }} - {{ (produk as any).name }}</span>
        <span class="block text-xs text-slate-500 mt-1">
          Provider dipilih di sini. Pengguna mobile tidak memilih provider. Perubahan berlaku untuk inquiry baru;
          inquiry yang sudah berjalan tetap memakai provider asal.
        </span>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 class="font-semibold text-slate-800">Perbandingan kandidat provider</h3>
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          :disabled="isSyncing"
          @click="syncKatalog"
        >
          {{ isSyncing ? 'Menyinkronkan...' : 'Sinkron Katalog Digiflazz' }}
        </button>
      </div>

      <div v-if="isLoading" class="text-center py-6 text-slate-500">Memuat data provider...</div>

      <div v-else-if="kandidat.length === 0" class="text-center py-6 text-slate-500 border border-dashed rounded-xl">
        Belum ada SKU provider yang terhubung ke produk ini.
      </div>

      <div v-else class="overflow-x-auto border rounded-xl">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr>
              <th class="px-3 py-2 text-left">Provider</th>
              <th class="px-3 py-2 text-left">SKU</th>
              <th class="px-3 py-2 text-left">Nama / Kategori</th>
              <th class="px-3 py-2 text-right">Biaya perolehan</th>
              <th class="px-3 py-2 text-right">Admin provider</th>
              <th class="px-3 py-2 text-right">Komisi</th>
              <th class="px-3 py-2 text-right">Fee aplikasi</th>
              <th class="px-3 py-2 text-right">Estimasi harga jual</th>
              <th class="px-3 py-2 text-right">Estimasi laba</th>
              <th class="px-3 py-2 text-center">Status</th>
              <th class="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in kandidat" :key="row.mappingId" class="border-t">
              <td class="px-3 py-2 font-semibold">{{ row.provider }}</td>
              <td class="px-3 py-2">{{ row.providerSku }}</td>
              <td class="px-3 py-2">
                {{ row.nama || '-' }}
                <span class="block text-xs text-slate-500">{{ row.kategori || '-' }}</span>
              </td>
              <td class="px-3 py-2 text-right">{{ formatRp(row.biayaPerolehan) }}</td>
              <td class="px-3 py-2 text-right">{{ formatRp(row.adminProvider) }}</td>
              <td class="px-3 py-2 text-right">{{ formatRp(row.komisiProvider) }}</td>
              <td class="px-3 py-2 text-right">{{ formatRp(row.biayaAdminAplikasi) }}</td>
              <td class="px-3 py-2 text-right">{{ formatRp(row.hargaJualEstimasi) }}</td>
              <td class="px-3 py-2 text-right">{{ formatRp(row.labaEstimasi) }}</td>
              <td class="px-3 py-2 text-center">
                <span
                  class="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase"
                  :class="row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                >
                  {{ row.isActive ? 'Aktif' : 'Kandidat' }}
                </span>
              </td>
              <td class="px-3 py-2 text-center space-x-1">
                <button
                  v-if="!row.isActive"
                  type="button"
                  class="px-2 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  :disabled="isSubmitting"
                  @click="jadikanAktif(row)"
                >
                  Jadikan Aktif
                </button>
                <button
                  v-if="!row.isActive"
                  type="button"
                  class="px-2 py-1 text-xs font-semibold rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  :disabled="isSubmitting"
                  @click="lepas(row)"
                >
                  Lepas
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="asumsi.length" class="rounded-xl bg-amber-50 border border-amber-200 p-3">
        <p class="text-xs font-semibold text-amber-800 mb-1">Asumsi perhitungan (estimasi, bukan keuntungan final)</p>
        <ul class="list-disc list-inside text-xs text-amber-800 space-y-0.5">
          <li v-for="(a, i) in asumsi" :key="i">{{ a }}</li>
        </ul>
      </div>

      <div class="border-t pt-4 space-y-3">
        <h3 class="font-semibold text-slate-800">Hubungkan SKU provider</h3>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg border"
            :class="providerBaru === 'DIGIFLAZZ' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300'"
            @click="providerBaru = 'DIGIFLAZZ'"
          >
            Digiflazz
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg border"
            :class="providerBaru === 'IAK' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300'"
            @click="providerBaru = 'IAK'"
          >
            IAK
          </button>
        </div>

        <div v-if="providerBaru === 'DIGIFLAZZ'" class="space-y-2">
          <div class="flex gap-2">
            <input
              v-model="searchKatalog"
              type="text"
              placeholder="Cari SKU / nama produk pascabayar Digiflazz"
              class="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="button"
              class="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white disabled:opacity-50"
              :disabled="isSearching"
              @click="cariKatalog"
            >
              {{ isSearching ? 'Mencari...' : 'Cari' }}
            </button>
          </div>
          <div v-if="hasilKatalog.length" class="max-h-56 overflow-y-auto border rounded-xl divide-y">
            <div v-for="item in hasilKatalog" :key="item.id" class="flex items-center justify-between px-3 py-2 text-sm">
              <div>
                <span class="font-semibold">{{ item.buyerSkuCode }}</span>
                <span class="block text-xs text-slate-500">{{ item.name }} - {{ item.category || '-' }}</span>
              </div>
              <button
                type="button"
                class="px-2 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                :disabled="isSubmitting"
                @click="hubungkanDigiflazz(item)"
              >
                Hubungkan
              </button>
            </div>
          </div>
        </div>

        <div v-else class="flex gap-2">
          <input
            v-model="kodeIak"
            type="text"
            placeholder="Kode SKU IAK pascabayar"
            class="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="button"
            class="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            :disabled="isSubmitting"
            @click="hubungkanIak"
          >
            Hubungkan
          </button>
        </div>
      </div>
    </div>
  </BaseFormModal>
</template>