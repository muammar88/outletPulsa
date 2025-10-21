import api_administrator from './api_administrator'

export const get_laporan_pengumpulan = async (param : any) => {
  try {
    const response = await api_administrator.post('/laporan_pengumpulan/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi laporan', error)
    throw error
  }
}
