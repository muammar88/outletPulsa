import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetProdukDto } from './dto/get-produk.dto';

@Injectable()
export class ProdukService {
  constructor(private prisma: PrismaService) {}

  async getDaftarProduk(query: GetProdukDto) {
    const { search, kategori, operator, page = 1, limit = 20 } = query;

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

    try {
      const [total, produks] = await Promise.all([
        this.prisma.produk.count({ where }),
        this.prisma.produk.findMany({
          where,
          include: {
            operator: {
              include: {
                kategori: true,
              },
            },
          },
        }),
      ]);

      produks.sort((a, b) => {
        const hargaA = (a.purchase_price || 0) + (a.markup || 0);
        const hargaB = (b.purchase_price || 0) + (b.markup || 0);
        return hargaA - hargaB;
      });

      console.log("__________________");
      console.log(total);
      console.log(produks);
      console.log("__________________-");

      if (produks.length === 0) {
        return {
          error: true,
          message: 'Operator tidak ditemukan atau tidak memiliki produk',
          data: {
            list_produk: {}
          }
        };
      }

      const list_produk: any = {};
      produks.forEach((item, index) => {
        const harga_modal = item.purchase_price || 0;
        const markup = item.markup || 0;
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

  async getDaftarKategori(kode: string) {
    try {
      // const kategori = await this.prisma.kategori.findFirst({
      //   where: { kode: kode },
      //   // include: {
      //   //   operators: {
      //   //     select: {
      //   //       id: true,
      //   //       kode: true,
      //   //       name: true,
      //   //     }
      //   //   }
      //   // }
      // });

      // if (!kategori) {
      //   return {
      //     error: false,
      //     message: 'Kategori tidak ditemukan',
      //     data: {
      //       list_kategori: {}
      //     }
      //   };
      // }

      // if (!kategori.operators || kategori.operators.length === 0) {
      //   return {
      //     error: false,
      //     error_msg: 'Data operator kosong untuk kategori ini',
      //     message: 'Data operator kosong untuk kategori ini',
      //     data: {
      //       list_kategori: {}
      //     }
      //   };
      // }

      // Format as Map {"0": {...}, "1": {...}} to be compatible with Flutter Model_list_kategori
      // const list_kategori: any = {};
      // kategori.operators.forEach((op, index) => {
      //   list_kategori[index.toString()] = {
      //     uuid: op.id.toString(),
      //     kode: op.kode,
      //     nama: op.name,
      //     kodeKategori: kategori.kode,
      //     status: 'aktif'
      //   };
      // });

      const [total, operators] = await Promise.all([
        this.prisma.operator.count({ where : {
            kategori : {
              kode: kode
            },
          } }),
        this.prisma.operator.findMany({
          where : {
            kategori : {
              kode: kode
            },
          },
          include: {
            kategori: true
          },
        }),
      ]);

      // console.log("**********************8");
      // console.log(operators);
      // console.log("**********************8");

      return {
        error: false,
        message: 'Data kategori berhasil ditemukan',
        data: {
          list_kategori: operators
        }
      };
    } catch (error) {
      // console.log("~~~~~~~~~~~~~~");
      // console.error(error);
      // console.log("~~~~~~~~~~~~~~");
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
