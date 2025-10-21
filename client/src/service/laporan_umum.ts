import api from "@/service/api_administrator"

export const list = async (tahun?: number, bulan?: number) => {
  try {
    const params: any = {};
    
    if (tahun) {
      params.tahun = tahun;
    }
    if (bulan) {
      params.bulan = bulan;
    }

    const response = await api.post("/laporan_umum/list", {}, {
      params: params
    })
    return response.data
  } catch (error) {
    console.error("Gagal mengambil laporan umum:", error)
    throw error
  }
}