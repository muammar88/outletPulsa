export interface Operator {
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
  operatorId: number | null;
  kode: string;
  name: string;
  purchase_price: number;
  markup: number;
  serverId: number | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  
  operator?: Operator | null;
  server?: Server | null;
}

export interface ProdukPrabayarResponse {
  list: Produk[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
