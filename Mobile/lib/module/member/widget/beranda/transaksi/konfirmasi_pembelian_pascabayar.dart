import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/TransactionProvider.dart';
import '../../../../../provider/loadProvider.dart';
import '../../../../../widget/CircularProgressWidget.dart';
import 'detail_transaksi.dart';
import 'detail_transaksi_pascabayar.dart';

class Konfirmasi_pembelian_pascabayar extends StatefulWidget {
  Konfirmasi_pembelian_pascabayar({
    super.key,
    required this.refId,
    required this.trId,
    required this.kode,
    required this.nomor_tujuan,
    required this.name,
    required this.namaPelanggan,
    required this.status,
    required this.fee,
    required this.nominal,
    required this.totalTagihan,
    required this.biaya_admin,
  });

  final String refId;
  final String trId;
  final String kode;
  final String name;
  final String namaPelanggan;
  final String status;
  final String fee;
  final String nomor_tujuan;
  final String nominal;
  final String totalTagihan;
  final String biaya_admin;

  @override
  State<Konfirmasi_pembelian_pascabayar> createState() =>
      _Konfirmasi_pembelian_pascabayarState();
}

class _Konfirmasi_pembelian_pascabayarState
    extends State<Konfirmasi_pembelian_pascabayar> {
  final config = ConfigApp();

  // check pembayaran

  @override
  void didChangeDependencies() async {
    final load = await Provider.of<Load_provider>(context, listen: false);
    load.isLoad = false;
    super.didChangeDependencies();
  }

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
                            label: 'REF ID',
                            value: '#' + widget.refId),
                        Divider(),
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Kode Produk',
                            value: widget.kode),
                        Divider(),
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Nomor Tujuan',
                            value: widget.nomor_tujuan),
                        Divider(),
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Nama Pelanggan',
                            value: widget.namaPelanggan),
                        Divider(),
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Biaya Admin',
                            value: widget.biaya_admin),
                        Divider(),
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Komisi Anda',
                            value: widget.fee),
                        Divider(),
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Nominal',
                            value: widget.nominal),
                        Divider(),
                        BoxKonfirmasiWidget(
                            config: config,
                            label: 'Total Tagihan',
                            value: widget.totalTagihan),
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
                              var feedBack =
                                  await trans.pembayaranPascabayar(widget.trId);
                              if (feedBack.error == false) {
                                loader.isLoad = false;
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
                                Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) =>
                                            Detail_transaksi_pascabayar(
                                                kodeTrans: widget.refId)));
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
                              "Bayar Tagihan",
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
      // height: 25,
      constraints: BoxConstraints(
          minHeight: 25, minWidth: double.infinity, maxHeight: double.infinity),
      child: Row(
        children: [
          Expanded(
              flex: 2,
              child: Text(
                label,
                style: GoogleFonts.ptSans(
                    textStyle: Theme.of(context).textTheme.headlineMedium,
                    fontSize: 13,
                    // fontWeight: FontWeight.bold,
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
          // Container(
          //   margin: EdgeInsets.only(left: 15),
          //   child: Icon(
          //     TablerIcons.chevron_right,
          //     color: config.text_grey_color,
          //     size: 15,
          //   ),
          // )
        ],
      ),
    );
  }
}
