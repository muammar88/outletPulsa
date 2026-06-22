export interface PengaturanUmum {
  id: number;
  nama_aplikasi: string;
  deskripsi: string;
  logo: string;
  email: string;
  telepon: string;
  alamat: string;
  bullmq_schedules: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
