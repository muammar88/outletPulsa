import api from '@/service/api_administrator';

export const list = async (param: { search: string; perpage: number; pageNumber: number }) => {
  try {
    const response = await api.post('/member/list', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil info saldo:', error);
    throw error;
  }
};

export const deletes = async (param: { id: number }) => {
  try {
    const response = await api.post('/member/delete', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil info saldo:', error);
    throw error;
  }
};
