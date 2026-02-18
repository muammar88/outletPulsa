import api from '@/service/api_administrator';

export const list = async (param: any) => {
  try {
    const response = await api.post('/target_pengumpulan/list', param);
    return response.data;
  } catch (error: any) {
    console.error('Gagal mengambil target pengumpulan:', error);
    throw error;
  }
};

export const add = async (param: any) => {
  try {
    const response = await api.post('/target_pengumpulan/add', param);
    return response.data;
  } catch (error: any) {
    console.error('Gagal menambahkan target pengumpulan:', error);
    throw error;
  }
};

export const detail = async (param: any) => {
  try {
    const response = await api.post('/target_pengumpulan/detail', param);
    return response.data;
  } catch (error: any) {
    console.error('Gagal mengambil info target pengumpulan:', error);
    throw error;
  }
};

export const edit = async (param: any) => {
  try {
    const response = await api.post('/target_pengumpulan/edit', param);
    return response.data;
  } catch (error: any) {
    console.error('Gagal mengupdate target pengumpulan:', error);
    throw error;
  }
};

export const delete_target = async (param: any) => {
  try {
    const response = await api.post('/target_pengumpulan/delete', param);
    return response.data;
  } catch (error: any) {
    console.error('Gagal menghapus target pengumpulan:', error);
    throw error;
  }
};
