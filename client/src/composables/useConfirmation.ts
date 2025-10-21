import { ref } from "vue"

export function useConfirmation() {
  const showConfirmDialog = ref(false)
  const confirmTitle = ref("")
  const confirmMessage = ref("")
  const confirmAction = ref<(() => void) | null>(null)

  function displayConfirmation(title: string, message: string, action: () => void) {
    confirmTitle.value = title
    confirmMessage.value = message
    confirmAction.value = action
    showConfirmDialog.value = true
  }

  function confirm(p0: () => Promise<void>) {
    if (confirmAction.value) confirmAction.value()
    showConfirmDialog.value = false
    confirmAction.value = null
  }

  function cancel(p0: () => void) {
    showConfirmDialog.value = false
    confirmAction.value = null
  }

  return {
    // state
    showConfirmDialog,
    confirmTitle,
    confirmMessage,
    confirmAction,

    // methods
    displayConfirmation,
    confirm,
    cancel,
  }
}
