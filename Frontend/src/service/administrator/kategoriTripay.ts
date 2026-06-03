import api from '@/service/api_administrator';

export interface KategoriTripay {
  id: number;
  name: string | null;
  type: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tripayPrabayarOperators: number;
  };
}

export interface KategoriTripayDetail extends KategoriTripay {
  tripayPrabayarOperators: {
    id: number;
    kode: string | null;
    name: string | null;
    _count?: { tripayPrabayarProduks: number };
  }[];
}

export const kategoriTripayService = {
  getAll: (search = '', limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'desc') =>
    api.get('/administrator/kategori-tripay', {
      params: { search, limit, page, sortBy, sortOrder },
    }),

  getAllFlat: (limit = 1000) =>
    api.get('/administrator/kategori-tripay', { params: { limit, page: 1 } }),

  getById: (id: number) => api.get(`/administrator/kategori-tripay/${id}`),

  create: (data: Pick<KategoriTripay, 'name' | 'type'>) =>
    api.post('/administrator/kategori-tripay', data),

  update: (id: number, data: Partial<Pick<KategoriTripay, 'name' | 'type'>>) =>
    api.put(`/administrator/kategori-tripay/${id}`, data),

  delete: (id: number) => api.delete(`/administrator/kategori-tripay/${id}`),
};
