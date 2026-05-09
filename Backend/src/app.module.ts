import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministratorController } from './administrator/administrator.controller';
import { MemberController } from './member/member.controller';
import { ApiController } from './api/api.controller';
import { AdministratorService } from './administrator/administrator.service';
import { MemberService } from './member/member.service';
import { ApiService } from './api/api.service';

@Module({
  imports: [],
  controllers: [AppController, AdministratorController, MemberController, ApiController],
  providers: [AppService, AdministratorService, MemberService, ApiService],
})
export class AppModule {}
