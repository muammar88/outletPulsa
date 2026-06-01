import api from '@/service/api_administrator';
import type { ApiResponse, PaginationData, Server } from '../types/semuaServer';

export const semuaServerService = {
  async getAll(search = '', limit = 10, page = 1, status = '') {
    const params = new URLSearchParams({
      search,
      limit: limit.toString(),
      page: page.toString(),
      status,
    });
    return api.get<ApiResponse<PaginationData>>(`/administrator/semua-server?${params}`);
  },

  async getById(id: number) {
    return api.get<ApiResponse<Server>>(`/administrator/semua-server/${id}`);
  },

  async create(data: Partial<Server>) {
    return api.post<ApiResponse<Server>>('/administrator/semua-server', data);
  },

  async update(id: number, data: Partial<Server>) {
    return api.put<ApiResponse<Server>>(`/administrator/semua-server/${id}`, data);
  },

  async delete(id: number) {
    return api.delete<ApiResponse<null>>(`/administrator/semua-server/${id}`);
  },
};
