import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { GetDepositDto } from './dto/get-deposit.dto';

@Injectable()
export class DepositService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetDepositDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const kategori = query.kategori;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { ket: { contains: search, mode: 'insensitive' } },
        { member: { fullname: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (kategori) {
      where.status = kategori;
    }

    const [list, total] = await Promise.all([
      this.prisma.riwayatSaldo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          member: true,
        },
      }),
      this.prisma.riwayatSaldo.count({ where }),
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
    const deposit = await this.prisma.riwayatSaldo.findUnique({
      where: { id },
      include: {
        member: true,
      },
    });

    if (!deposit) {
      throw new NotFoundException(`Riwayat Saldo with ID ${id} not found`);
    }
    return deposit;
  }

  async create(createDepositDto: CreateDepositDto) {
    return await this.prisma.$transaction(async (prisma) => {
      const member = await prisma.member.findUnique({
        where: { id: createDepositDto.member_id },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${createDepositDto.member_id} not found`);
      }

      const generatedKode = `RWS-${Date.now()}`;
      
      const saldoLama = member.saldo || 0;
      let saldoBaru = saldoLama;
      
      if (createDepositDto.status === 'deposit' || createDepositDto.status === 'pencairan_fee_agen') {
        saldoBaru = saldoLama + createDepositDto.nominal;
      } else {
        saldoBaru = saldoLama - createDepositDto.nominal;
      }

      const newRecord = await prisma.riwayatSaldo.create({
        data: {
          kode: generatedKode,
          member_id: member.id,
          nominal: createDepositDto.nominal,
          saldo_sebelumnya: saldoLama,
          saldo_setelahnya: saldoBaru,
          status: createDepositDto.status,
          ket: createDepositDto.ket || 'Dibuat secara manual oleh Admin',
        },
      });

      await prisma.member.update({
        where: { id: member.id },
        data: { saldo: saldoBaru },
      });

      return newRecord;
    });
  }

  async update(id: number, updateDepositDto: UpdateDepositDto) {
    const deposit = await this.findOne(id);
    
    return this.prisma.riwayatSaldo.update({
      where: { id },
      data: {
        status: updateDepositDto.status,
        ket: updateDepositDto.ket,
      },
    });
  }

  async remove(id: number) {
    const deposit = await this.findOne(id);

    return await this.prisma.$transaction(async (prisma) => {
      const member = await prisma.member.findUnique({
        where: { id: deposit.member_id },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${deposit.member_id} not found`);
      }

      const saldoLama = member.saldo || 0;
      let saldoBaru = saldoLama;

      if (deposit.status === 'deposit' || deposit.status === 'pencairan_fee_agen') {
        saldoBaru = saldoLama - deposit.nominal;
      } else if (deposit.status === 'pembelian_pulsa' || deposit.status === 'transfer_pulsa') {
        saldoBaru = saldoLama + deposit.nominal;
      }

      await prisma.member.update({
        where: { id: member.id },
        data: { saldo: saldoBaru },
      });

      return prisma.riwayatSaldo.delete({
        where: { id },
      });
    });
  }
}
