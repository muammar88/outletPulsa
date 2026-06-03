import api from '@/service/api_administrator';

export interface ActivityLog {
  id: number;
  userId?: number | null;
  memberId?: number | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  description?: string | null;
  createdAt: string;
  user?: {
    id: number;
    name: string;
  } | null;
  member?: {
    id: number;
    fullname: string;
    kode: string;
  } | null;
}

export const logService = {
  getAll: async (search?: string, limit: number = 10, page: number = 1, actionFilter?: string) => {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    if (actionFilter) params.action = actionFilter;
    
    return await api.get('/administrator/log', { params });
  },
};
