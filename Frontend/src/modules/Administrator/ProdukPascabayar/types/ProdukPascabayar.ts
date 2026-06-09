export interface Kategori {
  id: number;
  kode: string;
  name: string;
}

export interface Server {
  id: number;
  kode: string;
  name: string;
  status: string;
}

export interface Produk {
  id: number;
  kategoriId: number | null;
  kode: string;
  name: string;
  fee: number;
  comission: number;
  outletFee: number;
  serverId: number | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  
  kategori?: Kategori | null;
  server?: Server | null;
  iakPascabayarProducts?: any[];
}

export interface ProdukPascabayarResponse {
  list: Produk[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
