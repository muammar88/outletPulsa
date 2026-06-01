import { defineAsyncComponent } from 'vue';

export const tabComponents: Record<string, any> = {
  ringkasan: defineAsyncComponent(() => import('@/modules/Administrator/Ringkasan/Ringkasan.vue')),
  daftar_member: defineAsyncComponent(() => import('@/modules/Administrator/Daftar_member/Daftar_member.vue')),
  notFound: defineAsyncComponent(() => import('@/views/errors/NotFoundView.vue')),
};
