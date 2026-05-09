import api from '@/service/api_administrator'

export const get_beranda = async (param: any) => {
  try {
    const response = await api.post('/beranda/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil bank:', error)
    throw error
  }
}
