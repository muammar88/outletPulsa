import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { GetMemberDto } from './dto/get-member.dto';
import { TambahSaldoDto } from './dto/tambah-saldo.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DaftarMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetMemberDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { fullname: { contains: search, mode: 'insensitive' as any } },
            { kode: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

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
    const member = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  async create(createMemberDto: CreateMemberDto) {
    const lastMember = await this.prisma.member.findFirst({
      orderBy: { id: 'desc' },
    });
    const nextId = lastMember ? lastMember.id + 1 : 1;
    const generatedKode = `MBR${String(nextId).padStart(4, '0')}`;

    if (createMemberDto.kode_agen) {
      const targetAgen = await this.prisma.member.findFirst({
        where: { kode: createMemberDto.kode_agen }
      });
      if (!targetAgen) {
        throw new BadRequestException(`Kode agen ${createMemberDto.kode_agen} tidak ditemukan`);
      }
      if (targetAgen.status !== 'verfied') {
        throw new BadRequestException(`Member dengan kode ${createMemberDto.kode_agen} belum terverifikasi`);
      }
    }

    const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);

    const newMember = await this.prisma.member.create({
      data: {
        kode: generatedKode,
        fullname: createMemberDto.fullname,
        whatsappnumber: createMemberDto.whatsappnumber,
        kode_agen: createMemberDto.kode_agen,
        password: hashedPassword,
        saldo: createMemberDto.saldo || 0,
        status: createMemberDto.status || 'unverified',
      },
    });

    return newMember;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const member = await this.findOne(id); // Ensure member exists

    if (updateMemberDto.kode_agen) {
      if (updateMemberDto.kode_agen === member.kode) {
        throw new BadRequestException('Kode agen tidak boleh sama dengan kode member sendiri');
      }
      const targetAgen = await this.prisma.member.findFirst({
        where: { kode: updateMemberDto.kode_agen }
      });
      if (!targetAgen) {
        throw new BadRequestException(`Kode agen ${updateMemberDto.kode_agen} tidak ditemukan`);
      }
      if (targetAgen.status !== 'verfied') {
        throw new BadRequestException(`Member dengan kode ${updateMemberDto.kode_agen} belum terverifikasi`);
      }
    }

    const updateData: any = { ...updateMemberDto };

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
        throw new BadRequestException(`Member dengan kode ${updateData.kode} sudah terdaftar`);
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

  async tambahSaldo(dto: TambahSaldoDto) {
    const { member_id, nominal } = dto;

    if (nominal <= 0) {
      throw new BadRequestException('Nominal harus lebih besar dari 0');
    }

    return await this.prisma.$transaction(async (prisma) => {
      const member = await prisma.member.findUnique({
        where: { id: member_id },
      });

      if (!member) {
        throw new NotFoundException(`Member dengan ID ${member_id} tidak ditemukan`);
      }

      const saldoLama = member.saldo || 0;
      const saldoBaru = saldoLama + nominal;
      const generatedKode = `DEP-${Date.now()}`;

      // Create RiwayatSaldo
      await prisma.riwayatSaldo.create({
        data: {
          kode: generatedKode,
          member_id: member.id,
          nominal: nominal,
          saldo_sebelumnya: saldoLama,
          saldo_setelahnya: saldoBaru,
          status: 'deposit',
          ket: 'Tambah saldo oleh administrator',
        },
      });

      // Update Member
      await prisma.member.update({
        where: { id: member.id },
        data: { saldo: saldoBaru },
      });

      return {
        member_id: member.id,
        saldo_lama: saldoLama,
        nominal_tambah: nominal,
        saldo_baru: saldoBaru,
        message: 'Saldo berhasil ditambahkan',
      };
    });
  }
}
