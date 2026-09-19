<script setup lang="ts">
import { computed } from 'vue'
import BaseFormModal from '@/components/Modal/Form.vue'

// Since qrcode-vue is used, make sure it's installed or we can just comment it out if it fails
// import QrcodeVue from 'qrcode.vue'

const props = defineProps<{
  show: boolean
  transaction: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const parsedMetadata = computed(() => {
  if (!props.transaction?.metadata) return null
  try {
    return JSON.parse(props.transaction.metadata)
  } catch (e) {
    return null
  }
})

const formatRupiah = (value: number | string) => {
  const amount = Number(value)
  if (isNaN(amount)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS':
      return 'bg-green-100 text-green-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'FAILED':
      return 'bg-red-100 text-red-800'
    case 'EXPIRED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS':
      return 'Berhasil'
    case 'PENDING':
      return 'Proses'
    case 'FAILED':
      return 'Gagal'
    case 'EXPIRED':
      return 'Kedaluwarsa'
    default:
      return status || 'Unknown'
  }
}
</script>

<template>
  <BaseFormModal
    :is-open="show"
    title="Detail Transaksi LinkQu"
    :is-edit="false"
    size="5xl"
    :show-footer="false"
    @close="emit('close')"
  >
    <div v-if="transaction" class="p-2 space-y-6">
      
      <!-- Top Banner -->
      <div class="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center p-2">
            <!-- Using a generic icon for LinkQu for now -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-600"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900 leading-tight">INV-{{ transaction.id }}</h2>
            <p class="text-sm text-gray-500 font-mono">{{ transaction.uuid }}</p>
          </div>
        </div>
        <div class="text-right">
          <span
            :class="[
              'px-3.5 py-1.5 rounded-full text-sm font-bold shadow-sm',
              getStatusColor(transaction.status),
            ]"
          >
            {{ getStatusLabel(transaction.status) }}
          </span>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Left: Transaction Info -->
        <div class="space-y-4">
          <h3 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-500"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Informasi Transaksi
          </h3>
          
          <div class="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tanggal Dibuat</p>
                <p class="text-sm font-medium text-gray-900">{{ formatDate(transaction.created_at) }}</p>
              </div>
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Kadaluwarsa</p>
                <p class="text-sm font-medium text-gray-900">{{ transaction.expired_at ? formatDate(transaction.expired_at) : '-' }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 border-t border-gray-200/60 pt-4">
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Metode</p>
                <p class="text-sm font-medium text-gray-900">{{ transaction.payment_method }}</p>
              </div>
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Bank / Channel</p>
                <p class="text-sm font-bold text-primary-700">{{ transaction.bank_name || transaction.bank_code || '-' }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 border-t border-gray-200/60 pt-4">
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tipe Transaksi</p>
                <p class="text-sm font-medium text-gray-900">{{ transaction.reference_type?.replace(/_/g, ' ') }}</p>
              </div>
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nama Pelaku</p>
                <p class="text-sm font-bold text-primary-700">{{ transaction.customer_name || '-' }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-4 border-t border-gray-200/60 pt-4">
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Partner Reff</p>
                <p class="text-sm font-medium text-gray-900 font-mono">{{ transaction.partner_reff }}</p>
              </div>
            </div>

            <div v-if="parsedMetadata?.items?.length" class="grid grid-cols-1 gap-4 border-t border-gray-200/60 pt-4">
              <div>
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Rincian Tagihan</p>
                <div class="space-y-2">
                  <div v-for="(item, index) in parsedMetadata.items" :key="index" class="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                    <div class="flex flex-col">
                      <span class="text-xs font-bold text-gray-800">{{ item.title }}</span>
                      <span class="text-[10px] text-gray-500 font-medium">{{ item.type }}</span>
                    </div>
                    <span class="text-xs font-bold text-primary-700">{{ formatRupiah(item.nominal) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Payment & Summary -->
        <div class="space-y-4">
          <h3 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-500"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Pembayaran
          </h3>
          
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            
            <!-- Dynamic Payment Info -->
            <div class="p-6 grow flex flex-col items-center justify-center bg-slate-50/50">
              
              <div v-if="transaction.payment_method === 'VA' || transaction.virtual_account" class="text-center w-full">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Nomor Virtual Account</p>
                <div class="bg-primary-50 border border-primary-200 text-primary-700 py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 w-full shadow-inner">
                  <span class="text-2xl font-bold tracking-[0.15em] font-mono">{{ transaction.virtual_account || '-' }}</span>
                </div>
              </div>

              <div v-if="transaction.payment_method === 'QRIS' && parsedMetadata" class="text-center w-full flex flex-col items-center">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">QRIS Text</p>
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 inline-block">
                  <p class="break-words text-sm">{{ parsedMetadata.qris_text || parsedMetadata.qr_string || '-' }}</p>
                </div>
              </div>
              
              <div v-if="!transaction.virtual_account && transaction.payment_method !== 'QRIS'" class="text-center text-gray-400 italic text-sm">
                Informasi pembayaran tidak tersedia
              </div>
            </div>

            <!-- Total Breakdown -->
            <div class="bg-gray-900 p-5 text-white">
              <div class="space-y-2.5 text-sm text-gray-300">
                <div class="flex justify-between">
                  <span>Nominal Tagihan</span>
                  <span class="font-medium text-white">{{ formatRupiah(transaction.amount) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Biaya Admin</span>
                  <span class="font-medium text-white">{{ formatRupiah(transaction.fee_admin) }}</span>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                <span class="text-sm font-bold text-gray-200 uppercase tracking-wider">Total Pembayaran</span>
                <span class="text-2xl font-bold text-emerald-400">{{ formatRupiah(transaction.total_amount) }}</span>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
      
      <!-- JSON Metadata Viewer -->
      <div v-if="parsedMetadata" class="mt-4 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-sm">
        <details class="group">
          <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800 transition-colors">
            <span class="flex items-center gap-2 text-sm font-bold text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Raw Data (Log / Metadata)
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 transition-transform group-open:rotate-180"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          <div class="p-4 border-t border-slate-700 bg-slate-950 overflow-x-auto max-h-80 overflow-y-auto">
            <pre class="text-[11px] text-emerald-400 font-mono leading-relaxed">{{ JSON.stringify(parsedMetadata, null, 2) }}</pre>
          </div>
        </details>
      </div>

    </div>
  </BaseFormModal>
</template>
