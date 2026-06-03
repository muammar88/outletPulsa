import { ref, computed } from "vue"

export function usePagination(fetchData: () => void, options?: {
  perPage?: number
  totalRow?: number
}) {
  const currentPage = ref(1)
  const perPage = ref(options?.perPage ?? 10)
  const totalRow = ref(options?.totalRow ?? 0)

  // ✅ totalPages otomatis
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalRow.value / perPage.value))
  )

  function setPage(page: number) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    fetchData()
  }

  function nextPage() {
    setPage(currentPage.value + 1)
  }

  function prevPage() {
    setPage(currentPage.value - 1)
  }

  function pageNow(page: number) {
    setPage(page)
  }

  const pages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  return {
    currentPage,
    perPage,
    totalRow,
    totalPages,
    pages,
    nextPage,
    prevPage,
    pageNow,
    setPage
  }
}
