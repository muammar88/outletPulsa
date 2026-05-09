import api from '@/service/api_administrator'

export const get_daftar_asnaf = async (param: any) => {
  try {
    const response = await api.post('/daftar_asnaf/list', param)
    return response.data.data
  } catch (error) {
    console.error('Gagal mengambil asnaf:', error)
    throw error
  }
}

export const add_daftar_asnaf = async (param: any) => {
  try {
    const response = await api.post('/daftar_asnaf/add', param, {
    })
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan asnaf:', error)
    throw error
  }
}

export const get_info_edit_daftar_asnaf = async (id: number) => {
  try {
    const response = await api.post('/daftar_asnaf/asnaf_by_id', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi asnaf:', error)
    throw error
  }
}

export const edit_daftar_asnaf = async (param: any) => {
  try {
    const response = await api.post('/daftar_asnaf/update', param, {
    })
    return response.data
  } catch (error) {
    console.error('Gagal mengedit asnaf:', error)
    throw error
  }
}

export const delete_daftar_asnaf = async (id: number) => {
  try {
    const response = await api.post(`/daftar_asnaf/delete`, { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal menghapus asnaf:', error)
    throw error
  }
}
