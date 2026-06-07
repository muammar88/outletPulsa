import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetProdukIakDto } from './dto/get-produk-iak.dto';
import * as crypto from 'crypto';

@Injectable()
export class DaftarProdukIakService {
  private readonly logger = new Logger(DaftarProdukIakService.name);

  constructor(private readonly prisma: PrismaService) {}

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
        orderBy: { name: 'asc' },
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
    const username = process.env.IAK_USERNAME || '085262802141';
    const mode = process.env.IAK_MODE || 'development';
    const apiKey = mode === 'production' 
      ? process.env.IAK_API_KEY_PROD || '472643293c215b8ayS8p' 
      : process.env.IAK_API_KEY_DEV || '8286432937d964cegRmg';
    
    const baseUrl = mode === 'production'
      ? 'https://prepaid.iak.id/'
      : 'https://prepaid.iak.dev/';

    this.logger.log(`[IAK SYNC] Memulai sinkronisasi IAK. Mode: ${mode}, URL: ${baseUrl}`);

    const sign = this.signMd5(username, apiKey, 'pl');
    
    let json: any;
    try {
      const response = await fetch(`${baseUrl}api/pricelist`, {
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
      json = JSON.parse(bodyText);
    } catch (err: any) {
      this.logger.error(`[IAK SYNC] Gagal fetch ke IAK: ${err.message}`);
      throw new Error(`Gagal menghubungi server IAK: ${err.message}`);
    }

    if (!json.data || !json.data.pricelist) {
      this.logger.error(`[IAK SYNC] Invalid response dari IAK: ${JSON.stringify(json)}`);
      throw new Error('API IAK mengembalikan response yang tidak valid.');
    }

    // Tampilkan data mentah dari IAK di console log sesuai instruksi
    console.log('---------RAW JSON RESPONSE DARI IAK----------');
    console.dir(json, { depth: null, colors: true });
    console.log('---------------------------------------------');

    const pricelist = json.data.pricelist;
    if (!Array.isArray(pricelist) || pricelist.length === 0) {
      throw new Error('Data produk IAK kosong.');
    }

    this.logger.log(`[IAK SYNC] Berhasil mendapatkan ${pricelist.length} produk dari API IAK.`);

    // ==========================================
    // PHASE 2 - TIPE MAPPING
    // ==========================================
    const typeSet = new Set<string>();
    for (const p of pricelist) {
      if (p.product_type) typeSet.add(p.product_type);
    }

    const existingTypes = await this.prisma.iakPrabayarType.findMany();
    const existingTypeMap = new Map<string, number>();
    for (const t of existingTypes) {
      if (t.type) existingTypeMap.set(t.type.toLowerCase(), t.id);
    }

    let insertedTypes = 0;
    for (const typeName of Array.from(typeSet)) {
      if (!existingTypeMap.has(typeName.toLowerCase())) {
        const newType = await this.prisma.iakPrabayarType.create({ data: { type: typeName } });
        existingTypeMap.set(typeName.toLowerCase(), newType.id);
        insertedTypes++;
      }
    }
    this.logger.log(`[IAK SYNC] Kategori Tipe (Baru: ${insertedTypes})`);

    // ==========================================
    // PHASE 3 - OPERATOR MAPPING
    // ==========================================
    // Kelompokkan operator berdasarkan nama & tipe
    const operatorMap = new Map<string, { name: string, typeId: number }>();
    for (const p of pricelist) {
      if (!p.product_operator || !p.product_type) continue;
      const typeId = existingTypeMap.get(p.product_type.toLowerCase());
      if (!typeId) continue;
      
      const key = `${p.product_operator.toLowerCase()}_${typeId}`;
      if (!operatorMap.has(key)) {
        operatorMap.set(key, { name: p.product_operator, typeId });
      }
    }

    const existingOps = await this.prisma.iakPrabayarOperator.findMany();
    // Key gabungan: "name_typeId"
    const existingOpMap = new Map<string, number>();
    for (const o of existingOps) {
      if (o.name && o.typeId) {
        existingOpMap.set(`${o.name.toLowerCase()}_${o.typeId}`, o.id);
      }
    }

    let insertedOps = 0;
    for (const [key, val] of operatorMap.entries()) {
      if (!existingOpMap.has(key)) {
        const newOp = await this.prisma.iakPrabayarOperator.create({
          data: { name: val.name, typeId: val.typeId }
        });
        existingOpMap.set(key, newOp.id);
        insertedOps++;
      }
    }
    this.logger.log(`[IAK SYNC] Operator (Baru: ${insertedOps})`);

    // ==========================================
    // PHASE 4 - PRODUK MAPPING
    // ==========================================
    const existingProds = await this.prisma.iakPrabayarProduk.findMany({
      select: { id: true, kode: true, price: true, status: true }
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

      let opId: number | null = null;
      if (apiProd.product_operator && apiProd.product_type) {
        const typeId = existingTypeMap.get(apiProd.product_type.toLowerCase());
        if (typeId) {
          opId = existingOpMap.get(`${apiProd.product_operator.toLowerCase()}_${typeId}`) || null;
        }
      }

      const price = Number(apiProd.product_price || 0);

      const existingProd = prodMap.get(kode);
      if (existingProd) {
        if (existingProd.price !== price || existingProd.status !== finalStatus) {
          dataToUpdate.push({
            id: existingProd.id,
            price: price,
            status: finalStatus,
          });
        }
      } else {
        dataToInsert.push({
          kode,
          name: apiProd.product_description || '',
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
              data: { price: item.price, status: item.status },
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

    return {
      error: false,
      error_msg: '',
      inserted: dataToInsert.length,
      updated: dataToUpdate.length,
      total: pricelist.length
    };
  }
}

