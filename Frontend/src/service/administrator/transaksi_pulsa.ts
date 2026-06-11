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

  runCronJob: async () => {
    return await api.get(`/administrator/transaksi-pulsa/run-cron-job`);
  },

  checkStatusServer: async () => {
    return await api.get(`/administrator/transaksi-pulsa/check-status-server`);
  },

  reCheckStatus: async (id: number) => {
    return await api.post(`/administrator/transaksi-pulsa/${id}/check-status`);
  },

  delete: async (id: number) => {
    return await api.post(`/administrator/transaksi-pulsa/delete`, { id });
  },
};
