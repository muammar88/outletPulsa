import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/utils/print_pascabayar.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import '../../provider/BerandaProvider.dart';
import '../../provider/DetailPascabayarProvider.dart';
import '../../provider/RiwayatPascabayarProvider.dart';
import '../../provider/loadProvider.dart';
import '../../widget/CircularProgressWidget.dart';

class Detail_transaksi_pascabayar extends StatefulWidget {
  Detail_transaksi_pascabayar({super.key, required this.kodeTrans});

  final String kodeTrans;

  @override
  State<Detail_transaksi_pascabayar> createState() =>
      _Detail_transaksi_pascabayarState();
}

class _Detail_transaksi_pascabayarState
    extends State<Detail_transaksi_pascabayar> {
  final config = ConfigApp();

  //  PrinterBluetoothManager _printerManager = PrinterBluetoothManager();

  bool loadData = false;

  @override
  void didChangeDependencies() async {
    final load = await Provider.of<Load_provider>(context, listen: false);
    final details =
        await Provider.of<Detail_pascabayar_provider>(context, listen: false);
    load.isLoad = true;
    if (loadData == false) {
      await details.detailTransaksiPascabayar(widget.kodeTrans);
      await Provider.of<Riwayat_pascabayar_provider>(context, listen: false)
          .getRiwayatPascabayar();
      await Provider.of<Beranda_provider>(context, listen: false)
          .get_data_beranda();
      loadData = true;
    }
    load.isLoad = false;

    super.didChangeDependencies();
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final detail = Provider.of<Detail_pascabayar_provider>(context);
    return Scaffold(
        backgroundColor: Colors.grey[200],
        body: Consumer<Load_provider>(
          builder: (context, loader, child) => Stack(
            children: [
              Container(
                height: 200,
                color: config.background_color,
              ),
              Container(
                  padding: EdgeInsets.only(left: 30, right: 30, bottom: 0),
                  child: ListView(children: [
                    SizedBox(
                      height: 15,
                    ),
                    Row(children: [
                      Expanded(
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: InkWell(
                            onTap: () {
                              Navigator.of(context)
                                  .popUntil((route) => route.isFirst);
                            },
                            child: Icon(
                              Icons.arrow_back,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                      // Expanded(
                      //   child: detail.status == 'SUKSES'
                      //       ? Align(
                      //           alignment: Alignment.centerRight,
                      //           child: IconButton(
                      //               icon: Icon(
                      //                 detail.type == 'prabayar'
                      //                     ? FontAwesomeIcons.copy
                      //                     : FontAwesomeIcons.shareNodes,
                      //                 size: 20,
                      //                 color: Colors.white,
                      //               ),
                      //               onPressed: () async {
                      //                 await Clipboard.setData(
                      //                     ClipboardData(text: detail.message!));

                      //                 ScaffoldMessenger.of(context)
                      //                     .showSnackBar(SnackBar(
                      //                         backgroundColor: Colors.teal,
                      //                         behavior:
                      //                             SnackBarBehavior.floating,
                      //                         content: Text(
                      //                             'Pesan Berhasil Di Copy Di Clipboard',
                      //                             style: GoogleFonts.ptSans(
                      //                                 textStyle:
                      //                                     Theme.of(context)
                      //                                         .textTheme
                      //                                         .headline4,
                      //                                 fontSize: 12,
                      //                                 color: config
                      //                                     .text_light_color))));
                      //               }),
                      //         )
                      //       : SizedBox(),
                      // )
                    ]),
                    SizedBox(
                      height: 25,
                    ),
                    Container(
                      child: Image.asset(
                        'assets/img/' +
                            (detail.status == 'SUKSES'
                                ? 'top_success_struk.png'
                                : detail.status == 'PROSES'
                                    ? 'top_progress_struk.png'
                                    : 'top_failed_struk.png'),
                        fit: BoxFit.cover,
                      ),
                    ),
                    Container(
                      height: 370,
                      color: Colors.white,
                      child: Column(
                        children: [
                          BoxDetail(
                              config: config,
                              label: 'ID Transaksi',
                              value: '#' + widget.kodeTrans + ''),
                          BoxDetail(
                              config: config,
                              label: 'Tanggal Transaksi',
                              value: detail.dateTransaction ?? '-'),
                          BoxDetail(
                              config: config,
                              label: 'Kode Produk',
                              value: detail.productName ?? '-'),
                          BoxDetail(
                              config: config,
                              label: 'Nomor Tujuan',
                              value: detail.nomorTujuan ?? '-'),
                          BoxDetail(
                              config: config,
                              label: 'Nama Pelanggan',
                              value: detail.namaPelanggan ?? '-'),
                          BoxDetail(
                              config: config,
                              label: 'Biaya Admin',
                              value: detail.biayaAdmin ?? '-'),
                          BoxDetail(
                              config: config,
                              label: 'Fee',
                              value: detail.fee ?? '-'),
                          BoxDetail(
                              config: config,
                              label: 'Tagihan',
                              value: detail.price ?? '-'),
                          BoxDetail(
                              config: config,
                              label: 'Total Tagihan',
                              value: detail.totalPrice ?? '-'),
                          BoxDetailLabel(
                            config: config,
                            text: 'Pesan',
                          ),
                          BoxDetailText(
                            config: config,
                            text: detail.message ?? '-',
                          ),
                          // BoxDetail(
                          //     config: config,
                          //     label: 'Tanggal',
                          //     value: detail.dateTransaction ?? '-'),
                          // BoxDetail(
                          //     config: config,
                          //     label: 'No. Pengisian',
                          //     value: detail.nomorTujuan ?? '-'),
                        ],
                      ),
                    ),
                    Image.asset(
                      'assets/img/bottom.png',
                      fit: BoxFit.cover,
                    ),
                    // Container(
                    //     child: Column(
                    //   children: [
                    //     Icon(
                    //       detail.status == 'SUKSES'
                    //           ? FontAwesomeIcons.solidCircleCheck
                    //           : (detail.status == 'PROSES'
                    //               ? FontAwesomeIcons.arrowsSpin
                    //               : FontAwesomeIcons.solidCircleXmark),
                    //       size: 70,
                    //       color: detail.status == 'SUKSES'
                    //           ? Colors.green
                    //           : (detail.status == 'PROSES'
                    //               ? Colors.orange
                    //               : Colors.red),
                    //     ),
                    //     SizedBox(
                    //       height: 10,
                    //     ),
                    //     Text(
                    //       detail.status ?? '-',
                    //       style: GoogleFonts.ptSans(
                    //           textStyle: Theme.of(context).textTheme.headline4,
                    //           fontSize: 16,
                    //           fontWeight: FontWeight.bold,
                    //           color: config.text_dark_color),
                    //     ),
                    //   ],
                    // )),
                    SizedBox(
                      height: 40,
                    ),

                    // Divider(),
                    // SizedBox(
                    //   height: 20,
                    // ),
                    detail.status == 'SUKSES'
                        ? TextButton(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  FontAwesomeIcons.print,
                                  size: 15,
                                  color: config.background_color,
                                ),
                                SizedBox(
                                  width: 10,
                                ),
                                Text('Cetak Struk',
                                    textAlign: TextAlign.center,
                                    style: GoogleFonts.ptSans(
                                        textStyle: Theme.of(context)
                                            .textTheme
                                            .headline4,
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: config.background_color))
                              ],
                            ),
                            style: ButtonStyle(
                              padding: MaterialStateProperty.all<EdgeInsets>(
                                  EdgeInsets.all(15)),
                              foregroundColor: MaterialStateProperty.all<Color>(
                                  config.background_color),
                              shape: MaterialStateProperty.all<
                                      RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(5.0),
                                      side: BorderSide(
                                          color: config.background_color))),
                              backgroundColor:
                                  MaterialStateProperty.all(Colors.grey[200]),
                            ),
                            onPressed: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) => PrintPascabayar(
                                          kodeTrans: widget.kodeTrans,
                                        ))))
                        : SizedBox(),
                    SizedBox(
                      height: 10,
                    ),
                    TextButton(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('OK',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
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
                          shape:
                              MaterialStateProperty.all<RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(5.0),
                                      side: BorderSide(
                                          color: config.background_color))),
                          backgroundColor: MaterialStateProperty.all(
                              config.background_color),
                        ),
                        onPressed: () {
                          Navigator.of(context)
                              .popUntil((route) => route.isFirst);
                        }),
                    SizedBox(
                      height: 30,
                    ),
                  ])),
              loader.isLoad == true ? CircularProgressWidget() : SizedBox(),
            ],
          ),
        ));
  }
}

class BoxDetailLabel extends StatelessWidget {
  const BoxDetailLabel({super.key, required this.config, required this.text});

  final ConfigApp config;
  final String text;
  // final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 25, right: 25, top: 7, bottom: 7),
      child: Row(
        children: [
          Expanded(
              child: Text(
            text,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: config.text_dark_color),
          )),
        ],
      ),
    );
  }
}

class BoxDetailText extends StatelessWidget {
  const BoxDetailText({super.key, required this.config, required this.text});

  final ConfigApp config;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 25, right: 25, top: 7, bottom: 7),
      child: Row(
        children: [
          Expanded(
              child: Text(
            text,
            textAlign: TextAlign.end,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: config.text_dark_color),
          ))
        ],
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
      padding: EdgeInsets.only(left: 25, right: 25, top: 7, bottom: 7),
      child: Row(
        children: [
          Expanded(
              child: Text(
            label,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 13,
                color: config.text_grey_color),
          )),
          Expanded(
              child: Text(
            value,
            textAlign: TextAlign.end,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: config.text_dark_color),
          ))
        ],
      ),
    );
  }
}
