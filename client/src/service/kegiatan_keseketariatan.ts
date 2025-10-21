import api from "@/service/api_administrator"

// fungsi named export
export const list = async (param: any) => {
  try {
    const response = await api.post("/kegiatan_kesekretariatan/list", {
      ...param,
    })
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keseketariatan:", error)
    throw error
  }
}

export const add = async (param: any) => {
  try {
    const response = await api.post("/kegiatan_kesekretariatan/add", {
      ...param,
    })
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keseketariatan:", error)
    throw error
  }
}

export const list_desa = async (param: any) => {
  try {
    const response = await api.post("/kegiatan_kesekretariatan/daftar_desa", param)
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request desa:", error)
    throw error
  }
}

export const list_kecamatan = async (param: any) => {
  try {
    const response = await api.get("/kegiatan_kesekretariatan/daftar_kecamatan")
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request kecamatan:", error)
    throw error
  }
}