import api from '@/service/api_administrator';

export const daftarProdukSellerDigiflazzService = {
  getAll: async (searchQuery = '', limit = 10, page = 1, sellerId = '') => {
    return await api.get(`/administrator/daftar-produk-seller-digiflazz`, {
      params: { search: searchQuery, limit, page, sellerId },
    });
  },
  getSellers: async () => {
    return await api.get(`/administrator/daftar-produk-seller-digiflazz/sellers`);
  },
  sync: async () => {
    return await api.post(`/administrator/daftar-produk-seller-digiflazz/sync`);
  }
};
