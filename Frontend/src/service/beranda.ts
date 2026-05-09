import api from '@/service/api_administrator';

export const get_saldo_iak = async () => {
  try {
    const response = await api.get('/beranda/get_saldo_iak');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil info saldo:', error);
    throw error;
  }
};

export const get_saldo_tripay = async () => {
  try {
    const response = await api.get('/beranda/get_saldo_tripay');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil info saldo:', error);
    throw error;
  }
};
