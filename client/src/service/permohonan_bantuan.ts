import api from './api_administrator';

export const get_filter_type = async () => {
  try {
    const response = await api.get('/permohonan_bantuan/get_filter_type');
    return response.data;
  } catch (error) {
    console.error('Error fetching filter type:', error);
    throw error;
  }
};

export const get_list_kegiatan = async () => {
  try {
    const response = await api.get('/permohonan_bantuan/list_kegiatan');
    return response.data;
  } catch (error) {
    console.error('Error fetching kegiatan list:', error);
    throw error;
  }
};

export const get_list_member = async () => {
  try {
    const response = await api.get('/permohonan_bantuan/list_member');
    return response.data;
  } catch (error) {
    console.error('Error fetching member list:', error);
    throw error;
  }
};

export const get_list_bank = async () => {
  try {
    const response = await api.get('/permohonan_bantuan/list_bank');
    return response.data;
  } catch (error) {
    console.error('Error fetching bank list:', error);
    throw error;
  }
};

export const get_list_syarat = async (id: number) => {
  try {
    const response = await api.post('/permohonan_bantuan/list_kriteria_syarat', {
      kegiatan_id: id,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching syarat list:', error);
    throw error;
  }
};

export const get_permohonan_bantuan = async (param: any) => {
  try {
    const response = await api.post('/permohonan_bantuan/list', param);
    return response.data;
  } catch (error) {
    console.error('Error fetching permohonan bantuan:', error);
    throw error;
  }
};

export const add_permohonan_bantuan = async (param: any) => {
  try {
    const response = await api.post('/permohonan_bantuan/add', param, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding permohonan bantuan:', error);
    throw error;
  }
};

export const get_info_edit_permohonan_bantuan = async (id: number) => {
  try {
    const response = await api.post('/permohonan_bantuan/get_info_edit_permohonan_bantuan', {
      id: id,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching permohonan bantuan:', error);
    throw error;
  }
};

export const edit_permohonan_bantuan = async (param: any) => {
  try {
    const response = await api.post('/permohonan_bantuan/edit', param, {
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

export const edit_status_permohonan_bantuan = async (param: any) => {
  try {
    const response = await api.post('/permohonan_bantuan/edit_status', param);
    return response.data;
  } catch (error) {
    console.error('Error editing status permohonan bantuan:', error);
    throw error;
  }
};

export const delete_permohonan_bantuan = async (id: number) => {
  try {
    const response = await api.post('/permohonan_bantuan/delete', { id: id });
    return response.data;
  } catch (error) {
    console.error('Error deleting permohonan bantuan:', error);
    throw error;
  }
};
