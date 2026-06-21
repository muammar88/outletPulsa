import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateBankTransferOutletDto } from './dto/create-bank-transfer-outlet.dto';
import { UpdateBankTransferOutletDto } from './dto/update-bank-transfer-outlet.dto';
import { GetBankTransferOutletDto } from './dto/get-bank-transfer-outlet.dto';

@Injectable()
export class BankTransferOutletService {
  constructor(private prisma: PrismaService) {}

  async create(createBankTransferOutletDto: CreateBankTransferOutletDto) {
    return this.prisma.bankTransferOutlet.create({
      data: {
        bankId: createBankTransferOutletDto.bankId,
        accountName: createBankTransferOutletDto.accountName,
        accountNumber: createBankTransferOutletDto.accountNumber,
      },
      include: { bank: true },
    });
  }

  async findAll(query: GetBankTransferOutletDto) {
    const { perPage = 10, page = 1, keyword } = query;
    const skip = (page - 1) * perPage;

    const whereClause: any = {};
    if (keyword) {
      whereClause.OR = [
        { accountName: { contains: keyword } },
        { accountNumber: { contains: keyword } },
        { bank: { nama: { contains: keyword } } },
      ];
    }

    const [list, total] = await this.prisma.$transaction([
      this.prisma.bankTransferOutlet.findMany({
        where: whereClause,
        include: { bank: true },
        skip,
        take: perPage,
        orderBy: { id: 'desc' },
      }),
      this.prisma.bankTransferOutlet.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return {
      data: {
        list,
        total,
        page,
        perPage,
        totalPages,
      },
      message: 'Berhasil mengambil data bank transfer outlet',
    };
  }

  async findOne(id: number) {
    const bankTransferOutlet = await this.prisma.bankTransferOutlet.findUnique({
      where: { id },
      include: { bank: true },
    });
    if (!bankTransferOutlet) {
      throw new NotFoundException(`BankTransferOutlet dengan id ${id} tidak ditemukan`);
    }
    return bankTransferOutlet;
  }

  async update(id: number, updateBankTransferOutletDto: UpdateBankTransferOutletDto) {
    await this.findOne(id);

    return this.prisma.bankTransferOutlet.update({
      where: { id },
      data: {
        bankId: updateBankTransferOutletDto.bankId,
        accountName: updateBankTransferOutletDto.accountName,
        accountNumber: updateBankTransferOutletDto.accountNumber,
      },
      include: { bank: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.bankTransferOutlet.delete({
      where: { id },
    });
  }
}
