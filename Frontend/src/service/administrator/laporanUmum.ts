import api from '@/service/api_administrator';

export const laporanUmumService = {
  getSummary: async (startDate?: string, endDate?: string) => {
    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return await api.get('/administrator/laporan-umum/summary', { params });
  },

  getTable: async (page: number = 1, limit: number = 10, search?: string, startDate?: string, endDate?: string, type?: string) => {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (type) params.type = type;

    return await api.get('/administrator/laporan-umum/table', { params });
  }
};
