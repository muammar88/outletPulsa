import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { GetDepositDto } from './dto/get-deposit.dto';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { SocketService } from '../../socket/socket.service';

@Injectable()
export class DepositService {
  private readonly logger = new Logger(DepositService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pengumumanService: PengumumanService,
    private readonly socketService: SocketService,
  ) {}

  async findAll(query: GetDepositDto) {

    console.log("-------1----------");
    console.log("query : ", query);
    console.log("-------1----------");

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const kategori = query.kategori;

    const skip = (page - 1) * limit;

    const where: any = {
      tipeTransaksi: 'deposit'
    };

    if (search) {
      where.OR = [
        { member: { fullname: { contains: search, mode: 'insensitive' } } },
        { requestDeposits: { some: { kode: { contains: search, mode: 'insensitive' } } } },
        { requestDeposits: { some: { alasanPenolakan: { contains: search, mode: 'insensitive' } } } },
        { riwayatSaldos: { some: { kode: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // if (kategori && kategori !== 'deposit') {
    //   where.OR = [
    //     { requestDeposits: { some: { status: kategori as any } } },
    //   ];
    // }

    const [riwayatTransaksiList, total] = await Promise.all([
      this.prisma.riwayatTransaksi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          member: true,
          requestDeposits: {
            orderBy: { createdAt: 'desc' },
            include: {
              bankTransferOutlet: {
                include: { bank: true }
              }
            }
          },
          riwayatSaldos: {
            orderBy: { created_at: 'desc' }
          }
        },
      }),
      this.prisma.riwayatTransaksi.count({ where }),
    ]);

    console.log('+++++++++');
    console.log('riwayatTransaksiList : ', riwayatTransaksiList);
    console.log('+++++++++');

    const list = riwayatTransaksiList.map((riwayat) => {
      const deposit = riwayat.requestDeposits?.[0];
      const manualDeposit = riwayat.riwayatSaldos?.[0];
      
      const isManual = !deposit && manualDeposit;
      
      const currentMemberSaldo = riwayat.member?.saldo ?? 0;

      if (isManual) {
        return {
          id: riwayat.id,
          kode: manualDeposit.kode,
          nominal: manualDeposit.nominal,
          kategori: manualDeposit.status,
          saldo_sebelumnya: currentMemberSaldo,
          saldo_setelahnya: currentMemberSaldo + (manualDeposit.nominal || 0),
          saldo_sebelum: currentMemberSaldo,
          saldo_sesudah: currentMemberSaldo + (manualDeposit.nominal || 0),
          ket: manualDeposit.ket || 'Deposit Manual',
          created_at: riwayat.createdAt,
          member: riwayat.member || null,
          status_kirim: 'SUDAH_KIRIM',
          waktu_request: riwayat.createdAt,
          bank_tujuan_transfer: '-',
          nomor_rekening_akun: '-',
          nama_akun: '-',
        };
      }

      const nominalVal = deposit ? ((deposit.nominal || 0) + (deposit.nominalTambahan || 0)) : 0;
      
      let saldoSebelum = currentMemberSaldo;
      let saldoSesudah = currentMemberSaldo;

      if (deposit?.status === 'proses') {
        saldoSesudah = currentMemberSaldo + nominalVal;
      } else if (deposit?.status === 'sukses') {
        saldoSesudah = riwayat.riwayatSaldos?.[0]?.saldo_setelahnya ?? currentMemberSaldo;
      } else {
        saldoSesudah = currentMemberSaldo;
      }
      
      return {
        id: riwayat.id,
        kode: deposit?.kode || '-',
        nominal: nominalVal,
        kategori: deposit?.status || 'proses',
        status: deposit?.status || 'proses',
        saldo_sebelumnya: saldoSebelum,
        saldo_setelahnya: saldoSesudah,
        saldo_sebelum: saldoSebelum,
        saldo_sesudah: saldoSesudah,
        ket: deposit?.alasanPenolakan 
               ? `Ditolak: ${deposit.alasanPenolakan}` 
               : (deposit?.bankTransferOutlet?.bank?.nama ? `Bank: ${deposit.bankTransferOutlet.bank.nama}` : `Deposit ${deposit?.status || 'proses'}`),
        created_at: riwayat.createdAt,
        member: riwayat.member || null,
        status_kirim: deposit?.statusKirim || '-',
        waktu_request: deposit?.waktuRequest || riwayat.createdAt,
        bank_tujuan_transfer: deposit?.bankTransferOutlet?.bank?.nama || '-',
        nomor_rekening_akun: deposit?.bankTransferOutlet?.accountNumber || '-',
        nama_akun: deposit?.bankTransferOutlet?.accountName || '-',
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

      // Beritahu frontend via Socket.IO
      this.socketService.emitBalanceUpdated(member.id, {
        newBalance: saldoBaru,
        timestamp: new Date(),
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

      // Beritahu frontend via Socket.IO
      this.socketService.emitBalanceUpdated(member.id, {
        newBalance: saldoBaru,
        timestamp: new Date(),
      });

      // Beritahu frontend via FCM
      this.pengumumanService.sendPengumuman({
        title: 'Deposit Berhasil',
        body: `Deposit manual sebesar Rp ${dto.nominal} telah ditambahkan ke saldo Anda.`,
        pengumumanType: 'Deposit',
        targetType: 'User',
        targetId: member.id.toString(),
        payload: { reference_id: riwayatTransaksi.id.toString() }
      }).catch(e => this.logger.error('Failed to send deposit success notif', e));

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

  async updateStatus(id: number, dto: import('./dto/update-deposit-status.dto').UpdateDepositStatusDto, adminId: number) {
    return await this.prisma.$transaction(async (prisma) => {
      const requestDeposit = await prisma.requestDeposit.findFirst({
        where: { riwayatTransaksiId: id },
        include: { riwayatTransaksi: { include: { member: true } } }
      });

      if (!requestDeposit) {
        throw new NotFoundException(`Request Deposit untuk Riwayat Transaksi ${id} tidak ditemukan`);
      }

      if (requestDeposit.status !== 'proses') {
        throw new BadRequestException(`Request Deposit sudah berstatus ${requestDeposit.status} dan tidak bisa diubah lagi`);
      }

      if (dto.status === 'sukses') {
        const nominalTotal = (requestDeposit.nominal || 0) + (requestDeposit.nominalTambahan || 0);
        const member = requestDeposit.riwayatTransaksi?.member;

        if (!member) {
           throw new NotFoundException('Data member terkait deposit ini tidak ditemukan');
        }

        const saldoLama = member.saldo || 0;
        const saldoBaru = saldoLama + nominalTotal;

        // 1. Update RequestDeposit
        const updatedRequest = await prisma.requestDeposit.update({
          where: { id: requestDeposit.id },
          data: { 
            status: 'sukses',
          }
        });

        // 2. Update Member Saldo
        await prisma.member.update({
          where: { id: member.id },
          data: { saldo: saldoBaru }
        });

        // 3. Create RiwayatSaldo (Mutasi)
        const generatedKode = `RWS-${Date.now()}`;
        await prisma.riwayatSaldo.create({
          data: {
            kode: generatedKode,
            member_id: member.id,
            nominal: nominalTotal,
            saldo_sebelumnya: saldoLama,
            saldo_setelahnya: saldoBaru,
            status: 'deposit',
            ket: `Top Up Saldo via Tiket #${requestDeposit.kode || id}`,
            riwayat_transaksi_id: requestDeposit.riwayatTransaksiId,
            admin_id: adminId,
          }
        });

        this.pengumumanService.sendPengumuman({
          title: 'Deposit Berhasil',
          body: `Deposit sebesar Rp ${nominalTotal} telah berhasil ditambahkan ke saldo Anda.`,
          pengumumanType: 'Deposit',
          targetType: 'User',
          targetId: member.id.toString(),
          payload: { reference_id: requestDeposit.id.toString() }
        }).catch(e => this.logger.error('Failed to send deposit success notif', e));

        // Beritahu frontend via Socket.IO
        this.socketService.emitBalanceUpdated(member.id, {
          newBalance: saldoBaru,
          timestamp: new Date(),
        });

        return updatedRequest;

      } else if (dto.status === 'gagal') {
        if (!dto.alasanPenolakan) {
           throw new BadRequestException('Alasan penolakan wajib diisi jika status ditolak');
        }

        const updatedRequest = await prisma.requestDeposit.update({
          where: { id: requestDeposit.id },
          data: {
            status: 'gagal',
            alasanPenolakan: dto.alasanPenolakan,
          }
        });

        const member = requestDeposit.riwayatTransaksi?.member;
        if (member) {
          const nominalTotal = (requestDeposit.nominal || 0) + (requestDeposit.nominalTambahan || 0);
          this.pengumumanService.sendPengumuman({
            title: 'Deposit Ditolak',
            body: `Deposit sebesar Rp ${nominalTotal} telah ditolak. Alasan: ${dto.alasanPenolakan}`,
            pengumumanType: 'Deposit',
            targetType: 'User',
            targetId: member.id.toString(),
            payload: { reference_id: requestDeposit.id.toString() }
          }).catch(e => this.logger.error('Failed to send deposit rejected notif', e));
        }

        return updatedRequest;
      }
    });
  }

  async remove(id: number) {
    const riwayat = await this.prisma.riwayatTransaksi.findUnique({
      where: { id },
      include: {
        requestDeposits: true,
        riwayatSaldos: true
      }
    });

    if (!riwayat) {
      throw new NotFoundException(`Riwayat Transaksi with ID ${id} not found`);
    }

    return await this.prisma.$transaction(async (prisma) => {
      // Reversal balance IF there's a riwayatSaldo (which means the money was added!)
      for (const saldo of riwayat.riwayatSaldos) {
        if (saldo.status === 'deposit') {
          const member = await prisma.member.findUnique({ where: { id: saldo.member_id } });
          if (member) {
            const saldoBaru = (member.saldo || 0) - saldo.nominal;
            if (saldoBaru < 0) throw new BadRequestException(`Reversal dibatalkan: Saldo member akan menjadi negatif.`);
            await prisma.member.update({ where: { id: member.id }, data: { saldo: saldoBaru } });
          }
          await prisma.riwayatSaldo.delete({ where: { id: saldo.id } });
        }
      }

      // Delete request deposits
      for (const reqDep of riwayat.requestDeposits) {
        await prisma.requestDeposit.delete({ where: { id: reqDep.id } });
      }

      // Delete the riwayat transaksi itself
      return await prisma.riwayatTransaksi.delete({ where: { id } });
    });
  }
}
