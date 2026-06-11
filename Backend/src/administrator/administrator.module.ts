import { DaftarProdukPascabayarTripayModule } from './daftar_produk_pascabayar_tripay/daftar_produk_pascabayar_tripay.module';
import { Module } from '@nestjs/common';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { DaftarMemberModule } from './daftar_member/daftar_member.module';
import { TransaksiPulsaModule } from './transaksi_pulsa/transaksi_pulsa.module';
import { ProdukPrabayarModule } from './produk_prabayar/produk_prabayar.module';
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
import { DaftarProdukPrabayarTripayModule } from './daftar_produk_prabayar_tripay/daftar_produk_prabayar_tripay.module';
import { KategoriPrabayarTripayModule } from './kategori_prabayar_tripay/kategori_prabayar_tripay.module';
import { OperatorPrabayarTripayModule } from './operator_prabayar_tripay/operator_prabayar_tripay.module';
import { KategoriPascabayarTripayModule } from './kategori_pascabayar_tripay/kategori_pascabayar_tripay.module';
import { OperatorPascabayarTripayModule } from './operator_pascabayar_tripay/operator_pascabayar_tripay.module';
import { DaftarTypeIakModule } from './daftar_type_iak/daftar_type_iak.module';
import { DaftarOperatorIakModule } from './daftar_operator_iak/daftar_operator_iak.module';
import { DaftarProdukPrabayarIakModule } from './daftar_produk_prabayar_iak/daftar_produk_prabayar_iak.module';
import { DaftarProdukPascabayarIakModule } from './daftar_produk_pascabayar_iak/daftar_produk_pascabayar_iak.module';
import { ProdukPascabayarModule } from './produk_pascabayar/produk_pascabayar.module';
import { DaftarSellerDigiflazzModule } from './daftar_seller_digiflazz/daftar_seller_digiflazz.module';
import { DaftarProdukSellerDigiflazzModule } from './daftar_produk_seller_digiflazz/daftar_produk_seller_digiflazz.module';

import { DaftarProdukDigiflazzModule } from './daftar_produk_digiflazz/daftar_produk_digiflazz.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RiwayatTransferSaldoModule } from './riwayat_transfer_saldo/riwayat_transfer_saldo.module';

@Module({
  imports: [AuthModule, MenuModule, DaftarMemberModule, DaftarAgenModule, TransaksiPulsaModule, ProdukPrabayarModule, ProdukPascabayarModule, SemuaServerModule, PengaturanUmumModule, KategoriModule, OperatorModule, DepositModule, LogModule, DaftarGrupModule, DaftarPenggunaModule, TripayModule, DaftarProdukPrabayarTripayModule, DaftarProdukPascabayarTripayModule, KategoriPrabayarTripayModule, OperatorPrabayarTripayModule, KategoriPascabayarTripayModule, OperatorPascabayarTripayModule, DaftarTypeIakModule, DaftarOperatorIakModule, DaftarProdukPrabayarIakModule, DaftarProdukPascabayarIakModule, DaftarSellerDigiflazzModule, DaftarProdukSellerDigiflazzModule, DaftarProdukDigiflazzModule, DashboardModule, RiwayatTransferSaldoModule],
  controllers: [AdministratorController],
  providers: [AdministratorService],
})
export class AdministratorModule {}
