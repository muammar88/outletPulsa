import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/module/public/login.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/shared/providers/InfoAddDepositProvider.dart';
import 'package:outletpulsa/shared/providers/RegistrasiProvider.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/module/public/splash_screen.dart';

import 'module/member/main.dart';
import 'shared/providers/AgenProvider.dart';
import 'shared/providers/AuthenticationProvider.dart';
import 'shared/providers/DepositProvider.dart';
import 'shared/providers/DetailPascabayarProvider.dart';
import 'shared/providers/DetailProvider.dart';
import 'shared/providers/InfoBelumBacaProvider.dart';
import 'shared/providers/InfoSudahBacaProvider.dart';
import 'shared/providers/KonfirmasiProvider.dart';
import 'shared/providers/RiwayatDepositProvider.dart';
import 'shared/providers/RiwayatPascabayarProvider.dart';
import 'shared/providers/RiwayatPrabayarProvider.dart';
import 'shared/providers/RiwayatTransferProvider.dart';
import 'shared/providers/TransactionProvider.dart';
import 'shared/providers/TransferSaldoProvider.dart';
import 'shared/providers/UpdateAkunProvider.dart';
import 'shared/providers/UpdateStatusBacaProvider.dart';
import 'shared/providers/loadProvider.dart';
import 'shared/providers/notification_provider.dart';

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Handle background messages
  print('Handling a background message: ${message.messageId}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    // If you have firebase_options.dart generated, you should pass options: DefaultFirebaseOptions.currentPlatform
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e) {
    print('Error initializing Firebase: $e');
    print('Note: Ensure you have added google-services.json and configured Firebase properly.');
  }
  
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
        ChangeNotifierProvider<NotificationProvider>(
          create: (context) => NotificationProvider(),
        ),
      ],
      child: MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            textTheme: GoogleFonts.poppinsTextTheme(
              Theme.of(context).textTheme,
            ),
          ),
          home: const SplashScreen()),
    );
  }
}
