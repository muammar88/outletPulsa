import api from '@/service/api_administrator';

export interface OperatorTripay {
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
    tripayPrabayarProduks: number;
  };
}

export const operatorTripayService = {
  getAll: (
    search = '',
    limit = 10,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    kategoriId?: number,
  ) =>
    api.get('/administrator/operator-tripay', {
      params: { search, limit, page, sortBy, sortOrder, kategoriId },
    }),

  getById: (id: number) => api.get(`/administrator/operator-tripay/${id}`),

  create: (data: { name: string; kode: string; kategoriId?: number }) =>
    api.post('/administrator/operator-tripay', data),

  update: (id: number, data: { name?: string; kode?: string; kategoriId?: number }) =>
    api.put(`/administrator/operator-tripay/${id}`, data),

  delete: (id: number) => api.delete(`/administrator/operator-tripay/${id}`),
};
