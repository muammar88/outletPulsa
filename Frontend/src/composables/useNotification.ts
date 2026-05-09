import { ref } from 'vue';

export function useNotification() {
  const showNotification = ref(false);
  const notificationType = ref<'success' | 'error' | 'warning'>('success');
  const notificationMessage = ref('');
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function displayNotification(
    message: string,
    type: 'success' | 'error' | 'warning' = 'success',
    duration: number = 2000, // default 2 detik
  ) {
    // reset timeout biar gk bentrok kalo dipanggil berkali-kali
    if (timeoutId) clearTimeout(timeoutId);

    notificationMessage.value = message;
    notificationType.value = type;
    showNotification.value = true;

    // auto hide setelah duration
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
    displayNotification,
    hideNotification,
  };
}
