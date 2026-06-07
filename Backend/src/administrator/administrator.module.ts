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
import { LogModule } from './log/log.module';
import { DaftarGrupModule } from './daftar_grup/daftar_grup.module';
import { DaftarPenggunaModule } from './daftar_pengguna/daftar_pengguna.module';
import { TripayModule } from './tripay/tripay.module';
import { DaftarProdukTripayModule } from './daftar_produk_tripay/daftar_produk_tripay.module';
import { KategoriTripayModule } from './kategori_tripay/kategori_tripay.module';
import { OperatorTripayModule } from './operator_tripay/operator_tripay.module';
import { DaftarTypeIakModule } from './daftar_type_iak/daftar_type_iak.module';
import { DaftarOperatorIakModule } from './daftar_operator_iak/daftar_operator_iak.module';
import { DaftarProdukIakModule } from './daftar_produk_iak/daftar_produk_iak.module';

@Module({
  imports: [AuthModule, MenuModule, DaftarMemberModule, DaftarAgenModule, TransaksiPulsaModule, SemuaProdukModule, SemuaServerModule, PengaturanUmumModule, KategoriModule, OperatorModule, DepositModule, LogModule, DaftarGrupModule, DaftarPenggunaModule, TripayModule, DaftarProdukTripayModule, KategoriTripayModule, OperatorTripayModule, DaftarTypeIakModule, DaftarOperatorIakModule, DaftarProdukIakModule],
  controllers: [AdministratorController],
  providers: [AdministratorService],
})
export class AdministratorModule {}
