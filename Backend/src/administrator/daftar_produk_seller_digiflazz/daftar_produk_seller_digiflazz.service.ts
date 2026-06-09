import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetProdukSellerDigiflazzDto } from './dto/get-produk-seller-digiflazz.dto';
import * as crypto from 'crypto';

@Injectable()
export class DaftarProdukSellerDigiflazzService {
  private readonly logger = new Logger(DaftarProdukSellerDigiflazzService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetProdukSellerDigiflazzDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const sellerId = query.sellerId;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { buyerSkuKode: { contains: search, mode: 'insensitive' } },
        { digiflazzProduct: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (sellerId) {
      where.sellerId = parseInt(sellerId, 10);
    }

    const [list, total] = await Promise.all([
      this.prisma.digiflazzSellerProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { buyerSkuKode: 'asc' },
        include: {
          digiflazzProduct: true,
          digiflazzSeller: true
        }
      }),
      this.prisma.digiflazzSellerProduct.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSellers() {
    return await this.prisma.digiflazzSeller.findMany({
      orderBy: { name: 'asc' }
    });
  }

  private signMd5(username: string, apiKey: string, suffix: string) {
    return crypto.createHash('md5').update(username + apiKey + suffix).digest('hex');
  }

  async syncProducts(adminId: number) {
    const username = process.env.DIGIFLAZZ_USERNAME || 'gapajaD7VQKo';
    const mode = process.env.DIGIFLAZZ_MODE || 'development';
    const apiKey = mode === 'production' 
      ? process.env.DIGIFLAZZ_API_KEY_PROD || '39a2cc82-ffb3-5a56-9d99-59a9a49d99b3' 
      : process.env.DIGIFLAZZ_API_KEY_DEV || 'dev-82309dd0-8684-11ee-bada-e3aa4ec369e9';
    
    const baseUrl = 'https://api.digiflazz.com/v1/price-list';

    this.logger.log(`[DIGIFLAZZ SYNC] Memulai sinkronisasi Digiflazz. Mode: ${mode}, URL: ${baseUrl}`);

    const sign = this.signMd5(username, apiKey, 'pricelist');
    
    let digiflazzData: any[] = [];

    try {
      this.logger.log(`[DIGIFLAZZ SYNC] Mengambil data pricelist dari server...`);

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          cmd: "prepaid",
          username,
          sign,
        })
      });

      const bodyText = await response.text();
      const opJson = JSON.parse(bodyText);

