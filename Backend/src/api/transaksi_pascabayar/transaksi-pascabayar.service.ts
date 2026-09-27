import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma.service';
import { PascabayarRouterService } from '../../providers/pascabayar/pascabayar-router.service';
import { PascabayarSelectionService } from '../../providers/pascabayar/pascabayar-selection.service';
import { PascabayarFinalizerService } from '../../providers/pascabayar/pascabayar-finalizer.service';
import { claimStatusCheck, PASCA_MIN_JEDA_MS } from '../../providers/pascabayar/pascabayar-lease';
import {
  PascabayarNormalizedInquiry,
  PascabayarProviderCode,
} from '../../providers/pascabayar/pascabayar.types';

@Injectable()
export class TransaksiPascabayarService {
  private readonly logger = new Logger(TransaksiPascabayarService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly router: PascabayarRouterService,
    private readonly selection: PascabayarSelectionService,
    private readonly finalizer: PascabayarFinalizerService,
  ) {}

  async getRiwayatPascabayar(userId: number, search?: string) {
    try {
      const transactions = await this.prisma.transactionPascabayar.findMany({
        where: {
          // Hanya tampilkan transaksi yang sudah benar-benar diproses (ada debit),
          // bukan inquiry yang belum dibayar.
          riwayatTransaksiId: { not: null },
          OR: [{ memberId: userId }, { riwayatTransaksi: { memberId: userId } }],
          ...(search
            ? {
                AND: [
                  {
                    OR: [
                      { nomorTujuan: { contains: search } },
                      { trId: { contains: search } },
                      { produkPascabayar: { name: { contains: search } } },
                    ],
                  },
                ],
              }
            : {}),
        },
        include: { produkPascabayar: true },
        orderBy: { createdAt: 'desc' },
      });

      const listTransaksi: any = {};
      transactions.forEach((trx, index) => {
        listTransaksi[index.toString()] = {
          id: trx.id,
          // Kode transaksi = referensi unik (bukan kode produk).
          kode_transaksi: trx.trId ?? String(trx.id),
          nomor_tujuan: trx.nomorTujuan ?? '',
          nama_produk: trx.produkPascabayar ? trx.produkPascabayar.name : 'Unknown Produk',
          komisi: 'Rp ' + (trx.comission || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
          status: trx.status ?? 'proses',
          transaction_date: trx.createdAt.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
          ket: trx.ket ?? '',
        };
      });

      return {
        error: false,
        error_msg: '',
        message: 'Riwayat pascabayar berhasil ditemukan',
        data: { list: listTransaksi },
      };
    } catch (error) {
      this.logger.error(`Gagal mengambil riwayat pascabayar: ${(error as Error).message}`);
      return {
        error: true,
        error_msg: 'Gagal mengambil data riwayat',
        message: 'Terjadi kesalahan pada server',
        data: { list: {} },
      };
    }
  }

  async getDaftarKategoriPascabayar(kodeKategori: string) {
    try {
      if (!kodeKategori) {
        return { error: true, message: 'Kode kategori tidak boleh kosong', data: { list_kategori: [] } };
      }

      const kategori = await this.prisma.kategori.findFirst({
        where: { kode: kodeKategori },
        include: { produkPascabayars: { where: { status: 'active' } } },
      });

      if (!kategori) {
        return { error: true, message: 'Kategori tidak ditemukan', data: { list_kategori: [] } };
      }

      return { error: false, message: 'Data ditemukan', data: { list_kategori: kategori.produkPascabayars } };
    } catch (error) {
      this.logger.error(`Gagal mengambil kategori pascabayar: ${(error as Error).message}`);
      return { error: true, message: 'Internal server error', data: { list_kategori: [] } };
    }
  }

  async inquiryPascabayar(
    userId: number,
    product_code: string,
    nomor_tujuan: string,
    additionalData?: Record<string, unknown> | null,
  ) {
    try {
      if (!product_code) return { error: true, error_msg: 'Kode produk tidak boleh kosong', data: {} };
      if (!nomor_tujuan) return { error: true, error_msg: 'Nomor tujuan tidak boleh kosong', data: {} };

      const produk = await this.prisma.produkPascabayar.findFirst({
        where: { kode: product_code, status: 'active' },
      });
      if (!produk) return { error: true, error_msg: 'Produk pascabayar tidak ditemukan atau tidak aktif', data: {} };

      const selection = await this.selection.resolveActive(produk.id);
      if (!selection) {
        return {
          error: true,
          error_msg: 'Produk belum memiliki provider pascabayar aktif yang tersedia. Hubungi admin.',
          data: {},
        };
      }

      const refId = this.buildRefId(selection.provider);
      const adapter = this.router.getAdapter(selection.provider);
      const inquiry = await adapter.inquiry({
        refId,
        sku: selection.providerSku,
        customerNo: nomor_tujuan,
        providerType: selection.providerType,
        additionalData: additionalData ?? null,
      });

      if (!inquiry.ok || inquiry.billAmount === null) {
        return {
          error: true,
          error_msg: inquiry.message || 'Gagal mengecek tagihan ke provider',
          data: {},
        };
      }

      const appFee = produk.fee ?? 0;
      const total = inquiry.billAmount + appFee;
      const expiredAt = this.computeExpiry();

      const trx = await this.prisma.transactionPascabayar.create({
        data: {
          trId: refId,
          kode: product_code,
          produkId: produk.id,
          memberId: userId,
          provider: selection.provider,
          providerSku: selection.providerSku,
          nomorTujuan: nomor_tujuan,
          trName: inquiry.customerName,
          nominal: inquiry.billAmount,
          adminFee: appFee,
          adminFeeSnapshot: appFee,
          comissionSnapshot: inquiry.providerCommission,
          providerRefId: inquiry.providerRefId,
          noref: inquiry.providerBillRef,
          tarif: inquiry.tarif,
          daya: inquiry.daya,
          total,
          totalNominal: total,
          expiredAt,
          status: 'proses',
          providerStatus: 'inquiry_sukses',
          inquiryPayload: {
            providerType: selection.providerType,
            additionalData: additionalData ?? null,
            providerAdminFee: inquiry.providerAdminFee,
            providerSellingPrice: inquiry.providerSellingPrice,
            providerCommission: inquiry.providerCommission,
            providerCost: inquiry.providerCost,
            tarif: inquiry.tarif,
            daya: inquiry.daya,
            trId: inquiry.providerRefId,
            providerBillRef: inquiry.providerBillRef,
            period: inquiry.period,
            rc: inquiry.rc,
            detail: inquiry.detail as any,
          } as any,
        },
      });

      return {
        error: false,
        error_msg: '',
        data: {
          ref_id: refId,
          tr_id: refId,
          kode_product: product_code,
          nomor_tujuan,
          nama_pelanggan: inquiry.customerName ?? 'Tidak diketahui',
          nominal: String(inquiry.billAmount),
          totalTagihan: String(total),
          biaya_admin: String(appFee),
          fee: '0',
          periode: inquiry.period ?? '',
          provider: selection.provider,
          transaction_id: trx.id,
        },
      };
    } catch (error) {
      this.logger.error(`Inquiry pascabayar gagal: ${(error as Error).message}`);
      return { error: true, error_msg: 'Gagal melakukan inquiry', data: {} };
    }
  }

  async pembayaranPascabayar(userId: number, trId: string) {
    try {
      if (!trId) return { error: true, error_msg: 'Referensi transaksi tidak boleh kosong' };

      const trx = await this.prisma.transactionPascabayar.findFirst({
        where: { trId, OR: [{ memberId: userId }, { riwayatTransaksi: { memberId: userId } }] },
      });
      if (!trx) return { error: true, error_msg: 'Transaksi tidak ditemukan' };

      if (trx.status === 'sukses') {
        return { error: false, error_msg: '', message: 'Pembayaran sudah berhasil', data: { status: 'sukses' } };
      }
      if (trx.status === 'gagal' || trx.status === 'expired') {
        return { error: true, error_msg: `Transaksi sudah ${trx.status}. Silakan lakukan cek tagihan ulang.` };
      }
      if (!trx.provider || !trx.providerSku || !trx.nomorTujuan) {
        return { error: true, error_msg: 'Snapshot provider transaksi tidak lengkap' };
      }
      if (trx.paymentAttemptedAt) {
        // Sudah pernah dikirim; jangan debit ulang dan jangan tandai kedaluwarsa.
        // Saldo bisa sudah terpotong, jadi transaksi harus tetap diselesaikan
        // finalizer/worker pemulihan meski tanggal inquiry sudah lewat.
        return { error: false, error_msg: '', message: 'Pembayaran sedang diproses', data: { status: trx.status } };
      }
      if (trx.expiredAt && trx.expiredAt.getTime() < Date.now()) {
        await this.prisma.transactionPascabayar.updateMany({
          where: { id: trx.id, status: 'proses', paymentAttemptedAt: null },
          data: { status: 'expired', providerStatus: 'expired' },
        });
        return { error: true, error_msg: 'Inquiry sudah kedaluwarsa. Silakan cek tagihan ulang.' };
      }

      const payload = (trx.inquiryPayload as any) ?? {};

      // Kontrak IAK: pembayaran wajib memakai tr_id hasil inquiry. Tolak sebelum
      // debit supaya saldo tidak terpotong untuk permintaan yang tidak mungkin dikirim.
      if (trx.provider === 'IAK' && !(trx.providerRefId ?? payload.trId)) {
        this.logger.error(`[PASCA] Pembayaran IAK ${trx.trId} ditolak: tr_id inquiry tidak tersedia`);
        return {
          error: true,
          error_msg: 'Data tr_id dari IAK tidak tersedia. Silakan lakukan cek tagihan ulang.',
        };
      }

      const total = trx.total ?? 0;
      const intentId = `PSCPAY-${trx.id}-${Date.now()}`;

      // 1. Klaim + debit saldo atomik (tanpa request jaringan).
      const debit = await this.prisma.$transaction(async (p) => {
        const claim = await p.transactionPascabayar.updateMany({
          where: { id: trx.id, status: 'proses', paymentIntentId: null },
          data: { paymentIntentId: intentId, paymentAttemptedAt: new Date() },
        });
        if (claim.count === 0) return { claimed: false, insufficient: false };

        // Tidak ada debit bila inquiry belum dibayar? Debit di sini adalah reservasi
        // dana; refund otomatis hanya terjadi pada kegagalan definitif.
        const debited = await p.member.updateMany({
          where: { id: userId, saldo: { gte: total } },
          data: { saldo: { decrement: total } },
        });
        if (debited.count === 0) {
          await p.transactionPascabayar.updateMany({
            where: { id: trx.id, paymentIntentId: intentId },
            data: { paymentIntentId: null, paymentAttemptedAt: null },
          });
          return { claimed: true, insufficient: true };
        }

        const member = await p.member.findUnique({ where: { id: userId } });
        const saldoAfter = member?.saldo ?? 0;
        const saldoBefore = saldoAfter + total;
        const riwayat = await p.riwayatTransaksi.create({
          data: { memberId: userId, tipeTransaksi: 'beli_produk_pascabayar' },
        });
        await p.riwayatSaldo.create({
          data: {
            kode: `RWS-PSC-${trx.id}-${Date.now()}`,
            member_id: userId,
            nominal: total,
            saldo_sebelumnya: saldoBefore,
            saldo_setelahnya: saldoAfter,
            status: 'pembelian_pulsa',
            ket: `Pembayaran pascabayar ${trx.nomorTujuan ?? ''}`,
            riwayat_transaksi_id: riwayat.id,
          },
        });
        await p.transactionPascabayar.update({
          where: { id: trx.id },
          data: { riwayatTransaksiId: riwayat.id, saldo_sebelum: saldoBefore, saldo_sesudah: saldoAfter },
        });
        return { claimed: true, insufficient: false };
      });

      if (!debit.claimed) {
        return { error: false, error_msg: '', message: 'Pembayaran sedang diproses', data: { status: 'proses' } };
      }
      if (debit.insufficient) {
        return { error: true, error_msg: 'Saldo Anda tidak mencukupi' };
      }

      // 2. Panggil provider di luar transaksi database.
      const adapter = this.router.getAdapter(trx.provider as PascabayarProviderCode);
      const pay = await adapter.pay({
        refId: trx.trId as string,
        sku: trx.providerSku,
        customerNo: trx.nomorTujuan,
        providerRefId: trx.providerRefId ?? payload.trId ?? null,
        providerType: payload.providerType ?? null,
        additionalData: payload.additionalData ?? null,
      });

      if (pay.status === 'sukses') {
        await this.finalizer.finalizeSuccess({
          transactionId: trx.id,
          sn: pay.sn,
          providerRefId: pay.providerRefId,
          actualBillAmount: pay.actualBillAmount,
          actualProviderAdminFee: pay.actualProviderAdminFee ?? null,
          providerCost: pay.providerCost ?? null,
          providerBillRef: pay.providerBillRef ?? null,
          source: 'PAY_DIRECT',
        });
        return { error: false, error_msg: '', message: 'Pembayaran Pascabayar Berhasil', data: { status: 'sukses' } };
      }

      if (pay.definitiveFailure) {
        await this.finalizer.finalizeFailure({
          transactionId: trx.id,
          reason: pay.message || 'Pembayaran gagal',
          source: 'PAY_DIRECT',
        });
        return { error: true, error_msg: pay.message || 'Pembayaran gagal. Saldo dikembalikan.' };
      }

      // Pending / ambigu: pertahankan status proses agar tidak salah refund.
      // Simpan alasan rekonsiliasi supaya operator tahu transaksi menunggu hasil
      // provider dan tidak dibayar ulang ke provider lain.
      await this.prisma.transactionPascabayar.updateMany({
        where: { id: trx.id, status: 'proses' },
        data: {
          providerStatus: pay.status,
          providerRefId: pay.providerRefId ?? undefined,
          inquiryPayload: {
            ...payload,
            reconciliationReason: 'HASIL_BAYAR_AMBIGU',
            lastProviderStatus: pay.status,
            reconciliationSince: new Date().toISOString(),
          } as any,
        },
      });
      return {
        error: false,
        error_msg: '',
        message: 'Pembayaran sedang diproses. Silakan cek status beberapa saat lagi.',
        data: { status: 'proses' },
      };
    } catch (error) {
      this.logger.error(`Pembayaran pascabayar gagal: ${(error as Error).message}`);
      return { error: true, error_msg: 'Gagal melakukan pembayaran' };
    }
  }

  /**
   * Cek status: baca status lokal; panggil provider hanya bila sudah lewat 60
   * detik sejak perubahan terakhir (sesuai rekomendasi jeda provider).
   */
  async checkStatusPascabayar(userId: number, trId: string) {
    const trx = await this.findOwned(userId, trId);
    if (!trx) return { error: true, error_msg: 'Transaksi tidak ditemukan', data: {} };

    if (trx.status === 'sukses' || trx.status === 'gagal' || trx.status === 'expired') {
      return this.statusResponse(trx);
    }
    if (!trx.provider || !trx.providerSku || !trx.nomorTujuan) {
      return this.statusResponse(trx);
    }

    const secondsSinceUpdate = (Date.now() - trx.updatedAt.getTime()) / 1000;
    if (secondsSinceUpdate < PASCA_MIN_JEDA_MS / 1000) {
      return this.statusResponse(trx, 'Status lokal (belum 60 detik sejak pembaruan terakhir)');
    }
    // Klaim atomik: worker pemulihan dan tombol cek status memakai lease yang sama,
    // supaya dua pemanggil tidak menembak provider bersamaan.
    const claimed = await claimStatusCheck(this.prisma, trx.id);
    if (!claimed) {
      return this.statusResponse(trx, 'Sedang diperiksa proses lain (status lokal)');
    }

    const payload = (trx.inquiryPayload as any) ?? {};
    try {
      const adapter = this.router.getAdapter(trx.provider as PascabayarProviderCode);
      const result = await adapter.status({
        refId: trx.trId as string,
        sku: trx.providerSku,
        customerNo: trx.nomorTujuan,
        providerRefId: trx.providerRefId ?? payload.trId ?? null,
        providerType: payload.providerType ?? null,
        additionalData: payload.additionalData ?? null,
      });

      if (result.status === 'sukses') {
        await this.finalizer.finalizeSuccess({
          transactionId: trx.id,
          sn: result.sn,
          providerRefId: result.providerRefId,
          actualBillAmount: result.actualBillAmount,
          actualProviderAdminFee: result.actualProviderAdminFee ?? null,
          providerCost: result.providerCost ?? null,
          providerBillRef: result.providerBillRef ?? null,
          source: 'STATUS_CHECK',
        });
      } else if (result.definitiveFailure) {
        await this.finalizer.finalizeFailure({
          transactionId: trx.id,
          reason: result.message || 'Gagal berdasarkan cek status',
          source: 'STATUS_CHECK',
        });
      } else {
        await this.prisma.transactionPascabayar.updateMany({
          where: { id: trx.id, status: 'proses' },
          data: {
            providerStatus: result.status,
            providerRefId: result.providerRefId ?? undefined,
            inquiryPayload: {
              ...payload,
              reconciliationReason: 'HASIL_CEK_STATUS_AMBIGU',
              lastProviderStatus: result.status,
              reconciliationSince: new Date().toISOString(),
            } as any,
          },
        });
      }
    } catch (error) {
      this.logger.warn(`Cek status provider gagal untuk ${trId}: ${(error as Error).message}`);
    }

    const refreshed = await this.findOwned(userId, trId);
    return this.statusResponse(refreshed ?? trx);
  }

  /** Detail transaksi pascabayar (menggantikan stub kosong). */
  async getDetailPascabayar(userId: number, kodeTransaksi: string) {
    const trx = await this.findOwned(userId, kodeTransaksi);
    if (!trx) return { error: true, error_msg: 'Transaksi tidak ditemukan', data: {} };

    const produk = trx.produkId
      ? await this.prisma.produkPascabayar.findUnique({ where: { id: trx.produkId } })
      : null;

    const created = trx.createdAt;
    const tanggal = created.toISOString().slice(0, 10);
    const waktu = created.toISOString().slice(11, 19);

    // Rincian provider disimpan pada snapshot inquiry; kolom transaksi hanya diisi
    // bila provider menyatakannya saat inquiry, jadi keduanya dibaca di sini.
    const payload = (trx.inquiryPayload as Record<string, any> | null) ?? {};
    const detailProvider = (payload.detail as Record<string, any> | null) ?? {};
    const descProvider = (detailProvider.desc as Record<string, any> | null) ?? {};
    const tarif = trx.tarif ?? payload.tarif ?? detailProvider.tarif ?? descProvider.tarif ?? '';
    const daya = trx.daya ?? payload.daya ?? detailProvider.daya ?? descProvider.daya ?? null;
    // `noref` = nomor bukti biller dari provider, terpisah dari ID inquiry kami.
    const noref =
      trx.noref ??
      payload.providerBillRef ??
      detailProvider.noref ??
      trx.serial_number ??
      '';
    const providerTrId = trx.providerRefId ?? payload.trId ?? detailProvider.tr_id ?? detailProvider.trId ?? null;
    const providerAdminFee = payload.providerAdminFee ?? detailProvider.admin ?? null;

    return {
      error: false,
      error_msg: '',
      data: {
        kode: trx.trId ?? String(trx.id),
        kode_transaksi: trx.trId ?? String(trx.id),
        status: trx.status ?? 'proses',
        print_status: trx.status === 'sukses',
        tanggal,
        waktu,
        dateTransaction: `${tanggal} ${waktu}`,
        noref: String(noref ?? ''),
        tr_id: String(providerTrId ?? ''),
        sn: trx.serial_number ?? '',
        tarif: String(tarif ?? ''),
        daya,
        total: trx.total !== null ? String(trx.total) : '',
        productName: produk?.name ?? '',
        nomorTujuan: trx.nomorTujuan ?? '',
        namaPelanggan: trx.trName ?? '',
        price: trx.nominal !== null ? String(trx.nominal) : '',
        totalPrice: trx.total !== null ? String(trx.total) : '',
        biayaAdmin: trx.adminFee !== null ? String(trx.adminFee) : '',
        providerAdminFee: providerAdminFee !== null ? String(providerAdminFee) : '',
        fee: '0',
        periode: payload.period ?? '',
        message: trx.ket ?? '',
        provider: trx.provider ?? null,
      },
    };
  }

  private async findOwned(userId: number, trId: string) {
    if (!trId) return null;
    return this.prisma.transactionPascabayar.findFirst({
      where: { trId, OR: [{ memberId: userId }, { riwayatTransaksi: { memberId: userId } }] },
    });
  }

  private statusResponse(
    trx: { trId: string | null; id: number; status: string | null; providerStatus: string | null; serial_number: string | null; total: number | null },
    note?: string,
  ) {
    return {
      error: false,
      error_msg: '',
      message: note ?? 'Status transaksi',
      data: {
        ref_id: trx.trId ?? String(trx.id),
        tr_id: trx.trId ?? String(trx.id),
        status: trx.status ?? 'proses',
        provider_status: trx.providerStatus ?? null,
        serial_number: trx.serial_number ?? '',
        total: trx.total !== null ? String(trx.total) : '',
      },
    };
  }

  private buildRefId(provider: PascabayarProviderCode): string {
    const stamp = [Date.now(), randomBytes(4).toString('hex')].join('');
    // IAK RC 03: referensi harus alfanumerik tanpa tanda hubung/spasi.
    if (provider === 'IAK') return `PSC${stamp}`;
    return `PSC-${stamp}`;
  }

  /**
   * Kedaluwarsa inquiry: akhir hari operasional WIB (UTC+7). Digiflazz
   * mensyaratkan pay-pasca pada tanggal yang sama dengan inq-pasca.
   */
  private computeExpiry(): Date {
    const wib = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate(), 16, 59, 59, 999));
  }
}
