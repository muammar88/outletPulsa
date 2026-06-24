export interface TakeLaba {
  id: number;
  kode_invoice: string;
  jumlah_laba: number;
  jumlah_transaksi: number;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryUnpaid {
  totalLaba: number;
  totalTransaksi: number;
}
