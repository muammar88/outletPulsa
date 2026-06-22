import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AdministratorModule } from './administrator/administrator.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberController } from './member/member.controller';
import { ApiController } from './api/api.controller';
import { MemberService } from './member/member.service';
import { ApiService } from './api/api.service';
import { AuthModule } from './api/auth/auth.module';
import { BerandaModule } from './api/beranda/beranda.module';
import { RiwayatModule } from './api/riwayat/riwayat.module';
import { StubModule } from './api/stub/stub.module';
import { InfoModule } from './api/info/info.module';
import { AkunModule } from './api/akun/akun.module';
import { ProdukModule } from './api/produk/produk.module';
import { TransaksiModule } from './api/transaksi/transaksi.module';

import { TransaksiPascabayarModule } from './api/transaksi_pascabayar/transaksi-pascabayar.module';
import { DepositModule } from './api/deposit/deposit.module';

import { WebhookModule } from './api/webhook/webhook.module';
import { ProvidersModule } from './providers/providers.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ProvidersModule, AdministratorModule, AuthModule, BerandaModule, RiwayatModule, StubModule, InfoModule, AkunModule, ProdukModule, TransaksiModule, TransaksiPascabayarModule, WebhookModule, DepositModule, SchedulerModule.register(), EventEmitterModule.forRoot()],
  controllers: [AppController, MemberController, ApiController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService, MemberService, ApiService],
})
export class AppModule {}
