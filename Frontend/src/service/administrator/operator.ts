import api from '@/service/api_administrator';
import type { Kategori } from './kategori';

export interface Operator {
  id?: number;
  kategoriId?: number | null;
  kode: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  kategori?: Kategori;
  _count?: {
    produks?: number;
  };
}

export const operatorService = {
  getAll: async (searchQuery = '', limit = 10, page = 1) => {
    return await api.get(`/administrator/operator`, {
      params: { search: searchQuery, limit, page },
    });
  },

  getById: async (id: number) => {
    return await api.get(`/administrator/operator/${id}`);
  },

  create: async (data: Operator) => {
    return await api.post(`/administrator/operator`, data);
  },

  update: async (id: number, data: Partial<Operator>) => {
    return await api.put(`/administrator/operator/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/administrator/operator/${id}`);
  },
};
