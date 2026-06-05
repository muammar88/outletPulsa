import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/module/home/daftar_reseller_agen.dart';
import 'package:provider/provider.dart';

import '../../config/config.dart';
import '../../provider/AuthenticationProvider.dart';
import '../../provider/BerandaProvider.dart';
import '../saldo/riwayat_transfer_saldo.dart';
import '../transaksi/UpdateAkunName.dart';
import '../saldo/form_transfer_saldo.dart';
import '../transaksi/UpdatePassword.dart';
import 'ketentuan_dan_kebijakan.dart';
import 'riwayat_pembayaran_fee_agen.dart';

class Akun_tab extends StatefulWidget {
  const Akun_tab({super.key});

  @override
  State<Akun_tab> createState() => _Akun_tabState();
}

class _Akun_tabState extends State<Akun_tab> {
  final config = ConfigApp();
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey[200],
      padding: EdgeInsets.only(
        left: 30,
        right: 30,
      ),
      child: ListView(
        children: [
          SizedBox(
            height: 20,
          ),
          Text(
            'Pengaturan Akun',
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 12,
                color: config.text_grey_color),
          ),
          SizedBox(
            height: 10,
          ),
          Container(
              padding: EdgeInsets.symmetric(vertical: 15, horizontal: 15),
              decoration: BoxDecoration(
                  color: config.text_light_color,
                  borderRadius: BorderRadius.circular(10)),
              child: Consumer<Beranda_provider>(
                builder: (context, dataBeranda, child) => Column(
                  children: [
                    BoxAkunWidget(
                        config: config,
                        label: 'Kode Member',
                        value: dataBeranda.kode!,
                        arrowStatus: false),
                    Image.asset(
                      'assets/img/tengah.png',
                      fit: BoxFit.cover,
                    ),
                    InkWell(
                      onTap: () {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) =>
                                    Update_akun_name(name: dataBeranda.name!)));
                      },
                      child: BoxAkunWidget(
                          config: config,
                          label: 'Nama Pengguna',
                          value: dataBeranda.name!,
                          arrowStatus: true),
                    ),
                    Image.asset(
                      'assets/img/tengah.png',
                      fit: BoxFit.cover,
                    ),
                    BoxAkunWidget(
                        config: config,
                        label: 'Nomor Whatsapp',
                        value: dataBeranda.nomor_whatsapp!,
                        arrowStatus: false),
                    Image.asset(
                      'assets/img/tengah.png',
                      fit: BoxFit.cover,
                    ),
                    InkWell(
                      onTap: () {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => Update_password()));
                      },
                      child: BoxAkunWidget(
                          config: config,
                          label: 'Ganti Password',
                          value: '',
                          arrowStatus: true),
                    ),
                  ],
                ),
              )),
          SizedBox(
            height: 20,
          ),
          Text(
            'Transfer Saldo',
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 12,
                color: config.text_grey_color),
          ),
          SizedBox(
            height: 10,
          ),
          Container(
            padding: EdgeInsets.only(top: 15, left: 15, right: 15, bottom: 15),
            decoration: BoxDecoration(
                color: config.text_light_color,
                borderRadius: BorderRadius.circular(10)),
            child: Column(
              children: [
                InkWell(
                  onTap: () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => Form_transfer_saldo()));
                  },
                  child: BoxOneRowWidget(
                      config: config,
                      label: 'Transfer Saldo',
                      id: '',
                      arrowStatus: true),
                ),
                Image.asset(
                  'assets/img/tengah.png',
                  fit: BoxFit.cover,
                ),
                InkWell(
                  onTap: () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => Riwayat_transfer_saldo()));
                  },
                  child: BoxOneRowWidget(
                      config: config,
                      label: 'Riwayat Transfer Saldo',
                      id: '',
                      arrowStatus: true),
                ),
              ],
            ),
          ),
          SizedBox(
            height: 20,
          ),
          Text(
            'Keagenan',
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 12,
                color: config.text_grey_color),
          ),
          SizedBox(
            height: 10,
          ),
          Container(
            padding: EdgeInsets.only(top: 15, left: 15, right: 15, bottom: 15),
            decoration: BoxDecoration(
                color: config.text_light_color,
                borderRadius: BorderRadius.circular(10)),
            child: Column(
              children: [
                InkWell(
                  onTap: () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => Daftar_reseller_agen()));
                  },
                  child: BoxOneRowWidget(
                      config: config,
                      label: 'Daftar Reseller Agen',
                      id: '',
                      arrowStatus: true),
                ),
                Image.asset(
                  'assets/img/tengah.png',
                  fit: BoxFit.cover,
                ),
                InkWell(
                  onTap: () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) =>
                                Riwayat_pembayaran_fee_agen()));
                  },
                  child: BoxOneRowWidget(
                      config: config,
                      label: 'Riwayat Pembayaran Fee Agen',
                      id: '',
                      arrowStatus: true),
                ),
                Image.asset(
                  'assets/img/tengah.png',
                  fit: BoxFit.cover,
                ),
                InkWell(
                  onTap: () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => Ketentuan_dan_kebijakan()));
                  },
                  child: BoxOneRowWidget(
                      config: config,
                      label: 'Ketentuan Dan Kebijakan Fitur Keagenan',
                      id: '',
                      arrowStatus: true),
                ),
              ],
            ),
          ),
          SizedBox(
            height: 20,
          ),
          TextButton(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    FontAwesomeIcons.arrowCircleLeft,
                    size: 15,
                    color: config.text_light_color,
                  ),
                  SizedBox(
                    width: 10,
                  ),
                  Text('Keluar',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.ptSans(
                          textStyle: Theme.of(context).textTheme.headline4,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: config.text_light_color))
                ],
              ),
              style: ButtonStyle(
                  padding:
                      MaterialStateProperty.all<EdgeInsets>(EdgeInsets.all(15)),
                  foregroundColor: MaterialStateProperty.all<Color>(
                      config.background_smooth_navy),
                  backgroundColor: MaterialStateProperty.all(Colors.red),
                  shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                      RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(5.0),
                          side: BorderSide(color: Colors.red)))),
              onPressed: () => {
                    // logOut
                    Provider.of<Authentication_provider>(context, listen: false)
                        .logOut()
                  }),
          SizedBox(
            height: 50,
          ),
        ],
      ),
    );
  }
}

