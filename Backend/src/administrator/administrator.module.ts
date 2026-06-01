import { Module } from '@nestjs/common';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { DaftarMemberModule } from './daftar_member/daftar_member.module';
import { TransaksiPulsaModule } from './transaksi_pulsa/transaksi_pulsa.module';
import { SemuaProdukModule } from './semua_produk/semua_produk.module';

@Module({
  imports: [AuthModule, MenuModule, DaftarMemberModule, TransaksiPulsaModule, SemuaProdukModule],
  controllers: [AdministratorController],
  providers: [AdministratorService],
})
export class AdministratorModule {}
