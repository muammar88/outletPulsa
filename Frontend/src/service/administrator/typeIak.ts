import api from '@/service/api_administrator';

export const typeIakService = {
  getAll: async (searchQuery = '', limit = 10, page = 1) => {
    return await api.get(`/administrator/daftar-type-iak`, {
      params: { search: searchQuery, limit, page },
    });
  },
};
