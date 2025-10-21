import api from '@/service/api_administrator'


export const list = async (param: any) => {
  try {
    const response = await api.post('/target_distribusi/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil data target:', error)
     throw error
  }
}

export const add_target = async (param: any) => {
  try {
    const response = await api.post('/target_distribusi/add', param)
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan target:', error)
    throw error
  }
}

export const update_target = async (param: any) => {
  try {
    const response = await api.post('/target_distribusi/update', param)
    return response.data
  } catch (error) {
    console.error('Gagal update target:', error)
    throw error
  }
}

export const detail = async (param: any) => {
  try {
    const response = await api.post('/target_distribusi/detail', param)
    return response.data
  } catch (error) {
    console.error('Gagal ambil detail target:', error)
    throw error
  }
}


export const daftar_asnaf = async() => {
    try {
        const response = await api.get('/target_distribusi/list_asnaf')
        return response.data
    } catch (error) {
        console.error('Gagal ambil daftar asnaf:', error)
        throw error
    }
}

export const delete_target = async (param: any) => {
  try {
    const response = await api.post('/target_distribusi/delete', param)
    return response.data
  } catch (error) {
    console.error('Gagal menghapus target:', error)
    throw error
  }
}