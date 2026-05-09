import api from "@/service/api_administrator"

export const list = async (param: any) => {
  try {
    const response = await api.post("/system_log_surveyor/list", param)
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keanggotaan:", error)
    throw error
  }
}
