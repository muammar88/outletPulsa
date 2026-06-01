import api from '@/service/api_administrator';
import type { SemuaProdukResponse, Produk } from '../types/semuaProduk';

export const semuaProdukService = {
  async getAll(
    search = '',
    limit = 10,
    page = 1,
    status = '',
    type = ''
  ) {
    const params = new URLSearchParams({
      search,
      limit: limit.toString(),
      page: page.toString(),
      status,
      type
    });
    
    return await api.get(`/administrator/semua-produk?${params.toString()}`);
  },

  async getById(id: number) {
    return await api.get(`/administrator/semua-produk/${id}`);
  },

  async create(data: Partial<Produk>) {
    return await api.post('/administrator/semua-produk', data);
  },

  async update(id: number, data: Partial<Produk>) {
    return await api.put(`/administrator/semua-produk/${id}`, data);
  },

  async delete(id: number) {
    return await api.delete(`/administrator/semua-produk/${id}`);
  },
};
