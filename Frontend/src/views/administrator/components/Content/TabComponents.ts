import { defineAsyncComponent } from 'vue';

export const tabComponents: Record<string, any> = {
  ringkasan: defineAsyncComponent(() => import('@/modules/Administrator/Ringkasan/Ringkasan.vue')),
  daftar_member: defineAsyncComponent(() => import('@/modules/Administrator/DaftarMember/DaftarMember.vue')),
  transaksi_pulsa: defineAsyncComponent(() => import('@/modules/Administrator/TransaksiPulsa/TransaksiPulsa.vue')),
  semua_produk: defineAsyncComponent(() => import('@/modules/Administrator/SemuaProduk/SemuaProduk.vue')),
  daftar_server: defineAsyncComponent(() => import('@/modules/Administrator/SemuaServer/SemuaServer.vue')),
  pengaturan: defineAsyncComponent(() => import('@/modules/Administrator/PengaturanUmum/PengaturanUmum.vue')),
  notFound: defineAsyncComponent(() => import('@/views/errors/NotFoundView.vue')),
};
