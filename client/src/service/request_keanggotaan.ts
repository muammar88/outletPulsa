import api from "@/service/api_administrator"

// fungsi named export
export const list = async (param: any) => {
  try {
    const response = await api.post("/request_keanggotaan/list", {
      ...param,
    })
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keanggotaan:", error)
    throw error
  }
}

export const verifikasi = async (param: any) => {
  try {
    const response = await api.post("/request_keanggotaan/verifikasi", {
      ...param,
    })
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keanggotaan:", error)
    throw error
  }
}

// export object sebagai default (ngumpulin semua fungsi)
const requestKeanggotaanService = {
  list,
  verifikasi,
}

export default requestKeanggotaanService
