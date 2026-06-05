import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import '../../provider/BerandaProvider.dart';
import '../../provider/loadProvider.dart';
import '../deposit/form_input_deposit.dart';
import '../deposit/konfirmasi_deposit_saldo.dart';
import '../transaksi/daftar_kategori.dart';
import '../transaksi/daftar_kategori_pascabayar.dart';
import '../transaksi/input_ppob.dart';

class Beranda_tab extends StatefulWidget {
  const Beranda_tab({
    Key? key,
    required GlobalKey<RefreshIndicatorState> refreshIndicatorKey,
    required this.config,
  })  : _refreshIndicatorKey = refreshIndicatorKey,
        super(key: key);

  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey;
  final ConfigApp config;

  @override
  State<Beranda_tab> createState() => _Beranda_tabState();
}

class _Beranda_tabState extends State<Beranda_tab> {
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    var l = await Provider.of<Load_provider>(context, listen: false);
    if (loadData == false) {
      await Provider.of<Beranda_provider>(context, listen: false)
          .get_data_beranda();
      l.isLoad = false;
      loadData = true;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<Load_provider>(
        builder: (context, loader, child) => Stack(
              children: [
                Center(
                  child: Container(
                      child: Stack(
                    children: [
                      Positioned(
                        top: 0.0,
                        left: 0.0,
                        right: 0.0,
                        child: Container(
                          height: 50,
                          color: widget.config.background_color,
                        ),
                      ),
                      Positioned(
                        top: 50.0,
                        left: 0.0,
                        right: 0.0,
                        child: Container(
                          child: Container(
                            padding:
                                EdgeInsets.only(top: 20, left: 30, right: 30),
                            height: 600,
                            child: ListView(
                              children: [
                                SizedBox(
                                  height: 50,
                                ),
                                Container(
                                    height: 20,
                                    child: Text(
                                      'Prabayar',
                                      style: GoogleFonts.ptSans(
                                          textStyle: Theme.of(context)
                                              .textTheme
                                              .headline4,
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: widget.config.text_dark_color),
                                    )),
                                SizedBox(
                                  height: 20,
                                ),
                                Container(
                                  child: Column(
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                              child: BoxProduk(
                                                  config: widget.config,
                                                  label: 'Pulsa\nReguler',
                                                  title: 'Pulsa Reguler',
                                                  path: 'PIU',
                                                  image: 'pulsa_reguler',
                                                  tipe: 'prabayar')),
                                          Expanded(
                                              child: BoxProduk(
                                                  config: widget.config,
                                                  label: 'Pulsa\nTransfer',
                                                  title: 'Pulsa Transfer',
                                                  path: 'PT',
                                                  image: 'pulsa_transfer',
                                                  tipe: 'prabayar')),
                                          Expanded(
                                              child: BoxProduk(
                                                  config: widget.config,
                                                  label: 'Paket\nData',
                                                  title: 'Paket Data',
                                                  path: 'PD',
                                                  image: 'paket_data',
                                                  tipe: 'prabayar')),
                                          Expanded(
                                              child: BoxProduk(
                                                  config: widget.config,
                                                  label: 'Paket\nTelpon',
                                                  title: 'Paket Telpon',
                                                  path: 'PTP',
                                                  image: 'paket_nelpon',
                                                  tipe: 'prabayar')),
                                        ],
                                      ),
                                      SizedBox(
                                        height: 20,
                                      ),
                                      Row(
                                        children: [
                                          Expanded(
                                              child: BoxProduk(
                                                  config: widget.config,
                                                  label: 'Paket\nSMS',
                                                  title: 'Paket SMS',
                                                  path: 'PS',
                                                  image: 'paket_sms',
                                                  tipe: 'prabayar')),
                                          Expanded(
                                              child: BoxProduk(
                                                  config: widget.config,
                                                  label: 'Pulsa\nInternational',
                                                  title: 'Pulsa International',
                                                  path: 'PI',
                                                  image: 'pulsa_international',
                                                  tipe: 'prabayar')),
                                          Expanded(
                                              child: BoxProduk(
                                                  config: widget.config,
                                                  label: 'Token\nListrik',
                                                  title: 'Token Listrik',
                                                  path: 'TL',
                                                  image: 'tokenpln',
                                                  tipe: 'prabayar')),
                                          Expanded(
                                              child: BoxProduk(
                                                  config: widget.config,
                                                  label: 'Uang\nDigital',
                                                  title: 'Uang Digital',
                                                  path: 'UD',
                                                  image: 'uang_digital',
                                                  tipe: 'prabayar')),
                                        ],
                                      ),
                                      SizedBox(
                                        height: 20,
                                      ),
                                      Row(
                                        children: [
                                          Expanded(
                                              child: BoxProduk(
                                                  config: widget.config,
                                                  label: 'Wifi ID',
                                                  title: 'Wifi ID',
                                                  path: 'WIFI',
                                                  image: 'wifi_id',
                                                  tipe: 'prabayar')),
                                          Expanded(
                                              child: BoxProduk(
                                                  config: widget.config,
                                                  label: 'E-Toll',
                                                  title: 'E-Toll',
                                                  path: 'ET',
                                                  image: 'e-toll',
                                                  tipe: 'prabayar')),
                                          Expanded(child: Text('')),
                                          Expanded(child: Text('')),
                                        ],
                                      ),
                                      SizedBox(
                                        height: 20,
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                    height: 20,
                                    child: Text(
                                      'Pascabayar',
                                      style: GoogleFonts.ptSans(
                                          textStyle: Theme.of(context)
                                              .textTheme
                                              .headline4,
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: widget.config.text_dark_color),
                                    )),
                                SizedBox(
                                  height: 20,
                                ),
                                Container(
                                    child: Column(children: [
                                  Row(
                                    children: [
                                      Expanded(
                                          child: BoxProduk(
                                              config: widget.config,
                                              label: 'PLN\nPascabayar',
                                              title: 'PLN Pascabayar',
                                              path: 'PLNPASCABAYAR',
                                              image: 'pln_berlangganan',
                                              tipe: 'pascabayar')),
                                      Expanded(
                                          child: BoxProduk(
                                              config: widget.config,
                                              label: 'Telkom',
                                              title: 'Telkom',
                                              path: 'TELKOM',
                                              image: 'telkom',
                                              tipe: 'pascabayar')),
                                      Expanded(
                                          child: BoxProduk(
                                              config: widget.config,
                                              label: 'PDAM',
                                              title: 'PDAM',
                                              path: 'PDAM',
                                              image: 'pdam',
                                              tipe: 'pascabayar')),
                                      Expanded(
                                          child: BoxProduk(
                                              config: widget.config,
                                              label: 'BPJS',
                                              title: 'BPJS',
                                              path: 'BPJS',
                                              image: 'bpjs',
                                              tipe: 'pascabayar')),
                                    ],
                                  ),
                                  SizedBox(
                                    height: 20,
                                  ),
                                  Row(
                                    children: [
                                      Expanded(
                                          child: BoxProduk(
                                              config: widget.config,
                                              label: 'TV\nPascabayar',
                                              title: 'TV Pascabayar',
                                              path: 'TVK',
                                              image: 'television',
                                              tipe: 'pascabayar')),
                                      Expanded(
                                          child: BoxProduk(
                                              config: widget.config,
                                              label: 'PGN',
                                              title: 'PNG',
                                              path: 'PGN',
                                              image: 'pgn',
                                              tipe: 'pascabayar')),
                                      Expanded(
                                          child: BoxProduk(
                                              config: widget.config,
                                              label: 'Internet',
                                              title: 'Internet',
                                              path: 'INT',
                                              image: 'internet',
                                              tipe: 'pascabayar')),
                                      Expanded(child: Text('')),
                                    ],
                                  ),
                                  SizedBox(
                                    height: 60,
                                  ),
                                ]))
                              ],
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 15.0,
                        left: 0.0,
                        right: 0.0,
                        child: Container(
                          margin: EdgeInsets.only(top: 0),
                          child: Column(
                            children: [
                              Container(
                                height: 65,
                                width: 300,
                                padding: EdgeInsets.only(
                                    top: 10, bottom: 10, left: 20, right: 20),
                                decoration: BoxDecoration(
                                    boxShadow: [
                                      BoxShadow(
                                        color: widget.config.color_shadow,
                                        spreadRadius: 2,
                                        blurRadius: 7,
                                        offset: Offset(0, 3),
                                      ),
                                    ],
                                    color: widget.config.background_light_color,
                                    borderRadius: BorderRadius.circular(10)),
                                child: Consumer<Beranda_provider>(
                                    builder:
                                        (context, dataBeranda, child) => Row(
                                              children: [
                                                Expanded(
                                                    child: Column(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment.start,
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    loader.isLoad == true
                                                        ? LoadWidgetDepositSaya(
                                                            config:
                                                                widget.config)
                                                        : Text(
                                                            'Deposit Saya',
                                                            style: GoogleFonts.ptSans(
                                                                textStyle: Theme.of(
                                                                        context)
                                                                    .textTheme
                                                                    .headline4,
                                                                fontSize: 13,
                                                                color: widget
                                                                    .config
                                                                    .text_grey_color),
                                                          ),
                                                    loader.isLoad == true
                                                        ? LoadWidgetSaldo(
                                                            config:
                                                                widget.config)
                                                        : Text(
                                                            dataBeranda.saldo!,
                                                            style: GoogleFonts.ptSans(
                                                                textStyle: Theme.of(
                                                                        context)
                                                                    .textTheme
                                                                    .headline4,
                                                                fontSize: 16,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                                color: widget
                                                                    .config
                                                                    .text_dark_color),
                                                          ),
                                                  ],
                                                )),
                                                VerticalDivider(
                                                  color: widget
                                                      .config.color_shadow,
                                                  thickness: 2,
                                                ),
                                                Expanded(
                                                    child: dataBeranda
                                                                .status_deposit! ==
                                                            true
                                                        ? TextButton(
                                                            child: Row(
                                                              mainAxisAlignment:
                                                                  MainAxisAlignment
                                                                      .center,
                                                              children: [
                                                                Text('Konfirmasi',
                                                                    textAlign:
                                                                        TextAlign
                                                                            .center,
                                                                    style: GoogleFonts.ptSans(
                                                                        textStyle: Theme.of(context)
                                                                            .textTheme
                                                                            .headline4,
                                                                        fontSize:
                                                                            15,
                                                                        fontWeight:
                                                                            FontWeight
                                                                                .bold,
                                                                        color: Color.fromARGB(
                                                                            255,
                                                                            255,
                                                                            255,
                                                                            255)))
                                                              ],
                                                            ),
                                                            style: ButtonStyle(
                                                              padding: MaterialStateProperty.all<
                                                                      EdgeInsets>(
                                                                  EdgeInsets
                                                                      .all(10)),
                                                              foregroundColor:
                                                                  MaterialStateProperty.all<
                                                                          Color>(
                                                                      Colors
                                                                          .teal),
                                                              shape: MaterialStateProperty.all<RoundedRectangleBorder>(RoundedRectangleBorder(
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .circular(
                                                                              5.0),
                                                                  side: BorderSide(
                                                                      color: Colors
                                                                          .teal))),
                                                              backgroundColor:
                                                                  MaterialStateProperty
                                                                      .all(Colors
                                                                          .teal),
                                                            ),
                                                            onPressed: () => Navigator.push(
                                                                context,
                                                                MaterialPageRoute(
                                                                    builder:
                                                                        (context) =>
                                                                            Konfirmasi_deposit_saldo())))
                                                        : ButtonAddSaldo(
                                                            config:
                                                                widget.config)),
                                              ],
                                            )),
                              ),
                              SizedBox(
                                height: 20,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  )),
                ),
              ],
            ));
  }
}

class LoadWidgetSaldo extends StatelessWidget {
  const LoadWidgetSaldo({
    super.key,
    required this.config,
  });

  final ConfigApp config;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 10),
      height: 13,
      width: 50,
      decoration: BoxDecoration(
          color: config.color_shadow, borderRadius: BorderRadius.circular(2)),
    );
  }
}

class LoadWidgetDepositSaya extends StatelessWidget {
  const LoadWidgetDepositSaya({
    super.key,
    required this.config,
  });

  final ConfigApp config;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 5),
      height: 13,
      width: 100,
      decoration: BoxDecoration(
          color: config.color_shadow, borderRadius: BorderRadius.circular(2)),
    );
  }
}

class ButtonAddSaldo extends StatelessWidget {
  const ButtonAddSaldo({
    super.key,
    required this.config,
  });

