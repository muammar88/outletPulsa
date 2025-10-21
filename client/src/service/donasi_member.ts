import api from '@/service/api_member';

export const daftar_donasi = async (param: any) => {
  try {
    const response = await api.post('/donasi_member/list', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil donasi:', error);
    throw error;
  }
};

export const kode_pembayaran = async () => {
  try {
    const response = await api.get('/donasi_member/kode_pembayaran');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil profil member:', error);
    throw error;
  }
};

export const detail_donasi = async (param: any) => {
  try {
    const response = await api.post('/donasi_member/detail_donasi', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil donasi:', error);
    throw error;
  }
};

export const daftar_donatur = async (param: any) => {
  try {
    const response = await api.post('/donasi_member/daftar_donatur', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar donatur:', error);
    throw error;
  }
};

export const detail_donatur = async (param: any) => {
  try {
    const response = await api.post('/donasi_member/detail', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil detail donasi:', error);
    throw error;
  }
};

export const add = async (param: any) => {
  try {
    const response = await api.post('/donasi_member/add', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil detail donasi:', error);
    throw error;
  }
};

export const konfirmasi = async (param: any) => {
  try {
    const response = await api.post('/donasi_member/get_konfirmasi', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil detail donasi:', error);
    throw error;
  }
};

export const update_konfirmasi = async (param: any) => {
  try {
    const response = await api.post('/donasi_member/update_konfirmasi', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil detail donasi:', error);
    throw error;
  }
};

export const konfirmasi_detail = async (param: any) => {
  try {
    const response = await api.post('/donasi_member/konfirmasi_detail', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil detail donasi:', error);
    throw error;
  }
};

export const riwayat_detail = async (param: any) => {
  try {
    const response = await api.post('/donasi_member/detail_riwayat', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil detail donasi:', error);
    throw error;
  }
};

export const riwayat_donasi_user = async (param: any) => {
  try {
    const response = await api.post('/donasi_member/riwayat_donasi_user', param);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil detail donasi:', error);
    throw error;
  }
};

export const getMemberProfile = async () => {
  try {
    const response = await api.get('/donasi_member/profile');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil profil member:', error);
    throw error;
  }
};

export const getDonasiBanks = async () => {
  try {
    const response = await api.get('/donasi_member/banks');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar bank:', error);
    throw error;
  }
};
