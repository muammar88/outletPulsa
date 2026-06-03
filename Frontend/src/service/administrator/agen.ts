import api from '@/service/api_administrator';

export interface Agen {
  id?: number;
  kode: string;
  fullname: string;
  whatsappnumber: string;
  kode_agen?: string;
  password?: string;
  saldo?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const agenService = {
  getAll: async (searchQuery = '', limit = 10, page = 1) => {
    return await api.get(`/administrator/agen`, {
      params: { search: searchQuery, limit, page },
    });
  },

  getById: async (id: number) => {
    return await api.get(`/administrator/agen/${id}`);
  },

  create: async (data: Agen) => {
    return await api.post(`/administrator/agen`, data);
  },

  update: async (id: number, data: Partial<Agen>) => {
    return await api.put(`/administrator/agen/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/administrator/agen/${id}`);
  },
};
