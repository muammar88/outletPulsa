import api from '@/service/api_administrator';

export const transaksiPulsaService = {
  getAll: async (searchQuery = '', limit = 10, page = 1, status = '') => {
    return await api.get(`/administrator/transaksi-pulsa`, {
      params: { search: searchQuery, limit, page, status },
    });
  },

  getById: async (id: number) => {
    return await api.get(`/administrator/transaksi-pulsa/${id}`);
  },

  updateStatus: async (id: number, status: string, keterangan?: string) => {
    return await api.patch(`/administrator/transaksi-pulsa/${id}/status`, { status, keterangan });
  },
};
