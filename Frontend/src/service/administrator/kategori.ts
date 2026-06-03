import api from '@/service/api_administrator';

export interface Kategori {
  id?: number;
  kode: string;
  name: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    operators?: number;
  };
}

export const kategoriService = {
  getAll: async (searchQuery = '', limit = 10, page = 1) => {
    return await api.get(`/administrator/kategori`, {
      params: { search: searchQuery, limit, page },
    });
  },

  getById: async (id: number) => {
    return await api.get(`/administrator/kategori/${id}`);
  },

  create: async (data: Kategori) => {
    return await api.post(`/administrator/kategori`, data);
  },

  update: async (id: number, data: Partial<Kategori>) => {
    return await api.put(`/administrator/kategori/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/administrator/kategori/${id}`);
  },
};
