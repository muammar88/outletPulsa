import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateEmoneyLinkquDto } from './dto/create-emoney_linkqu.dto';
import { UpdateEmoneyLinkquDto } from './dto/update-emoney_linkqu.dto';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class EmoneyLinkquService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEmoneyLinkquDto: CreateEmoneyLinkquDto) {
    return await this.prisma.emoneyLinkqu.create({
      data: createEmoneyLinkquDto,
    });
  }

  async findAll() {
    return await this.prisma.emoneyLinkqu.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.emoneyLinkqu.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Data tidak ditemukan');
    return item;
  }

  async update(id: number, updateEmoneyLinkquDto: UpdateEmoneyLinkquDto) {
    await this.findOne(id);
    return await this.prisma.emoneyLinkqu.update({
      where: { id },
      data: updateEmoneyLinkquDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prisma.emoneyLinkqu.delete({
      where: { id },
    });
  }

  async sync() {
    // 1. Get Tenant Config
    const pengaturan = await this.prisma.pengaturanUmum.findFirst();

    if (!pengaturan) {
      throw new BadRequestException('Pengaturan umum tidak ditemukan');
    }

    console.log('=== PENGATURAN ===', pengaturan);

    if (!pengaturan.linkqu_client_id || !pengaturan.linkqu_client_secret || !pengaturan.linkqu_merchant_code) {
      throw new BadRequestException('Kredensial LinkQu belum lengkap (Membutuhkan Client ID, Secret, dan Merchant Code). Silakan atur di menu Pengaturan LinkQu.');
    }

    const clientId = pengaturan.linkqu_client_id;
    const clientSecret = pengaturan.linkqu_client_secret;
    const username = pengaturan.linkqu_merchant_code;

    const isSandbox = pengaturan.linkqu_is_sandbox;
    let baseUrl = isSandbox ? pengaturan.linkqu_base_url_dev : pengaturan.linkqu_base_url_prod;

    if (!baseUrl || baseUrl.trim() === '') {
      baseUrl = isSandbox ? 'https://gateway-dev.linkqu.id' : 'https://api.linkqu.id';
    }

    baseUrl = baseUrl.replace(/\/+$/, '').replace(/\/linkqu-partner$/, '');

    // 2. Fetch Data from LinkQu API
    let responseData;
    try {
      const response = await fetch(`${baseUrl}/linkqu-partner/data/emoney?username=${username}`, {
        method: 'GET',
        headers: {
          'client-id': clientId,
          'client-secret': clientSecret,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      responseData = await response.json();
    } catch (error: any) {
      throw new BadRequestException(`Gagal menghubungi API LinkQu: ${error.message}`);
    }

    if (responseData.rc !== '00') {
      throw new BadRequestException(`LinkQu Error: ${responseData.rd || 'Unknown error'}`);
    }

    const groups = responseData.data;
    if (!Array.isArray(groups)) {
      throw new BadRequestException('Format response API LinkQu tidak sesuai.');
    }

    let added = 0;
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    let total = 0;

    for (const group of groups) {
      if (Array.isArray(group.dataproduk)) {
        for (const item of group.dataproduk) {
          total++;
          const kode = typeof item.kodebank === 'string' ? item.kodebank.trim() : null;
          const name = typeof item.namaproduk === 'string' ? item.namaproduk.trim() : null;
          
          if (!kode || !name) {
            failed++;
            continue;
          }

          let image = typeof item.url_image === 'string' ? item.url_image.trim() : null;
          if (image && image.includes('gateway-dev.linkqu.id/permata.png')) {
            image = null;
          }

          try {
            const existing = await this.prisma.emoneyLinkqu.findFirst({
              where: { kode },
            });

            if (existing) {
              if (existing.name !== name || existing.image !== image) {
                await this.prisma.emoneyLinkqu.update({
                  where: { id: existing.id },
                  data: { name, image },
                });
                updated++;
              } else {
                skipped++;
              }
            } else {
              await this.prisma.emoneyLinkqu.create({
                data: {
                  kode,
                  name,
                  image,
                },
              });
              added++;
            }
          } catch (err) {
            failed++;
          }
        }
      }
    }

    return {
      message: 'Sinkronisasi berhasil',
      data: {
        total,
        added,
        updated,
        skipped,
        failed,
      }
    };
  }
}
