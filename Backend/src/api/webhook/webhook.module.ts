import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../../prisma.service';
import { PengumumanModule } from '../../pengumuman/pengumuman.module';
import { SocketModule } from '../../socket/socket.module';
import { AuthModule } from '../auth/auth.module';
import { DaftarProdukDigiflazzModule } from '../../administrator/daftar_produk_digiflazz/daftar_produk_digiflazz.module';
import { TransaksiModule } from '../transaksi/transaksi.module';
import { WapisenderService } from '../../providers/wapisender.service';
import { LinkquCallbackWorkerService } from './linkqu-callback-worker.service';
import { LinkquCallbackProcessorService } from './linkqu-callback-processor.service';

@Module({
  imports: [
    PengumumanModule,
    SocketModule,
    AuthModule,
    DaftarProdukDigiflazzModule,
    TransaksiModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService, PrismaService, WapisenderService, LinkquCallbackWorkerService, LinkquCallbackProcessorService],
  exports: [WapisenderService, LinkquCallbackWorkerService, LinkquCallbackProcessorService],
})
export class WebhookModule {}
