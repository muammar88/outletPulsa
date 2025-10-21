import api from '@/service/api_administrator'

export const list_daftar_pengguna = async (param: any) => {
  try {
    const response = await api.post('/daftar_pengguna/list', param)
    return response.data.data
  } catch (error) {
    console.error('Gagal mengambil pengguna:', error)
    throw error
  }
}

export const add_daftar_pengguna = async (param: any) => {
  try {
    const response = await api.post('/daftar_pengguna/add', param, {
    })
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan pengguna:', error)
    throw error
  }
}

export const get_info_edit_daftar_pengguna = async (id: number) => {
  try {
    const response = await api.post('/daftar_pengguna/pengguna_by_id', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi pengguna:', error)
    throw error
  }
}

export const edit_daftar_pengguna = async (param: any) => {
  try {
    const response = await api.post('/daftar_pengguna/update', param, {
    })
    return response.data
  } catch (error) {
    console.error('Gagal mengedit pengguna:', error)
    throw error
  }
}

export const delete_daftar_pengguna = async (id: number) => {
  try {
    const response = await api.post(`/daftar_pengguna/delete`, { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal menghapus pengguna:', error)
    throw error
  }
}

export const list_grup = async () => {
  try {
    const response = await api.get('/daftar_pengguna/list_grup')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil grup:', error)
    throw error
  }
}