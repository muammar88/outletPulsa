import api from '@/service/api_administrator';

export interface Member {
  id?: number;
  kode: string;
  fullname: string;
  whatsappnumber: string;
  kode_agen?: string;
  password?: string;
  saldo?: number;
  status?: string;
  type?: string;
  agenType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const memberService = {
  getAll: async (searchQuery = '', limit = 10, page = 1) => {
    return await api.get(`/administrator/member`, {
      params: { search: searchQuery, limit, page },
    });
  },

  getById: async (id: number) => {
    return await api.get(`/administrator/member/${id}`);
  },

  create: async (data: Member) => {
    return await api.post(`/administrator/member`, data);
  },

  update: async (id: number, data: Partial<Member>) => {
    return await api.put(`/administrator/member/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/administrator/member/${id}`);
  },
};
