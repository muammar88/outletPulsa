import { ref, onMounted, onUnmounted } from 'vue';

export function useDynamicLabel() {
  const windowWidth = ref(window.innerWidth);

  const handleResize = () => {
    windowWidth.value = window.innerWidth;
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  const dynamicLabel = (val: string) => {
    if (windowWidth.value < 640) {
      return '';
    } else if (windowWidth.value < 1269) {
      return val.slice(0, 8) + '...';
    } else if (windowWidth.value < 1467) {
      return val.slice(0, 8) + '...';
    } else if (windowWidth.value < 1611) {
      return val.slice(0, 13) + '...';
    } else if (windowWidth.value < 1707) {
      return val.slice(0, 16) + '...';
    } else {
      return val;
    }
  };

  return { windowWidth, dynamicLabel };
}
