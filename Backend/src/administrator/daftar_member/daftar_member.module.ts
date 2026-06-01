import { Module } from '@nestjs/common';
import { DaftarMemberService } from './daftar_member.service';
import { DaftarMemberController } from './daftar_member.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarMemberController],
  providers: [DaftarMemberService, PrismaService],
})
export class DaftarMemberModule {}
