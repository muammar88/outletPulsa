import api_administrator from './api_administrator'

export const get_info_pengaturan_umum = async () => {
  try {
    const response = await api_administrator.get('/pengaturan_umum/get_info_pengaturan_umum')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi pengaturan', error)
    throw error
  }
}

export const edit_pengaturan_umum = async (formData: FormData) => {
  try {
    const response = await api_administrator.post('/pengaturan_umum/edit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Gagal memperbarui pengaturan umum', error)
    throw error
  }
}
