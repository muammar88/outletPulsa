import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';

// ============================================================
// INTERFACE: Tipe data untuk payload webhook dari masing-masing provider
// ============================================================

/** Payload yang dikirim IAK saat callback prabayar */
interface IakCallbackPayload {
  data: {
    ref_id: string;    // Kode transaksi kita (sama dengan field `kode` di tabel Transaction)
    status: number | string; // 1 = sukses, 2 = gagal (IAK mengirimnya sebagai string '1' atau '2')
    sn: string;        // Serial Number (bukti transaksi)
    price: number | string;  // Harga transaksi
  };
}

/** Satu item dalam array payload yang dikirim Tripay saat callback prabayar */
interface TripayCallbackItem {
  trxid: number;    // ID transaksi di Tripay (sama dengan field `trx_id` di tabel Transaction)
  code: string;     // Kode produk
  harga: number;    // Harga
  target: string;   // Nomor tujuan
  note: string;     // Catatan/keterangan
  mtrpln: string;   // Meter token PLN (jika ada)
  status: number;   // 1 = sukses, 2 = gagal
  token: string;    // Token (SN/bukti transaksi)
}

/** Payload yang dikirim Digiflazz saat callback */
interface DigiflazzCallbackPayload {
  data: {
    ref_id: string;       // Kode transaksi kita
    buyer_sku_code: string;
    customer_no: string;
    status: string;       // 'Sukses', 'Gagal', 'Pending'
    rc: string;           // Response code: '00' = sukses, '03' = pending, lainnya = gagal
    sn: string;           // Serial Number
    price: number;
    message: string;
  };
}

