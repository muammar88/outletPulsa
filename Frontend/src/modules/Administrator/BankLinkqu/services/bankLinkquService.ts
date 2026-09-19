import api from '@/service/api_administrator';
import type { BankLinkqu } from '../types/bankLinkqu';

export const bankLinkquService = {
  getAll: () => {
    return api.get('/administrator/bank-linkqu');
  },

  updateStatus: (id: number, status: boolean) => {
    return api.patch(`/administrator/bank-linkqu/${id}/status`, { status });
  },

  sync: () => {
    return api.post('/administrator/bank-linkqu/sync');
  }
};
