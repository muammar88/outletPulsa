export interface PengaturanUmum {
  id: number;
  nama_aplikasi: string;
  deskripsi: string;
  logo: string;
  email: string;
  telepon: string;
  alamat: string;
  bullmq_schedules: string;
  wa_api_url?: string;
  wa_api_key?: string;
  wa_device_key?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
