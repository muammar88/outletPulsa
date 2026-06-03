import { defineAsyncComponent } from 'vue';

export const tabComponents: Record<string, any> = {
  ringkasan: defineAsyncComponent(() => import('@/modules/Administrator/Ringkasan/Ringkasan.vue')),
  daftar_member: defineAsyncComponent(() => import('@/modules/Administrator/DaftarMember/DaftarMember.vue')),
  daftar_agen: defineAsyncComponent(() => import('@/modules/Administrator/DaftarAgen/DaftarAgen.vue')),
  transaksi_pulsa: defineAsyncComponent(() => import('@/modules/Administrator/TransaksiPulsa/TransaksiPulsa.vue')),
  semua_produk: defineAsyncComponent(() => import('@/modules/Administrator/SemuaProduk/SemuaProduk.vue')),
  daftar_server: defineAsyncComponent(() => import('@/modules/Administrator/SemuaServer/SemuaServer.vue')),
  kategori: defineAsyncComponent(() => import('@/modules/Administrator/Kategori/Kategori.vue')),
  operator: defineAsyncComponent(() => import('@/modules/Administrator/Operator/Operator.vue')),
  pengaturan: defineAsyncComponent(() => import('@/modules/Administrator/PengaturanUmum/PengaturanUmum.vue')),
  deposit: defineAsyncComponent(() => import('@/modules/Administrator/Deposit/Deposit.vue')),
  notFound: defineAsyncComponent(() => import('@/views/errors/NotFoundView.vue')),
};
