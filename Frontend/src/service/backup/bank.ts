import api from '@/service/api_administrator'

export const get_bank = async (param: any) => {
  try {
    const response = await api.post('/bank/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil bank:', error)
    throw error
  }
}

export const add_bank = async (param: any) => {
  try {
    const response = await api.post('/bank/add', param, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan bank:', error)
    throw error
  }
}

export const get_info_edit_bank = async (id: number) => {
  try {
    const response = await api.post('/bank/get_info_edit_bank', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi bank:', error)
    throw error
  }
}

export const edit_bank = async (param: any) => {
  try {
    const response = await api.post(`/bank/edit`, param,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error('Gagal mengedit bank:', error)
    throw error
  }
}

export const delete_bank = async (id: number) => {
  try {
    const response = await api.post(`/bank/delete`, { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal menghapus bank:', error)
    throw error
  }
}

