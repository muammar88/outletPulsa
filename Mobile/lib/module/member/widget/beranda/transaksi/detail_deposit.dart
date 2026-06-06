import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/DepositProvider.dart';

class Detail_deposit extends StatefulWidget {
  Detail_deposit({super.key, required this.status, required this.id});

  final String status;
  final String id;

  @override
  State<Detail_deposit> createState() => _Detail_depositState();
}

class _Detail_depositState extends State<Detail_deposit> {
  final config = ConfigApp();

  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Deposit_provider>(context).getDetailDeposit(widget.id);
      loadData = true;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final deposit = Provider.of<Deposit_provider>(context);
    var status = widget.status;
    return Scaffold(
      // appBar: AppBar(
      //   backgroundColor: config.background_smooth_navy,
      //   elevation: 0,
      //   centerTitle: true,
      //   leading: IconButton(
      //       onPressed: () {
      //         Navigator.pop(context);
      //       },
      //       icon: Icon(
      //         Icons.arrow_back,
      //         color: Colors.white,
      //       )),
      //   title: Text(
      //     'Detail Status Deposit',
      //     style: GoogleFonts.ptSans(
      //         textStyle: Theme.of(context).textTheme.headlineMedium,
      //         fontSize: 16,
      //         fontWeight: FontWeight.bold,
      //         color: config.text_light_color),
      //   ),
      // ),
      backgroundColor: Colors.grey[200],
      body: Stack(
        children: [
          Container(
            height: 200,
            color: config.background_color,
          ),
          Container(
            padding: EdgeInsets.only(
              left: 30,
              right: 30,
            ),
            child: ListView(
              children: [
                SizedBox(
                  height: 20,
                ),
                Row(children: [
                  Expanded(
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: InkWell(
                        onTap: () {
                          Navigator.of(context).pop();
                          // Navigator.of(context)
                          //     .popUntil((route) => route.isFirst);
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
                  //                     ? TablerIcons.copy
                  //                     : TablerIcons.share,
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
                  //                                         .headlineMedium,
                  //                                 fontSize: 12,
                  //                                 color: config
                  //                                     .text_light_color))));
                  //               }),
                  //         )
                  //       : SizedBox(),
                  // )
                ]),
                SizedBox(
                  height: 20,
                ),
                // Container(
                //   child: Image.asset(
                //     'assets/img/top.png',
                //     fit: BoxFit.cover,
                //   ),
                // ),
                // Container(
                //     child: Column(
                //   children: [
                //     Icon(
                //       status == 'sukses'
                //           ? TablerIcons.circle_check_filled
                //           : (status == 'proses'
                //               ? TablerIcons.rotate
                //               : TablerIcons.circle_x_filled),
                //       size: 70,
                //       color: status == 'sukses'
                //           ? Colors.green
                //           : (status == 'proses' ? Colors.orange : Colors.red),
                //     ),
                //     SizedBox(
                //       height: 10,
                //     ),
                //     Text(
                //       status == 'sukses'
                //           ? 'Sukses'
                //           : (status == 'proses' ? 'Proses' : 'Gagal'),
                //       style: GoogleFonts.ptSans(
                //           textStyle: Theme.of(context).textTheme.headlineMedium,
                //           fontSize: 16,
                //           fontWeight: FontWeight.bold,
                //           color: config.text_dark_color),
                //     ),
                //   ],
                // )),
                Container(
                  child: Image.asset(
                    'assets/img/' +
                        (status == 'sukses'
                            ? 'top_success_struk.png'
                            : status == 'proses'
                                ? 'top_progress_struk.png'
                                : 'top_failed_struk.png'),
                    fit: BoxFit.cover,
                  ),
                ),
                Container(
                  color: Colors.white,
                  height: 300,
                  child: Column(
                    children: [
                      BoxDetail(
                        config: config,
                        label: 'Kode Transaksi',
                        value: '#' + (deposit.kode ?? '-'),
                        btnCopy: false,
                      ),
                      BoxDetail(
                        config: config,
                        label: 'Nominal Deposit',
                        value: deposit.nominal ?? '-',
                        btnCopy: false,
                      ),
                      BoxDetail(
                        config: config,
                        label: 'Bank Tujuan Transfer',
                        value: deposit.bank_tujuan_transfer ?? '-',
                        btnCopy: false,
                      ),
                      BoxDetail(
                        config: config,
                        label: 'Nomor Rekening Tujuan Transfer',
                        value: deposit.nomor_rekening_akun ?? '-',
                        btnCopy: true,
                      ),
                      BoxDetail(
                        config: config,
                        label: 'Nama Akun Tujuan Transfer',
                        value: deposit.nama_akun ?? '-',
                        btnCopy: false,
                      ),
                      BoxDetail(
                        config: config,
                        label: 'Status Deposit',
                        value: deposit.status_deposit == 'proses'
                            ? 'PROSES'
                            : deposit.status_deposit == 'gagal'
                                ? 'GAGAL'
                                : 'SUKSES',
                        btnCopy: false,
                      ),
                      BoxDetail(
                        config: config,
                        label: 'Status Kirim',
                        value: deposit.status_kirim == 'belum_kirim'
                            ? 'BELUM KIRIM'
                            : 'SUDAH KIRIM',
                        btnCopy: false,
                      ),
                      deposit.status_deposit == 'gagal'
                          ? Divider()
                          : SizedBox(
                              height: 0,
                            ),
                      deposit.status_deposit == 'gagal'
                          ? BoxDetailText(
                              config: config,
                              title: "Alasan Penolakan",
                              text: deposit.alasan_penolakan ?? '-')
                          : SizedBox(
                              height: 0,
                            ),
                      deposit.status_deposit == 'gagal'
                          ? Divider()
                          : SizedBox(
                              height: 0,
                            ),
                      deposit.status_deposit == 'gagal'
                          ? BoxDetailText(
                              config: config,
                              title: "Kontak Admin",
                              text:
                                  'Silahkan hubungi admin melalui Whatsapp disini : 085262802141.')
                          : SizedBox(
                              height: 0,
                            ),
                      deposit.status_deposit == 'gagal'
                          ? SizedBox(
                              height: 70,
                            )
                          : SizedBox(
                              height: 0,
                            ),
                      // Image.asset(
                      //   'assets/img/bottom.png',
                      //   fit: BoxFit.cover,
                      // ),
                    ],
                  ),
                ),

                Image.asset(
                  'assets/img/bottom.png',
                  fit: BoxFit.cover,
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
                                textStyle:
                                    Theme.of(context).textTheme.headlineMedium,
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
                              side:
                                  BorderSide(color: config.background_color))),
                      backgroundColor:
                          MaterialStateProperty.all(config.background_color),
                    ),
                    onPressed: () {
                      Navigator.of(context).popUntil((route) => route.isFirst);
                    }),
                SizedBox(
                  height: 30,
                ),

                // Divider(),

                // Divider(),

                // Divider(),

                // Divider(),

                // Divider(),

                // Divider(),
              ],
            ),
          ),
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
      required this.value,
      required this.btnCopy});

  final ConfigApp config;
  final String label;
  final String value;
  final bool btnCopy;

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
                textStyle: Theme.of(context).textTheme.headlineMedium,
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: config.text_dark_color),
          )),
          Expanded(
              child: Text(
            value,
            textAlign: TextAlign.end,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headlineMedium,
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: config.text_dark_color),
          )),
          btnCopy == true
              ? Container(
                  width: 40,
                  margin: EdgeInsets.only(left: 10),
                  child: ElevatedButton(
                      onPressed: () async {
                        await Clipboard.setData(ClipboardData(text: value));

                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            backgroundColor: Colors.teal,
                            behavior: SnackBarBehavior.floating,
                            content: Text(
                                'Nomor Rekening Berhasil Di Copy Di Clipboard',
                                style: GoogleFonts.ptSans(
                                    textStyle: Theme.of(context)
                                        .textTheme
                                        .headlineMedium,
                                    fontSize: 12,
                                    color: config.text_light_color))));
                      },
                      child: Icon(
                        TablerIcons.copy,
                        size: 15,
                        color: config.text_dark_color,
                      ),
                      style: ButtonStyle(
                        shape:
                            MaterialStateProperty.all<RoundedRectangleBorder>(
                                RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(5.0),
                        )),
                        backgroundColor:
                            MaterialStateProperty.all(Colors.white),
                        padding: MaterialStateProperty.all(EdgeInsets.only(
                            top: 0, bottom: 0, left: 0, right: 0)),
                      )),
                )
              : SizedBox()
        ],
      ),
    );
  }
}

class BoxDetailText extends StatelessWidget {
  const BoxDetailText(
      {super.key,
      required this.config,
      required this.text,
      required this.title});

  final ConfigApp config;
  final String text;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 25, right: 25, top: 7, bottom: 7),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                  child: Text(
                title,
                textAlign: TextAlign.start,
                style: GoogleFonts.ptSans(
                    textStyle: Theme.of(context).textTheme.headlineMedium,
                    fontSize: 14,
                    // fontWeight: FontWeight.bold,
                    color: config.text_grey_color),
              ))
            ],
          ),
          SizedBox(
            height: 5,
          ),
          Row(
            children: [
              Expanded(
                  child: Text(
                text,
                textAlign: TextAlign.justify,
                style: GoogleFonts.ptSans(
                    textStyle: Theme.of(context).textTheme.headlineMedium,
                    fontSize: 14,
                    // fontWeight: FontWeight.bold,
                    color: config.text_dark_color),
              ))
            ],
          ),
        ],
      ),
    );
  }
}
