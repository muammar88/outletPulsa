import api from '../api_administrator';

export const daftarProdukPrabayarTripayService = {
  getAll: (page = 1, limit = 10, search = '', operatorId = '', kategoriId = '', status = '', connectionStatus = '', sortBy = 'createdAt', sortOrder = 'desc') => {
    return api.get('/administrator/daftar-produk-prabayar-tripay', {
      params: { page, limit, search, operatorId, kategoriId, status, connectionStatus, sortBy, sortOrder },
    });
  },
  getById: (id: number) => {
    return api.get(`/administrator/daftar-produk-prabayar-tripay/${id}`);
  },
  sync: () => {
    return api.post('/administrator/daftar-produk-prabayar-tripay/sync');
  },
  getInternalOperators: (search = '') => {
    return api.get('/administrator/daftar-produk-prabayar-tripay/internal-operators', { params: { search } });
  },
  getInternalProducts: (operatorId: number, search = '') => {
    return api.get('/administrator/daftar-produk-prabayar-tripay/internal-products', { params: { operatorId, search } });
  },
  connectProduct: (id: number, produkId: number) => {
    return api.post(`/administrator/daftar-produk-prabayar-tripay/${id}/connect`, { produkId });
  },
};
