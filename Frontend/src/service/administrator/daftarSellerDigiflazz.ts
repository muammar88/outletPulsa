import api from '@/service/api_administrator';

export const daftarSellerDigiflazzService = {
  getAll: async (searchQuery = '', limit = 10, page = 1) => {
    return await api.get(`/administrator/daftar-seller-digiflazz`, {
      params: { search: searchQuery, limit, page },
    });
  },
};
