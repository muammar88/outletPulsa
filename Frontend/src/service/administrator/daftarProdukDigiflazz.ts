import api from '@/service/api_administrator';

export const daftarProdukDigiflazzService = {
  getAll: (
    page = 1,
    limit = 100,
    search = '',
    kategoriId = '',
    brandId = '',
    typeId = '',
    connectionStatus = '',
    status = ''
  ) => {
    return api.get('/administrator/daftar-produk-digiflazz', {
      params: {
        page,
        limit,
        search,
        kategoriId,
        brandId,
        typeId,
        connectionStatus,
        status,
      },
    });
  },

  getFilters: () => {
    return api.get('/administrator/daftar-produk-digiflazz/filters');
  },

  selectCheapestSeller: () => {
    return api.post('/administrator/daftar-produk-digiflazz/select-cheapest-seller');
  },

  getInternalOperators: (search = '') => {
    return api.get('/administrator/daftar-produk-digiflazz/internal-operators', { params: { search } });
  },

  getInternalProducts: (operatorId: number, search = '') => {
    return api.get('/administrator/daftar-produk-digiflazz/internal-products', { params: { operatorId, search } });
  },

  connectProduct: (id: number, produkId: number) => {
    return api.post(`/administrator/daftar-produk-digiflazz/${id}/connect`, { produkId });
  },

  getSellers: (id: number) => {
    return api.get(`/administrator/daftar-produk-digiflazz/${id}/sellers`);
  },

  toggleStatus: (id: number) => {
    return api.post(`/administrator/daftar-produk-digiflazz/${id}/toggle-status`);
  }
};
