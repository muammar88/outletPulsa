import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateAgenDto } from './dto/create-agen.dto';
import { UpdateAgenDto } from './dto/update-agen.dto';
import { GetAgenDto } from './dto/get-agen.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DaftarAgenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetAgenDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';

    const skip = (page - 1) * limit;

    // Ambil kode_agen dari member yang menggunakannya
    const agenCodesResult = await this.prisma.member.findMany({
      where: { kode_agen: { not: null } },
      select: { kode_agen: true },
      distinct: ['kode_agen'],
    });

    const validAgenCodes = agenCodesResult
      .map((c) => c.kode_agen)
      .filter((c) => c !== null) as string[];

    const where = {
      kode: { in: validAgenCodes },
      ...(search
        ? {
            OR: [
              { fullname: { contains: search, mode: 'insensitive' as any } },
              { kode: { contains: search, mode: 'insensitive' as any } },
            ],
          }
        : {}),
    };

    const [list, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.member.count({ where }),
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
    const agen = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!agen) {
      throw new NotFoundException(`Agen with ID ${id} not found`);
    }

    // We could strictly enforce that this member is an agen, 
    // but allowing view/edit for the specific ID is fine in admin.
    return agen;
  }

  async create(createAgenDto: CreateAgenDto) {
    const lastMember = await this.prisma.member.findFirst({
      orderBy: { id: 'desc' },
    });
    const nextId = lastMember ? lastMember.id + 1 : 1;
    // Prefix AGN untuk menandakan dibuat dari halaman agen (jika diperlukan)
    const generatedKode = `AGN${String(nextId).padStart(4, '0')}`;

    if (createAgenDto.kode_agen) {
      const targetAgen = await this.prisma.member.findFirst({
        where: { kode: createAgenDto.kode_agen }
      });
      if (!targetAgen) {
        throw new BadRequestException(`Kode agen ${createAgenDto.kode_agen} tidak ditemukan`);
      }
      if (targetAgen.status !== 'verfied') {
        throw new BadRequestException(`Member dengan kode ${createAgenDto.kode_agen} belum terverifikasi`);
      }
    }

    const hashedPassword = await bcrypt.hash(createAgenDto.password, 10);

    const newAgen = await this.prisma.member.create({
      data: {
        kode: generatedKode,
        fullname: createAgenDto.fullname,
        whatsappnumber: createAgenDto.whatsappnumber,
        kode_agen: createAgenDto.kode_agen,
        password: hashedPassword,
        saldo: createAgenDto.saldo || 0,
        status: createAgenDto.status || 'unverified',
      },
    });

    return newAgen;
  }

  async update(id: number, updateAgenDto: UpdateAgenDto) {
    const agen = await this.findOne(id); // Ensure exists

    if (updateAgenDto.kode_agen) {
      if (updateAgenDto.kode_agen === agen.kode) {
        throw new BadRequestException('Kode agen tidak boleh sama dengan kode agen sendiri');
      }
      const targetAgen = await this.prisma.member.findFirst({
        where: { kode: updateAgenDto.kode_agen }
      });
      if (!targetAgen) {
        throw new BadRequestException(`Kode agen ${updateAgenDto.kode_agen} tidak ditemukan`);
      }
      if (targetAgen.status !== 'verfied') {
        throw new BadRequestException(`Member dengan kode ${updateAgenDto.kode_agen} belum terverifikasi`);
      }
    }

    const updateData: any = { ...updateAgenDto };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    if (updateData.kode) {
      const existing = await this.prisma.member.findFirst({
        where: { kode: updateData.kode, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException(`Agen dengan kode ${updateData.kode} sudah terdaftar`);
      }
    }

    return this.prisma.member.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.member.delete({
      where: { id },
    });
  }
}
