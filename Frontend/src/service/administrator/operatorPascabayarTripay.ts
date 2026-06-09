import api from '@/service/api_administrator';

export interface OperatorPascabayarTripay {
  id: number;
  kode: string | null;
  name: string | null;
  kategoriId: number | null;
  createdAt: string;
  updatedAt: string;
  kategori?: {
    id: number;
    name: string | null;
    type: string | null;
  };
  _count?: {
    tripayPascabayarProduks: number;
  };
}

export const operatorPascabayarTripayService = {
  getAll: (
    search = '',
    limit = 10,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    kategoriId?: number,
  ) =>
    api.get('/administrator/operator-pascabayar-tripay', {
      params: { search, limit, page, sortBy, sortOrder, kategoriId },
    }),

  getById: (id: number) => api.get(`/administrator/operator-pascabayar-tripay/${id}`),

  create: (data: { name: string; kode: string; kategoriId?: number }) =>
    api.post('/administrator/operator-pascabayar-tripay', data),

  update: (id: number, data: { name?: string; kode?: string; kategoriId?: number }) =>
    api.put(`/administrator/operator-pascabayar-tripay/${id}`, data),

  delete: (id: number) => api.delete(`/administrator/operator-pascabayar-tripay/${id}`),
};
