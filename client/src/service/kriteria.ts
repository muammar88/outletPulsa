import api from '@/service/api_administrator';

export const get_kriteria = async (param: any) => {
  try {
    const response = await api.post('/kriteria/list', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil kriteria:', error);
    throw error;
  }
};

export const delete_kriteria = async (id: number) => {
  try {
    const response = await api.post(`/kriteria/delete`, { id: id });
    return response.data;
  } catch (error) {
    console.error('Gagal menghapus kriteria:', error);
    throw error;
  }
};
