import api_administrator from './api_administrator'

export const get_laporan_perencanaan = async (param : any) => {
  try {
    const response = await api_administrator.post('/laporan_perencanaan/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi laporan', error)
    throw error
  }
}
