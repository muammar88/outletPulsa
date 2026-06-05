import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../config/config.dart';

class Ketentuan_dan_kebijakan extends StatefulWidget {
  const Ketentuan_dan_kebijakan({super.key});

  @override
  State<Ketentuan_dan_kebijakan> createState() =>
      _Ketentuan_dan_kebijakanState();
}

class _Ketentuan_dan_kebijakanState extends State<Ketentuan_dan_kebijakan> {
  final config = ConfigApp();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: config.background_smooth_navy,
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
          'Ketentuan dan Kebijakan',
          style: GoogleFonts.ptSans(
              textStyle: Theme.of(context).textTheme.headline4,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: config.text_light_color),
        ),
      ),
      backgroundColor: Colors.grey[200],
      body: Container(
          padding: EdgeInsets.symmetric(
            horizontal: 25,
          ),
          child: Container(
            child: ListView(children: [
              SizedBox(
                height: 25,
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 15, vertical: 15),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(5),
                  color: Colors.white,
                ),
                child: Column(
                  children: [
                    RichText(
                      textAlign: TextAlign.justify,
                      text: TextSpan(
                        style: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 14,
                            height: 1.5,
                            color: config.text_dark_color),
                        children: <TextSpan>[
                          TextSpan(
                            text:
                                'Fitur Keagenan adalah salah satu fitur yang tersedia dalam aplikasi',
                          ),
                          TextSpan(
                              text: ' OutletPulsa ',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontStyle: FontStyle.italic)),
                          TextSpan(
                            text: 'untuk Member',
                          ),
                          TextSpan(
                              text: ' OutletPulsa ',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontStyle: FontStyle.italic)),
                          TextSpan(
                            text:
                                'yang ingin memiliki reseller produk yang tersedia di platform ini. Fitur ini akan memberikan komisi kepada Agen sebesar',
                          ),
                          TextSpan(
                              text: ' Rp 20,-  ',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                              )),
                          TextSpan(
                            text:
                                'dari setiap transaksi yang dilakukan oleh reseller. Komisi tersebut akan secara otomatis didistribusikan ke saldo member sekali dalam sehari.',
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 10,
                    ),
                    RichText(
                      textAlign: TextAlign.justify,
                      text: TextSpan(
                        style: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 14,
                            height: 1.5,
                            color: config.text_dark_color),
                        children: <TextSpan>[
                          TextSpan(
                            text:
                                'Saldo yang didapatkan, dapat digunakan kembali untuk membeli produk di',
                          ),
                          TextSpan(
                              text: ' OutletPulsa ',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontStyle: FontStyle.italic)),
                          TextSpan(
                            text:
                                'atau untuk mentransfer ke anggota lainnya di platform ini. Selain itu, anggota',
                          ),
                          TextSpan(
                              text: ' OutletPulsa ',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontStyle: FontStyle.italic)),
                          TextSpan(
                            text:
                                'juga bisa mentransfer saldo pulsa mereka kepada reseller di bawah mereka. Namun, saldo dari setiap anggota tidak dapat ditarik (withdraw).',
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 10,
                    ),
                    RichText(
                      textAlign: TextAlign.justify,
                      text: TextSpan(
                        style: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 14,
                            height: 1.5,
                            color: config.text_dark_color),
                        children: <TextSpan>[
                          TextSpan(
                            text:
                                'Untuk menambahkan reseller baru, agen cukup memasukkan kode member saat mendaftarkan member baru. Setelah itu member baru tersebut akan otomatis menjadi reseller dari agen tersebut.',
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 10,
                    ),
                    RichText(
                      textAlign: TextAlign.justify,
                      text: TextSpan(
                        style: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 14,
                            height: 1.5,
                            color: config.text_dark_color),
                        children: <TextSpan>[
                          TextSpan(
                            text:
                                'Setiap member dapat melihat riwayat pencairan Fee keagenan masing-masing di menu',
                          ),
                          TextSpan(
                              text: ' Riwayat Pembayaran Fee Agen',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                              )),
                          TextSpan(
                            text: '.',
                          ),
                          TextSpan(
                            text:
                                ' Ketentuan dan kebijakan dari fitur keagenan dapat berubah sewaktu waktu tanpa pemberitahuan sebelumnya.',
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: 30,
              ),
              TextButton(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('OK',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: config.text_light_color))
                    ],
                  ),
                  style: ButtonStyle(
                    padding: MaterialStateProperty.all<EdgeInsets>(
                        EdgeInsets.all(15)),
                    foregroundColor: MaterialStateProperty.all<Color>(
                        config.background_color),
                    shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                        RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(5.0),
                            side: BorderSide(color: config.background_color))),
                    backgroundColor:
                        MaterialStateProperty.all(config.background_color),
                  ),
                  onPressed: () async {
                    Navigator.of(context).pop();
                  }),
              SizedBox(
                height: 30,
              ),
            ]),
          )),
    );
  }
}
