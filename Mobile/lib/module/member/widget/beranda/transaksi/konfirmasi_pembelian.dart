import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/TransactionProvider.dart';
import '../../../../../provider/loadProvider.dart';
import '../../../../../widget/CircularProgressWidget.dart';
import 'detail_transaksi.dart';

class Konfirmasi_pembelian extends StatefulWidget {
  Konfirmasi_pembelian(
      {super.key,
      required this.kode,
      required this.nominal,
      required this.operator,
      required this.harga,
      required this.nomor_tujuan});

  final String kode;
  final String nominal;
  final String operator;
  final String harga;
  final String nomor_tujuan;

  @override
  State<Konfirmasi_pembelian> createState() => _Konfirmasi_pembelianState();
}

class _Konfirmasi_pembelianState extends State<Konfirmasi_pembelian> {
  final config = ConfigApp();

  // @override
  // void didChangeDependencies() async {
  //   //var l = await Provider.of<Load_provider>(context, listen: false);
  //   if (loadData == false) {
  //     await Provider.of<Transaction_provider>(context)
  //         .getDaftarProduk(widget.nomor_tujuan, widget.path, widget.prefix);
  //     //l.isLoad = false;
  //     loadData = true;
  //   }
  //   super.didChangeDependencies();
  // }

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
            'Konfirmasi Pembelian',
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headlineMedium,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: config.text_light_color),
          ),
        ),
        backgroundColor: Colors.grey[200],
        body: Consumer<Load_provider>(
          builder: (context, loader, child) => Stack(
            children: [
              Container(
                // color: Colors.white,
                padding: EdgeInsets.only(
                  left: 30,
                  right: 30,
                ),
                child: ListView(children: [
                  SizedBox(
                    height: 20,
                  ),
                  Container(
                    padding: EdgeInsets.symmetric(vertical: 15, horizontal: 0),
                    constraints: BoxConstraints(
                        minHeight: 180,
                        minWidth: double.infinity,
                        maxHeight: double.infinity),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(5)),
                    child: Column(
                      children: [
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Kode Produk',
                            value: widget.kode),
                        // Divider(),
                        Image.asset(
                          'assets/img/tengah.png',
                          fit: BoxFit.cover,
                        ),
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Nominal Produk',
                            value: widget.nominal),
                        Image.asset(
                          'assets/img/tengah.png',
                          fit: BoxFit.cover,
                        ),
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Harga Produk',
                            value: widget.harga),
                        Image.asset(
                          'assets/img/tengah.png',
                          fit: BoxFit.cover,
                        ),
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Nomor Tujuan',
                            value: widget.nomor_tujuan),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 20,
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                            onPressed: () async {
                              loader.isLoad = true;

                              final trans = Provider.of<Transaction_provider>(
                                  context,
                                  listen: false);

                              var feedBack = await trans.prabayarTransaction(
                                  widget.nomor_tujuan, widget.kode);

                              if (feedBack.error == false) {
                                // feedBack.kodeTransaksi
                                loader.isLoad = false;

                                print("=========KODE TRANSAKSI");
                                print(feedBack.kodeTransaksi);
                                print("=========KODE TRANSAKSI");
                                // loader.isLoad = false;
                                ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                        backgroundColor: Colors.teal,
                                        behavior: SnackBarBehavior.floating,
                                        content: Text(feedBack.errorMsg!,
                                            style: GoogleFonts.ptSans(
                                                textStyle: Theme.of(context)
                                                    .textTheme
                                                    .headlineMedium,
                                                fontSize: 12,
                                                color:
                                                    config.text_light_color))));

                                // redirect ke halaman detail transaksi
                                Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) => Detail_transaksi(
                                            kodeTrans:
                                                feedBack.kodeTransaksi!)));
                              } else {
                                loader.isLoad = false;
                                ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                        backgroundColor: const Color.fromARGB(
                                            255, 163, 57, 49),
                                        behavior: SnackBarBehavior.floating,
                                        content: Text(feedBack.errorMsg!,
                                            style: GoogleFonts.ptSans(
                                                textStyle: Theme.of(context)
                                                    .textTheme
                                                    .headlineMedium,
                                                fontSize: 12,
                                                color:
                                                    config.text_light_color))));
                              }
                            },
                            child: Text(
                              "Beli Produk",
                              style: GoogleFonts.ptSans(
                                  textStyle: Theme.of(context)
                                      .textTheme
                                      .headlineMedium,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: config.text_light_color),
                            ),
                            style: ButtonStyle(
                              shape: MaterialStateProperty.all<
                                      RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(5.0),
                              )),
                              backgroundColor: MaterialStateProperty.all(
                                  config.btn_primary_color),
                              padding: MaterialStateProperty.all(
                                  EdgeInsets.only(
                                      top: 17,
                                      bottom: 16,
                                      left: 20,
                                      right: 20)),
                            )),
                      ),
                    ],
                  ),
                ]),
              ),
              loader.isLoad == true ? CircularProgressWidget() : SizedBox(),
            ],
          ),
        ));
  }
}

class BoxKonfirmasiWidget extends StatelessWidget {
  const BoxKonfirmasiWidget(
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
      padding: EdgeInsets.symmetric(horizontal: 15),
      constraints: BoxConstraints(
          minHeight: 25, minWidth: double.infinity, maxHeight: double.infinity),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
              flex: 2,
              child: Text(
                label,
                style: GoogleFonts.ptSans(
                    textStyle: Theme.of(context).textTheme.headlineMedium,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: config.text_dark_color),
              )),
          Expanded(
              flex: 3,
              child: Text(
                value,
                textAlign: TextAlign.right,
                style: GoogleFonts.ptSans(
                    textStyle: Theme.of(context).textTheme.headlineMedium,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: config.text_dark_color),
              )),
        ],
      ),
    );
  }
}
