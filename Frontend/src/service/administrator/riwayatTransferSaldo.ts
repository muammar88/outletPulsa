import api from '../api_administrator';

export interface RiwayatTransferParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  status?: string;
}

export const riwayatTransferSaldoService = {
  findAll: async (params: RiwayatTransferParams) => {
    return api.get('/administrator/riwayat-transfer-saldo', { params });
  },

  findOne: async (id: number) => {
    return api.get(`/administrator/riwayat-transfer-saldo/${id}`);
  },
};
