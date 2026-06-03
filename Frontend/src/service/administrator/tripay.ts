import api from '@/service/api_administrator';

export const tripayService = {
  getChannels: () => api.get('/tripay/channels'),
  calculateFee: (amount: number, code: string) => api.get('/tripay/fee', { params: { amount, code } }),
};
