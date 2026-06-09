import api from '@/service/api_administrator';
import type { ProdukPascabayarResponse, Produk } from '../types/ProdukPascabayar';

export const ProdukPascabayarService = {
  async getAll(
    search = '',
    limit = 10,
    page = 1,
    status = '',
    kategoriId = ''
  ) {
    const params = new URLSearchParams({
      search,
      limit: limit.toString(),
      page: page.toString(),
      status,
      kategoriId
    });
    
    return await api.get(`/administrator/produk-pascabayar?${params.toString()}`);
  },

  async getById(id: number) {
    return await api.get(`/administrator/produk-pascabayar/${id}`);
  },

  async create(data: Partial<Produk>) {
    return await api.post('/administrator/produk-pascabayar', data);
  },

  async update(id: number, data: Partial<Produk>) {
    return await api.put(`/administrator/produk-pascabayar/${id}`, data);
  },

  async delete(id: number) {
    return await api.delete(`/administrator/produk-pascabayar/${id}`);
  },
};
