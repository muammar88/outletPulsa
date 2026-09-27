import api from '@/service/api_administrator';

export interface Envelope<T> {
  message: string;
  error: string | null;
  data: T;
}

export interface DigiflazzPascabayarConnection {
  id: number;
  produkPascabayarId: number;
  provider: string;
  providerSku: string;
  isActive: boolean;
  produkPascabayar: { id: number; kode: string | null; name: string | null } | null;
}

export interface DigiflazzPascabayarCatalogItem {
  id: number;
  buyerSkuCode: string;
  name: string | null;
  category: string | null;
  brand: string | null;
  sellerName: string | null;
  price: number | null;
  admin: number | null;
  commission: number | null;
  buyerProductStatus: boolean | null;
  sellerProductStatus: boolean | null;
  desc: string | null;
  syncedAt: string | null;
  providerSelections: DigiflazzPascabayarConnection[];
}

export interface Paginated<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InternalProductOption {
  id: number;
  kode: string | null;
  name: string | null;
  fee: number | null;
  comission: number | null;
  kategori: string | null;
  digiflazzMappings: Array<{
    id: number;
    providerSku: string;
    digiflazzProductId: number | null;
    isActive: boolean;
  }>;
}

export interface KatalogQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  seller?: string;
  availability?: string;
  connected?: string;
}

export interface SyncResult {
  error: boolean;
  error_msg: string;
  inserted: number;
  updated: number;
  total: number;
}

export const daftarProdukPascabayarSellerDigiflazzService = {
  async listKatalog(params: KatalogQuery) {
    return await api.get<Envelope<Paginated<DigiflazzPascabayarCatalogItem>>>(
      '/administrator/pascabayar-provider/katalog-digiflazz',
      { params },
    );
  },

  async listSellers() {
    return await api.get<Envelope<string[]>>(
      '/administrator/pascabayar-provider/katalog-digiflazz/sellers',
    );
  },

  async listCategories() {
    return await api.get<Envelope<string[]>>(
      '/administrator/pascabayar-provider/katalog-digiflazz/kategori',
    );
  },

  async listInternalProducts(params: {
    search?: string;
    provider?: 'DIGIFLAZZ';
    connection?: 'available';
    catalogId?: number;
  }) {
    return await api.get<Envelope<InternalProductOption[]>>(
      '/administrator/pascabayar-provider/internal-products',
      { params },
    );
  },

  async connect(
    produkPascabayarId: number,
    payload: {
      provider: 'DIGIFLAZZ';
      providerSku: string;
      digiflazzProductId: number;
      iakProductId: null;
    },
  ) {
    return await api.post<Envelope<unknown>>(
      `/administrator/pascabayar-provider/produk/${produkPascabayarId}/connect`,
      payload,
    );
  },

  async disconnect(produkPascabayarId: number, provider: 'DIGIFLAZZ') {
    return await api.post<Envelope<unknown>>(
      `/administrator/pascabayar-provider/produk/${produkPascabayarId}/disconnect`,
      { provider },
    );
  },

  async sync() {
    return await api.post<Envelope<SyncResult>>(
      '/administrator/pascabayar-provider/katalog-digiflazz/sync',
    );
  },
};