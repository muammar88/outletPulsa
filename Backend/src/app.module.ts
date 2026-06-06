import { Module } from '@nestjs/common';
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

@Module({
  imports: [AdministratorModule, AuthModule, BerandaModule, RiwayatModule, StubModule],
  controllers: [AppController, MemberController, ApiController],
  providers: [AppService, MemberService, ApiService],
})
export class AppModule {}


