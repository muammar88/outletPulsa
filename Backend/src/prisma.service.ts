import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    await this.fixSequences();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Memperbaiki nilai sequence autoincrement di PostgreSQL.
   * Diperlukan ketika data disisipkan secara manual dengan id eksplisit
   * sehingga sequence tidak ikut naik dan menyebabkan error Unique constraint.
   */
  private async fixSequences() {
    const tables = [
      '"User"',
      '"Group"',
      '"Permission"',
      '"GroupPermission"',
      '"Member"',
      '"Bank"',
      '"BankTransferOutlet"',
      '"Kategori"',
      '"Operator"',
      '"Prefix"',
      '"Server"',
      '"Produk"',
      '"ProdukPascabayar"',
      '"Transaction"',
      '"TransactionPascabayar"',
      '"RequestDeposit"',
      '"RiwayatTransaksi"',
      '"RiwayatMutasi"',
      '"TransferSaldo"',
      '"TerimaSaldo"',
      '"RiwayatTransferSaldoServer"',
      '"Notif"',
      '"NotifMemberRead"',
      '"ResetPassword"',
      '"Promo"',
      '"DigiflazzBrand"',
      '"DigiflazzCategory"',
      '"DigiflazzType"',
      '"DigiflazzProduct"',
      '"DigiflazzSeller"',
      '"DigiflazzSellerProduct"',
      '"DigiflazzTransaction"',
      '"DigiflazzPascabayarProduct"',
      '"ProdukPascabayarProvider"',
      '"ActivityLog"',
      '"WebhookLog"',
    ];

    let fixed = 0;
    let skipped = 0;

    for (const table of tables) {
      try {
        await this.$executeRawUnsafe(
          `SELECT setval(pg_get_serial_sequence('${table}', 'id'), coalesce((SELECT MAX(id) FROM ${table}), 0) + 1, false);`
        );
        fixed++;
      } catch (err) {
        // Table might not have a sequence (e.g. no rows yet) - silently skip
        skipped++;
      }
    }

    this.logger.log(`Sequence fix selesai: ${fixed} tabel diperbarui, ${skipped} dilewati.`);
  }
}
