import 'package:flutter/material.dart';
import 'package:change_app_package_name/change_app_package_name.dart';
import 'package:outletpulsa/module/login/login_page.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:outletpulsa/provider/BerandaProvider.dart';
import 'package:outletpulsa/provider/InfoAddDepositProvider.dart';
import 'package:outletpulsa/provider/RegistrasiProvider.dart';
import 'package:provider/provider.dart';

import 'module/home/home_page.dart';
import 'provider/AgenProvider.dart';
import 'provider/AuthenticationProvider.dart';
import 'provider/DepositProvider.dart';
import 'provider/DetailPascabayarProvider.dart';
import 'provider/DetailProvider.dart';
import 'provider/InfoBelumBacaProvider.dart';
import 'provider/InfoSudahBacaProvider.dart';
import 'provider/KonfirmasiProvider.dart';
import 'provider/RiwayatDepositProvider.dart';
import 'provider/RiwayatPascabayarProvider.dart';
import 'provider/RiwayatPrabayarProvider.dart';
import 'provider/RiwayatTransferProvider.dart';
import 'provider/TransactionProvider.dart';
import 'provider/TransferSaldoProvider.dart';
import 'provider/UpdateAkunProvider.dart';
import 'provider/UpdateStatusBacaProvider.dart';
import 'provider/loadProvider.dart';

void main() async {
  await dotenv.load(fileName: ".env");
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<Authentication_provider>(
          create: (context) => Authentication_provider(),
        ),
        ChangeNotifierProxyProvider<Authentication_provider, Beranda_provider>(
          create: (context) => Beranda_provider(),
          update: (context, auth, home) => home!..updateIsLogin(auth.isLogin),
        ),
        ChangeNotifierProvider<Info_add_deposit_provider>(
          create: (context) => Info_add_deposit_provider(),
        ),
        ChangeNotifierProvider<Transaction_provider>(
          create: (context) => Transaction_provider(),
        ),
        ChangeNotifierProvider<Riwayat_prabayar_provider>(
          create: (context) => Riwayat_prabayar_provider(),
        ),
        ChangeNotifierProvider<Riwayat_pascabayar_provider>(
          create: (context) => Riwayat_pascabayar_provider(),
        ),
        ChangeNotifierProvider<Riwayat_deposit_provider>(
          create: (context) => Riwayat_deposit_provider(),
        ),
        ChangeNotifierProvider<Info_belum_baca_provider>(
          create: (context) => Info_belum_baca_provider(),
        ),
        ChangeNotifierProvider<Info_sudah_baca_provider>(
          create: (context) => Info_sudah_baca_provider(),
        ),
        ChangeNotifierProvider<Update_status_baca_provider>(
          create: (context) => Update_status_baca_provider(),
        ),
        ChangeNotifierProvider<Update_akun_provider>(
          create: (context) => Update_akun_provider(),
        ),
        ChangeNotifierProvider<Transfer_saldo_provider>(
          create: (context) => Transfer_saldo_provider(),
        ),
        ChangeNotifierProvider<Riwayat_transfer_saldo_provider>(
          create: (context) => Riwayat_transfer_saldo_provider(),
        ),
        ChangeNotifierProvider<Deposit_provider>(
          create: (context) => Deposit_provider(),
        ),
        ChangeNotifierProvider<Konfirmasi_provider>(
          create: (context) => Konfirmasi_provider(),
        ),
        ChangeNotifierProvider<Registrasi_provider>(
          create: (context) => Registrasi_provider(),
        ),
        ChangeNotifierProvider<Load_provider>(
          create: (context) => Load_provider(),
        ),
        ChangeNotifierProvider<Detail_provider>(
          create: (context) => Detail_provider(),
        ),
        ChangeNotifierProvider<Detail_pascabayar_provider>(
          create: (context) => Detail_pascabayar_provider(),
        ),
        ChangeNotifierProvider<Agen_provider>(
          create: (context) => Agen_provider(),
        ),
      ],
      child: MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData(fontFamily: 'Poppins'),
          home: SupportWidget()),
    );
  }
}

class SupportWidget extends StatefulWidget {
  const SupportWidget({
    Key? key,
  }) : super(key: key);

  @override
  State<SupportWidget> createState() => _SupportWidgetState();
}

class _SupportWidgetState extends State<SupportWidget> {
  int numLoad = 0;

  @override
  void didChangeDependencies() async {
    if (numLoad == 0) {
      // check login
      await Provider.of<Authentication_provider>(context).check_login();
      numLoad = 1;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<Authentication_provider>(
        builder: (context, auth, child) => Container(
              child: (auth.isLogin == true) ? Home_page() : Login_page(),
            ));
  }
}
