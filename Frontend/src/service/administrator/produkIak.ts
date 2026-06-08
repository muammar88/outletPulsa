import api from '@/service/api_administrator';

export const produkIakService = {
  getAll: async (searchQuery = '', limit = 10, page = 1, operatorId = '', connectionStatus = '') => {
    return await api.get(`/administrator/daftar-produk-iak`, {
      params: { search: searchQuery, limit, page, operatorId, connectionStatus },
    });
  },
  sync: async () => {
    return await api.post(`/administrator/daftar-produk-iak/sync`);
  },
  getInternalOperators: (search = '') => {
    return api.get('/administrator/daftar-produk-iak/internal-operators', { params: { search } });
  },
  getInternalProducts: (operatorId: number, search = '') => {
    return api.get('/administrator/daftar-produk-iak/internal-products', { params: { operatorId, search } });
  },
  connectProduct: (id: number, produkId: number) => {
    return api.post(`/administrator/daftar-produk-iak/${id}/connect`, { produkId });
  },
};
