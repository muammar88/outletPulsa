import api from '@/service/api_administrator';

export const daftarGrupService = {
  getAll: (page: number = 1, limit: number = 10, search: string = '') =>
    api.get('/administrator/daftar-grup', { params: { page, limit, search } }),

  getById: (id: number) => api.get(`/administrator/daftar-grup/${id}`),

  create: (data: any) => api.post('/administrator/daftar-grup', data),

  update: (id: number, data: any) => api.put(`/administrator/daftar-grup/${id}`, data),

  delete: (id: number) => api.delete(`/administrator/daftar-grup/${id}`),

  getPermissions: () => api.get('/administrator/daftar-grup/permissions'),

  assignPermissions: (id: number, permissionIds: number[]) =>
    api.post(`/administrator/daftar-grup/${id}/permissions`, { permissionIds }),
};
