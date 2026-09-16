import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../../prisma.service';
import { PengumumanModule } from '../../pengumuman/pengumuman.module';
import { SocketModule } from '../../socket/socket.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PengumumanModule, SocketModule, AuthModule],
  controllers: [WebhookController],
  providers: [WebhookService, PrismaService],
})
export class WebhookModule {}
