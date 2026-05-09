<template>
  <tr class="border">
    <td class="px-4 py-4 text-center min-h-[200px]" :colspan="totalColumns - 2">
      <nav class="flex mt-0">
        <ul class="inline-flex items-center -space-x-px">
          <!-- Tombol Previous -->
          <li>
            <button
              @click="$emit('prev-page')"
              :disabled="currentPage === 1"
              class="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
          </li>

          <!-- Tombol halaman (dengan ellipsis) -->
          <li v-for="page in visiblePages" :key="page.key">
            <button
              v-if="page.type === 'page'"
              @click="$emit('page-now', page.number)"
              class="px-3 py-2 leading-tight border"
              :class="
                currentPage === page.number
                  ? 'text-white bg-[#3a477d] border-[#3a477d]'
                  : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
              "
            >
              {{ page.number }}
            </button>
            <span v-else class="px-3 py-2 text-gray-400 select-none">...</span>
          </li>

          <!-- Tombol Next -->
          <li>
            <button
              @click="$emit('next-page')"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </td>
    <td class="px-4 py-4 text-right min-h-[200px] font-medium text-sm" colspan="2">
      Total Entries {{ totalRow }}
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: Number,
  totalPages: Number,
  pages: Array,
  totalColumns: Number,
  totalRow: { type: Number, default: 0 },
})

defineEmits(['prev-page', 'next-page', 'page-now'])

// Logic untuk bikin visiblePages dengan ellipsis
const visiblePages = computed(() => {
  const pages = []
  const total = props.totalPages
  const current = props.currentPage
  const delta = 2

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push({ type: 'page', number: i, key: `page-${i}` })
    }
  } else {
    pages.push({ type: 'page', number: 1, key: 'page-1' })

    if (current > delta + 2) {
      pages.push({ type: 'ellipsis', key: 'start-ellipsis' })
    }

    const start = Math.max(2, current - delta)
    const end = Math.min(total - 1, current + delta)

    for (let i = start; i <= end; i++) {
      pages.push({ type: 'page', number: i, key: `page-${i}` })
    }

    if (current < total - (delta + 1)) {
      pages.push({ type: 'ellipsis', key: 'end-ellipsis' })
    }

    pages.push({ type: 'page', number: total, key: `page-${total}` })
  }

  return pages
})
</script>
