import api from '@/service/api_administrator'

export const get_daftar_program = async (param: any) => {
  try {
    const response = await api.post('/daftar_program/list', param)
    return response.data.data
  } catch (error) {
    console.error('Gagal mengambil program:', error)
    throw error
  }
}

export const add_daftar_program = async (param: any) => {
  try {
    const response = await api.post('/daftar_program/add', param, {
    })
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan program:', error)
    throw error
  }
}

export const get_info_edit_daftar_program = async (id: number) => {
  try {
    const response = await api.post('/daftar_program/program_by_id', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi program:', error)
    throw error
  }
}

export const edit_daftar_program = async (param: any) => {
  try {
    const response = await api.post('/daftar_program/update', param, {
    })
    return response.data
  } catch (error) {
    console.error('Gagal mengedit program:', error)
    throw error
  }
}

export const delete_daftar_program = async (id: number) => {
  try {
    const response = await api.post(`/daftar_program/delete`, { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal menghapus program:', error)
    throw error
  }
}
