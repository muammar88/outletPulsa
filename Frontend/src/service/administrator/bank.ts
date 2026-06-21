import api from '@/service/api_administrator';

export interface Bank {
  id?: number;
  kode: string;
  nama: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    bankTransferOutlets?: number;
    riwayatMutasis?: number;
  };
}

export const bankService = {
  getAll: async (searchQuery = '', limit = 10, page = 1) => {
    return await api.get(`/administrator/bank`, {
      params: { search: searchQuery, limit, page },
    });
  },

  getById: async (id: number) => {
    return await api.get(`/administrator/bank/${id}`);
  },

  create: async (data: Bank | FormData) => {
    return await api.post(`/administrator/bank`, data);
  },

  update: async (id: number, data: Partial<Bank> | FormData) => {
    return await api.put(`/administrator/bank/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/administrator/bank/${id}`);
  },
};