class BoxOneRowWidget extends StatelessWidget {
  const BoxOneRowWidget(
      {super.key,
      required this.config,
      required this.label,
      required this.id,
      required this.arrowStatus});

  final ConfigApp config;
  final String label;
  final String id;
  final bool arrowStatus;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 30,
      child: Row(
        children: [
          Expanded(
              child: Text(
            label,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 13,
                color: config.text_dark_color),
          )),
          arrowStatus == true
              ? Container(
                  margin: EdgeInsets.only(left: 15),
                  child: Icon(
                    FontAwesomeIcons.chevronRight,
                    color: config.text_grey_color,
                    size: 15,
                  ),
                )
              : SizedBox()
        ],
      ),
    );
  }
}

class BoxAkunWidget extends StatelessWidget {
  const BoxAkunWidget(
      {super.key,
      required this.config,
      required this.label,
      required this.value,
      required this.arrowStatus});

  final ConfigApp config;
  final String label;
  final String value;
  final bool arrowStatus;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 30,
      child: Row(
        children: [
          Expanded(
              child: Text(
            label,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 13,
                color: config.text_dark_color),
          )),
          Expanded(
              child: Text(
            value,
            textAlign: TextAlign.right,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 13,
                color: config.text_dark_color),
          )),
          arrowStatus == true
              ? Container(
                  margin: EdgeInsets.only(left: 15),
                  child: Icon(
                    FontAwesomeIcons.chevronRight,
                    color: config.text_grey_color,
                    size: 15,
                  ),
                )
              : SizedBox(
                  width: 10,
                )
        ],
      ),
    );
  }
}
