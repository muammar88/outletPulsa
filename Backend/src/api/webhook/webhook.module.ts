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
import {
  LinkquCallbackProcessorService,
  LINKQU_SETTLEMENT_ADAPTER,
} from './linkqu-callback-processor.service';
import { LinkquSettlementAdapter } from './linkqu-settlement.adapter';
import { LinkquReconciliationService } from './linkqu-reconciliation.service';

@Module({
  imports: [
    PengumumanModule,
    SocketModule,
    AuthModule,
    DaftarProdukDigiflazzModule,
    TransaksiModule,
  ],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    PrismaService,
    WapisenderService,
    LinkquCallbackWorkerService,
    LinkquCallbackProcessorService,
    // Adapter settlement produksi: tanpa ini event hanya ditahan dan saldo tidak pernah masuk.
    { provide: LINKQU_SETTLEMENT_ADAPTER, useClass: LinkquSettlementAdapter },
    LinkquReconciliationService,
  ],
  exports: [WapisenderService, LinkquCallbackWorkerService, LinkquCallbackProcessorService, LinkquReconciliationService],
})
export class WebhookModule {}
