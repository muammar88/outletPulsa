import api_administrator from './api_administrator'

export const getBankPengumpulan = async (params: any) => {
  try {
    const response = await api_administrator.post('/daftar_bank_pengumpulan/list', params)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil Data', error)
    throw error
  }
}

export const getBank = async () => {
  try {
    const response = await api_administrator.get('/daftar_bank/list')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil Daftar Bank', error)
    throw error
  }
}

export const addBankPengumpulan = async (param: any) => {
  try {
    const response = await api_administrator.post('/bank_pengumpulan/add', param)
    return response.data
  } catch (error) {
    console.error('Gagal MENAMBAH Bank Pengumpulan:', error)
    throw error
  }
}

export const updateBankPengumpulan = async (id: number, param: any) => {
  try {
    const response = await api_administrator.post('/bank_pengumpulan/edit', { id, ...param })
    return response.data
  } catch (error) {
    console.error(`Gagal MENGUBAH Bank Pengumpulan dengan ID: ${id}`, error)
    throw error
  }
}

export const deleteBankPengumpulan = async (id: number) => {
  try {
    const response = await api_administrator.post('/bank_pengumpulan/delete', { id })
    return response.data
  } catch (error) {
    console.error(`Gagal MENGHAPUS Bank Pengumpulan dengan ID: ${id}`, error)
    throw error
  }
}
