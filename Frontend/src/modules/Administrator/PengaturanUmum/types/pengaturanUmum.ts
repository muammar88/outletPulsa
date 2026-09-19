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
  // LinkQu Integration
  linkqu_is_active?: boolean;
  linkqu_base_url_dev?: string;
  linkqu_base_url_prod?: string;
  linkqu_client_id?: string;
  linkqu_client_secret?: string;
  linkqu_pin?: string;
  linkqu_merchant_code?: string;
  linkqu_signature_key?: string;
  linkqu_is_sandbox?: boolean;
  linkqu_payment_va?: boolean;
  linkqu_payment_ewallet?: boolean;
  linkqu_payment_qris?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
