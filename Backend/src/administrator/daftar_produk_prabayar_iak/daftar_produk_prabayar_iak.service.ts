import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetProdukIakDto } from './dto/get-produk-iak.dto';
import * as crypto from 'crypto';

@Injectable()
export class DaftarProdukPrabayarIakService {
  private readonly logger = new Logger(DaftarProdukPrabayarIakService.name);
  private isSyncing = false;
  private syncResult: any = null;

  constructor(private readonly prisma: PrismaService) {}

  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      result: this.syncResult,
    };
  }

  clearSyncResult() {
    this.syncResult = null;
  }

  async findAll(query: GetProdukIakDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const operatorId = query.operatorId ? parseInt(query.operatorId, 10) : undefined;
    const connectionStatus = query.connectionStatus;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (operatorId) {
      where.operatorId = operatorId;
    }

    if (connectionStatus === 'connected') {
      where.produkId = { not: null };
    } else if (connectionStatus === 'disconnected') {
      where.produkId = null;
    }

    const [list, total] = await Promise.all([
      this.prisma.iakPrabayarProduk.findMany({
        where,
        skip,
        take: limit,
        orderBy: { price: 'asc' },
        include: {
          operator: {
            include: {
              type: true
            }
          },
          produk: true,
        }
      }),
      this.prisma.iakPrabayarProduk.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private signMd5(username: string, apiKey: string, suffix: string) {
    return crypto.createHash('md5').update(username + apiKey + suffix).digest('hex');
  }

  async syncProducts(adminId: number) {
    if (this.isSyncing) {
      throw new Error('Sinkronisasi IAK sedang berjalan');
    }

    this.isSyncing = true;
    this.syncResult = null;

    try {
      let rawUsername = process.env.IAK_USERNAME || '085262802141';
      if (String(rawUsername).includes('e+')) {
        rawUsername = Number(rawUsername).toString();
      }
      const username = String(rawUsername).padStart(12, '0');
      const mode = process.env.IAK_MODE || (process.env.NODE_ENV === 'production' ? 'production' : 'development');
      const apiKey = process.env.IAK_KEY || (mode === 'production' 
        ? '472643293c215b8ayS8p' 
        : '8286432937d964cegRmg');

        

        console.log("API KEY");
        console.log(apiKey);
        console.log("API KEY");

        console.log("USER NAME");
        console.log(username);
        console.log("USER NAME");

       
      
      const baseUrl = mode === 'production'
        ? 'https://prepaid.iak.id/'
        : 'https://prepaid.iak.dev/';


        console.log("BASE URL");
        console.log(baseUrl);
        console.log("BASE URL");

      this.logger.log(`[IAK SYNC] Memulai sinkronisasi IAK. Mode: ${mode}, URL: ${baseUrl}`);

      const sign = this.signMd5(username, apiKey, 'pl');
    
    let json: any = { data: { pricelist: [] } };
    
    const operators = await this.prisma.iakPrabayarOperator.findMany({
      include: {
        type: true
      }
    });

    try {
      this.logger.log(`[IAK SYNC] Mengambil data pricelist dari ${operators.length} operator...`);

      for (const op of operators) {
        if (!op.type?.type || !op.name) continue;

        const typeName = op.type.type.toLowerCase();
        const opName = op.name.toLowerCase();

        try {
          const response = await fetch(`${baseUrl}api/pricelist/${typeName}/${opName}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              username,
              sign,
              status: "all"
            })
          });

          const bodyText = await response.text();
          const opJson = JSON.parse(bodyText);

          // Skip jika mendapat response error (contoh: rc '20' CODE NOT FOUND)
          if (opJson.data && opJson.data.rc && opJson.data.rc !== '00') {
            this.logger.warn(`[IAK SYNC] Skip operator ${opName}: ${opJson.data.message || 'Error IAK'}`);
            continue;
          }

          // Menampilkan raw response ke console log
          console.log(`--------- RESPONSE DARI ${typeName.toUpperCase()} - ${opName.toUpperCase()} ---------`);
          console.dir(opJson, { depth: null, colors: true });

          // Jika ada daftar harga, masukkan ke dalam penampung json utama
          if (opJson.data && Array.isArray(opJson.data.pricelist)) {
            const mappedPricelist = opJson.data.pricelist.map((p: any) => ({
              ...p,
              operatorId: op.id
            }));
            json.data.pricelist.push(...mappedPricelist);
          }
        } catch (fetchErr: any) {
          this.logger.warn(`[IAK SYNC] Gagal fetch untuk operator ${opName}: ${fetchErr.message}`);
        }
      }
    } catch (err: any) {
      this.logger.error(`[IAK SYNC] Gagal fetch ke IAK: ${err.message}`);
      throw new Error(`Gagal menghubungi server IAK: ${err.message}`);
    }

    const pricelist = json.data.pricelist;
    if (!Array.isArray(pricelist) || pricelist.length === 0) {
      throw new Error('Data produk IAK kosong.');
    }

    this.logger.log(`[IAK SYNC] Berhasil mengumpulkan ${pricelist.length} produk dari seluruh operator.`);

    // ==========================================
    // PHASE 4 - PRODUK MAPPING
    // ==========================================

    const existingProds = await this.prisma.iakPrabayarProduk.findMany({
      select: { id: true, kode: true, price: true, status: true, nominal: true }
    });
    
    const prodMap = new Map<string, any>();
    for (const p of existingProds) {
      if (p.kode) prodMap.set(p.kode, p);
    }

    const dataToInsert: any[] = [];
    const dataToUpdate: any[] = [];

    for (const apiProd of pricelist) {
      const kode = apiProd.product_code;
      if (!kode) continue;

      let finalStatus: any;
      const rawStatus = typeof apiProd.status === 'string' ? apiProd.status.toLowerCase() : '';
      if (rawStatus === 'active') finalStatus = 'active';
      else if (rawStatus === 'gangguan') finalStatus = 'gangguan';
      else if (rawStatus === 'inactive') finalStatus = 'inactive';
      else finalStatus = 'active';

      const opId = apiProd.operatorId || null;

      const price = Number(apiProd.product_price || 0);
      const nominal = apiProd.product_nominal ? String(apiProd.product_nominal) : null;

      const existingProd = prodMap.get(kode);
      if (existingProd) {
        if (existingProd.price !== price || existingProd.status !== finalStatus || existingProd.nominal !== nominal) {
          dataToUpdate.push({
            id: existingProd.id,
            price: price,
            status: finalStatus,
            nominal: nominal,
          });
        }
      } else {
        dataToInsert.push({
          kode,
          name: apiProd.product_description || '',
          nominal: nominal,
          price: price,
          status: finalStatus,
          operatorId: opId,
        });
      }
    }

    this.logger.log(`[IAK SYNC] Produk -> Insert: ${dataToInsert.length}, Update: ${dataToUpdate.length}`);

    if (dataToInsert.length > 0) {
      await this.prisma.iakPrabayarProduk.createMany({
        data: dataToInsert,
        skipDuplicates: true,
      });
    }

    if (dataToUpdate.length > 0) {
      // Chunking untuk update ribuan data
      const chunkSize = 500;
      for (let i = 0; i < dataToUpdate.length; i += chunkSize) {
        const chunk = dataToUpdate.slice(i, i + chunkSize);
        await this.prisma.$transaction(
          chunk.map((item) =>
            this.prisma.iakPrabayarProduk.update({
              where: { id: item.id },
              data: { price: item.price, status: item.status, nominal: item.nominal },
            })
          )
        );
      }
    }

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'SYNC_PRODUK_IAK',
        entity: 'IakPrabayarProduk',
        description: `Melakukan sinkronisasi produk IAK. Baru: ${dataToInsert.length}, Diperbarui: ${dataToUpdate.length}`,
      }
    });

      this.syncResult = {
        success: true,
        data: {
          inserted: dataToInsert.length,
          updated: dataToUpdate.length,
          total: pricelist.length
        }
      };

    } catch (globalError: any) {
      this.logger.error(`[IAK SYNC] Proses dibatalkan karena error: ${globalError.message}`);
      this.syncResult = {
        success: false,
        error: globalError.message
      };
    } finally {
      this.isSyncing = false;
    }
  }
  async getInternalOperators(search: string = '') {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { kode: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const operators = await this.prisma.operator.findMany({
      where: {
        ...where,
      },
      select: {
        id: true,
        kode: true,
        name: true,
      },
      orderBy: { name: 'asc' },
      take: 50,
    });

    return operators.map(op => ({
      ...op,
      name: op.kode ? `${op.name} (${op.kode})` : op.name,
    }));
  }

  async getInternalProducts(operatorId: number, search: string = '') {
    const where: any = { 
      operatorId,
      iakPrabayarProduks: {
        none: {}
      }
    };
    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const products = await this.prisma.produk.findMany({
      where,
      select: {
        id: true,
        kode: true,
        name: true,
        purchase_price: true,
        markup: true,
        operator: {
          select: { name: true }
        }
      },
      take: 50,
      orderBy: { purchase_price: 'asc' },
    });

    return products.map(p => ({
      ...p,
      kode: p.operator?.name ? `${p.operator.name} - ${p.kode}` : p.kode,
    }));
  }

  async connectProduct(iakProdukId: number, produkId: number) {
    const iakProd = await this.prisma.iakPrabayarProduk.findUnique({ where: { id: iakProdukId } });
    if (!iakProd) throw new Error('Produk IAK tidak ditemukan');

    const internalProd = await this.prisma.produk.findUnique({ where: { id: produkId } });
    if (!internalProd) throw new Error('Produk Internal tidak ditemukan');

    const updated = await this.prisma.iakPrabayarProduk.update({
      where: { id: iakProdukId },
      data: { produkId },
      include: {
        operator: { include: { type: true } },
        produk: true
      }
    });

    return updated;
  }

  async toggleStatus(id: number) {
    const product = await this.prisma.iakPrabayarProduk.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }
    const currentStatus = product.status as any;
    const newStatus = currentStatus === 'active' || currentStatus === 'ACTIVE' ? 'inactive' : 'active';
    return this.prisma.iakPrabayarProduk.update({
      where: { id },
      data: { status: newStatus as any },
    });
  }
}

