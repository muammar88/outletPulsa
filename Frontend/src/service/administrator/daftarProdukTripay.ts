import api from '../api_administrator';

export const daftarProdukTripayService = {
  getAll: (page = 1, limit = 10, search = '', operatorId = '', kategoriId = '', status = '', connectionStatus = '', sortBy = 'createdAt', sortOrder = 'desc') => {
    return api.get('/administrator/daftar-produk-tripay', {
      params: { page, limit, search, operatorId, kategoriId, status, connectionStatus, sortBy, sortOrder },
    });
  },
  getById: (id: number) => {
    return api.get(`/administrator/daftar-produk-tripay/${id}`);
  },
  sync: () => {
    return api.post('/administrator/daftar-produk-tripay/sync');
  },
  getInternalOperators: (search = '') => {
    return api.get('/administrator/daftar-produk-tripay/internal-operators', { params: { search } });
  },
  getInternalProducts: (operatorId: number, search = '') => {
    return api.get('/administrator/daftar-produk-tripay/internal-products', { params: { operatorId, search } });
  },
  connectProduct: (id: number, produkId: number) => {
    return api.post(`/administrator/daftar-produk-tripay/${id}/connect`, { produkId });
  },
};
