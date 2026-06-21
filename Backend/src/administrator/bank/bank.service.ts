import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { GetBankDto } from './dto/get-bank.dto';
import sharp = require('sharp');
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BankService {
  constructor(private prisma: PrismaService) {}

  private async processAndSaveImage(file: Express.Multer.File): Promise<string> {
    if (file.size > 200 * 1024) {
      throw new BadRequestException('Ukuran file maksimal 200KB.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Format file harus JPG, JPEG, atau PNG.');
    }

    const uploadDir = path.join(__dirname, '..', '..', '..', 'public', 'uploads', 'banks');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `bank-${uniqueSuffix}.png`;
    const filepath = path.join(uploadDir, filename);

    const width = 300;
    const height = 150;
    const rx = 30;

    const roundedRectSvg = `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${rx}"/></svg>`;

    await sharp(file.buffer)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .composite([{
        input: Buffer.from(roundedRectSvg),
        blend: 'dest-in'
      }])
      .png()
      .toFile(filepath);

    return `/public/uploads/banks/${filename}`;
  }

  private async deleteOldImage(imageUrl: string) {
    if (!imageUrl) return;
    try {
      const filename = imageUrl.split('/').pop();
      if (!filename) return;
      const filepath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', 'banks', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (e) {
      console.error('Failed to delete old image:', e);
    }
  }

  async findAll(query: GetBankDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { nama: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.bank.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          _count: {
            select: { bankTransferOutlets: true, riwayatMutasis: true }
          }
        },
      }),
      this.prisma.bank.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const bank = await this.prisma.bank.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bankTransferOutlets: true, riwayatMutasis: true }
        }
      },
    });

    if (!bank) {
      throw new NotFoundException(`Bank dengan ID ${id} tidak ditemukan`);
    }

    return bank;
  }

  async create(createBankDto: CreateBankDto, file?: Express.Multer.File) {
    const existing = await this.prisma.bank.findFirst({
      where: { kode: createBankDto.kode },
    });

    if (existing) {
      throw new BadRequestException(`Bank dengan kode ${createBankDto.kode} sudah terdaftar`);
    }

    let imageUrl = createBankDto.image;
    if (file) {
      imageUrl = await this.processAndSaveImage(file);
    }

    return this.prisma.bank.create({
      data: {
        ...createBankDto,
        image: imageUrl,
      },
    });
  }

  async update(id: number, updateBankDto: UpdateBankDto, file?: Express.Multer.File) {
    const bank = await this.findOne(id); // Ensure exists

    if (updateBankDto.kode) {
      const existing = await this.prisma.bank.findFirst({
        where: { kode: updateBankDto.kode, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException(`Bank dengan kode ${updateBankDto.kode} sudah terdaftar`);
      }
    }

    let imageUrl = updateBankDto.image !== undefined ? updateBankDto.image : bank.image;

    if (file) {
      imageUrl = await this.processAndSaveImage(file);
      if (bank.image && bank.image.startsWith('/public/uploads/banks/')) {
        await this.deleteOldImage(bank.image);
      }
    }

    return this.prisma.bank.update({
      where: { id },
      data: {
        ...updateBankDto,
        image: imageUrl,
      },
    });
  }

  async remove(id: number) {
    const bank = await this.findOne(id);

    const outletCount = await this.prisma.bankTransferOutlet.count({ where: { bankId: id } });
    const mutasiCount = await this.prisma.riwayatMutasi.count({ where: { bankId: id } });

    if (outletCount > 0 || mutasiCount > 0) {
      throw new BadRequestException(`Gagal menghapus! Bank ini sedang digunakan oleh ${outletCount} data Outlet Transfer dan ${mutasiCount} data Riwayat Mutasi. Harap hapus data tersebut terlebih dahulu.`);
    }

    if (bank.image && bank.image.startsWith('/public/uploads/banks/')) {
      await this.deleteOldImage(bank.image);
    }

    return await this.prisma.bank.delete({
      where: { id },
    });
  }
}
