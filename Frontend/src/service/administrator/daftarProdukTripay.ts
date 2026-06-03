import api from '../api_administrator';

export const daftarProdukTripayService = {
  getAll: (page = 1, limit = 10, search = '', operatorId = '', kategoriId = '', status = '', sortBy = 'createdAt', sortOrder = 'desc') => {
    return api.get('/administrator/daftar-produk-tripay', {
      params: { page, limit, search, operatorId, kategoriId, status, sortBy, sortOrder },
    });
  },
  getById: (id: number) => {
    return api.get(`/administrator/daftar-produk-tripay/${id}`);
  },
  sync: () => {
    return api.post('/administrator/daftar-produk-tripay/sync');
  },
};
