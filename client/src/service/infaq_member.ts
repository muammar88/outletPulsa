import api from '@/service/api_member';

export const getInfaqList = async (params: any) => {
  try {
    const response = await api.post('/infaq_member/list', params);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar infaq:', error);
    throw error;
  }
};

export const kode_pembayaran = async () => {
  try {
    const response = await api.get('/infaq_member/kode_pembayaran');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil profil member:', error);
    throw error;
  }
};

export const getMemberProfile = async () => {
  try {
    const response = await api.get('/infaq_member/profile');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil profil member:', error);
    throw error;
  }
};

export const getInfaqBanks = async () => {
  try {
    const response = await api.get('/infaq_member/banks');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar bank:', error);
    throw error;
  }
};

export const addInfaq = async (data: {
  nominal: number | null;
  invoice: string | null;
  kode: number;
}) => {
  try {
    const response = await api.post('/infaq_member/add', data);
    return response.data;
  } catch (error) {
    console.error('Gagal membuat pembayaran infaq:', error);
    throw error;
  }
};

export const confirmInfaqPayment = async (invoice: string) => {
  try {
    const response = await api.post('/infaq_member/confirm', { invoice });
    return response.data;
  } catch (error) {
    console.error('Gagal mengkonfirmasi pembayaran infaq:', error);
    throw error;
  }
};
