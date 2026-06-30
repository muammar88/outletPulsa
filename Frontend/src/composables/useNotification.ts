import { ref } from 'vue';

export function useNotification() {
  const showNotification = ref(false);
  const notificationType = ref<'success' | 'error' | 'warning'>('success');
  const notificationMessage = ref('');
  const notificationMessageHtml = ref('');
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function displayNotification(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success',
    duration: number = 2000, // default 2 detik
    isHtml: boolean = false
  ) {
    if (timeoutId) clearTimeout(timeoutId);

    if (isHtml) {
      notificationMessage.value = '';
      notificationMessageHtml.value = message;
    } else {
      notificationMessage.value = message;
      notificationMessageHtml.value = '';
    }

    notificationType.value = type;
    showNotification.value = true;

    timeoutId = setTimeout(() => {
      showNotification.value = false;
      timeoutId = null;
    }, duration);
  }

  function hideNotification() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    showNotification.value = false;
  }

  return {
    showNotification,
    notificationType,
    notificationMessage,
    notificationMessageHtml,
    displayNotification,
    hideNotification,
  };
}
