import api from './api_administrator'

export const get_filter_type = async () => {
  try {
    const response = await api.get('/program_kegiatan_bantuan/get_filter_type')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil program kegiatan bantuan:', error)
    throw error
  }
}

export const get_daftar_kecamatan = async () => {
  try {
    const response = await api.get("/program_kegiatan_bantuan/daftar_kecamatan")
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keanggotaan:", error)
    throw error
  }
}

export const get_daftar_desa = async () => {
  try {
    const response = await api.get("/program_kegiatan_bantuan/daftar_desa")
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keanggotaan:", error)
    throw error
  }
}

export const get_program_bantuan = async (param: any) => {
  try {
    const response = await api.post('/program_kegiatan_bantuan/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil request program kegiatan bantuan:', error)
    throw error
  }
}

export const add_program_bantuan = async (param: any) => {
  try {
    const response = await api.post('/program_kegiatan_bantuan/add', param, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan program kegiatan bantuan:', error)
    throw error
  }
}

export const get_info_edit_program_bantuan = async (id: number) => {
  try {
    const response = await api.post('/program_kegiatan_bantuan/get_info_edit_program_bantuan', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengambil program kegiatan bantuan:', error)
    throw error
  }
}

export const edit_program_bantuan = async (param: any) => {
  try {
    const response = await api.post('/program_kegiatan_bantuan/edit', param, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error('Gagal mengedit program kegiatan bantuan:', error)
    throw error
  }
}

export const get_info_edit_status_program_bantuan = async (id: number) => {
  try {
    const response = await api.post('/program_kegiatan_bantuan/get_info_edit_status_program_bantuan', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengedit status program kegiatan bantuan:', error)
    throw error
  }
}

export const edit_status_program_bantuan = async (id: number) => {
  try {
    const response = await api.post('/program_kegiatan_bantuan/edit_status_program_bantuan', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengedit status program kegiatan bantuan:', error)
    throw error
  }
}

export const delete_program_bantuan = async (id: number) => {
  try {
    const response = await api.post('/program_kegiatan_bantuan/delete', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal menghapus program kegiatan bantuan:', error)
    throw error
  }
}

