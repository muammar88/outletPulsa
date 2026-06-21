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
        { alasanPenolakan: { contains: search, mode: 'insensitive' } },
        { riwayatTransaksi: { member: { fullname: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (kategori) {
      where.status = kategori;
    }

    const [deposits, total] = await Promise.all([
      this.prisma.requestDeposit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          riwayatTransaksi: {
            include: {
              member: true,
            },
          },
          bankTransferOutlet: {
            include: {
              bank: true,
            },
          },
        },
      }),
      this.prisma.requestDeposit.count({ where }),
    ]);

    const list = deposits.map((deposit) => {
      const nominalVal = (deposit.nominal || 0) + (deposit.nominalTambahan || 0);
      
      return {
        id: deposit.id,
        kode: deposit.kode,
        nominal: nominalVal,
        kategori: deposit.status,
        saldo_sebelumnya: 0,
        saldo_setelahnya: 0,
        ket: deposit.alasanPenolakan 
               ? `Ditolak: ${deposit.alasanPenolakan}` 
               : (deposit.bankTransferOutlet?.bank?.nama ? `Bank: ${deposit.bankTransferOutlet.bank.nama}` : `Deposit ${deposit.status}`),
        created_at: deposit.createdAt,
        member: deposit.riwayatTransaksi?.member || null,
        // Extra detail fields
        status_kirim: deposit.statusKirim,
        waktu_request: deposit.waktuRequest,
        bank_tujuan_transfer: deposit.bankTransferOutlet?.bank?.nama || '-',
        nomor_rekening_akun: deposit.bankTransferOutlet?.accountNumber || '-',
        nama_akun: deposit.bankTransferOutlet?.accountName || '-',
      };
    });

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

  async manualDeposit(dto: import('./dto/deposit-manual.dto').DepositManualDto, adminId: number) {
    if (dto.nominal <= 0) {
      throw new BadRequestException('Nominal deposit harus lebih besar dari 0');
    }

    return await this.prisma.$transaction(async (prisma) => {
      const member = await prisma.member.findUnique({
        where: { id: dto.memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${dto.memberId} not found`);
      }

      const saldoLama = member.saldo || 0;
      const saldoBaru = saldoLama + dto.nominal;

      // Buat RiwayatTransaksi
      const riwayatTransaksi = await prisma.riwayatTransaksi.create({
        data: {
          memberId: member.id,
          tipeTransaksi: 'deposit',
        },
      });

      const generatedKode = `DEP-${Date.now()}`;

      // Buat RiwayatSaldo
      const riwayatSaldo = await prisma.riwayatSaldo.create({
        data: {
          kode: generatedKode,
          member_id: member.id,
          nominal: dto.nominal,
          saldo_sebelumnya: saldoLama,
          saldo_setelahnya: saldoBaru,
          status: 'deposit',
          ket: dto.ket || 'Deposit Manual oleh Administrator',
          riwayat_transaksi_id: riwayatTransaksi.id,
          admin_id: adminId,
        },
      });

      // Update Saldo Member
      await prisma.member.update({
        where: { id: member.id },
        data: { saldo: saldoBaru },
      });

      return { riwayatTransaksi, riwayatSaldo };
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

    if (deposit.status !== 'deposit') {
      throw new BadRequestException('Hanya transaksi dengan status deposit yang dapat direversal/dihapus.');
    }

    return await this.prisma.$transaction(async (prisma) => {
      const member = await prisma.member.findUnique({
        where: { id: deposit.member_id },
      });

      if (!member) {
        throw new NotFoundException(`Member dengan ID ${deposit.member_id} tidak ditemukan`);
      }

      const saldoSekarang = member.saldo || 0;
      const saldoBaru = saldoSekarang - deposit.nominal;

      if (saldoBaru < 0) {
        throw new BadRequestException(`Reversal dibatalkan: Saldo member akan menjadi negatif (${saldoBaru}) jika deposit ini dihapus.`);
      }

      await prisma.member.update({
        where: { id: member.id },
        data: { saldo: saldoBaru },
      });

      const deletedRiwayatSaldo = await prisma.riwayatSaldo.delete({
        where: { id },
      });

      if (deposit.riwayat_transaksi_id) {
        // Cek apakah riwayat transaksi ini dipakai di request_deposits atau transaksi lain
        const requestDepositCount = await prisma.requestDeposit.count({
          where: { riwayatTransaksiId: deposit.riwayat_transaksi_id }
        });
        
        if (requestDepositCount === 0) {
           await prisma.riwayatTransaksi.delete({
             where: { id: deposit.riwayat_transaksi_id }
           });
        }
      }

      return deletedRiwayatSaldo;
    });
  }
}
