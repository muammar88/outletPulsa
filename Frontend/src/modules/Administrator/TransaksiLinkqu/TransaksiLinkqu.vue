<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePagination } from '@/composables/usePaginations'
import BaseTable from '@/components/Table/BaseTable.vue'
import BaseButton from '@/components/Button/BaseButton.vue'
import type { TableColumn } from '@/components/Table/BaseTable.vue'
import { transaksiLinkquService } from './services/transaksiLinkquService'
import TransaksiLinkquDetailModal from './components/TransaksiLinkquDetailModal.vue'

const columns: TableColumn[] = [
  { key: 'created_at', label: 'Tanggal' },
  { key: 'customer_name', label: 'Nama Pelaku' },
  { key: 'reference_type', label: 'Tipe Transaksi' },
  { key: 'payment_method', label: 'Metode' },
  { key: 'bank_name', label: 'Bank' },
  { key: 'total_amount', label: 'Total (Rp)' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Aksi', headerClass: 'text-center w-[10%]', cellClass: 'text-center' },
]

const data = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')

const { currentPage, totalPages, pages, totalRow, pageNow, perPage } = usePagination(
  () => loadData(),
  { perPage: 30, totalRow: 0 },
)

const showDetailModal = ref(false)
const selectedData = ref<any>(null)

const loadData = async (keyword?: string | Event) => {
  if (typeof keyword === 'string') {
    searchQuery.value = keyword
    currentPage.value = 1
  }

  loading.value = true
  try {
    const res = await transaksiLinkquService.getAll({
      search: searchQuery.value,
      limit: perPage.value,
      page: currentPage.value,
    })
    data.value = res.data.data.data || []
    const meta = res.data.data.meta || { page: 1, total: 0, last_page: 1 }
    totalRow.value = meta.total
  } catch (error) {
    console.error('Failed to load transaksi linkqu', error)
  } finally {
    loading.value = false
  }
}

const paginationProps = ref({
  currentPage,
  totalPages,
  pages,
  totalRow,
  perPage,
})

const openDetailModal = (row: any) => {
  selectedData.value = row
  showDetailModal.value = true
}

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

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="w-full h-full flex flex-col p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Riwayat Transaksi LinkQu</h1>
        <p class="text-sm text-gray-500 mt-1">Daftar riwayat pembayaran gateway LinkQu.</p>
      </div>
    </div>

    <!-- BaseTable Component -->
    <BaseTable
      :columns="columns"
      :data="data"
      :loading="loading"
      :show-actions="false"
      :show-add="false"
      :with-pagination="true"
      :pagination="paginationProps"
      @search="loadData"
      @page-change="pageNow"
      search-placeholder="Cari transaksi..."
    >
      <template #cell-created_at="{ value }">
        <span class="text-gray-900">{{ formatDate(value) }}</span>
      </template>

      <template #cell-reference_type="{ value }">
        <span class="text-gray-900 text-sm">{{ value?.replace(/_/g, ' ') || '-' }}</span>
      </template>

      <template #cell-bank_name="{ row }">
        <span class="text-gray-900 font-medium">{{ row.bank_name || row.bank_code || '-' }}</span>
      </template>

      <template #cell-total_amount="{ value }">
        <span class="font-semibold text-gray-900">{{ formatRupiah(value) }}</span>
      </template>
      
      <template #cell-status="{ value }">
        <span
          :class="[
            'px-2.5 py-0.5 rounded-full text-xs font-medium',
            getStatusColor(value),
          ]"
        >
          {{ getStatusLabel(value) }}
        </span>
      </template>

      <!-- Kolom Aksi -->
      <template #cell-action="{ row }">
        <div class="flex justify-center gap-2">
          <BaseButton @click="openDetailModal(row)" title="Lihat Detail" variant="secondary" size="sm" class="!p-2">
            <template #icon-left>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </template>
          </BaseButton>
        </div>
      </template>
    </BaseTable>

    <!-- Modals -->
    <TransaksiLinkquDetailModal
      :show="showDetailModal"
      :transaction="selectedData"
      @close="
        showDetailModal = false,
        selectedData = null
      "
    />
  </div>
</template>
