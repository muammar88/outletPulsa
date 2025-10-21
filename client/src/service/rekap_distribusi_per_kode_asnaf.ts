import api from '@/service/api_administrator';

export const list_rekap_distribusi_per_kode_asnaf = async (params?: { year?: number }) => {
  try {
    const response = await api.get('/rekap_distribusi_per_kode_asnaf/list', {
      params, //kirim query param ke backend
    });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil rekap distribusi per kode asnaf:', error);
    throw error;
  }
};
