import api from '@/service/api_administrator';

// Ambil semua template pesan whatsapp
export const get_template_pesan_whatsapp = async (param: any) => {
  try {
    const response = await api.post('/template_pesan_whatsapp/list', param);
    return response.data?.data || []; // default [] biar gak error
  } catch (error) {
    console.error('Gagal mengambil template pesan whatsapp:', error);
    return [];
  }
};

// Tambah template pesan whatsapp
export const add_template_pesan_whatsapp = async (param: any) => {
  try {
    const response = await api.post('/template_pesan_whatsapp/add', param);
    return response.data;
  } catch (error) {
    console.error('Gagal menambahkan template pesan whatsapp:', error);
    throw error;
  }
};

// Ambil detail template pesan whatsapp berdasarkan id
export const get_info_edit_template_pesan_whatsapp = async (id: number) => {
  try {
    const response = await api.post('/template_pesan_whatsapp/template_pesan_whatsapp_by_id', {
      id,
    });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil informasi template pesan whatsapp:', error);
    return null;
  }
};

// Edit template pesan whatsapp
export const edit_template_pesan_whatsapp = async (param: any) => {
  try {
    const response = await api.post('/template_pesan_whatsapp/update', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengedit template pesan whatsapp:', error);
    throw error;
  }
};

// Hapus template pesan whatsapp
export const delete_template_pesan_whatsapp = async (id: number) => {
  try {
    const response = await api.post('/template_pesan_whatsapp/delete', { id });
    return response.data;
  } catch (error) {
    console.error('Gagal menghapus template pesan whatsapp:', error);
    throw error;
  }
};
