import api_administrator from './api_administrator'
import axios from 'axios'

const api_public = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const getRunningText = async (param: any) => {
  try {
    const response = await api_administrator.post('/running_text/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil Running Text', error)
    throw error
  }
}

export const addRunningText = async (param: any) => {
  try {
    const response = await api_administrator.post('/running_text/add', param)
    return response.data
  } catch (error) {
    console.error('Gagal MENAMBAH Running Text:', error)
    throw error
  }
}

export const editRunningText = async (id: number, param: any) => {
  try {
    const response = await api_administrator.post('/running_text/edit', { id, ...param })
    return response.data
  } catch (error) {
    console.error(`Gagal MENGEDIT Running Text ID ${id}:`, error)
    throw error
  }
}

export const deleteRunningText = async (id: number) => {
  try {
    const response = await api_administrator.post('/running_text/delete', { id })
    return response.data
  } catch (error) {
    console.error(`Gagal MENGHAPUS Running Text ID ${id}:`, error)
    throw error
  }
}

export const toggleRunningTextStatus = async (id: number) => {
  try {
    const response = await api_administrator.post('/running_text/toggle', { id })
    return response.data
  } catch (error) {
    console.error(`Gagal mengubah status untuk ID ${id}`, error)
    throw error
  }
}

export const updateRunningTextOrder = async (order: number[]) => {
  try {
    const response = await api_administrator.post('/running_text/update-order', { order })
    return response.data
  } catch (error) {
    console.error('Gagal memperbarui urutan', error)
    throw error
  }
}

export const getActiveRunningText = async () => {
  try {
    const response = await api_public.get('/running_text/active')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil Running Text aktif:', error)
    throw error
  }
}