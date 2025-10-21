import api from '@/service/api_administrator';

export const logo = async () => {
  try {
    const response = await api.get('/image/logo');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar monev:', error);
    throw error;
  }
};
