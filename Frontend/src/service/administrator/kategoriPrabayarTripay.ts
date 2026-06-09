import api from '@/service/api_administrator';

export interface KategoriPrabayarTripay {
  id: number;
  name: string | null;
  type: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tripayPrabayarOperators: number;
  };
}

export interface KategoriPrabayarTripayDetail extends KategoriPrabayarTripay {
  tripayPrabayarOperators: {
    id: number;
    kode: string | null;
    name: string | null;
    _count?: { tripayPrabayarProduks: number };
  }[];
}

export const kategoriPrabayarTripayService = {
  getAll: (search = '', limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'desc') =>
    api.get('/administrator/kategori-prabayar-tripay', {
      params: { search, limit, page, sortBy, sortOrder },
    }),

  getAllFlat: (limit = 1000) =>
    api.get('/administrator/kategori-prabayar-tripay', { params: { limit, page: 1 } }),

  getById: (id: number) => api.get(`/administrator/kategori-prabayar-tripay/${id}`),

  create: (data: Pick<KategoriPrabayarTripay, 'name' | 'type'>) =>
    api.post('/administrator/kategori-prabayar-tripay', data),

  update: (id: number, data: Partial<Pick<KategoriPrabayarTripay, 'name' | 'type'>>) =>
    api.put(`/administrator/kategori-prabayar-tripay/${id}`, data),

  delete: (id: number) => api.delete(`/administrator/kategori-prabayar-tripay/${id}`),
};
