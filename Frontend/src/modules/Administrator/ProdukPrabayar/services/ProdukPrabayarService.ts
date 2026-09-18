import api from '@/service/api_administrator';
import type { ProdukPrabayarResponse, Produk } from '../types/ProdukPrabayar';

export const ProdukPrabayarService = {
  async getAll(
    search = '',
    limit = 10,
    page = 1,
    status = '',
    operatorId = '',
    kategori = ''
  ) {
    const params = new URLSearchParams({
      search,
      limit: limit.toString(),
      page: page.toString(),
      status,
      operatorId,
      kategori
    });
    
    return await api.get(`/administrator/produk-prabayar?${params.toString()}`);
  },

  async getById(id: number) {
    return await api.get(`/administrator/produk-prabayar/${id}`);
  },

  async create(data: Partial<Produk>) {
    return await api.post('/administrator/produk-prabayar', data);
  },

  async update(id: number, data: Partial<Produk>) {
    return await api.put(`/administrator/produk-prabayar/${id}`, data);
  },

  async delete(id: number) {
    return await api.delete(`/administrator/produk-prabayar/${id}`);
  },

  async syncTermurah() {
    return await api.post('/administrator/produk-prabayar/sync-termurah');
  },

  async bulkUpdateStatus(ids: number[], status: 'active' | 'inactive') {
    return await api.post('/administrator/produk-prabayar/bulk-update-status', { ids, status });
  },
};
