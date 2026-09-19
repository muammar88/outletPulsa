import api from '@/service/api_administrator';
import type { EmoneyLinkqu } from '../types/emoneyLinkqu';

export const emoneyLinkquService = {
  getAll: () => {
    return api.get('/administrator/emoney-linkqu');
  },
  
  getById: (id: number) => {
    return api.get(`/administrator/emoney-linkqu/${id}`);
  },

  create: (data: EmoneyLinkqu) => {
    return api.post('/administrator/emoney-linkqu', data);
  },

  update: (id: number, data: EmoneyLinkqu) => {
    return api.put(`/administrator/emoney-linkqu/${id}`, data);
  },

  delete: (id: number) => {
    return api.delete(`/administrator/emoney-linkqu/${id}`);
  },

  sync: () => {
    return api.post('/administrator/emoney-linkqu/sync');
  }
};
