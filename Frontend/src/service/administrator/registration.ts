import api from '../api_administrator';

export const registrationService = {
  async getAll(search: string = '', limit: number = 10, page: number = 1) {
    const params = new URLSearchParams({
      search,
      limit: limit.toString(),
      page: page.toString(),
    });
    return await api.get(`/administrator/registration?${params.toString()}`);
  },

  async delete(id: number) {
    return await api.delete(`/administrator/registration/${id}`);
  },
};
