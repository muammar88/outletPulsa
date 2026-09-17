import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../../prisma.service';
import { PengumumanModule } from '../../pengumuman/pengumuman.module';
import { SocketModule } from '../../socket/socket.module';
import { AuthModule } from '../auth/auth.module';
import { DaftarProdukDigiflazzModule } from '../../administrator/daftar_produk_digiflazz/daftar_produk_digiflazz.module';

@Module({
  imports: [PengumumanModule, SocketModule, AuthModule, DaftarProdukDigiflazzModule],
  controllers: [WebhookController],
  providers: [WebhookService, PrismaService],
})
export class WebhookModule {}
