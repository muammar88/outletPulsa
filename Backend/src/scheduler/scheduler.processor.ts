import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { DaftarProdukSellerDigiflazzService } from '../administrator/daftar_produk_seller_digiflazz/daftar_produk_seller_digiflazz.service';
import { DaftarProdukDigiflazzService } from '../administrator/daftar_produk_digiflazz/daftar_produk_digiflazz.service';
import { DaftarProdukPrabayarIakService } from '../administrator/daftar_produk_prabayar_iak/daftar_produk_prabayar_iak.service';
import { DaftarProdukPascabayarIakService } from '../administrator/daftar_produk_pascabayar_iak/daftar_produk_pascabayar_iak.service';
import { DaftarProdukPrabayarTripayService } from '../administrator/daftar_produk_prabayar_tripay/daftar_produk_prabayar_tripay.service';
import { DaftarProdukPascabayarTripayService } from '../administrator/daftar_produk_pascabayar_tripay/daftar_produk_pascabayar_tripay.service';
import { ProdukPrabayarService } from '../administrator/produk_prabayar/produk_prabayar.service';

@Processor('product-sync', { concurrency: 1 })
export class SchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(SchedulerProcessor.name);

  constructor(
    private readonly digiflazzSellerService: DaftarProdukSellerDigiflazzService,
    private readonly digiflazzService: DaftarProdukDigiflazzService,
    private readonly iakPrabayarService: DaftarProdukPrabayarIakService,
    private readonly iakPascabayarService: DaftarProdukPascabayarIakService,
    private readonly tripayPrabayarService: DaftarProdukPrabayarTripayService,
    private readonly tripayPascabayarService: DaftarProdukPascabayarTripayService,
    private readonly produkPrabayarService: ProdukPrabayarService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Memulai Job ${job.name} (ID: ${job.id})`);
    const systemAdminId = 1;

    // Langkah 1: Scan produk Digiflazz
    await this.runStep('1. Scan Produk Digiflazz', async () => {
      await this.digiflazzSellerService.syncProducts(systemAdminId);
    });

    // Langkah 2: Pilih seller termurah Digiflazz
    await this.runStep('2. Pilih Seller Termurah Digiflazz', async () => {
      await this.digiflazzService.selectCheapestSeller();
    });

    // Langkah 3: Scan produk prabayar IAK
    await this.runStep('3. Scan Produk Prabayar IAK', async () => {
      await this.iakPrabayarService.syncProducts(systemAdminId);
    });

    // Langkah 4: Scan produk pascabayar IAK
    await this.runStep('4. Scan Produk Pascabayar IAK', async () => {
      await this.iakPascabayarService.syncProducts(systemAdminId);
    });

    // Langkah 5: Scan produk prabayar Tripay
    await this.runStep('5. Scan Produk Prabayar Tripay', async () => {
      await this.tripayPrabayarService.syncProducts(systemAdminId);
    });

    // Langkah 6: Scan produk pascabayar Tripay
    await this.runStep('6. Scan Produk Pascabayar Tripay', async () => {
      await this.tripayPascabayarService.syncProducts(systemAdminId);
    });

    // Langkah 7: Pemilihan produk termurah (seluruh prabayar)
    await this.runStep('7. Sync Termurah Seluruh Produk Prabayar', async () => {
      await this.produkPrabayarService.syncTermurah();
    });

    this.logger.log(`Job ${job.name} selesai dieksekusi.`);
    return { success: true, timestamp: new Date() };
  }

  /**
   * Helper function to execute a step safely.
   * Akan menangkap error dan melanjutkannya agar tidak menghancurkan sisa proses.
   */
  private async runStep(stepName: string, action: () => Promise<void>) {
    this.logger.log(`--> Memulai step: ${stepName}`);
    const start = Date.now();
    try {
      await action();
      const duration = Date.now() - start;
      this.logger.log(`    [SUKSES] ${stepName} (Durasi: ${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      this.logger.error(`    [GAGAL] ${stepName} (Durasi: ${duration}ms)`, error.stack);
      // Jangan melempar (throw) error agar proses selanjutnya bisa tetap berjalan.
    }
  }
}
