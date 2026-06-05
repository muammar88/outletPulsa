import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';
import '../../config/config.dart';
import '../../provider/BerandaProvider.dart';
import '../../provider/KonfirmasiProvider.dart';
import '../../provider/loadProvider.dart';
import '../../widget/CircularProgressWidget.dart';

class Konfirmasi_deposit_saldo extends StatefulWidget {
  const Konfirmasi_deposit_saldo({super.key});

  @override
  State<Konfirmasi_deposit_saldo> createState() =>
      _Konfirmasi_deposit_saldoState();
}

class _Konfirmasi_deposit_saldoState extends State<Konfirmasi_deposit_saldo> {
  final config = ConfigApp();

  bool loadData = false;
  bool update = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Konfirmasi_provider>(context, listen: false)
          .getInfoKonfirmasi();
      loadData = true;
      update = true;
    }
    if (update == true) {
      update = false;
    }
    super.didChangeDependencies();
  }

  Future<void> _peringatanBatalkanDeposit() async {
    var loader = await Provider.of<Load_provider>(context, listen: false);
    return showDialog<void>(
      context: context,
      barrierDismissible: false, // user must tap button!
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Peringatan',
              style: GoogleFonts.ptSans(
                  textStyle: Theme.of(context).textTheme.headline4,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: config.text_dark_color)),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text('Apakah anda ingin membatalkan permintaan deposit?.',
                    style: GoogleFonts.ptSans(
                        textStyle: Theme.of(context).textTheme.headline4,
                        fontSize: 15,
                        color: config.text_dark_color)),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: Text('Tidak',
                  style: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: config.text_dark_color)),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: Text('Iya',
                  style: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: config.text_dark_color)),
              onPressed: () async {
                loader.isLoad = true;
                final konf =
                    Provider.of<Konfirmasi_provider>(context, listen: false);
                // delete process
                // konf.deleteKonfirmasi();
                // konfirmasi process
                var deletes = await konf.deleteKonfirmasi();
                // filter error
                if (deletes.error == false) {
                  loader.isLoad = false;
                  // get data beranda
                  Provider.of<Beranda_provider>(context, listen: false)
                      .get_data_beranda();
                  // back to beranda page
                  Navigator.of(context).popUntil((route) => route.isFirst);
                  // show alert
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      backgroundColor: Colors.teal,
                      behavior: SnackBarBehavior.floating,
                      content: Text(konf.errorMsg!,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 12,
                              color: config.text_light_color))));
                } else {
                  loader.isLoad = false;
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      backgroundColor: const Color.fromARGB(255, 163, 57, 49),
                      behavior: SnackBarBehavior.floating,
                      content: Text(konf.errorMsg!,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 12,
                              color: config.text_light_color))));
                }
              },
            ),
          ],
        );
      },
    );
  }

  Future<void> _peringatanKonfirmasiDeposit() async {
    var loader = await Provider.of<Load_provider>(context, listen: false);
    return showDialog<void>(
      context: context,
      barrierDismissible: false, // user must tap button!
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Peringatan',
              style: GoogleFonts.ptSans(
                  textStyle: Theme.of(context).textTheme.headline4,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: config.text_dark_color)),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text(
                    'Apakah anda yakin sudah mengirimkan biaya sesuai dengan nomor rekening dan nominal transfer?.',
                    style: GoogleFonts.ptSans(
                        textStyle: Theme.of(context).textTheme.headline4,
                        fontSize: 15,
                        color: config.text_dark_color)),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: Text('Tidak',
                  style: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: config.text_dark_color)),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: Text('Iya',
                  style: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: config.text_dark_color)),
              onPressed: () async {
                loader.isLoad = true;
                final konf =
                    Provider.of<Konfirmasi_provider>(context, listen: false);
                // konfirmasi process
                var konfirmasi = await konf.konfirmasiDeposit();
                // filter error
                if (konfirmasi.error == false) {
                  loader.isLoad = false;
                  // get data beranda
                  Provider.of<Beranda_provider>(context, listen: false)
                      .get_data_beranda();
                  // back to beranda page
                  Navigator.of(context).popUntil((route) => route.isFirst);
                  // show alert
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      backgroundColor: Colors.teal,
                      behavior: SnackBarBehavior.floating,
                      content: Text(konf.errorMsg!,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 12,
                              color: config.text_light_color))));
                } else {
                  loader.isLoad = false;
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      backgroundColor: const Color.fromARGB(255, 163, 57, 49),
                      behavior: SnackBarBehavior.floating,
                      content: Text(konf.errorMsg!,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 12,
                              color: config.text_light_color))));
                }
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final info_konfirmasi = Provider.of<Konfirmasi_provider>(context);
    return Scaffold(
        // appBar: AppBar(
        //   leading: GestureDetector(
        //     child: Icon(
        //       Icons.arrow_back,
        //       color: config.text_light_color,
        //     ),
        //     onTap: () {
        //       Navigator.of(context).popUntil((route) => route.isFirst);
        //     },
        //   ),
        //   backgroundColor: config.background_smooth_navy,
        //   elevation: 0,
        //   centerTitle: true,
        //   title: Text(
        //     'Konfirmasi Pembayaran',
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
                  padding: EdgeInsets.only(
                    left: 30,
                    right: 30,
                  ),
                  child: ListView(children: [
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
                      height: 20,
                    ),
                    Container(
                      child: Image.asset(
                        'assets/img/top.png',
                        fit: BoxFit.cover,
                      ),
                    ),
                    Container(
                      padding:
                          EdgeInsets.symmetric(vertical: 0, horizontal: 10),
                      constraints: BoxConstraints(
                          minHeight: 180,
                          minWidth: double.infinity,
                          maxHeight: double.infinity),
                      decoration: BoxDecoration(
                        color: config.text_light_color,
                        // borderRadius: BorderRadius.circular(10)
                      ),
                      child: Column(
                        children: [
                          BoxDetail(
                            config: config,
                            label: 'Kode Transaksi',
                            colors: config.text_dark_color,
                            bold: true,
                            value: info_konfirmasi.kode ?? '-',
                            btnCopy: false,
                          ),
                          // Divider(),
                          BoxDetail(
                            config: config,
                            label: 'Nominal Deposit',
                            colors: config.text_dark_color,
                            bold: true,
                            value: info_konfirmasi.nominal ?? '-',
                            btnCopy: false,
                          ),
                          //Divider(),
                          BoxDetail(
                            config: config,
                            label: 'Bank Tujuan Transfer',
                            colors: config.text_dark_color,
                            bold: true,
                            value: info_konfirmasi.bank_tujuan_transfer ?? '-',
                            btnCopy: false,
                          ),
                          // Divider(),
                          BoxDetail(
                            config: config,
                            label: 'Nomor Rekening Tujuan Transfer',
                            colors: config.text_dark_color,
                            bold: true,
                            value: info_konfirmasi.nomor_rekening_akun ?? '-',
                            btnCopy: true,
                          ),
                          // Divider(),
                          BoxDetail(
                            config: config,
                            label: 'Nama Akun Tujuan Transfer',
                            colors: config.text_dark_color,
                            bold: true,
                            value: info_konfirmasi.nama_akun ?? '-',
                            btnCopy: false,
                          ),
                          // Divider(),
                          BoxDetail(
                            config: config,
                            label: 'Status Deposit',
                            colors: info_konfirmasi.status_deposit == 'proses'
                                ? Color.fromARGB(255, 241, 219, 13)
                                : info_konfirmasi.status_deposit == 'gagal'
                                    ? Color.fromARGB(255, 245, 88, 88)
                                    : Color.fromARGB(255, 82, 226, 45),
                            bold: true,
                            value: info_konfirmasi.status_deposit == 'proses'
                                ? 'PROSES'
                                : info_konfirmasi.status_deposit == 'gagal'
                                    ? 'GAGAL'
                                    : 'SUKSES',
                            btnCopy: false,
                          ),
                          // Divider(),
                          BoxDetail(
                            config: config,
                            label: 'Status Kirim',
                            colors:
                                info_konfirmasi.status_kirim == 'belum_kirim'
                                    ? Color.fromARGB(255, 245, 88, 88)
                                    : Color.fromARGB(255, 82, 226, 45),
                            bold: true,
                            value: info_konfirmasi.status_kirim == 'belum_kirim'
                                ? 'BELUM KIRIM'
                                : 'SUDAH KIRIM',
                            btnCopy: false,
                          ),
                          // Divider(),
                          BoxDetailText(
                            config: config,
                            title: 'Catatan',
                            text:
                                'Silahkan lakukan pengiriman ke bank dengan nomor rekening dan nominal deposit sesuai dengan nomor rekening dan nominal deposit diatas.\n\nTransaksi deposit hanya diproses dari jam 09.00 sampai Jam 21.00.\n\nSetiap kesalah transfer diluar tanggung jawab kami.',
                          ),
                          // Divider(),
                        ],
                      ),
                    ),
                    Container(
                      child: Image.asset(
                        'assets/img/bottom-simple.png',
                        fit: BoxFit.cover,
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
                                _peringatanBatalkanDeposit();
                              },
                              child: Text(
                                "Batalkan Permintaan Deposit",
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
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
                                backgroundColor:
                                    MaterialStateProperty.all(Colors.red),
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
                    SizedBox(
                      height: 20,
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                              onPressed: () async {
                                _peringatanKonfirmasiDeposit();
                              },
                              child: Text(
                                "Konfirmasi Pembayaran",
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
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
                    SizedBox(
                      height: 60,
                    )
                  ])),
              loader.isLoad == true ? CircularProgressWidget() : SizedBox(),
            ],
          ),
        ));
  }
}

