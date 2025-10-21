import api from '@/service/api_administrator'

export const get_member = async () => {
  try {
    const response = await api.get('/riwayat_infaq/list_member')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil member:', error)
    throw error
  }
}

export const get_riwayat_infaq = async (param: any) => {
  try {
    const response = await api.post('/riwayat_infaq/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil riwayat infaq:', error)
    throw error
  }
}

export const add_riwayat_infaq = async (param: any) => {
  try {
    const response = await api.post('/riwayat_infaq/add', param)
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan riwayat infaq:', error)
    throw error
  }
}

export const delete_riwayat_infaq = async (id: number) => {
  try {
    const response = await api.post(`/riwayat_infaq/delete`, { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal menghapus riwayat infaq:', error)
    throw error
  }
}