  final ConfigApp config;

  @override
  Widget build(BuildContext context) {
    var loader = Provider.of<Load_provider>(context, listen: false);
    return InkWell(
      onTap: () {
        Navigator.push(context,
            MaterialPageRoute(builder: (context) => Form_input_deposit()));
      },
      child: Row(
        children: [
          Expanded(
            child: Align(
              alignment: Alignment.centerRight,
              child: loader.isLoad == true
                  ? Container(
                      margin: EdgeInsets.only(top: 0),
                      height: 13,
                      width: 70,
                      decoration: BoxDecoration(
                          color: config.color_shadow,
                          borderRadius: BorderRadius.circular(2)),
                    )
                  : Text('TAMBAH SALDO',
                      style: GoogleFonts.ptSans(
                          textStyle: Theme.of(context).textTheme.headline4,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: config.text_grey_color)),
            ),
          ),
          SizedBox(
            width: 5,
          ),
          Align(
            alignment: Alignment.centerRight,
            child: loader.isLoad == true
                ? Container(
                    margin: EdgeInsets.only(top: 0),
                    height: 25,
                    width: 25,
                    decoration: BoxDecoration(
                        color: config.color_shadow,
                        borderRadius: BorderRadius.circular(15)),
                  )
                : Icon(
                    FontAwesomeIcons.circlePlus,
                    size: 20,
                    color: config.text_navy_color,
                  ),
          ),
        ],
      ),
    );
  }
}

class BoxProduk extends StatelessWidget {
  const BoxProduk(
      {super.key,
      required this.config,
      required this.label,
      required this.title,
      required this.path,
      required this.image,
      required this.tipe});

