import { Module } from '@nestjs/common';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { DaftarMemberModule } from './daftar_member/daftar_member.module';
import { TransaksiPulsaModule } from './transaksi_pulsa/transaksi_pulsa.module';
import { SemuaProdukModule } from './semua_produk/semua_produk.module';
import { SemuaServerModule } from './semua_server/semua_server.module';
import { PengaturanUmumModule } from './pengaturan_umum/pengaturan_umum.module';
import { DaftarAgenModule } from './daftar_agen/daftar_agen.module';

import { KategoriModule } from './kategori/kategori.module';
import { OperatorModule } from './operator/operator.module';
import { DepositModule } from './deposit/deposit.module';

@Module({
  imports: [AuthModule, MenuModule, DaftarMemberModule, DaftarAgenModule, TransaksiPulsaModule, SemuaProdukModule, SemuaServerModule, PengaturanUmumModule, KategoriModule, OperatorModule, DepositModule],
  controllers: [AdministratorController],
  providers: [AdministratorService],
})
export class AdministratorModule {}
