import api from '@/service/api_administrator'


export const getJenisMonevList = async () => {
  try {
    const response = await api.get('/urutan-monev/get-jenis');
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil list jenis monev:', error);
    throw error;
  }
}


export const getUrutanByJenis = async (jenis_monev: string) => {
  try {
    if (!jenis_monev) return { data: { urutan: [], updatedAt: null } }; 
    const response = await api.post('/urutan-monev/get-urutan', { jenis_monev });
    return response.data;
  } catch (error) {
    console.error('Gagal mengambil urutan bagian:', error);
    throw error;
  }
}


export const updateUrutanMonev = async (jenis_monev: string, urutan_bagian: string[]) => {
  try {
    const response = await api.post('/urutan-monev/update-urutan', {
      jenis_monev,
      urutan_bagian
    });
    return response.data;
  } catch (error) {
    console.error('Gagal menyimpan urutan:', error);
    throw error;
  }
}

