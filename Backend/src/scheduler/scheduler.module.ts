import { Module, DynamicModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SchedulerService } from './scheduler.service';
import { SchedulerProcessor } from './scheduler.processor';
import { PascabayarRecoveryProcessor } from './pascabayar-recovery.processor';

// Import services that will be called in the job
import { DaftarProdukSellerDigiflazzModule } from '../administrator/daftar_produk_seller_digiflazz/daftar_produk_seller_digiflazz.module';
import { DaftarProdukDigiflazzModule } from '../administrator/daftar_produk_digiflazz/daftar_produk_digiflazz.module';
import { DaftarProdukPrabayarIakModule } from '../administrator/daftar_produk_prabayar_iak/daftar_produk_prabayar_iak.module';
import { DaftarProdukPascabayarIakModule } from '../administrator/daftar_produk_pascabayar_iak/daftar_produk_pascabayar_iak.module';
import { DaftarProdukPrabayarTripayModule } from '../administrator/daftar_produk_prabayar_tripay/daftar_produk_prabayar_tripay.module';
import { DaftarProdukPascabayarTripayModule } from '../administrator/daftar_produk_pascabayar_tripay/daftar_produk_pascabayar_tripay.module';
import { ProdukPrabayarModule } from '../administrator/produk_prabayar/produk_prabayar.module';

import { PrismaService } from '../prisma.service';

@Module({})
export class SchedulerModule {
  static register(): DynamicModule {
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      // In development/staging, we don't start the BullMQ workers or queues
      return {
        module: SchedulerModule,
        providers: [],
        exports: [],
      };
    }

    return {
      module: SchedulerModule,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            connection: {
              host: configService.get<string>('REDIS_HOST') || 'localhost',
              port: configService.get<number>('REDIS_PORT') || 6379,
              password: configService.get<string>('REDIS_PASSWORD') || undefined,
            },
            defaultJobOptions: {
              removeOnComplete: 10,
              removeOnFail: 100,
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 1000,
              },
            },
          }),
          inject: [ConfigService],
        }),
        BullModule.registerQueue({
          name: 'product-sync',
        }),
        BullModule.registerQueue({
          name: 'pascabayar-recovery',
        }),
        // Import modules to inject their services into the Processor
        DaftarProdukSellerDigiflazzModule,
        DaftarProdukDigiflazzModule,
        DaftarProdukPrabayarIakModule,
        DaftarProdukPascabayarIakModule,
        DaftarProdukPrabayarTripayModule,
        DaftarProdukPascabayarTripayModule,
        ProdukPrabayarModule,
      ],
      providers: [SchedulerService, SchedulerProcessor, PascabayarRecoveryProcessor, PrismaService],
    };
  }
}
