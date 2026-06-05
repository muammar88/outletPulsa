import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import '../../provider/BerandaProvider.dart';
import '../../provider/DetailProvider.dart';
import '../../provider/RiwayatPrabayarProvider.dart';
import '../../provider/loadProvider.dart';
import '../../utils/print.dart';
import '../../widget/CircularProgressWidget.dart';

class Detail_transaksi extends StatefulWidget {
  Detail_transaksi({super.key, required this.kodeTrans});

  final String kodeTrans;

  @override
  State<Detail_transaksi> createState() => _Detail_transaksiState();
}

class _Detail_transaksiState extends State<Detail_transaksi> {
  final config = ConfigApp();

  bool loadData = false;

  @override
  void didChangeDependencies() async {
    final load = await Provider.of<Load_provider>(context, listen: false);
    final details = await Provider.of<Detail_provider>(context, listen: false);
    load.isLoad = true;
    if (loadData == false) {
      await details.detailTransaksi(widget.kodeTrans);
      await Provider.of<Riwayat_prabayar_provider>(context, listen: false)
          .getRiwayatPrabayar();
      await Provider.of<Beranda_provider>(context, listen: false)
          .get_data_beranda();
      loadData = true;
    }
    load.isLoad = false;
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final detail = Provider.of<Detail_provider>(context);
    return Scaffold(
        // appBar: AppBar(
        //   leading: IconButton(
        //     icon: Icon(
        //       Icons.arrow_back,
        //       color: Colors.white,
        //     ),
        //     onPressed: () {
        //       Navigator.of(context).popUntil((route) => route.isFirst);
        //     },
        //   ),
        //   actions: <Widget>[
        //     detail.status == 'SUKSES'
        //         ? IconButton(
        //             icon: Icon(
        //               detail.type == 'prabayar'
        //                   ? FontAwesomeIcons.copy
        //                   : FontAwesomeIcons.shareNodes,
        //               size: 20,
        //               color: Colors.white,
        //             ),
        //             onPressed: () async {
        //               await Clipboard.setData(
        //                   ClipboardData(text: detail.message!));

        //               ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        //                   backgroundColor: Colors.teal,
        //                   behavior: SnackBarBehavior.floating,
        //                   content: Text('Pesan Berhasil Di Copy Di Clipboard',
        //                       style: GoogleFonts.ptSans(
        //                           textStyle:
        //                               Theme.of(context).textTheme.headline4,
        //                           fontSize: 12,
        //                           color: config.text_light_color))));
        //             })
        //         : SizedBox(),
        //     SizedBox(
        //       width: 10,
        //     )
        //   ],
        //   backgroundColor: config.background_smooth_navy,
        //   elevation: 0,
        //   centerTitle: true,
        //   title: Text(
        //     'Detail Transaksi',
        //     style: GoogleFonts.ptSans(
        //         textStyle: Theme.of(context).textTheme.headline4,
        //         fontSize: 16,
        //         fontWeight: FontWeight.bold,
        //         color: config.text_light_color),
        //   ),
        // ),
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
                  // color: Colors.amber,
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
                      Expanded(
                        child: detail.status == 'SUKSES'
                            ? Align(
                                alignment: Alignment.centerRight,
                                child: IconButton(
                                    icon: Icon(
                                      detail.type == 'prabayar'
                                          ? FontAwesomeIcons.copy
                                          : FontAwesomeIcons.shareNodes,
                                      size: 20,
                                      color: Colors.white,
                                    ),
                                    onPressed: () async {
                                      await Clipboard.setData(
                                          ClipboardData(text: detail.message!));

                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(SnackBar(
                                              backgroundColor: Colors.teal,
                                              behavior:
                                                  SnackBarBehavior.floating,
                                              content: Text(
                                                  'Pesan Berhasil Di Copy Di Clipboard',
                                                  style: GoogleFonts.ptSans(
                                                      textStyle:
                                                          Theme.of(context)
                                                              .textTheme
                                                              .headline4,
                                                      fontSize: 12,
                                                      color: config
                                                          .text_light_color))));
                                    }),
                              )
                            : SizedBox(),
                      )
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
                      height: 70,
                      color: Colors.white,
                      child: Column(
                        children: [
                          BoxDetail(
                              config: config,
                              label: 'Tanggal',
                              value: detail.dateTransaction ?? '-'),
                          BoxDetail(
                              config: config,
                              label: 'No. Pengisian',
                              value: detail.nomorTujuan ?? '-'),
                        ],
                      ),
                    ),
                    Image.asset(
                      'assets/img/tengah.png',
                      fit: BoxFit.cover,
                    ),
                    Container(
                      height: 200,
                      color: Colors.white,
                      child: Column(
                        children: [
                          BoxDetail(
                              config: config,
                              label: 'Produk',
                              value: detail.productName ?? '-'),
                          BoxDetail(
                              config: config,
                              label: 'Harga Modal',
                              value: detail.price ?? '-'),
                          BoxDetail(
                              config: config,
                              label: 'Serial Number',
                              value: detail.serialNumber ?? '-'),
                          BoxDetailLabel(
                            config: config,
                            text: 'Pesan',
                          ),
                          BoxDetailText(
                            config: config,
                            text: detail.message ?? '-',
                          ),
                        ],
                      ),
                    ),
                    Image.asset(
                      'assets/img/bottom.png',
                      fit: BoxFit.cover,
                    ),
                    SizedBox(
                      height: 40,
                    ),
                    detail.status == 'SUKSES'
                        ? detail.printStatus == true
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
                                  padding:
                                      MaterialStateProperty.all<EdgeInsets>(
                                          EdgeInsets.all(15)),
                                  foregroundColor:
                                      MaterialStateProperty.all<Color>(
                                          config.background_color),
                                  shape: MaterialStateProperty.all<
                                          RoundedRectangleBorder>(
                                      RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(5.0),
                                          side: BorderSide(
                                              color: config.background_color))),
                                  backgroundColor: MaterialStateProperty.all(
                                      Colors.grey[200]),
                                ),
                                onPressed: () {
                                  Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                          builder: (_) => Print(
                                                message: detail.message!,
                                                kodeTrans: widget.kodeTrans,
                                              )));
                                })
                            : SizedBox()
                        : detail.status == 'PROSES'
                            ? TextButton(
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      FontAwesomeIcons.arrowRotateLeft,
                                      size: 15,
                                      color: config.background_color,
                                    ),
                                    SizedBox(
                                      width: 10,
                                    ),
                                    Text('Muat Ulang Data',
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
                                  padding:
                                      MaterialStateProperty.all<EdgeInsets>(
                                          EdgeInsets.all(15)),
                                  foregroundColor:
                                      MaterialStateProperty.all<Color>(
                                          config.background_color),
                                  shape: MaterialStateProperty.all<
                                          RoundedRectangleBorder>(
                                      RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(5.0),
                                          side: BorderSide(
                                              color: config.background_color))),
                                  backgroundColor: MaterialStateProperty.all(
                                      Colors.grey[200]),
                                ),
                                onPressed: () async {
                                  loader.isLoad = true;
                                  await Provider.of<Detail_provider>(context,
                                          listen: false)
                                      .detailTransaksi(widget.kodeTrans);
                                  await Provider.of<Riwayat_prabayar_provider>(
                                          context,
                                          listen: false)
                                      .getRiwayatPrabayar();
                                })
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
                        })
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
              flex: 3,
              child: Text(
                label,
                style: GoogleFonts.ptSans(
                    textStyle: Theme.of(context).textTheme.headline4,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: config.text_dark_color),
              )),
          Expanded(
              flex: 4,
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
