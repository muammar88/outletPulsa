import api from '@/service/api_administrator'

export const get_syarat = async (param: any) => {
  try {
    const response = await api.post('/syarat/list', param)
    return response.data.data
  } catch (error) {
    console.error('Gagal mengambil syarat:', error)
    throw error
  }
}

export const add_syarat = async (param: any) => {
  try {
    const response = await api.post('/syarat/add', param, {
    })
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan syarat:', error)
    throw error
  }
}

export const get_info_edit_syarat = async (id: number) => {
  try {
    const response = await api.post('/syarat/syarat_by_id', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi syarat:', error)
    throw error
  }
}

export const edit_syarat = async (param: any) => {
  try {
    const response = await api.post('/syarat/update', param, {
    })
    return response.data
  } catch (error) {
    console.error('Gagal mengedit syarat:', error)
    throw error
  }
}

export const delete_syarat = async (id: number) => {
  try {
    const response = await api.post(`/syarat/delete`, { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal menghapus syarat:', error)
    throw error
  }
}
