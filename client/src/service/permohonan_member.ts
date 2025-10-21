import api from './api_member'

export const get_desc = async (param : any) => {
  try {
    const response = await api.post('/permohonan_member/desc', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error)
    throw error
  }
}

export const get_syarat = async (param : any) => {
  try {
    const response = await api.post('/permohonan_member/syarat', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error)
    throw error
  }
}

export const get_kriteria = async (param : any) => {
  try {
    const response = await api.post('/permohonan_member/kriteria', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error)
    throw error
  }
}

export const get_info = async (param : any) => {
  try {
    const response = await api.post('/permohonan_member/info', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error)
    throw error
  }
}

export const get_lokasi = async (param : any) => {
  try {
    const response = await api.post('/permohonan_member/lokasi', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error)
    throw error
  }
}

export const get_info_member = async () => {
  try {
    const response = await api.get('/permohonan_member/info_member')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error)
    throw error
  }
}

export const daftar_bank = async () => {
  try {
    const response = await api.get('/permohonan_member/list_bank')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil Daftar Bank', error)
    throw error
  }
}

export const add_permohonan = async (param: any) => {
  try {
    const response = await api.post('/permohonan_member/add', param, {
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