import api from '@/service/api_administrator';

export interface RiwayatSaldo {
  id?: number;
  kode?: string;
  member_id: number;
  nominal: number;
  saldo_sebelumnya?: number;
  saldo_setelahnya?: number;
  status: string;
  ket: string | null;
  created_at?: string;
  updated_at?: string;
  member?: any;
}

export const depositService = {
  getAll: async (search?: string, limit: number = 10, page: number = 1, kategori?: string) => {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    if (kategori) params.kategori = kategori;
    
    return await api.get('/administrator/deposit', { params });
  },

  getById: async (id: number) => {
    return await api.get(`/administrator/deposit/${id}`);
  },

  create: async (data: Partial<RiwayatSaldo>) => {
    return await api.post('/administrator/deposit', data);
  },

  update: async (id: number, data: Partial<RiwayatSaldo>) => {
    return await api.put(`/administrator/deposit/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/administrator/deposit/${id}`);
  },
};
