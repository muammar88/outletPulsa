<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div
      class="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-gray-800 border border-gray-300"
    >
      <div class="text-center border-b border-gray-300 pb-4">
        <h1 class="text-xl font-bold">Kwitansi Pembayaran</h1>
        <p class="text-sm text-gray-500">Terima kasih telah melakukan registrasi</p>
      </div>

      <div v-if="loading" class="text-center py-6">
        <div
          class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-700 mx-auto"
        ></div>
        <p class="text-gray-700 font-semibold mt-2">Memuat...</p>
      </div>

      <div v-else-if="error" class="text-center text-red-500 font-semibold py-6">
        {{ error }}
      </div>

      <div v-else class="py-4 space-y-3">
        <div class="text-center border-b pb-2">
          <p class="text-gray-600">Order ID</p>
          <p class="text-black font-mono font-bold">{{ transaction.order_id }}</p>
        </div>

        <div class="flex justify-between items-center border-b pb-2">
          <p class="text-gray-600">Status:</p>
          <span class="font-bold flex items-center text-black">
            <span :class="statusClass(transaction.status)">{{
              statusIcon(transaction.status)
            }}</span>
            <span class="ml-2">{{ transaction.status?.toUpperCase() }}</span>
          </span>
        </div>

        <div class="flex justify-between border-b pb-2">
          <p class="text-gray-600">Jumlah Pembayaran:</p>
          <p class="text-black font-bold font-mono">{{ formatCurrency(transaction.price) }}</p>
        </div>

        <div class="flex justify-between border-b pb-2">
          <p class="text-gray-600">Nama Rekening:</p>
          <p class="text-black font-bold">{{ transaction.rekening?.toUpperCase() }}</p>
        </div>

        <div v-if="transaction.bank" class="flex justify-between border-b pb-2">
          <p class="text-gray-600">Bank:</p>
          <p class="text-black font-bold">{{ transaction.bank.toUpperCase() }}</p>
        </div>

        <div v-if="transaction.va_number" class="flex justify-between border-b pb-2">
          <p class="text-gray-600">Nomor Rekening:</p>
          <p class="text-black font-mono font-bold">{{ transaction.va_number }}</p>
        </div>

        <div class="flex justify-between border-b pb-2">
          <p class="text-gray-600">Keterangan:</p>
          <p class="text-black font-bold text-right leading-tight">
            Pembayaran Pendaftaran <br />
            Registrasi Aplikasi AMRA
          </p>
        </div>

        <div class="flex justify-between">
          <p class="text-gray-600">Tanggal Transaksi:</p>
          <p class="text-black font-bold">{{ formatDate(transaction.createdAt) }}</p>
        </div>
      </div>

      <div class="text-center text-sm text-gray-500 mt-4 border-t pt-2">
        <p>AMRA SAAS Payment System</p>
        <p>© {{ new Date().getFullYear() }} AMRA. All Rights Reserved.</p>
      </div>
    </div>
  </div>
  <div
    v-if="notification"
    class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md"
  >
    {{ notification }}
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getKwitansi, getNotifikasi } from '../service/notifikasi'

interface Transaction {
  order_id: string
  bank?: string
  va_number?: string
  status: string
  price: number
  rekening: string
  createdAt: string
}

export default defineComponent({
  setup() {
    const transaction = ref<Partial<Transaction>>({})
    const loading = ref(true)
    const error = ref<string | null>(null)
    const notification = ref<string | null>(null)
    const route = useRoute()

    let pollingTransaction: NodeJS.Timeout | null = null
    let pollingStatus: NodeJS.Timeout | null = null

    // Format Harga
    const formatCurrency = (amount?: number) => {
      return amount
        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)
        : 'Rp 0'
    }

    // Format Tanggal
    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Tidak tersedia'
      const date = new Date(dateString)
      return isNaN(date.getTime())
        ? 'Format tanggal tidak valid'
        : date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
    }

    // Status Styling
    const statusClass = (status?: string) => {
      switch (status?.toLowerCase()) {
        case 'success':
          return 'text-green-500 font-bold'
        case 'pending':
          return 'text-yellow-500 font-bold'
        case 'failed':
          return 'text-red-500 font-bold'
        default:
          return 'text-gray-700 font-bold'
      }
    }

    // Status Icon
    const statusIcon = (status?: string) => {
      switch (status?.toLowerCase()) {
        case 'success':
          return '✔️'
        case 'pending':
          return '⏳'
        case 'failed':
          return '❌'
        default:
          return ''
      }
    }

    // Fetch Status Notifikasi
    const fetchStatus = async () => {
      try {
        const response = await getNotifikasi()
        console.log('Notifikasi response:', response)

        if (response?.status) {
          transaction.value.status = response.status // Update status transaksi
        }
      } catch (err) {
        console.error('❌ Error fetch status:', err)
        error.value = 'Gagal mengambil status transaksi'
      } finally {
        loading.value = false
      }
    }

    // Fetch Data Kwitansi
    const fetchTransaction = async () => {
      try {
        // @ts-ignore
        const response = await getKwitansi()
        console.log('Kwitansi response:', response)

        if (!response || Object.keys(response).length === 0) {
          error.value = 'Data transaksi tidak ditemukan'
          return
        }

        transaction.value = { ...response, price: Number(response.price) }
      } catch (err) {
        console.error('❌ Error fetch kwitansi:', err)
        error.value = 'Gagal mengambil data transaksi'
      } finally {
        loading.value = false
      }
    }

    // Watch perubahan status transaksi
    watch(
      () => transaction.value.status,
      (newStatus, oldStatus) => {
        console.log('Status changed:', newStatus) // Debugging
        if (newStatus === 'success') {
          notification.value = '✅ Pembayaran berhasil!'
        } else if (newStatus === 'failed') {
          notification.value = '❌ Pembayaran gagal!'
        } else if (newStatus === 'accept') {
          notification.value = '✅ Pembayaran diterima!' // Tambahkan kondisi untuk 'accept'
        }

        // Hentikan polling jika sudah sukses/gagal/accept
        if (newStatus === 'success' || newStatus === 'failed' || newStatus === 'accept') {
          if (pollingTransaction) {
            clearInterval(pollingTransaction)
            pollingTransaction = null
          }
          if (pollingStatus) {
            clearInterval(pollingStatus)
            pollingStatus = null
          }
        }

        // Hilangkan notifikasi setelah 3 detik
        setTimeout(() => {
          notification.value = null
        }, 3000)
      },
      { deep: true }, // Pastikan perubahan di dalam objek terdeteksi
    )

    // On Mounted
    onMounted(() => {
      fetchTransaction()
      pollingTransaction = setInterval(fetchTransaction, 5000)
      pollingStatus = setInterval(fetchStatus, 5000)
    })

    // On Unmounted
    onUnmounted(() => {
      if (pollingTransaction) clearInterval(pollingTransaction)
      if (pollingStatus) clearInterval(pollingStatus)
    })

    return {
      transaction,
      loading,
      error,
      notification,
      formatCurrency,
      formatDate,
      statusClass,
      statusIcon,
    }
  },
})
</script>
