import api from '@/service/api_administrator';

export const transaksiLinkquService = {
  getAll: (params: { page: number; limit: number; search: string }) => {
    return api.get('/administrator/transaksi-linkqu', { params });
  },
};
