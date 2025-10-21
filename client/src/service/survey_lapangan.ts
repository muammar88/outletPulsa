import api from '@/service/api_member';

export const getInfo = async (param: any) => {
  try {
    const response = await api.post('/survey_lapangan/info', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error);
    throw error;
  }
};

export const getInfoMember = async (params: any) => {
  try {
    const response = await api.post('/survey_lapangan/info_member', params);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error);
    throw error;
  }
};

export const submitSurvey = async (params: any) => {
  try {
    const response = await api.post('/survey_lapangan/submit', params, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error);
    throw error;
  }
};