class BoxDetail extends StatelessWidget {
  const BoxDetail(
      {super.key,
      required this.config,
      required this.label,
      required this.colors,
      required this.bold,
      required this.value,
      required this.btnCopy});

  final ConfigApp config;
  final String label;
  final String value;
  final bool bold;
  final Color colors;
  final bool btnCopy;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 5, horizontal: 10),
      child: Row(
        children: [
          Expanded(
              child: Text(
            label,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: config.text_dark_color),
          )),
          Expanded(
              child: Text(
            value,
            textAlign: TextAlign.end,
            style: GoogleFonts.ptSans(
                textStyle: Theme.of(context).textTheme.headline4,
                fontSize: 13,
                fontWeight: bold == true ? FontWeight.bold : FontWeight.normal,
                color: colors),
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
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 12,
                                    color: config.text_light_color))));
                      },
                      child: Icon(
                        FontAwesomeIcons.copy,
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
      padding: EdgeInsets.symmetric(vertical: 5, horizontal: 10),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                  child: Text(
                title,
                textAlign: TextAlign.start,
                style: GoogleFonts.ptSans(
                    textStyle: Theme.of(context).textTheme.headline4,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: config.text_dark_color),
              ))
            ],
          ),
          SizedBox(
            height: 10,
          ),
          Row(
            children: [
              Expanded(
                  child: Text(
                text,
                textAlign: TextAlign.justify,
                style: GoogleFonts.ptSans(
                    textStyle: Theme.of(context).textTheme.headline4,
                    fontSize: 12,
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
