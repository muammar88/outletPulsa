import api from '@/service/api_administrator';
import type { ApiResponse, PengaturanUmum } from '../types/pengaturanUmum';

export const pengaturanUmumService = {
  async get() {
    return api.get<ApiResponse<PengaturanUmum>>('/administrator/pengaturan-umum');
  },

  async update(data: Partial<PengaturanUmum>) {
    return api.put<ApiResponse<PengaturanUmum>>('/administrator/pengaturan-umum', data);
  },
};
