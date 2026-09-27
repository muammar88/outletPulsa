import api from '@/service/api_administrator';

export type ProviderPascabayar = 'IAK' | 'DIGIFLAZZ';

export const PascabayarProviderService = {
  async getKandidat(produkId: number) {
    return await api.get(`/administrator/pascabayar-provider/produk/${produkId}/kandidat`);
  },

  async getPerbandingan(produkId: number) {
    return await api.get(`/administrator/pascabayar-provider/produk/${produkId}/perbandingan`);
  },

  async connect(
    produkId: number,
    data: { provider: ProviderPascabayar; providerSku: string; iakProductId?: number | null; digiflazzProductId?: number | null },
  ) {
    return await api.post(`/administrator/pascabayar-provider/produk/${produkId}/connect`, data);
  },

  async select(produkId: number, provider: ProviderPascabayar) {
    return await api.post(`/administrator/pascabayar-provider/produk/${produkId}/select`, { provider });
  },

  async disconnect(produkId: number, provider: ProviderPascabayar) {
    return await api.post(`/administrator/pascabayar-provider/produk/${produkId}/disconnect`, { provider });
  },

  async listKatalogDigiflazz(search = '', page = 1, limit = 8) {
    const params = new URLSearchParams({ search, page: String(page), limit: String(limit) });
    return await api.get(`/administrator/pascabayar-provider/katalog-digiflazz?${params.toString()}`);
  },

  async syncKatalogDigiflazz() {
    return await api.post('/administrator/pascabayar-provider/katalog-digiflazz/sync');
  },
};

