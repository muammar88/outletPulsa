import api from '@/service/api_administrator';

export const get_info_Whatsapp_message = async (param: any) => {
  try {
    const response = await api.post('/riwayat_pesan_whatsapp/list', param);
    return response.data;
  } catch (error) {
    console.error('Gagal whatsapp number:', error);
    throw error;
  }
};

export const get_template_pesan_whatsapp = async (param: any) => {
  try {
    const response = await api.post('/riwayat_pesan_whatsapp/get_template_pesan_whatsapp', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil template pesan:', error);
    throw error;
  }
};

export const get_pesan_template_pesan_whatsapp = async (param: any) => {
  try {
    const response = await api.post(
      '/riwayat_pesan_whatsapp/get_pesan_template_pesan_whatsapp',
      param,
    );
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil template pesan:', error);
    throw error;
  }
};

export const kirim_pesan = async (param: any) => {
  try {
    const response = await api.post('/riwayat_pesan_whatsapp/kirim_pesan', param);
    return response.data;
  } catch (error) {
    console.error('Gagal:', error);
    throw error;
  }
};

export const delete_pesan_whatsapp = async (id: number) => {
  try {
    const response = await api.post('/riwayat_pesan_whatsapp/delete', { id: id });
    return response.data;
  } catch (error) {
    console.error('Gagal:', error);
    throw error;
  }
};
