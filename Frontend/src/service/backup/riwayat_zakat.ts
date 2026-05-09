import api from '@/service/api_administrator'


export const list_member = async () => {
  try {
    const response = await api.get('/riwayat_zakat/list_member')
    return response.data
  } catch (error) {
    console.error('Gagal memperbarui riwayat zakat', error)
    throw error
  }
}

export const list = async (param: any) => {
  try {
    const response = await api.post('/riwayat_zakat/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal memperbarui riwayat zakat', error)
    throw error
  }
}

export const add_riwayat_zakat = async (param: any) => {
  try {
    const response = await api.post('/riwayat_zakat/add', param)
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan riwayat:', error)
    throw error
  }
}

export const delete_riwayat_zakat = async (id: number) => {
  try {
    const response = await api.post('/riwayat_zakat/delete', { id: id } )
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan riwayat zakat:', error)
    throw error
  }
}

