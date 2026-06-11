import api from '@/service/api_administrator';

export const dashboardService = {
  getServerBalances: async () => {
    try {
      const response = await api.get('/administrator/semua-server/balances');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getStatistics: async () => {
    const response = await api.get('/administrator/dashboard/statistics');
    return response.data;
  },
  getRecentTransactions: async () => {
    const response = await api.get('/administrator/dashboard/recent-transactions');
    return response.data;
  },
  getTopProducts: async () => {
    const response = await api.get('/administrator/dashboard/top-products');
    return response.data;
  },
  getSystemStatus: async () => {
    const response = await api.get('/administrator/dashboard/system-status');
    return response.data;
  },
};
