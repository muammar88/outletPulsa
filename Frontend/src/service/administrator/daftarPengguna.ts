import api from '@/service/api_administrator';

export const daftarPenggunaService = {
  getAll: (page: number = 1, limit: number = 10, search: string = '') =>
    api.get('/administrator/daftar-pengguna', { params: { page, limit, search } }),

  getById: (id: number) => api.get(`/administrator/daftar-pengguna/${id}`),

  create: (data: any) => api.post('/administrator/daftar-pengguna', data),

  update: (id: number, data: any) => api.put(`/administrator/daftar-pengguna/${id}`, data),

  delete: (id: number) => api.delete(`/administrator/daftar-pengguna/${id}`),
};
