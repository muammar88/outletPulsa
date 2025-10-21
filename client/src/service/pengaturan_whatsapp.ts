import api from './api_administrator'

export const list = async () => {
  try {
    const response = await api.get('/pengaturan_whatsapp/list')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error)
    throw error
  }
}


export const start = async () => {
  try {
    const response = await api.get('/pengaturan_whatsapp/start')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error)
    throw error
  }
}

export const get_konfigurasi = async () => {
  try {
    const response = await api.get('/pengaturan_whatsapp/get_konfigurasi')
    return response.data
  } catch (error) {
    console.error('Gagal memperbarui pengaturan umum', error)
    throw error
  }
}

export const update_konfigurasi = async (param: any) => {
    try {
        const response = await api.post('/pengaturan_whatsapp/update', param)
        return response.data
    } catch (error) {
        console.error("Error add surveyor", error);
        throw error
    }
}
