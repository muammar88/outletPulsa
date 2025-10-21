import api from '@/service/api_administrator';

export const get_filter_type = async () => {
  try {
    const response = await api.get('/monev/get_filter_type');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar monev:', error);
    throw error;
  }
};

export const monev_list = async (param: any) => {
  try {
    const response = await api.post('/monev/list', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar monev:', error);
    throw error;
  }
};

export const pertanyaan = async (param: any) => {
  try {
    const response = await api.post('/monev/pertanyaan', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar monev:', error);
    throw error;
  }
};

export const kirim_jawaban = async (param: any) => {
  try {
    const response = await api.post('/monev/kirim_jawaban', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengirim jawaban evaluasi:', error);
    throw error;
  }
};
