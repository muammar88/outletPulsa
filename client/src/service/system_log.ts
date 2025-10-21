import api from "@/service/api_administrator"

// fungsi named export
export const list = async (param: any) => {
  try {
    const response = await api.post("/system_log/list", {
      ...param,
    })
    return response.data
  } catch (error) {
    console.error("Gagal mengambil request keanggotaan:", error)
    throw error
  }
}

