import api from '@/service/api_administrator'

export const get_tab = async (param: any) => {
  try {
    const response = await api.post('/tab/list', param)
    return response.data.data
  } catch (error) {
    console.error('Gagal mengambil tab:', error)
    throw error
  }
}

export const get_info_edit_tab = async (id: number) => {
  try {
    const response = await api.post('/tab/tab_by_id', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi tab:', error)
    throw error
  }
}

export const edit_tab = async (param: any) => {
  try {
    const response = await api.post('/tab/update', param, {
    })
    return response.data
  } catch (error) {
    console.error('Gagal mengedit tab:', error)
    throw error
  }
}

