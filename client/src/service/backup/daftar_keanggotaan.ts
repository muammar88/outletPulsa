import api from "@/service/api_administrator"

export const get_daftar_kecamatan = async () => {
  try {
    const response = await api.get("/daftar_keanggotaan/daftar_kecamatan")
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keanggotaan:", error)
    throw error
  }
}
export const get_daftar_desa = async (id: number) => {
  try {
    const response = await api.post("/daftar_keanggotaan/daftar_desa", { kecamatan_id: id })
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keanggotaan:", error)
    throw error
  }
}

export const get_daftar_keanggotaan = async (param: any) => {
  try {
    const response = await api.post("/daftar_keanggotaan/list", param)
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keanggotaan:", error)
    throw error
  }
}

export const add_keanggotaan = async (param: any) => {
  try {
    const response = await api.post("/daftar_keanggotaan/add", param)
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keanggotaan:", error)
    throw error
  }
}

export const get_info_edit_keanggotaan = async (id: number) => {
  try {
    const response = await api.post('/daftar_keanggotaan/get_info_edit_keanggotaan', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal mengambil informasi bank:', error)
    throw error
  }
}

export const edit_keanggotaan = async (param: any) => {
  try {
    const response = await api.post("/daftar_keanggotaan/edit", param)
    return response.data
  } catch (error) {
    console.error("Gagal memperbaharui keanggotaan:", error)
    throw error
  }
}

export const delete_keanggotaan = async (id: number) => {
  try {
    const response = await api.post("/daftar_keanggotaan/delete", { id: id })
    return response.data
  } catch (error) {
    console.error("Gagal menghapus keanggotaan:", error)
    throw error
  }
}
