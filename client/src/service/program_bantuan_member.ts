import api from '@/service/api_member';

export const get_laporan = async (param: any) => {
  try {
    const response = await api.post('/program_bantuan_member/list', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil info edit pertanyaan:', error);
    throw error;
  }
};

export const list_program = async (param: any) => {
  try {
    const response = await api.post('/program_bantuan_member/list_program', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil info edit pertanyaan:', error);
    throw error;
  }
};
