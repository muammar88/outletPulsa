import api from "@/service/api_administrator"

export const list = async (params?: { year?: number }) => {
  try {
    const response = await api.get("/rekap_pengumpulan_per_kecamatan/list", {
      params, // ⬅️ kirim query param ke backend
    })
    return response.data
  } catch (error) {
    console.error("Gagal mengambil rekap pengumpulan per kecamatan:", error)
    throw error
  }
}
