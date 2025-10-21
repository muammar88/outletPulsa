import api from '@/service/api_member';

export const getZakatList = async (params: any) => {
  try {
    const response = await api.post('/zakat_member/list', params);
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar zakat:', error);
    throw error;
  }
};

export const kode_pembayaran = async () => {
  try {
    const response = await api.get('/zakat_member/kode_pembayaran');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil profil member:', error);
    throw error;
  }
};

export const getMemberProfile = async () => {
  try {
    const response = await api.get('/zakat_member/profile');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil profil member:', error);
    throw error;
  }
};

export const getZakatBanks = async () => {
  try {
    const response = await api.get('/zakat_member/banks');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar bank:', error);
    throw error;
  }
};

export const getTipeZakat = async () => {
  try {
    const response = await api.get('/zakat_member/tipe');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil daftar tipe zakat:', error);
    throw error;
  }
};

export const addZakat = async (data: {
  tipe: string;
  nominal: number | null;
  invoice: string;
  kode: number;
}) => {
  try {
    const response = await api.post('/zakat_member/add', data);
    return response.data;
  } catch (error) {
    console.error('Gagal membuat pembayaran zakat:', error);
    throw error;
  }
};

export const confirmZakatPayment = async (invoice: string) => {
  try {
    const response = await api.post('/zakat_member/confirm', { invoice });
    return response.data;
  } catch (error) {
    console.error('Gagal mengkonfirmasi pembayaran zakat:', error);
    throw error;
  }
};