// ============================================================
// SERVICE
// ============================================================

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================
  // BAGIAN 1: HANDLER UTAMA - Dipanggil oleh Controller
  // ===========================================================

  /**
   * Handler untuk webhook IAK Prabayar.
   *
   * Flow:
   * 1. Validasi kode_verifikasi (bandingkan dengan env IAK_CALLBACK_KEY)
   * 2. Parse body, ambil ref_id
   * 3. Cari transaksi di database berdasarkan ref_id (= field `kode` di tabel Transaction)
   * 4. Cek idempotency (jika sudah sukses/gagal, skip)
   * 5. Jika status=1 → updateSuccessTransaction
   * 6. Jika status=2 → updateFailedTransaction
   * 7. Log webhook
   *
   * Referensi proyek lama: controllers/mobile/transaksi.js baris 1962-1992
   */
  async handleIakCallback(
    kodeVerifikasi: string,
    body: IakCallbackPayload,
    ipAddress: string,
  ): Promise<{ error: boolean; error_msg: string }> {

    console.log("------1");
    console.log(body);
    console.log("------1");
    // STEP 1: Validasi kode verifikasi
    const expectedKey = process.env.IAK_CALLBACK_KEY || '';
    if (kodeVerifikasi !== expectedKey) {
      this.logger.warn(`[IAK WEBHOOK] Kode verifikasi tidak valid dari IP: ${ipAddress}`);
      await this.logWebhook('IAK', 'callback_prabayar', null, body, 'failed', 'Kode verifikasi tidak valid', ipAddress);
      return { error: true, error_msg: 'Kode verifikasi tidak valid', message: 'Kode verifikasi tidak valid', data: {} } as any;
    }

    console.log("------2");
    console.log(expectedKey);
    console.log(kodeVerifikasi);
    console.log("------2");

    // STEP 2: Ambil data dari payload
    const refId = body?.data?.ref_id;
    const status = body?.data?.status;
    const sn = body?.data?.sn || '';

    if (!refId) {
      this.logger.warn(`[IAK WEBHOOK] ref_id kosong`);
      await this.logWebhook('IAK', 'callback_prabayar', null, body, 'failed', 'ref_id kosong', ipAddress);
      return { error: true, error_msg: 'ref_id tidak ditemukan dalam payload', message: 'ref_id tidak ditemukan dalam payload', data: {} } as any;
    }


    console.log("------3");
    console.log(refId);
    console.log(status);
    console.log(sn);
    console.log("------3");

    this.logger.log(`[IAK WEBHOOK] Menerima callback. ref_id=${refId}, status=${status}`);

    // STEP 3: Cari transaksi berdasarkan kode (= ref_id dari IAK)
    const transaction = await this.prisma.transaction.findFirst({
      where: { kode: refId },
      include: {
        riwayatTransaksi: {
          include: { member: true },
        },
      },
    });

    console.log("------4");
    console.log(transaction);
    console.log("------4");

    if (!transaction) {
      this.logger.warn(`[IAK WEBHOOK] Transaksi tidak ditemukan: ref_id=${refId}`);
      await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'ignored', 'Transaksi tidak ditemukan', ipAddress);
      return { error: true, error_msg: 'Ref Id Tidak Ditemukan', message: 'Ref Id Tidak Ditemukan', data: {} } as any;
    }

    // STEP 4: Cek idempotency - jika transaksi sudah final (sukses/gagal), skip
    if (transaction.status === 'sukses' || transaction.status === 'gagal') {
      this.logger.log(`[IAK WEBHOOK] Transaksi sudah berstatus ${transaction.status}, skip. ref_id=${refId}`);
      await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'ignored', `Sudah berstatus ${transaction.status}`, ipAddress);
      return { error: false, error_msg: 'Berhasil' };
    }

    // STEP 5 & 6: Proses berdasarkan status
    try {
      const statusCode = Number(status);
      if (statusCode === 1 || String(status) === 'SUCCESS') {
        // SUKSES: Update transaksi dan hitung laba
        await this.updateSuccessTransaction(transaction.trx_id, sn, 'IAK', transaction);
        this.logger.log(`[IAK WEBHOOK] Transaksi SUKSES. ref_id=${refId}, sn=${sn}`);
        await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'success', `Transaksi sukses. SN: ${sn}`, ipAddress);
      } else if (statusCode === 2 || String(status) === 'FAILED') {
        // GAGAL: Kembalikan saldo member
        await this.updateFailedTransaction(transaction.trx_id, 'IAK', transaction);
        this.logger.log(`[IAK WEBHOOK] Transaksi GAGAL. ref_id=${refId}`);
        await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'success', 'Transaksi gagal, saldo dikembalikan', ipAddress);
      } else {
        this.logger.log(`[IAK WEBHOOK] Status tidak dikenali: ${status}. ref_id=${refId}`);
        await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'ignored', `Status tidak dikenali: ${status}`, ipAddress);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[IAK WEBHOOK] Error memproses callback: ${errorMsg}`);
      await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'error', errorMsg, ipAddress);
      return { error: true, error_msg: 'Terjadi kesalahan saat memproses webhook' };
    }

    return { error: false, error_msg: 'Berhasil' };
  }

  /**
   * Handler untuk webhook Tripay Prabayar.
   *
   * Flow:
   * 1. Validasi header x-callback-secret (bandingkan dengan env TRIPAY_CALLBACK_SECRET)
   * 2. Parse body (Tripay mengirim array, ambil elemen pertama)
   * 3. Cari transaksi di database berdasarkan trx_id
   * 4. Cek idempotency
   * 5. Jika status=1 → updateSuccessTransaction
   * 6. Jika status=2 → updateFailedTransaction
   * 7. Log webhook
   *
   * Referensi proyek lama: controllers/mobile/transaksi.js baris 2101-2138
   */
  async handleTripayCallback(
    callbackSecret: string,
    body: TripayCallbackItem[],
    ipAddress: string,
  ): Promise<{ error: boolean; error_msg: string }> {
    // STEP 1: Validasi secret
    const expectedSecret = process.env.TRIPAY_CALLBACK_SECRET || '';
    if (callbackSecret !== expectedSecret) {
      this.logger.warn(`[TRIPAY WEBHOOK] Secret tidak valid dari IP: ${ipAddress}`);
      await this.logWebhook('TRIPAY', 'callback_prabayar', null, body, 'failed', 'Secret tidak valid', ipAddress);
      return { error: true, error_msg: 'Kode secret tidak valid', message: 'Kode secret tidak valid', data: {} } as any;
    }

    // STEP 2: Ambil item pertama dari array
    // Tripay mengirim body sebagai array, contoh: [{ trxid: 123, status: 1, ... }]
    const item = Array.isArray(body) ? body[0] : null;
    if (!item) {
      this.logger.warn(`[TRIPAY WEBHOOK] Body kosong atau format tidak valid`);
      await this.logWebhook('TRIPAY', 'callback_prabayar', null, body, 'failed', 'Body kosong', ipAddress);
      return { error: true, error_msg: 'Payload tidak valid' };
    }

    const trxId = item.trxid;
    const status = item.status;
    const token = item.token || item.note || '';

    this.logger.log(`[TRIPAY WEBHOOK] Menerima callback. trxid=${trxId}, status=${status}`);

    // STEP 3: Cari transaksi berdasarkan trx_id
    const transaction = await this.prisma.transaction.findFirst({
      where: { trx_id: Number(trxId) },
      include: {
        riwayatTransaksi: {
          include: { member: true },
        },
      },
    });

    if (!transaction) {
      this.logger.warn(`[TRIPAY WEBHOOK] Transaksi tidak ditemukan: trxid=${trxId}`);
      await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'ignored', 'Transaksi tidak ditemukan', ipAddress);
      return { error: true, error_msg: 'Kode ID tidak ditemukan', message: 'Kode ID tidak ditemukan', data: {} } as any;
    }

    // STEP 4: Cek idempotency
    if (transaction.status === 'sukses' || transaction.status === 'gagal') {
      this.logger.log(`[TRIPAY WEBHOOK] Transaksi sudah berstatus ${transaction.status}, skip. trxid=${trxId}`);
      await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'ignored', `Sudah berstatus ${transaction.status}`, ipAddress);
      return { error: false, error_msg: 'Berhasil' };
    }

    // STEP 5 & 6: Proses berdasarkan status
    try {
      if (status === 1) {
        await this.updateSuccessTransaction(trxId, token, 'TRI', transaction);
        this.logger.log(`[TRIPAY WEBHOOK] Transaksi SUKSES. trxid=${trxId}, token=${token}`);
        await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'success', `Transaksi sukses. Token: ${token}`, ipAddress);
      } else if (status === 2) {
        await this.updateFailedTransaction(trxId, 'TRI', transaction);
        this.logger.log(`[TRIPAY WEBHOOK] Transaksi GAGAL. trxid=${trxId}`);
        await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'success', 'Transaksi gagal, saldo dikembalikan', ipAddress);
      } else {
        this.logger.log(`[TRIPAY WEBHOOK] Status tidak dikenali: ${status}. trxid=${trxId}`);
        await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'ignored', `Status tidak dikenali: ${status}`, ipAddress);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[TRIPAY WEBHOOK] Error memproses callback: ${errorMsg}`);
      await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'error', errorMsg, ipAddress);
      return { error: true, error_msg: 'Terjadi kesalahan saat memproses webhook' };
    }

    return { error: false, error_msg: 'Berhasil' };
  }

  /**
   * Handler untuk webhook Digiflazz.
   *
   * Flow:
   * 1. Validasi signature (header X-Hub-Signature = sha1 HMAC dari raw body)
   * 2. Parse body, ambil data.ref_id dan data.rc
   * 3. Cari transaksi di database berdasarkan kode (= ref_id)
   * 4. Cek idempotency
   * 5. Jika rc='00' → sukses
   * 6. Jika rc!='00' dan rc!='03' → gagal
   * 7. Jika rc='03' → masih pending, skip
   * 8. Update juga tabel DigiflazzTransaction
   * 9. Log webhook
   *
   * Referensi proyek lama: digiflazz helper baris 491-589 (logika rc code)
   * Catatan: Pada proyek lama, callback_digiflazz_prabayar (baris 2140-2146) hanya placeholder.
   *          Implementasi ini dibuat berdasarkan logika rc code dari fungsi cek_status_transaksi_DIGI.
   */
  async handleDigiflazzCallback(
    signature: string,
    rawBody: string,
    body: DigiflazzCallbackPayload,
    ipAddress: string,
  ): Promise<{ error: boolean; error_msg: string }> {
    // STEP 1: Validasi HMAC Signature
    // Digiflazz mengirim header X-Hub-Signature berisi: sha1=<hmac_hex>
    const webhookSecret = process.env.DIGIFLAZZ_WEBHOOK_SECRET || '';
    const expectedSignature = 'sha1=' + crypto
      .createHmac('sha1', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      this.logger.warn(`[DIGIFLAZZ WEBHOOK] Signature tidak valid dari IP: ${ipAddress}`);
      this.logger.warn(`[DIGIFLAZZ WEBHOOK] Expected: ${expectedSignature}`);
      this.logger.warn(`[DIGIFLAZZ WEBHOOK] Received: ${signature}`);
      await this.logWebhook('DIGIFLAZZ', 'callback', null, body, 'failed', 'Signature tidak valid', ipAddress);
      return { error: true, error_msg: 'Signature tidak valid', message: 'Signature tidak valid', data: {} } as any;
    }

    // STEP 2: Ambil data dari payload
    const data = body?.data;
    if (!data || !data.ref_id) {
      this.logger.warn(`[DIGIFLAZZ WEBHOOK] Payload tidak valid atau ref_id kosong`);
      await this.logWebhook('DIGIFLAZZ', 'callback', null, body, 'failed', 'Payload tidak valid', ipAddress);
      return { error: true, error_msg: 'Payload tidak valid' };
    }

    const refId = data.ref_id;
    const rc = data.rc;
    const sn = data.sn || '';

    this.logger.log(`[DIGIFLAZZ WEBHOOK] Menerima callback. ref_id=${refId}, rc=${rc}, status=${data.status}`);

    // STEP 3: Cari transaksi berdasarkan kode (= ref_id)
    const transaction = await this.prisma.transaction.findFirst({
      where: { kode: refId },
      include: {
        riwayatTransaksi: {
          include: { member: true },
        },
        digiflazzTransactions: true,
      },
    });

    if (!transaction) {
      this.logger.warn(`[DIGIFLAZZ WEBHOOK] Transaksi tidak ditemukan: ref_id=${refId}`);
      await this.logWebhook('DIGIFLAZZ', 'callback', refId, body, 'ignored', 'Transaksi tidak ditemukan', ipAddress);
      return { error: true, error_msg: 'Transaksi tidak ditemukan', message: 'Transaksi tidak ditemukan', data: {} } as any;
    }

    // STEP 4: Cek idempotency
    if (transaction.status === 'sukses' || transaction.status === 'gagal') {
      this.logger.log(`[DIGIFLAZZ WEBHOOK] Transaksi sudah berstatus ${transaction.status}, skip. ref_id=${refId}`);
      await this.logWebhook('DIGIFLAZZ', 'callback', refId, body, 'ignored', `Sudah berstatus ${transaction.status}`, ipAddress);
      return { error: false, error_msg: 'Berhasil', message: 'Berhasil', data: {} } as any;
    }

    // STEP 5, 6, 7: Proses berdasarkan rc (response code)
    try {
      const now = new Date();

      if (rc === '00') {
        // SUKSES
        // Update DigiflazzTransaction terlebih dahulu
        if (transaction.digiflazzTransactions.length > 0) {
          await this.prisma.digiflazzTransaction.updateMany({
            where: { transactionId: transaction.id },
            data: { status: 'sukses', responseTime: now, updatedAt: now },
          });
        }
        // Update Transaction utama
        await this.updateSuccessTransaction(transaction.id, sn, 'DIGI', transaction);
        this.logger.log(`[DIGIFLAZZ WEBHOOK] Transaksi SUKSES. ref_id=${refId}, sn=${sn}`);
        await this.logWebhook('DIGIFLAZZ', 'callback', refId, body, 'success', `Transaksi sukses. SN: ${sn}`, ipAddress);

      } else if (rc === '03') {
        // MASIH PENDING - jangan lakukan apa-apa, tunggu callback selanjutnya
        this.logger.log(`[DIGIFLAZZ WEBHOOK] Transaksi masih PENDING (rc=03). ref_id=${refId}`);
        await this.logWebhook('DIGIFLAZZ', 'callback', refId, body, 'ignored', 'Masih pending (rc=03)', ipAddress);

      } else {
        // GAGAL (rc selain '00' dan '03')
        // Update DigiflazzTransaction terlebih dahulu
        if (transaction.digiflazzTransactions.length > 0) {
          await this.prisma.digiflazzTransaction.updateMany({
            where: { transactionId: transaction.id },
            data: { status: 'gagal', responseTime: now, updatedAt: now },
          });
        }
        // Update Transaction utama dan kembalikan saldo
        await this.updateFailedTransaction(transaction.id, 'DIGI', transaction);
        this.logger.log(`[DIGIFLAZZ WEBHOOK] Transaksi GAGAL (rc=${rc}). ref_id=${refId}`);
        await this.logWebhook('DIGIFLAZZ', 'callback', refId, body, 'success', `Transaksi gagal (rc=${rc}), saldo dikembalikan`, ipAddress);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[DIGIFLAZZ WEBHOOK] Error memproses callback: ${errorMsg}`);
      await this.logWebhook('DIGIFLAZZ', 'callback', refId, body, 'error', errorMsg, ipAddress);
      return { error: true, error_msg: 'Terjadi kesalahan saat memproses webhook' };
    }

    return { error: false, error_msg: 'Berhasil' };
  }

  // ===========================================================
  // BAGIAN 2: HELPER FUNCTIONS - Dipanggil oleh handler di atas
  // ===========================================================

  /**
   * Update transaksi yang SUKSES.
   *
   * Yang dilakukan:
   * 1. Ambil info member (kode_agen) untuk hitung fee agen
   * 2. Hitung laba = selling_price - purchase_price - fee_agen
   * 3. Update tabel Transaction: status='sukses', ket=sn, laba, fee_agen, kodeAgen
   *
   * PENTING: Untuk server DIGI, parameter trxId adalah ID dari tabel Transaction (field `id`).
   *          Untuk server IAK dan TRI, parameter trxId adalah `trx_id` (field `trx_id`).
   *
   * Referensi proyek lama: fungsi updateSuccessTransaction baris 243-303
   */
  private async updateSuccessTransaction(
    trxId: number | null,
    sn: string,
    kodeServer: string,
    transactionData: {
      id: number;
      purchase_price: number | null;
      selling_price: number | null;
      riwayatTransaksi: { member: { kode_agen: string | null } | null } | null;
    },
  ): Promise<void> {
    // Hitung fee agen (jika member punya kode_agen, fee = 20)
    let feeAgen = 0;
    let kodeAgen = '';
    const memberKodeAgen = transactionData.riwayatTransaksi?.member?.kode_agen;
    if (memberKodeAgen) {
      feeAgen = 20;
      kodeAgen = memberKodeAgen;
    }

    // Hitung laba
    const sellingPrice = transactionData.selling_price || 0;
    const purchasePrice = transactionData.purchase_price || 0;
    const laba = sellingPrice - purchasePrice - feeAgen;

    // Tentukan where clause berdasarkan kode server
    // DIGI menggunakan field `id`, IAK dan TRI menggunakan field `trx_id`
    const whereClause = kodeServer === 'DIGI'
      ? { id: transactionData.id }
      : { trx_id: trxId };

    // Update tabel Transaction
    await this.prisma.transaction.updateMany({
      where: whereClause,
      data: {
        status: 'sukses',
        ket: sn,
        kodeAgen: kodeAgen,
        laba: laba,
        fee_agen: feeAgen,
      },
    });
  }

  /**
   * Update transaksi yang GAGAL dan kembalikan saldo member.
   *
   * Yang dilakukan:
   * 1. Cari transaksi beserta data member
   * 2. Hitung saldo baru = saldo member sekarang + selling_price (dikembalikan)
   * 3. Update saldo member di tabel Member
   * 4. Update status transaksi ke 'gagal' di tabel Transaction
   * 5. Khusus DIGI: Update juga DigiflazzTransaction ke 'gagal'
   *
   * Semua dilakukan dalam Prisma transaction ($transaction) agar atomic:
   * jika salah satu query gagal, semua di-rollback.
   *
   * Referensi proyek lama: fungsi updateFailedTransaction baris 140-241
   */
  private async updateFailedTransaction(
    trxId: number | null,
    kodeServer: string,
    transactionData: {
      id: number;
      selling_price: number | null;
      riwayatTransaksi: { member: { id: number; saldo: number | null } | null } | null;
    },
  ): Promise<void> {
    const member = transactionData.riwayatTransaksi?.member;
    if (!member) {
      this.logger.warn(`[WEBHOOK] Member tidak ditemukan untuk transaksi id=${transactionData.id}`);
      return;
    }

    const sellingPrice = transactionData.selling_price || 0;
    const currentSaldo = member.saldo || 0;
    const newSaldo = currentSaldo + sellingPrice;

    // Gunakan Prisma transaction untuk memastikan atomicity
    await this.prisma.$transaction(async (tx) => {
      // 1. Kembalikan saldo member
      await tx.member.update({
        where: { id: member.id },
        data: { saldo: newSaldo },
      });

      // 2. Update status transaksi ke gagal
      if (kodeServer === 'DIGI') {
        // Untuk DIGI: update berdasarkan id
        await tx.transaction.update({
          where: { id: transactionData.id },
          data: { status: 'gagal' },
        });
        // Update juga DigiflazzTransaction
        await tx.digiflazzTransaction.updateMany({
          where: { transactionId: transactionData.id },
          data: { status: 'gagal', responseTime: new Date() },
        });
      } else {
        // Untuk IAK dan TRI: update berdasarkan trx_id
        await tx.transaction.updateMany({
          where: { trx_id: trxId },
          data: { status: 'gagal' },
        });
      }
    });
  }

  /**
   * Simpan log webhook ke tabel WebhookLog.
   *
   * Fungsi ini selalu dipanggil setiap kali ada webhook masuk,
   * baik sukses, gagal, ataupun error.
   */
  private async logWebhook(
    provider: string,
    event: string,
    transactionRef: string | null,
    payload: unknown,
    status: string,
    message: string,
    ipAddress: string,
  ): Promise<void> {
    try {
      await this.prisma.webhookLog.create({
        data: {
          provider,
          event,
          transactionRef,
          payload: JSON.stringify(payload),
          status,
          message,
          ipAddress,
        },
      });
    } catch (err: unknown) {
      // Jangan sampai error logging menghentikan proses utama
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[WEBHOOK] Gagal menyimpan log webhook: ${errorMsg}`);
    }
  }
}
