// import api from '@/service/api_administrator'

// export const get_kecamatan = async () => {
//   try {
//     const response = await api.get('/desa/kecamatan_list')
//     return response.data
//   } catch (error) {
//     console.error('Gagal mengambil kecamatan:', error)
//     throw error
//   }
// }


// export const get_desa = async (param: any = {}) => {
//   try {
//     const response = await api.post('/desa/list', param)
//     return response.data
//   } catch (error) {
//     console.error('Gagal mengambil desa:', error)
//     throw error
//   }
// }

// export const add_desa = async (param: any) => {
//   try {
//     const response = await api.post('/desa/add', param)
//     return response.data
//   } catch (error) {
//     console.error('Gagal menambahkan desa:', error)
//     throw error
//   }
// }

// export const get_info_edit_desa = async (id: number) => {
//   try {
//     const response = await api.post('/desa/get_info_edit_desa', { id: id })
//     return response.data
//   } catch (error) {
//     console.error('Gagal mengambil informasi desa:', error)
//     throw error
//   }
// }

// export const edit_desa = async (param: any) => {
//   try {
//     const response = await api.post(`/desa/edit`, param)
//     return response.data
//   } catch (error) {
//     console.error('Gagal mengedit desa:', error)
//     throw error
//   }
// }

// export const delete_desa = async (id: number) => {
//   try {
//     const response = await api.post(`/desa/delete`, { id: id })
//     return response.data
//   } catch (error) {
//     console.error('Gagal menghapus desa:', error)
//     throw error
//   }
// }


import api from '@/service/api_administrator'

export const get_kecamatan = async () => {
  try {
    const response = await api.get('/desa/kecamatan_list')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil kecamatan:', error)
    throw error
  }
}

export const get_desa = async (param: any = { perpage: 10, pageNumber: 1, search: "" }) => {
  try {
    const response = await api.post('/desa/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil desa:', error)
    throw error
  }
}

export const add_desa = async (param: any) => {
  try {
    const response = await api.post('/desa/add', param)
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan desa:', error)
    throw error
  }
}

export const get_info_edit_desa = async (id: number) => {
  try {
    const response = await api.post('/desa/get_info_edit_desa', { id })
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi desa:', error)
    throw error
  }
}

export const edit_desa = async (param: any) => {
  try {
    const response = await api.post('/desa/edit', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengedit desa:', error)
    throw error
  }
}

export const delete_desa = async (id: number) => {
  try {
    const response = await api.post('/desa/delete', { id })
    return response.data
  } catch (error) {
    console.error('Gagal menghapus desa:', error)
    throw error
  }
}
