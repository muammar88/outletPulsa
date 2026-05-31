<script setup lang="ts">
import Pagination from '@/components/Pagination/Pagination.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
    <label class="font-semibold">Request Saldo</label>
    <div class="flex items-center w-full sm:w-auto">
      <label for="search" class="mr-2 text-sm font-medium text-gray-600">Cari</label>
      <input
        id="search"
        type="text"
        v-model="search"
        @change="fetchData"
        placeholder="Cari nomor invoice..."
        class="w-full sm:w-64 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-outlet focus:ring-2 focus:ring-outlet transition"
      />
    </div>
  </div>
  <div class="overflow-hidden rounded-xl border border-gray-200 shadow-md">
    <!-- <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" /> -->
    <table class="w-full border-collapse bg-white text-sm">
      <thead class="bg-gray-50 text-gray-700 text-center border-b border-gray-300">
        <tr>
          <th class="w-[20%] text-center px-6 py-3 font-medium font-bold text-gray-900 text-center">
            Invoice
          </th>
          <th class="w-[60%] text-center px-6 py-3 font-medium font-bold text-gray-900 text-center">
            Info Request Saldo
          </th>
          <th class="w-[20%] text-center px-6 py-3 font-medium font-bold text-gray-900 text-center">
            Aksi
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr>
          <td colspan="3" class="px-6 py-4 text-center align-middle">
            Request saldo tidak ditemukan
          </td>
        </tr>
      </tbody>
      <tfoot>
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :pages="pages"
          :total-columns="totalColumns"
          :total-row="totalRow"
          @prev-page="prevPage"
          @next-page="nextPage"
          @page-now="pageNow"
        />
      </tfoot>
    </table>
  </div>
</template>
