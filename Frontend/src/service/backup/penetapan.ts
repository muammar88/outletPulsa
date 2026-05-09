import api from '@/service/api_administrator'


export const get_program_bantuan = async (param: any) => {
  try {
    const response = await api.post('/penetapan/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil request program kegiatan bantuan:', error)
    throw error
  }
}


export const get_filter_type = async () => {
  try {
    const response = await api.get('/penetapan/get_filter_type')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil program kegiatan bantuan:', error)
    throw error
  }
}


export const daftar_syarat = async () => {
  try {
    const response = await api.get('/penetapan/daftar_syarat')
    return response.data
  } catch (error) {
    console.error('Gagal ambil data syarat:', error)
    throw error
  }
}

export const detail_syarat = async (param: any) => {
  try {
    const response = await api.post('/penetapan/detail_syarat', param)
    return response.data
  } catch (error) {
    console.error('Gagal ambil data syarat:', error)
    throw error
  }
}

export const add_syarat = async (param: any) => {
  try {
    const response = await api.post('/penetapan/add_syarat', param)
    return response.data
  } catch (error) {
    console.error('Gagal ambil data syarat:', error)
    throw error
  }
}

export const detail_kriteria = async (param: any) => {
  try {
    const response = await api.post('/penetapan/detail_kriteria', param)
    return response.data
  } catch (error) {
    console.error('Gagal ambil data syarat:', error)
    throw error
  }
}


export const add_kriteria = async (param: any) => {
  try {
    const response = await api.post('/penetapan/add_kriteria', param)
    return response.data
  } catch (error) {
    console.error('Gagal ambil data syarat:', error)
    throw error
  }
}

export const daftar_surveyor = async () => {
  try {
    const response = await api.get('/penetapan/daftar_surveyor')
    return response.data
  } catch (error) {
    console.error('Gagal ambil data surveyor:', error)
    throw error
  }
}

export const detail_surveyor = async (param: any) => {
  try {
    const response = await api.post('/penetapan/detail_surveyor', param)
    return response.data
  } catch (error) {
    console.error('Gagal ambil data surveyor:', error)
    throw error
  }
}


export const add_surveyor = async (param: any) => {
  try {
    const response = await api.post('/penetapan/add_surveyor', param, {
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

export const send_pesan = async (param: any) => {
  try {
    const response = await api.post('/penetapan/send_pesan', param)
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan program:', error)
    throw error
  }
}