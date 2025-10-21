import api from "@/service/api_administrator"

// fungsi named export

export const list_menu = async () => {
  try {
    const response = await api.get("/grup_akses/daftar_menu")
    return response.data
  } catch (error) {
    console.error("Gagal mengambil menu:", error)
    throw error
  }
}

export const list_menu_by_id = async (param: any) => {
  try {
    const response = await api.post('/grup_akses/list_menu_by_id', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil bank:', error)
    throw error
  }
}

export const list_grup = async (param: any) => {
  try {
    const response = await api.post('/grup_akses/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil bank:', error)
    throw error
  }
}

export const add_grup = async (param: any) => {
  try {
    const response = await api.post('/grup_akses/add', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil bank:', error)
    throw error
  }
}

export const edit_grup = async (param: any) => {
  try {
    const response = await api.post('/grup_akses/edit', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil bank:', error)
    throw error
  }
}

export const delete_grup = async (param: any) => {
  try {
    const response = await api.post('/grup_akses/delete', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil bank:', error)
    throw error
  }
}


