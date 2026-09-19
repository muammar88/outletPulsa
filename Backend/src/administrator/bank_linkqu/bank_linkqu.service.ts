import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class BankLinkquService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.bankLinkqu.findMany({
      orderBy: { name: 'asc' },
    });
    return {
      message: 'Berhasil mengambil data Bank LinkQu',
      data,
    };
  }

  async sync() {
    // 1. Get Tenant Config
    const pengaturan = await this.prisma.pengaturanUmum.findFirst();

    if (!pengaturan) {
      throw new BadRequestException('Pengaturan umum tidak ditemukan');
    }

    if (!pengaturan.linkqu_client_id || !pengaturan.linkqu_client_secret || !pengaturan.linkqu_merchant_code) {
      throw new BadRequestException('Kredensial LinkQu belum lengkap (Membutuhkan Client ID, Secret, dan Merchant Code). Silakan atur di menu Pengaturan LinkQu.');
    }

    const clientId = pengaturan.linkqu_client_id;
    const clientSecret = pengaturan.linkqu_client_secret;

    const isSandbox = pengaturan.linkqu_is_sandbox;
    let baseUrl = isSandbox ? pengaturan.linkqu_base_url_dev : pengaturan.linkqu_base_url_prod;

    if (!baseUrl || baseUrl.trim() === '') {
      baseUrl = isSandbox ? 'https://gateway-dev.linkqu.id' : 'https://api.linkqu.id';
    }

    baseUrl = baseUrl.replace(/\/+$/, '').replace(/\/linkqu-partner$/, '');

    // 2. Fetch Data from LinkQu API
    let responseData;
    try {
      const response = await fetch(`${baseUrl}/linkqu-partner/masterbank/list`, {
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

    const banks = responseData.data;
    if (!Array.isArray(banks)) {
      throw new BadRequestException('Format response API LinkQu tidak sesuai.');
    }

    let added = 0;
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    let total = 0;

    for (const bank of banks) {
      total++;
      const kode = typeof bank.kodeBank === 'string' ? bank.kodeBank.trim() : null;
      const name = typeof bank.namaBank === 'string' ? bank.namaBank.trim() : null;

      if (!kode || !name) {
        failed++;
        continue;
      }

      let image = typeof bank.url_image === 'string' ? bank.url_image.trim() : null;
      if (image && image.includes('gateway-dev.linkqu.id/permata.png')) {
        image = null;
      }

      try {
        const existing = await this.prisma.bankLinkqu.findFirst({
          where: { kode },
        });

        if (existing) {
          if (existing.name !== name || existing.image !== image) {
            await this.prisma.bankLinkqu.update({
              where: { id: existing.id },
              data: { name, image },
            });
            updated++;
          } else {
            skipped++;
          }
        } else {
          await this.prisma.bankLinkqu.create({
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

  async updateStatus(id: number, status: boolean) {
    const existing = await this.prisma.bankLinkqu.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new BadRequestException('Bank tidak ditemukan');
    }
    const updated = await this.prisma.bankLinkqu.update({
      where: { id },
      data: { status },
    });
    return {
      message: 'Status bank berhasil diperbarui',
      data: updated,
    };
  }
}
