import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetProdukIakDto } from './dto/get-produk-iak.dto';
import * as crypto from 'crypto';

@Injectable()
export class DaftarProdukPascabayarIakService {
  private readonly logger = new Logger(DaftarProdukPascabayarIakService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetProdukIakDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const connectionStatus = query.connectionStatus;
    const typeId = query.typeId;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (connectionStatus === 'connected') {
      where.produkPascabayarId = { not: null };
    } else if (connectionStatus === 'disconnected') {
      where.produkPascabayarId = null;
    }

    if (typeId) {
      where.typeId = parseInt(typeId, 10);
    }

    const [list, total] = await Promise.all([
      this.prisma.iakPascabayarProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
        include: {
          type: true,
          produkPascabayar: true,
        }
      }),
      this.prisma.iakPascabayarProduct.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTypes() {
    return await this.prisma.iakPascabayarType.findMany({
      orderBy: { type: 'asc' }
    });
  }

  private signMd5(username: string, apiKey: string, suffix: string) {
    return crypto.createHash('md5').update(username + apiKey + suffix).digest('hex');
  }

  async syncProducts(adminId: number) {
    let rawUsername = process.env.IAK_USERNAME || '085262802141';
    if (String(rawUsername).includes('e+')) {
      rawUsername = Number(rawUsername).toString();
    }
    const username = String(rawUsername).padStart(12, '0');
    const mode = process.env.IAK_MODE || (process.env.NODE_ENV === 'production' ? 'production' : 'development');
    const apiKey = process.env.IAK_MODE  === 'production'
      ? process.env.IAK_KEY_PRODUCTION 
      : process.env.IAK_KEY_DEVELOPMENT;
    
    const baseUrl = mode === 'production'
      ? 'https://postpaid.iak.id/'
      : 'https://testpostpaid.mobilepulsa.net/';

    this.logger.log(`[IAK PASCABAYAR SYNC] Memulai sinkronisasi IAK. Mode: ${mode}, URL: ${baseUrl}`);

    const sign = this.signMd5(username, apiKey!, 'pl');
    
    let pascabayarData: any[] = [];
    
    // 1. Ambil seluruh daftar type Pascabayar IAK yang tersedia
    const existingTypes = await this.prisma.iakPascabayarType.findMany();
    if (existingTypes.length === 0) {
      throw new Error('Daftar type Pascabayar IAK masih kosong. Silakan lakukan seeder terlebih dahulu.');
    }

    // 2. Lakukan looping terhadap setiap type
    for (const t of existingTypes) {
      if (!t.type) continue;
      const type = t.type;
      
      this.logger.log(`[IAK PASCABAYAR SYNC] Mengambil produk untuk tipe: ${type}`);
      
      try {
        // 3. Lakukan request ke endpoint dengan type
        const response = await fetch(`${baseUrl}api/v1/bill/check/${type}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            commands: "pricelist-pasca",
            username,
            sign,
            status: "all"
          })
        });

        const opJson = await response.json();

        // 4 & 5 & 6. Ambil data, tambahkan type, dan masukkan ke pascabayarData
        if (opJson.data && Array.isArray(opJson.data.pasca)) {
          const typeProducts = opJson.data.pasca.map((item: any) => ({
            ...item,
            type: type
          }));
          pascabayarData = pascabayarData.concat(typeProducts);
        } else {
           this.logger.warn(`[IAK PASCABAYAR SYNC] Format response tidak sesuai untuk tipe: ${type}`);
        }
      } catch (err: any) {
        this.logger.error(`[IAK PASCABAYAR SYNC] Gagal fetch ke IAK untuk tipe ${type}: ${err.message}`);
      }
    }

    if (!Array.isArray(pascabayarData) || pascabayarData.length === 0) {
      throw new Error('Data produk IAK Pascabayar kosong setelah mencoba semua tipe.');
    }

    this.logger.log(`[IAK PASCABAYAR SYNC] Berhasil mengumpulkan ${pascabayarData.length} produk pascabayar.`);

    const existingProds = await this.prisma.iakPascabayarProduct.findMany({
      select: { id: true, code: true, status: true, fee: true, komisi: true }
    });
    
    const prodMap = new Map<string, any>();
    for (const p of existingProds) {
      if (p.code) prodMap.set(p.code, p);
    }

    const dataToInsert: any[] = [];
    const dataToUpdate: any[] = [];

    // Sync types as well
    const typeMap = new Map<string, number>();
    for(const t of existingTypes) {
      if (t.type) typeMap.set(t.type.toLowerCase(), t.id);
    }

    for (const apiProd of pascabayarData) {
      const code = apiProd.code;
      if (!code) continue;

      let finalStatus: any = 'active';
      if (apiProd.status === 0 || apiProd.status === "0") finalStatus = 'inactive';
      else if (apiProd.status === 1 || apiProd.status === "1") finalStatus = 'active';

      const fee = Number(apiProd.fee || 0);
      const komisi = Number(apiProd.komisi || 0);
      const typeStr = apiProd.type || 'Lainnya';

      let typeId = typeMap.get(typeStr.toLowerCase());
      if (!typeId) {
        const newType = await this.prisma.iakPascabayarType.create({ data: { type: typeStr } });
        typeId = newType.id;
        typeMap.set(typeStr.toLowerCase(), typeId);
      }

      const existingProd = prodMap.get(code);
      if (existingProd) {
        if (existingProd.fee !== fee || existingProd.status !== finalStatus || existingProd.komisi !== komisi) {
          dataToUpdate.push({
            id: existingProd.id,
            fee,
            komisi,
            status: finalStatus,
          });
        }
      } else {
        dataToInsert.push({
          code,
          name: apiProd.name || '',
          fee,
          komisi,
          status: finalStatus,
          typeId,
        });
      }
    }

    this.logger.log(`[IAK PASCABAYAR SYNC] Produk -> Insert: ${dataToInsert.length}, Update: ${dataToUpdate.length}`);

    if (dataToInsert.length > 0) {
      await this.prisma.iakPascabayarProduct.createMany({
        data: dataToInsert,
        skipDuplicates: true,
      });
    }

    if (dataToUpdate.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < dataToUpdate.length; i += chunkSize) {
        const chunk = dataToUpdate.slice(i, i + chunkSize);
        await this.prisma.$transaction(
          chunk.map((item) =>
            this.prisma.iakPascabayarProduct.update({
              where: { id: item.id },
              data: { fee: item.fee, komisi: item.komisi, status: item.status },
            })
          )
        );
      }
    }

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'SYNC_PRODUK_PASCABAYAR_IAK',
        entity: 'IakPascabayarProduct',
        description: `Melakukan sinkronisasi produk pascabayar IAK. Baru: ${dataToInsert.length}, Diperbarui: ${dataToUpdate.length}`,
      }
    });

    return {
      error: false,
      error_msg: '',
      inserted: dataToInsert.length,
      updated: dataToUpdate.length,
      total: pascabayarData.length
    };
  }

  async getInternalProducts(search: string = '') {
    const where: any = { 
      iakPascabayarProducts: {
        none: {}
      }
    };
    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const products = await this.prisma.produkPascabayar.findMany({
      where,
      select: {
        id: true,
        kode: true,
        name: true,
        fee: true,
        comission: true,
        kategori: {
          select: { name: true }
        }
      },
      take: 50,
      orderBy: { kode: 'asc' },
    });

    return products.map(p => ({
      ...p,
      admin_fee: p.fee,
      komisi: p.comission,
      kode: p.kategori?.name ? `${p.kategori.name} - ${p.kode}` : p.kode,
    }));
  }

  async connectProduct(iakProdukId: number, produkPascabayarId: number) {
    const iakProd = await this.prisma.iakPascabayarProduct.findUnique({ where: { id: iakProdukId } });
    if (!iakProd) throw new Error('Produk Pascabayar IAK tidak ditemukan');

    const internalProd = await this.prisma.produkPascabayar.findUnique({ where: { id: produkPascabayarId } });
    if (!internalProd) throw new Error('Produk Pascabayar Internal tidak ditemukan');

    const updated = await this.prisma.iakPascabayarProduct.update({
      where: { id: iakProdukId },
      data: { produkPascabayarId },
      include: {
        type: true,
        produkPascabayar: true
      }
    });

    return updated;
  }

  async toggleStatus(id: number) {
    const product = await this.prisma.iakPascabayarProduct.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }
    const currentStatus = product.status as any;
    const newStatus = currentStatus === 'active' || currentStatus === 'ACTIVE' ? 'inactive' : 'active';
    return this.prisma.iakPascabayarProduct.update({
      where: { id },
      data: { status: newStatus as any },
    });
  }
}