import api from '@/service/api_administrator';

export const get_info_edit = async (id: number) => {
  try {
    const response = await api.post('/pertanyaan-monev/get-info-edit', { id });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil info edit pertanyaan:', error);
    throw error;
  }
};

export const getJenisMonevList = async () => {
  try {
    const response = await api.get('/pertanyaan-monev/get-jenis');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil list jenis monev:', error);
    throw error;
  }
};

export const getUrutanBagian = async (jenis_monev: string) => {
  try {
    const response = await api.get('/pertanyaan-monev/get-urutan-bagian', {
      params: { jenis_monev },
    });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil urutan bagian:', error);
    throw error;
  }
};

export const pertanyaan_monev_list = async (param: any) => {
  try {
    const response = await api.post('/pertanyaan-monev/list', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil pertanyaan monev:', error);
    throw error;
  }
};

export const create_pertanyaan = async (data: any) => {
  try {
    const response = await api.post('/pertanyaan-monev/create', data);
    return response.data;
  } catch (error) {
    console.error('Gagal membuat pertanyaan:', error);
    throw error;
  }
};

export const update_pertanyaan = async (data: any) => {
  try {
    const response = await api.post('/pertanyaan-monev/update', data);
    return response.data;
  } catch (error) {
    console.error('Gagal memperbarui pertanyaan:', error);
    throw error;
  }
};

export const delete_pertanyaan = async (id: number) => {
  try {
    const response = await api.post('/pertanyaan-monev/delete', { id });
    return response.data;
  } catch (error) {
    console.error('Gagal menghapus pertanyaan:', error);
    throw error;
  }
};
