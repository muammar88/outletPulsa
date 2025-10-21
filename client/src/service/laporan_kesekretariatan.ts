import api from '@/service/api_administrator'


export const get_tahun = () => {
  return api.get('/asnaf_tahun/list')
}

export const get_laporan_kesekretariatan = (tahun: string) => {
  return api.get('/laporan_kesekretariatan/list', {
    params: {
      tahun,
    },
  })
}

export const download_excel_kesekretariatan = (tahun: string, asnafType: string) => {
  return api.get('/download_excel_laporan_kesekretariatan/list', {
    params: { 
      tahun, 
      asnaf: asnafType 
    },
    responseType: 'blob'
  })
}