      if (opJson.data && Array.isArray(opJson.data)) {
        digiflazzData = opJson.data;
      } else {
        throw new Error('Format response Digiflazz tidak valid atau data kosong.');
      }
    } catch (err: any) {
      this.logger.error(`[DIGIFLAZZ SYNC] Gagal fetch ke Digiflazz: ${err.message}`);
      throw new Error(`Gagal menghubungi server Digiflazz: ${err.message}`);
    }

    this.logger.log(`[DIGIFLAZZ SYNC] Berhasil mengumpulkan ${digiflazzData.length} produk dari server Digiflazz.`);

    // ==========================================
    // PHASE 2 - MAP EXISTING DATA
    // ==========================================
    
    // category
    const catMap = new Map<string, number>();
    const existingCategories = await this.prisma.digiflazzCategory.findMany();
    for (const c of existingCategories) catMap.set((c.name || '').trim().replace(/\s/g, "_"), c.id);

    // brand
    const brandMap = new Map<string, number>();
    const existingBrands = await this.prisma.digiflazzBrand.findMany();
    for (const b of existingBrands) brandMap.set((b.name || '').trim().replace(/\s/g, "_"), b.id);

    // type
    const typeMap = new Map<string, number>();
    const existingTypes = await this.prisma.digiflazzType.findMany();
    for (const t of existingTypes) typeMap.set((t.name || '').trim().replace(/\s/g, "_"), t.id);

    // seller
    const sellerMap = new Map<string, number>();
    const existingSellers = await this.prisma.digiflazzSeller.findMany();
    for (const s of existingSellers) sellerMap.set((s.name || '').trim().replace(/\s/g, "_"), s.id);

    // product (Induk)
    const productMap = new Map<string, number>();
    const existingProducts = await this.prisma.digiflazzProduct.findMany({
      include: {
        category: true,
        brand: true,
        type: true
      }
    });
    for (const p of existingProducts) {
      const name = (p.name || '').trim().replace(/\s/g, "_");
      const cName = (p.category?.name || '').trim().replace(/\s/g, "_");
      const bName = (p.brand?.name || '').trim().replace(/\s/g, "_");
      const tName = (p.type?.name || '').trim().replace(/\s/g, "_");
      productMap.set(`${name}+${cName}+${bName}+${tName}`, p.id);
    }

    // sellerProduct
    const sellerProductMap = new Map<string, number>();
    const existingSellerProducts = await this.prisma.digiflazzSellerProduct.findMany({
      select: { id: true, buyerSkuKode: true }
    });
    for (const sp of existingSellerProducts) {
      if (sp.buyerSkuKode) sellerProductMap.set(sp.buyerSkuKode, sp.id);
    }

    // ==========================================
    // PHASE 3 - IDENTIFY NEW RELATED DATA
    // ==========================================
    
    const newCategories = new Set<string>();
    const newBrands = new Set<string>();
    const newTypes = new Set<string>();
    const newSellers = new Set<string>();
    const newProducts = new Map<string, {name: string, categoryId: number, brandId: number, typeId: number}>();
    
    const dataToInsert: any[] = [];
    const dataToUpdate: any[] = [];

    // Loop 1: Find unrecorded relations
    for (const apiProd of digiflazzData) {
      const e_category = (apiProd.category || '').trim().replace(/\s/g, "_");
      const e_brand = (apiProd.brand || '').trim().replace(/\s/g, "_");
      const e_type = (apiProd.type || '').trim().replace(/\s/g, "_");
      const e_seller = (apiProd.seller_name || '').trim().replace(/\s/g, "_");
      
      if (!catMap.has(e_category) && e_category) newCategories.add(e_category);
      if (!brandMap.has(e_brand) && e_brand) newBrands.add(e_brand);
      if (!typeMap.has(e_type) && e_type) newTypes.add(e_type);
      if (!sellerMap.has(e_seller) && e_seller) newSellers.add(e_seller);
    }

    // Insert new Categories
    if (newCategories.size > 0) {
      this.logger.log(`[DIGIFLAZZ SYNC] Menambahkan ${newCategories.size} kategori baru...`);
      for (const c of Array.from(newCategories)) {
        const created = await this.prisma.digiflazzCategory.create({ data: { name: c.replace(/_/g, " ") } });
        catMap.set(c, created.id);
      }
    }

    // Insert new Brands
    if (newBrands.size > 0) {
      this.logger.log(`[DIGIFLAZZ SYNC] Menambahkan ${newBrands.size} brand baru...`);
      for (const b of Array.from(newBrands)) {
        const created = await this.prisma.digiflazzBrand.create({ data: { name: b.replace(/_/g, " ") } });
        brandMap.set(b, created.id);
      }
    }

    // Insert new Types
    if (newTypes.size > 0) {
      this.logger.log(`[DIGIFLAZZ SYNC] Menambahkan ${newTypes.size} type baru...`);
      for (const t of Array.from(newTypes)) {
        const created = await this.prisma.digiflazzType.create({ data: { name: t.replace(/_/g, " ") } });
        typeMap.set(t, created.id);
      }
    }

    // Insert new Sellers
    if (newSellers.size > 0) {
      this.logger.log(`[DIGIFLAZZ SYNC] Menambahkan ${newSellers.size} seller baru...`);
      for (const s of Array.from(newSellers)) {
        const created = await this.prisma.digiflazzSeller.create({ data: { name: s.replace(/_/g, " ") } });
        sellerMap.set(s, created.id);
      }
    }

    // Loop 2: Find new Parent Products
    for (const apiProd of digiflazzData) {
      const e_category = (apiProd.category || '').trim().replace(/\s/g, "_");
      const e_brand = (apiProd.brand || '').trim().replace(/\s/g, "_");
      const e_type = (apiProd.type || '').trim().replace(/\s/g, "_");
      const e_product = (apiProd.product_name || '').trim().replace(/\s/g, "_");
      
      const e_key_product = `${e_product}+${e_category}+${e_brand}+${e_type}`;

      if (!productMap.has(e_key_product) && !newProducts.has(e_key_product)) {
        newProducts.set(e_key_product, {
          name: e_product.replace(/_/g, " "),
          categoryId: catMap.get(e_category) || 0,
          brandId: brandMap.get(e_brand) || 0,
          typeId: typeMap.get(e_type) || 0,
        });
      }
    }

    // Insert new Parent Products
    if (newProducts.size > 0) {
      this.logger.log(`[DIGIFLAZZ SYNC] Menambahkan ${newProducts.size} product induk baru...`);
      for (const [key, val] of Array.from(newProducts.entries())) {
        const created = await this.prisma.digiflazzProduct.create({ 
          data: { 
            name: val.name,
            categoryId: val.categoryId || null,
            brandId: val.brandId || null,
            typeId: val.typeId || null,
            status: "inactive"
          } 
        });
        productMap.set(key, created.id);
      }
    }

    // Loop 3: Upsert Seller Products
    const dummyDate = "1970-01-01T";
    const parseTime = (timeStr: string) => {
      if (!timeStr) return null;
      try {
        // timeStr usually "23:00" or "02:00"
        return new Date(`${dummyDate}${timeStr.trim()}:00.000Z`);
      } catch (e) {
        return null;
      }
    };

    for (const apiProd of digiflazzData) {
      const e_category = (apiProd.category || '').trim().replace(/\s/g, "_");
      const e_brand = (apiProd.brand || '').trim().replace(/\s/g, "_");
      const e_type = (apiProd.type || '').trim().replace(/\s/g, "_");
      const e_product = (apiProd.product_name || '').trim().replace(/\s/g, "_");
      const e_seller = (apiProd.seller_name || '').trim().replace(/\s/g, "_");
      
      const e_key_product = `${e_product}+${e_category}+${e_brand}+${e_type}`;
      const e_buyer_sku_code = (apiProd.buyer_sku_code || '').trim();
      
      const e_status = apiProd.buyer_product_status === true || apiProd.buyer_product_status === "true";
      const e_start_cut_off = parseTime(apiProd.start_cut_off);
      const e_end_cut_off = parseTime(apiProd.end_cut_off);
      const e_price = Number(apiProd.price || 0);

      const productId = productMap.get(e_key_product);
      const sellerId = sellerMap.get(e_seller);

      if (!productId || !sellerId) continue;

      if (sellerProductMap.has(e_buyer_sku_code)) {
        dataToUpdate.push({
          id: sellerProductMap.get(e_buyer_sku_code),
          sellerId,
          price: e_price,
          sellerProductStatus: e_status,
          startCutOff: e_start_cut_off,
          endCutOff: e_end_cut_off
        });
      } else {
        dataToInsert.push({
          productDigiflazzId: productId,
          sellerId,
          buyerSkuKode: e_buyer_sku_code,
          price: e_price,
          sellerProductStatus: e_status,
          startCutOff: e_start_cut_off,
          endCutOff: e_end_cut_off
        });
        // Biar nggak insert dobel jika ada API duplicate
        sellerProductMap.set(e_buyer_sku_code, -1); 
      }
    }

    this.logger.log(`[DIGIFLAZZ SYNC] Produk Seller -> Insert: ${dataToInsert.length}, Update: ${dataToUpdate.length}`);

    if (dataToInsert.length > 0) {
      await this.prisma.digiflazzSellerProduct.createMany({
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
            this.prisma.digiflazzSellerProduct.update({
              where: { id: item.id },
              data: { 
                sellerId: item.sellerId,
                price: item.price, 
                sellerProductStatus: item.sellerProductStatus, 
                startCutOff: item.startCutOff,
                endCutOff: item.endCutOff
              },
            })
          )
        );
      }
    }

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'SYNC_PRODUK_DIGIFLAZZ',
        entity: 'DigiflazzSellerProduct',
        description: `Melakukan sinkronisasi produk Digiflazz. Baru: ${dataToInsert.length}, Diperbarui: ${dataToUpdate.length}`,
      }
    });

    return {
      error: false,
      error_msg: '',
      inserted: dataToInsert.length,
      updated: dataToUpdate.length,
      total: digiflazzData.length
    };
  }
}