  final ConfigApp config;
  final String label;
  final String title;
  final String path;
  final String image;
  final String tipe;

  @override
  Widget build(BuildContext context) {
    var loader = Provider.of<Load_provider>(context, listen: false);
    return InkWell(
      onTap: () {
        if (tipe == 'prabayar') {
          if (path == 'PIU' ||
              path == 'PT' ||
              path == 'PD' ||
              path == 'PTP' ||
              path == 'PS' ||
              path == 'TL') {
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => Input_ppob(
                        label: label,
                        title: title,
                        path: path,
                        tipe: tipe,
                        checkPrefix: true,
                      )),
            );
          } else {
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => Daftar_kategori(
                      label: label, title: title, path: path, tipe: tipe)),
            );
          }
        } else {
          Navigator.push(
            context,
            MaterialPageRoute(
                builder: (context) => Daftar_kategori_pascabayar(
                    label: label, title: title, path: path, tipe: tipe)),
          );
        }
      },
      child: Container(
          height: 100,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              loader.isLoad == true
                  ? Container(
                      margin: EdgeInsets.only(top: 0),
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                          color: config.color_shadow,
                          borderRadius: BorderRadius.circular(10)),
                    )
                  : Container(
                      width: 50,
                      height: 50,
                      padding: EdgeInsets.symmetric(horizontal: 5, vertical: 5),
                      decoration: BoxDecoration(
                          boxShadow: [
                            BoxShadow(
                              color: config.color_shadow,
                              spreadRadius: 2,
                              blurRadius: 7,
                              offset: Offset(0, 3),
                            ),
                          ],
                          color: config.background_light_color,
                          borderRadius: BorderRadius.circular(10)),
                      child: Image.asset('assets/img/' + image + '.png',
                          width: 10, height: 10, fit: BoxFit.fill),
                    ),
              SizedBox(
                height: 5,
              ),
              loader.isLoad == true
                  ? Container(
                      margin: EdgeInsets.only(top: 5),
                      width: 25,
                      height: 10,
                      decoration: BoxDecoration(
                          color: config.color_shadow,
                          borderRadius: BorderRadius.circular(2)),
                    )
                  : Text(
                      label,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.ptSans(
                          textStyle: Theme.of(context).textTheme.headline4,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: config.text_dark_color),
                    ),
              loader.isLoad == true
                  ? Container(
                      margin: EdgeInsets.only(top: 5),
                      width: 40,
                      height: 10,
                      decoration: BoxDecoration(
                          color: config.color_shadow,
                          borderRadius: BorderRadius.circular(2)),
                    )
                  : SizedBox(),
            ],
          )),
    );
  }
}
