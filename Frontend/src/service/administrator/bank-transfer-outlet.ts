import api from '@/service/api_administrator';
import { Bank } from './bank';

export interface BankTransferOutlet {
  id?: number;
  bankId: number;
  accountName: string;
  accountNumber: string;
  bank?: Bank;
  createdAt?: string;
  updatedAt?: string;
}

export const bankTransferOutletService = {
  getAll: async (keyword = '', perPage = 10, page = 1) => {
    return await api.get(`/administrator/bank-transfer-outlet`, {
      params: { keyword, perPage, page },
    });
  },

  getById: async (id: number) => {
    return await api.get(`/administrator/bank-transfer-outlet/${id}`);
  },

  create: async (data: BankTransferOutlet) => {
    return await api.post(`/administrator/bank-transfer-outlet`, data);
  },

  update: async (id: number, data: Partial<BankTransferOutlet>) => {
    return await api.put(`/administrator/bank-transfer-outlet/${id}`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`/administrator/bank-transfer-outlet/${id}`);
  },
};
