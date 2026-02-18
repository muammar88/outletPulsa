import api from './api_administrator';

export const get_filter_type = async () => {
  try {
    const response = await api.get('/validasi_permohonan_bantuan/get_filter_type');
    return response.data;
  } catch (error) {
    console.error('Error fetching filter type:', error);
    throw error;
  }
};

export const get_validasi_permohonan_bantuan = async (param: any) => {
  try {
    const response = await api.post('/validasi_permohonan_bantuan/list', param);
    return response.data;
  } catch (error) {
    console.error('Error fetching permohonan bantuan:', error);
    throw error;
  }
};

export const get_info_edit_file = async (param: any) => {
  try {
    const response = await api.post('/validasi_permohonan_bantuan/get_info_edit_file', param);
    return response.data;
  } catch (error) {
    console.error('Error fetching permohonan bantuan:', error);
    throw error;
  }
};

export const edit_file = async (param: any) => {
  try {
    const response = await api.post('/validasi_permohonan_bantuan/edit_file', param, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error editing permohonan bantuan:', error);
    throw error;
  }
};

export const approve_berkas = async (param: any) => {
  try {
    const response = await api.post('/validasi_permohonan_bantuan/approve_berkas', param);
    return response.data;
  } catch (error) {
    console.error('Error editing permohonan bantuan:', error);
    throw error;
  }
};

export const reject_berkas = async (param: any) => {
  try {
    const response = await api.post('/validasi_permohonan_bantuan/reject_berkas', param);
    return response.data;
  } catch (error) {
    console.error('Error editing permohonan bantuan:', error);
    throw error;
  }
};

export const get_info_pemberitahuan = async (id: number) => {
  try {
    console.log(id);
    const response = await api.post('/validasi_permohonan_bantuan/get_info_pemberitahuan', {
      id: id,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching permohonan bantuan:', error);
    throw error;
  }
};

export const pemberitahuan = async (param: any) => {
  try {
    const response = await api.post('/validasi_permohonan_bantuan/pemberitahuan', param);
    return response.data;
  } catch (error) {
    console.error('Error editing permohonan bantuan:', error);
    throw error;
  }
};

export const get_info_approve_permohonan = async (id: number) => {
  try {
    const response = await api.post('/validasi_permohonan_bantuan/get_info_approve_permohonan', {
      id: id,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching permohonan bantuan:', error);
    throw error;
  }
};

export const approve_permohonan = async (param: any) => {
  try {
    const response = await api.post('/validasi_permohonan_bantuan/approve_permohonan', param);
    return response.data;
  } catch (error) {
    console.error('Error editing permohonan bantuan:', error);
    throw error;
  }
};

export const get_info_reject_permohonan = async (id: number) => {
  try {
    const response = await api.post('/validasi_permohonan_bantuan/get_info_reject_permohonan', {
      id: id,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching permohonan bantuan:', error);
    throw error;
  }
};

export const reject_permohonan = async (param: any) => {
  try {
    const response = await api.post('/validasi_permohonan_bantuan/reject_permohonan', param);
    return response.data;
  } catch (error) {
    console.error('Error editing permohonan bantuan:', error);
    throw error;
  }
};
