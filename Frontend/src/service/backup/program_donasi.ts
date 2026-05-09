import api from '@/service/api_administrator'


export const list = async (param: any) => {
  try {
    const response = await api.post('/program_donasi/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal memperbarui pengaturan umum', error)
    throw error
  }
}


export const add_program = async (param: any) => {
  try {
    const response = await api.post('/program_donasi/add', param, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan program:', error)
    throw error
  }
}

export const delete_program = async (param: any) => {
  try {
    const response = await api.post('/program_donasi/delete', param )
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan program:', error)
    throw error
  }
}

export const tutup = async (param: any) => {
  try {
    const response = await api.post('/program_donasi/tutup', param )
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan program:', error)
    throw error
  }
}

export const add_donasi = async (param: any) => {
  try {
    const response = await api.post('/program_donasi/add_donasi', param)
    return response.data
  } catch (error) {
    console.error('Gagal membuat donasi:', error)
    throw error
  }
}

export const edit = async (param: any) => {
  try {
    const response = await api.post('/program_donasi/edit', param)
    return response.data
  } catch (error) {
    console.error('Gagal membuat donasi:', error)
    throw error
  }
}


export const detail = async (param: any) => {
  try {
    const response = await api.post('/program_donasi/detail', param)
    return response.data
  } catch (error) {
    console.error('Gagal membuat donasi:', error)
    throw error
  }
}



export const daftar_member = async () => {
  try {
    const response = await api.get('/program_donasi/daftar_member')
    return response.data
  } catch (error) {
    console.error('Gagal membuat donasi:', error)
    throw error
  }
}
