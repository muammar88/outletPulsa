import api from '@/service/api_administrator';

export const produkPascabayarIakService = {
  getAll: async (searchQuery = '', limit = 10, page = 1, typeId = '', connectionStatus = '') => {
    return await api.get(`/administrator/daftar-produk-pascabayar-iak`, {
      params: { search: searchQuery, limit, page, typeId, connectionStatus },
    });
  },
  getTypes: async () => {
    return await api.get(`/administrator/daftar-produk-pascabayar-iak/types`);
  },
  sync: async () => {
    return await api.post(`/administrator/daftar-produk-pascabayar-iak/sync`);
  },
  getInternalOperators: (search = '') => {
    return api.get('/administrator/daftar-produk-pascabayar-iak/internal-operators', { params: { search } });
  },
  getInternalProducts: (operatorId: number, search = '') => {
    return api.get('/administrator/daftar-produk-pascabayar-iak/internal-products', { params: { operatorId, search } });
  },
  connectProduct: (id: number, produkPascabayarId: number) => {
    return api.post(`/administrator/daftar-produk-pascabayar-iak/${id}/connect`, { produkPascabayarId });
  },
};
