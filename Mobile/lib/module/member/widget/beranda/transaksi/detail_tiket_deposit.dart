import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../config/config.dart';

class Detail_tiket_deposit extends StatefulWidget {
  const Detail_tiket_deposit({super.key});

  @override
  State<Detail_tiket_deposit> createState() => _Detail_tiket_depositState();
}

class _Detail_tiket_depositState extends State<Detail_tiket_deposit> {
  final config = ConfigApp();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: config.background_color,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
            onPressed: () {
              Navigator.pop(context);
            },
            icon: Icon(
              Icons.arrow_back,
              color: Colors.white,
            )),
        title: Text(
          'Detail Deposit Saldo',
          style: GoogleFonts.poppins(
              textStyle: Theme.of(context).textTheme.headlineMedium,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: config.text_light_color),
        ),
      ),
      body: Container(
        padding: EdgeInsets.only(left: 30, right: 30, top: 25, bottom: 25),
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 15, horizontal: 10),
          constraints: BoxConstraints(
              minHeight: 180,
              minWidth: double.infinity,
              maxHeight: double.infinity),
          decoration: BoxDecoration(
              color: config.text_light_color,
              borderRadius: BorderRadius.circular(10)),
          child: ListView(
            children: [
              BoxDetail(
                  config: config, label: 'Kode Transaksi', value: '#123123'),
              Divider(),
              BoxDetail(
                  config: config,
                  label: 'Nominal Deposit',
                  value: 'RP 200.334'),
              Divider(),
              BoxDetail(
                  config: config,
                  label: 'Bank Tujuan Transfer',
                  value: 'Bank BSI'),
              Divider(),
              BoxDetail(
                  config: config,
                  label: 'Nomor Rekening Tujuan Transfer',
                  value: '1171298276'),
              Divider(),
              BoxDetail(
                  config: config,
                  label: 'Nama Akun Tujuan Transfer',
                  value: 'Muammar Kadafi'),
              Divider(),
              BoxDetail(
                  config: config, label: 'Status Deposit', value: 'Proses'),
              Divider(),
              BoxDetail(
                  config: config, label: 'Status Kirim', value: 'Sudah Kirim'),
              Divider(),
              Divider(),
            ],
          ),
        ),
      ),
    );
  }
}

class BoxDetail extends StatelessWidget {
  const BoxDetail(
      {super.key,
      required this.config,
      required this.label,
      required this.value});

  final ConfigApp config;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Row(
        children: [
          Expanded(
              child: Text(
            label,
            style: GoogleFonts.poppins(
                textStyle: Theme.of(context).textTheme.headlineMedium,
                fontSize: 14,
                color: config.text_grey_color),
          )),
          Expanded(
              child: Text(
            value,
            textAlign: TextAlign.end,
            style: GoogleFonts.poppins(
                textStyle: Theme.of(context).textTheme.headlineMedium,
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: config.text_dark_color),
          )),
        ],
      ),
    );
  }
}

class BoxDetailBank extends StatelessWidget {
  const BoxDetailBank(
      {super.key,
      required this.config,
      required this.label,
      required this.value,
      required this.an});

  final ConfigApp config;
  final String label;
  final String value;
  final String an;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Row(
        children: [
          Expanded(
              child: Text(
            label,
            style: GoogleFonts.poppins(
                textStyle: Theme.of(context).textTheme.headlineMedium,
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: config.text_dark_color),
          )),
          Expanded(
              child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                textAlign: TextAlign.end,
                style: GoogleFonts.poppins(
                    textStyle: Theme.of(context).textTheme.headlineMedium,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: config.text_dark_color),
              ),
              Text(
                'AN : ' + an,
                textAlign: TextAlign.end,
                style: GoogleFonts.poppins(
                    textStyle: Theme.of(context).textTheme.headlineMedium,
                    fontSize: 13,
                    color: config.text_dark_color),
              ),
            ],
          )),
        ],
      ),
    );
  }
}
