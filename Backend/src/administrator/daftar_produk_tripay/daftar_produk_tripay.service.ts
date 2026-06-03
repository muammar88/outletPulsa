import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetTripayProductDto } from './dto/get-tripay-product.dto';

@Injectable()
export class DaftarProdukTripayService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetTripayProductDto, adminId: number) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const search = query.search || '';
    const operatorId = query.operatorId ? parseInt(query.operatorId) : undefined;
    const kategoriId = query.kategoriId ? parseInt(query.kategoriId) : undefined;
    const status = query.status;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { kode: { contains: search, mode: 'insensitive' } },
          { operator: { name: { contains: search, mode: 'insensitive' } } },
          { operator: { kategori: { name: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
      ...(operatorId && { operatorId }),
      ...(kategoriId && { operator: { kategoriId } }),
      ...(status && { status }),
    };

    let orderBy: any = {};
    if (sortBy === 'operator') {
      orderBy = { operator: { name: sortOrder } };
    } else if (sortBy === 'kategori') {
      orderBy = { operator: { kategori: { name: sortOrder } } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const [list, total] = await Promise.all([
      this.prisma.tripayPrabayarProduk.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          operator: {
            include: {
              kategori: true,
            },
          },
        },
      }),
      this.prisma.tripayPrabayarProduk.count({ where }),
    ]);

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'VIEW_DAFTAR_PRODUK_TRIPAY',
        entity: 'TripayPrabayarProduk',
        description: `Melihat daftar produk tripay (Page: ${page}, Search: ${search})`,
      }
    });

    return {
      list,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, adminId: number) {
    const product = await this.prisma.tripayPrabayarProduk.findUnique({
      where: { id },
      include: {
        operator: {
          include: {
            kategori: true,
          },
        },
        produk: true
      },
    });

    if (!product) {
      throw new NotFoundException('Produk Tripay tidak ditemukan');
    }

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'VIEW_DETAIL_PRODUK_TRIPAY',
        entity: 'TripayPrabayarProduk',
        entityId: id.toString(),
        description: `Melihat detail produk tripay: ${product.name} (${product.kode})`,
      }
    });

    return product;
  }

  /**
   * Fetch data dari Tripay API.
   * Mengikuti pola cek_harga_TRI:
   *   - Authorization: Bearer {apiKey}
   *   - Cek json.success === true sebelum pakai data
   *   - Log request/response seperti console.log pada referensi lama
   */
  private async fetchTripayData(url: string, apiKey: string): Promise<any[]> {
    console.log('---------optionsGET----------TRIPAY');
    console.log({ uri: url, method: 'GET', Authorization: `Bearer ${apiKey.substring(0, 8)}...` });
    console.log('---------optionsGET----------TRIPAY');

    let bodyText = '';
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      bodyText = await response.text();

      console.log('---------RESPONSE----------TRIPAY');
      console.log(`URL: ${url} | Status: ${response.status}`);
      console.log('---------RESPONSE----------TRIPAY');

      const json = JSON.parse(bodyText);

      // Ikuti pola cek_harga_TRI: cek json.success terlebih dahulu
      if (json.success !== true) {
        throw new Error(json.message || `API Tripay mengembalikan success=false dari ${url}`);
      }

      console.log('---------JSON DATA----------TRIPAY');
      const data = json.data;
      console.log(`Data count: ${Array.isArray(data) ? data.length : 'single object'}`);
      console.log('---------JSON DATA----------TRIPAY');

      if (!data) return [];
      return Array.isArray(data) ? data : [data];
    } catch (err: any) {
      if (err.message && (
        err.message.startsWith('API Tripay') ||
        err.message.startsWith('Gagal')
      )) throw err;
      throw new Error(`Gagal parsing response dari ${url}: ${err.message}`);
    }
  }

  async syncProducts(adminId: number) {
    const apiKey = process.env.TRIPAY_API_KEY;
    const mode = process.env.TRIPAY_MODE || 'sandbox';

    if (!apiKey) {
      throw new Error('TRIPAY_API_KEY tidak ditemukan di environment variables.');
    }

    // Ikuti pola urlAct di referensi lama: base_url + path relatif
    const baseUrl = mode === 'production'
      ? 'https://tripay.id/api/v2/'
      : 'https://tripay.id/api-sandbox/v2/';

    const urlCat  = `${baseUrl}pembelian/category`;
    const urlOp   = `${baseUrl}pembelian/operator`;
    const urlProd = `${baseUrl}pembelian/produk`;

    // ==========================================
    // PHASE 1 - FETCH API
    // Mengikuti pola request di cek_harga_TRI: masing-masing endpoint
    // diambil terpisah agar error mudah diidentifikasi
    // ==========================================
    console.log('--- [TRIPAY SYNC] Fetching data dari Tripay API ---');
    console.log(`Mode: ${mode} | Base URL: ${baseUrl}`);

    let tripayCategories: any[] = [];
    let tripayOperators:  any[] = [];
    let tripayProducts:   any[] = [];

    try {
      tripayCategories = await this.fetchTripayData(urlCat, apiKey);
      console.log(`[TRIPAY SYNC] Kategori berhasil diambil: ${tripayCategories.length} item`);
    } catch (error: any) {
      console.error('[TRIPAY SYNC] Error fetch kategori:', error.message);
      throw new Error(`Gagal mengambil data kategori dari Tripay: ${error.message}`);
    }

    try {
      tripayOperators = await this.fetchTripayData(urlOp, apiKey);
      console.log(`[TRIPAY SYNC] Operator berhasil diambil: ${tripayOperators.length} item`);
    } catch (error: any) {
      console.error('[TRIPAY SYNC] Error fetch operator:', error.message);
      throw new Error(`Gagal mengambil data operator dari Tripay: ${error.message}`);
    }

    try {
      tripayProducts = await this.fetchTripayData(urlProd, apiKey);
      console.log(`[TRIPAY SYNC] Produk berhasil diambil: ${tripayProducts.length} item`);
    } catch (error: any) {
      console.error('[TRIPAY SYNC] Error fetch produk:', error.message);
      throw new Error(`Gagal mengambil data produk dari Tripay: ${error.message}`);
    }

    console.log("xxxx");
    console.log(tripayCategories);
    console.log("xxxx");

    if (!Array.isArray(tripayProducts) || tripayProducts.length === 0) {
      throw new Error('Data produk Tripay kosong atau format tidak valid.');
    }

    // ==========================================
    // PHASE 2 - KATEGORI MAPPING
    // ==========================================
    const existingCat = await this.prisma.tripayPrabayarKategori.findMany({ select: { id: true } });
    const catMap = new Set(existingCat.map(c => c.id));
    const catToInsert: any[] = [];
    const catToUpdate: any[] = [];

    for (const c of tripayCategories) {
      if (!c.id) continue;
      const item = { id: Number(c.id), name: c.product_name, type: c.type || 'PPOB' };
      if (catMap.has(item.id)) catToUpdate.push(item);
      else catToInsert.push(item);
    }
    console.log(`[TRIPAY SYNC] Kategori -> Insert: ${catToInsert.length}, Update: ${catToUpdate.length}`);

    // ==========================================
    // PHASE 3 - OPERATOR MAPPING
    // ==========================================
    const existingOp = await this.prisma.tripayPrabayarOperator.findMany({ select: { id: true } });
    const opMap = new Set(existingOp.map(o => o.id));
    const opToInsert: any[] = [];
    const opToUpdate: any[] = [];

    for (const o of tripayOperators) {
      if (!o.id) continue;
      const item = {
        id:         Number(o.id),
        kategoriId: o.category_id ? Number(o.category_id) : null,
        name:       o.product_name,
        kode:       o.kode ?? o.product_name?.toUpperCase().replace(/\s+/g, '_') ?? '',
      };
      if (opMap.has(item.id)) opToUpdate.push(item);
      else opToInsert.push(item);
    }
    console.log(`[TRIPAY SYNC] Operator -> Insert: ${opToInsert.length}, Update: ${opToUpdate.length}`);

    // ==========================================
    // PHASE 4 - PRODUK MAPPING
    // Konversi status mengikuti pola cek_harga_TRI:
    //   json.data.status == 1 ? true : false
    //   1 = ACTIVE (tersedia), 2 = GANGGUAN, 0 = INACTIVE
    // ==========================================
    const existingProds = await this.prisma.tripayPrabayarProduk.findMany({ select: { id: true, kode: true } });
    const prodMap = new Map<string, number>();
    for (const p of existingProds) {
      if (p.kode) prodMap.set(p.kode, p.id);
    }

    const dataToInsert: any[] = [];
    const dataToUpdate: any[] = [];

    for (const apiProd of tripayProducts) {
      const kode = apiProd.code ?? apiProd.kode;
      if (!kode) continue;

      // Konversi status integer → string (sesuai pola referensi lama)
      let finalStatus: string;
      const rawStatus = apiProd.status;
      if (rawStatus === 1 || rawStatus === '1') {
        finalStatus = 'ACTIVE';
      } else if (rawStatus === 2 || rawStatus === '2') {
        finalStatus = 'GANGGUAN';
      } else if (rawStatus === 0 || rawStatus === '0') {
        finalStatus = 'INACTIVE';
      } else if (typeof rawStatus === 'string' && rawStatus.length > 0) {
        finalStatus = rawStatus.toUpperCase();
      } else {
        finalStatus = 'ACTIVE'; // default
      }

      const mappedData = {
        kode,
        name:       apiProd.product_name ?? apiProd.product_name ?? '',
        price:      Number(apiProd.price ?? apiProd.harga ?? 0),
        status:     finalStatus,
        deskripsi:  apiProd.description ?? apiProd.deskripsi ?? '',
        operatorId: apiProd.operator_id ? Number(apiProd.operator_id) : null,
      };

      if (prodMap.has(kode)) {
        dataToUpdate.push({
          id:     prodMap.get(kode)!,
          name:   mappedData.name,
          price:  mappedData.price,
          status: mappedData.status,
        });
      } else {
        dataToInsert.push(mappedData);
      }
    }
    console.log(`[TRIPAY SYNC] Produk -> Insert: ${dataToInsert.length}, Update: ${dataToUpdate.length}`);

    // ==========================================
    // PHASE 5 - EKSEKUSI BATCH DALAM SATU TRANSACTION
    // ==========================================
    await this.prisma.$transaction(async (tx) => {
      // Kategori
      if (catToInsert.length > 0) {
        await tx.tripayPrabayarKategori.createMany({ data: catToInsert, skipDuplicates: true });
      }
      for (const u of catToUpdate) {
        await tx.tripayPrabayarKategori.update({
          where: { id: u.id },
          data:  { name: u.name, type: u.type },
        });
      }

      // Operator
      if (opToInsert.length > 0) {
        await tx.tripayPrabayarOperator.createMany({ data: opToInsert, skipDuplicates: true });
      }
      for (const u of opToUpdate) {
        await tx.tripayPrabayarOperator.update({
          where: { id: u.id },
          data:  { name: u.name, kode: u.kode, kategoriId: u.kategoriId },
        });
      }

      // Produk
      if (dataToInsert.length > 0) {
        await tx.tripayPrabayarProduk.createMany({ data: dataToInsert, skipDuplicates: true });
      }
      for (const u of dataToUpdate) {
        await tx.tripayPrabayarProduk.update({
          where: { id: u.id },
          data:  { name: u.name, price: u.price, status: u.status },
        });
      }

      // Activity Log
      await tx.activityLog.create({
        data: {
          userId:      adminId,
          action:      'SYNC_PRODUK_TRIPAY',
          entity:      'TripayPrabayarProduk',
          description: [
            `Sinkronisasi Tripay selesai.`,
            `Kategori → Baru: ${catToInsert.length}, Update: ${catToUpdate.length}`,
            `Operator → Baru: ${opToInsert.length}, Update: ${opToUpdate.length}`,
            `Produk   → Baru: ${dataToInsert.length}, Update: ${dataToUpdate.length}`,
          ].join(' | '),
        },
      });
    });

    console.log('--- [TRIPAY SYNC] Sinkronisasi selesai ---');

    return {
      success:    true,
      mode,
      categories: { inserted: catToInsert.length,  updated: catToUpdate.length },
      operators:  { inserted: opToInsert.length,   updated: opToUpdate.length },
      products:   { inserted: dataToInsert.length, updated: dataToUpdate.length },
      message:    'Sinkronisasi produk Tripay berhasil.',
    };
  }
}
