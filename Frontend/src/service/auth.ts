import api from '@/service/api_administrator'
import api_member from '@/service/api_member'

export const login_administrator = async (payload: any) => {
  try {
    const response = await api.post('/administrator/auth', payload)
    return response
  } catch (error) {
    console.error('Gagal login administrator:', error)
    throw error
  }
}

export const verify_2fa = async (payload: { tempToken: string; otpCode: string }) => {
  try {
    const response = await api.post('/administrator/auth/verify-2fa', payload)
    return response
  } catch (error) {
    console.error('Gagal verifikasi 2FA:', error)
    throw error
  }
}

export const get_2fa_status = async () => {
  try {
    const response = await api.get('/administrator/auth/2fa-status')
    return response.data.data
  } catch (error) {
    console.error('Gagal get 2FA status:', error)
    throw error
  }
}

export const setup_2fa = async () => {
  try {
    const response = await api.post('/administrator/auth/setup-2fa')
    return response.data.data
  } catch (error) {
    console.error('Gagal setup 2FA:', error)
    throw error
  }
}

export const enable_2fa = async (payload: { otpCode: string }) => {
  try {
    const response = await api.post('/administrator/auth/enable-2fa', payload)
    return response.data.data
  } catch (error) {
    console.error('Gagal enable 2FA:', error)
    throw error
  }
}

export const disable_2fa = async (payload: { password: string }) => {
  try {
    const response = await api.post('/administrator/auth/disable-2fa', payload)
    return response.data.data
  } catch (error) {
    console.error('Gagal disable 2FA:', error)
    throw error
  }
}

export const get_info_edit_profile = async () => {
  try {
    const response = await api.get('/auth/administrator/get_info_edit_profile')
    return response.data
  } catch (error) {
    console.error('Gagal edit profile:', error)
    throw error
  }
}

export const get_info_edit_profile_member = async () => {
  try {
    const response = await api_member.get('/auth/member/get_info_edit_profile_member')
    return response.data
  } catch (error) {
    console.error('Gagal edit profile:', error)
    throw error
  }
}

export const edit_profile = async (param: any) => {
  try {
    const response = await api.post('/auth/administrator/edit_profile', param)
    return response.data
  } catch (error) {
    console.error('Gagal edit profile:', error)
    throw error
  }
}

export const edit_profile_member = async (param: any) => {
  try {
    console.log(param)
    const response = await api_member.post('/auth/member/edit_profile_member', param)
    return response.data
  } catch (error) {
    console.error('Gagal edit profile:', error)
    throw error
  }
}

export const logout_administrator = async (param: any) => {
  try {
    const response = await api.post('/auth/administrator/logout', param)
    return response.data
  } catch (error) {
    console.error('Gagal logout:', error)
    throw error
  }
}
