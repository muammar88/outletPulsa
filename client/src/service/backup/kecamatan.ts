import api from '@/service/api_administrator'

export const get_kecamatan = async (param: any) => {
  try {
    const response = await api.post('/kecamatan/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil kecamatan:', error)
    throw error
  }
}

export const add_kecamatan = async (param: any) => {
  try {
    const response = await api.post('/kecamatan/add', param)
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan kecamatan:', error)
    throw error
  }
}

export const get_info_edit_kecamatan = async (id: number) => {
  try {
    const response = await api.post('/kecamatan/get_info_edit_kecamatan', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi kecamatan:', error)
    throw error
  }
}

export const edit_kecamatan = async (param: any) => {
  try {
    const response = await api.post(`/kecamatan/edit`, param)
    return response.data
  } catch (error) {
    console.error('Gagal mengedit kecamatan:', error)
    throw error
  }
}

export const delete_kecamatan = async (id: number) => {
  try {
    const response = await api.post(`/kecamatan/delete`, { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal menghapus kecamatan:', error)
    throw error
  }
}

