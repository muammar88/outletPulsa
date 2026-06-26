import api from '@/service/api_administrator';

export interface Device {
  id?: number;
  device_code: string;
  member_id?: number;
  device_name?: string;
  device_brand?: string;
  device_model?: string;
  os_name?: string;
  os_version?: string;
  app_version?: string;
  last_login?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  member?: {
    id: number;
    fullname: string;
    whatsappnumber: string;
  };
}

export const deviceService = {
  getAll: async (searchQuery = '', limit = 10, page = 1) => {
    return await api.get(`/administrator/device`, {
      params: { search: searchQuery, limit, page },
    });
  },

  getById: async (id: number) => {
    return await api.get(`/administrator/device/${id}`);
  },
};
