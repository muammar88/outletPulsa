import api from '@/service/api_administrator';

export interface Pengumuman {
  id?: number;
  title: string;
  content: string;
  status: boolean;
  start_date: string;
  end_date: string;
  priority?: string;
  attachment?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const pengumumanService = {
  getAll: async (searchQuery = '', status = '', limit = 10, page = 1) => {
    return await api.get(`/administrator/pengumuman`, {
      params: { search: searchQuery, status, limit, page },
    });
  },

  getById: async (id: number) => {
    return await api.get(`/administrator/pengumuman/${id}`);
  },

  create: async (data: Pengumuman) => {
    return await api.post(`/administrator/pengumuman`, data);
  },

  update: async (id: number, data: Partial<Pengumuman>) => {
    return await api.put(`/administrator/pengumuman/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/administrator/pengumuman/${id}`);
  },

  publish: async (id: number) => {
    return await api.post(`/administrator/pengumuman/${id}/publish`);
  },
};
