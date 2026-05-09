import api from '@/service/api_administrator';

export const daftar_rekap_distribusi_kecamatan = async (params?: { tahun?: string | number }) => {
  try {
    const response = await api.get('/rekap_distribusi_kecamatan/list', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil rekap perkecamatan:', error);
    throw error;
  }
};

export const download_rekap_perkecamatan = async (params?: { tahun?: string | number }) => {
  try {
    const response = await api.get("/rekap_perkecamatan/download", {
      params,
      responseType: 'blob',
    })
    return response
  } catch (error) {
    console.error("Gagal download rekap perkecamatan:", error)
    throw error
  }
}