import api from '@/service/api_administrator';

export interface KategoriPascabayarTripay {
  id: number;
  name: string | null;
  type: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tripayPascabayarOperators: number;
  };
}

export interface KategoriPascabayarTripayDetail extends KategoriPascabayarTripay {
  tripayPascabayarOperators: {
    id: number;
    kode: string | null;
    name: string | null;
    _count?: { tripayPascabayarProduks: number };
  }[];
}

export const kategoriPascabayarTripayService = {
  getAll: (search = '', limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'desc') =>
    api.get('/administrator/kategori-pascabayar-tripay', {
      params: { search, limit, page, sortBy, sortOrder },
    }),

  getAllFlat: (limit = 1000) =>
    api.get('/administrator/kategori-pascabayar-tripay', { params: { limit, page: 1 } }),

  getById: (id: number) => api.get(`/administrator/kategori-pascabayar-tripay/${id}`),

  create: (data: Pick<KategoriPascabayarTripay, 'name' | 'type'>) =>
    api.post('/administrator/kategori-pascabayar-tripay', data),

  update: (id: number, data: Partial<Pick<KategoriPascabayarTripay, 'name' | 'type'>>) =>
    api.put(`/administrator/kategori-pascabayar-tripay/${id}`, data),

  delete: (id: number) => api.delete(`/administrator/kategori-pascabayar-tripay/${id}`),
};
