import api from '@/service/api_administrator'


export const get_tahun = () => {
  return api.get('/asnaf_tahun/list')
}

export const get_laporan_asnaf = (tahun: string, asnaf: number) => {
  return api.get('/fn_asnaf/list', {
    params: {
      tahun,
      asnaf,
    },
  })
}

export const download_excel_asnaf = (tahun: string, asnafType: string) => {
  return api.get('/download_excel_laporan_penyaluran/list', {
    params: { 
      tahun, 
      asnaf: asnafType 
    },
    responseType: 'blob'
  })
}
