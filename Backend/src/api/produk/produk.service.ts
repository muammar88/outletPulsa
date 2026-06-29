import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetProdukDto } from './dto/get-produk.dto';

@Injectable()
export class ProdukService {
  constructor(private prisma: PrismaService) {}

  async getDaftarProduk(query: GetProdukDto, user?: any) {
    const { search, kategori, operator, page = 1, limit = 20 } = query;
    let isReseller = false;

    if (user && user.id) {
      const member = await this.prisma.member.findFirst({
        where: { id: Number(user.id) },
        select: { kode_agen: true }
      });
      if (member && member.kode_agen) {
        isReseller = true;
      }
    }

    const where: any = {
      status: 'active',
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { kode: { contains: search } },
      ];
    }

    if (operator) {
      where.operator = {
        kode: operator
      };
    }

    const limitNum = Number(limit) || 20;
    const pageNum = Number(page) || 1;
    const skip = (pageNum - 1) * limitNum;

    try {
      const [total, produks] = await Promise.all([
        this.prisma.produk.count({ where }),
        this.prisma.produk.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: [
            { purchase_price: 'asc' },
            { id: 'asc' } // Pengurutan sekunder untuk menjamin determinisme paginasi
          ],
          include: {
            operator: {
              include: {
                kategori: true,
              },
            },
          },
        }),
      ]);

      console.log("__________________");
      console.log(total);
      console.log(produks);
      console.log("__________________-");

      if (produks.length === 0 && pageNum === 1) {
        return {
          error: true,
          message: 'Operator tidak ditemukan atau tidak memiliki produk',
          data: {
            list_produk: {}
          }
        };
      }

      if (produks.length === 0 && pageNum > 1) {
        return {
          error: false,
          message: 'Tidak ada data produk tambahan',
          data: {
            list_produk: {}
          }
        };
      }

      const list_produk: any = {};
      produks.forEach((item, index) => {
        const harga_modal = item.purchase_price || 0;
        let markup = item.markup || 0;
        if (isReseller) {
          markup += 20;
        }
        const harga_jual = harga_modal + markup;

        list_produk[index.toString()] = {
          id: item.id,
          kode: item.kode || '',
          name: item.name || '',
          kategori: item.operator?.kategori?.name || '',
          operator: item.operator?.name || '',
          harga_modal: harga_modal.toString(),
          price: 'Rp ' + harga_jual.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
          keuntungan: markup.toString(),
          status: item.status,
          deskripsi: null,
        };
      });

      return {
        error: false,
        error_msg: '',
        data: {
          list_produk,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        error_msg: 'Terjadi kesalahan pada server',
        data: {}
      };
    }
  }

  async getDaftarKategori(kode: string, search: string = '') {
    try {
      const where: any = {
        kategori: { kode: kode },
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { kode: { contains: search, mode: 'insensitive' } },
        ];
        // Pastikan filter kategori tetap diterapkan meski ada OR
        where.AND = [{ kategori: { kode: kode } }];
        delete where.kategori;
      }

      const [total, operators] = await Promise.all([
        this.prisma.operator.count({ where }),
        this.prisma.operator.findMany({
          where,
          include: { kategori: true },
        }),
      ]);

      return {
        error: false,
        message: 'Data kategori berhasil ditemukan',
        data: { list_kategori: operators }
      };
    } catch (error) {
      return {
        error: true,
        message: 'Terjadi kesalahan pada server',
        data: { list_kategori: {} }
      };
    }
  }

  async getPrefix(body: any) {
    const { nomor_tujuan, kode } = body;

    if (!nomor_tujuan) {
      return { error: true, message: 'Nomor Whatsapp Tidak Boleh Kosong', data: {} };
    }
    if (!kode) {
      return { error: true, message: 'Kode Tidak Boleh Kosong', data: {} };
    }

    try {
      const kategori = await this.prisma.kategori.findFirst({
        where: { kode: kode }
      });

      if (!kategori) {
        return { error: true, message: 'Kode Kategori Tidak Ditemukan.', data: {} };
      }

      const needPrefix = ["PIU", "PD", "PT", "PTP", "PI"];
      if (needPrefix.includes(kode)) {
        const prefix = nomor_tujuan.substring(0, 4);
        
        const validPrefix = await this.prisma.prefix.findFirst({
          where: {
            prefix: prefix,
            operator: {
              kategori: {
                kode: kode
              }
            }
          },
          include: {
            operator: true
          }
        });

        if (!validPrefix) {
          return { error: true, message: 'Format Nomor Tujuan Tidak Sesuai.', data: {} };
        }

        return {
          error: false,
          message: "Berhasil ditemukan",
          data: {
            operator: validPrefix.operator?.kode
          }
        };
      }

      return {
        error: false,
        message: "Berhasil ditemukan",
        data: {}
      };
    } catch (error) {
      return {
        error: true,
        message: 'Terjadi kesalahan pada server',
        data: {}
      };
    }
  }
}
