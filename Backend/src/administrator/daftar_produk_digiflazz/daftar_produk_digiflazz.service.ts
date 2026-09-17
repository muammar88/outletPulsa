import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetDigiflazzProductDto } from './dto/get-digiflazz-product.dto';

@Injectable()
export class DaftarProdukDigiflazzService {
  private readonly logger = new Logger(DaftarProdukDigiflazzService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetDigiflazzProductDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '100', 10);
    const search = query.search || '';
    
    const kategoriId = query.kategoriId ? parseInt(query.kategoriId, 10) : undefined;
    const brandId = query.brandId ? parseInt(query.brandId, 10) : undefined;
    const typeId = query.typeId ? parseInt(query.typeId, 10) : undefined;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { selectedSellerBuyerSkuKode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (kategoriId) {
      where.categoryId = kategoriId;
    }
    
    if (brandId) {
      where.brandId = brandId;
    }

    if (typeId) {
      where.typeId = typeId;
    }

    if (query.connectionStatus) {
      if (query.connectionStatus === 'connected') {
        where.produkId = { not: null };
      } else if (query.connectionStatus === 'disconnected') {
        where.produkId = null;
      }
    }

    if (query.status) {
      where.status = query.status;
    }

    const [list, total] = await Promise.all([
      this.prisma.digiflazzProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { selectedSellerPrice: 'asc' },
        include: {
          category: true,
          brand: true,
          type: true,
          produk: true, // internal product connection
          digiflazzSellerProducts: {
            include: { digiflazzSeller: true }
          },
          _count: {
            select: {
              digiflazzSellerProducts: true,
            },
          },
        },
      }),
      this.prisma.digiflazzProduct.count({ where }),
    ]);

    return {
      list,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async getFilters() {
    // Return unique categories, brands, and types for the frontend filters
    const [categories, brands, types] = await Promise.all([
      this.prisma.digiflazzCategory.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.digiflazzBrand.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.digiflazzType.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return {
      categories,
      brands,
      types
    };
  }

  async selectCheapestSeller() {
    this.logger.log('Memulai proses pemilihan produk seller termurah...');
    
    const digiflazzProducts = await this.prisma.digiflazzProduct.findMany({
      include: {
        digiflazzSellerProducts: {
          where: {
            sellerProductStatus: true,
            temp_status: 'unbanned',
            digiflazzSeller: {
              status: 'unbanned',
            },
          },
          orderBy: {
            price: 'asc',
          },
          take: 1,
        },
      },
    });

    let totalProcessed = digiflazzProducts.length;
    let totalUpdated = 0;
    let totalSkipped = 0;

    const updateOperations: any[] = [];

    for (const product of digiflazzProducts) {
      if (product.digiflazzSellerProducts.length > 0) {
        const cheapestSellerProduct = product.digiflazzSellerProducts[0];
        
        if (
          product.selectedSellerBuyerSkuKode !== cheapestSellerProduct.buyerSkuKode ||
          product.selectedSellerPrice !== cheapestSellerProduct.price
        ) {
          updateOperations.push(
            this.prisma.digiflazzProduct.update({
              where: { id: product.id },
              data: {
                selectedSellerBuyerSkuKode: cheapestSellerProduct.buyerSkuKode,
                selectedSellerPrice: cheapestSellerProduct.price,
              },
            })
          );
        }
        totalUpdated++;
      } else {
        totalSkipped++;
      }
    }

    if (updateOperations.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < updateOperations.length; i += chunkSize) {
        const chunk = updateOperations.slice(i, i + chunkSize);
        await this.prisma.$transaction(chunk);
      }
    }

    this.logger.log(`Proses selesai. Processed: ${totalProcessed}, Updated: ${totalUpdated}, Skipped: ${totalSkipped}`);

    return {
      totalProcessed,
      totalUpdated,
      totalSkipped,
    };
  }

  async selectCheapestSellerByProductId(productId: number) {
    this.logger.log(`Mencari seller termurah alternatif untuk produk Digiflazz ID: ${productId}`);
    
    const product = await this.prisma.digiflazzProduct.findUnique({
      where: { id: productId },
      include: {
        digiflazzSellerProducts: {
          where: {
            sellerProductStatus: true,
            temp_status: 'unbanned',
            digiflazzSeller: {
              status: 'unbanned',
            },
          },
          orderBy: {
            price: 'asc',
          },
          take: 1,
        },
      },
    });

    if (!product || product.digiflazzSellerProducts.length === 0) {
      this.logger.warn(`Tidak ditemukan seller alternatif yang tersedia untuk produk ID ${productId}`);
      return false;
    }

    const cheapestSellerProduct = product.digiflazzSellerProducts[0];
    
    if (
      product.selectedSellerBuyerSkuKode !== cheapestSellerProduct.buyerSkuKode ||
      product.selectedSellerPrice !== cheapestSellerProduct.price
    ) {
      await this.prisma.digiflazzProduct.update({
        where: { id: product.id },
        data: {
          selectedSellerBuyerSkuKode: cheapestSellerProduct.buyerSkuKode,
          selectedSellerPrice: cheapestSellerProduct.price,
        },
      });
      this.logger.log(`Berhasil mengubah seller produk ID ${productId} ke SKU ${cheapestSellerProduct.buyerSkuKode}`);
      return true;
    }
    
    return false;
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
      digiflazzProducts: {
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

  async connectProduct(id: number, produkId: number) {
    const digiflazzProd = await this.prisma.digiflazzProduct.findUnique({ where: { id } });
    if (!digiflazzProd) throw new Error('Produk Digiflazz tidak ditemukan');

    const internalProd = await this.prisma.produk.findUnique({ where: { id: produkId } });
    if (!internalProd) throw new Error('Produk Internal tidak ditemukan');

    return this.prisma.digiflazzProduct.update({
      where: { id },
      data: { produkId },
      include: {
        category: true,
        brand: true,
        type: true,
        produk: true
      }
    });
  }

  async getConnectedSellers(id: number) {
    return this.prisma.digiflazzSellerProduct.findMany({
      where: { productDigiflazzId: id },
      include: {
        digiflazzSeller: true,
      },
      orderBy: { price: 'asc' },
    });
  }

  async toggleStatus(id: number) {
    const product = await this.prisma.digiflazzProduct.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    return this.prisma.digiflazzProduct.update({
      where: { id },
      data: { status: newStatus },
    });
  }
  async selectSellerManual(id: number, sellerProductId: number) {
    const sellerProduct = await this.prisma.digiflazzSellerProduct.findUnique({
      where: { id: sellerProductId }
    });

    if (!sellerProduct) {
      throw new Error('Produk seller tidak ditemukan');
    }

    if (sellerProduct.productDigiflazzId !== id) {
      throw new Error('Produk seller tidak cocok dengan produk Digiflazz ini');
    }

    if (sellerProduct.temp_status === 'banned') {
      throw new Error('Produk seller ini sedang dinonaktifkan sementara (BANNED) hari ini karena gangguan');
    }

    return this.prisma.digiflazzProduct.update({
      where: { id },
      data: {
        selectedSellerBuyerSkuKode: sellerProduct.buyerSkuKode,
        selectedSellerPrice: sellerProduct.price,
      },
    });
  }
}
