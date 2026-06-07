import api from '@/service/api_administrator';

export const operatorIakService = {
  getAll: async (searchQuery = '', limit = 10, page = 1, typeId = '') => {
    return await api.get(`/administrator/daftar-operator-iak`, {
      params: { search: searchQuery, limit, page, typeId },
    });
  },
};
