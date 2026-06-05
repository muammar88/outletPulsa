import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import '../../provider/BerandaProvider.dart';
import '../../provider/RiwayatDepositProvider.dart';
import '../../provider/RiwayatPrabayarProvider.dart';
import '../../provider/RiwayatPascabayarProvider.dart';
import '../../widget/NotFound.dart';
import '../transaksi/detail_deposit.dart';
import '../transaksi/detail_transaksi.dart';
import '../transaksi/detail_transaksi_pascabayar.dart';

class Riwayat_tab extends StatefulWidget {
  const Riwayat_tab({super.key});

  @override
  State<Riwayat_tab> createState() => _Riwayat_tabState();
}

class _Riwayat_tabState extends State<Riwayat_tab> {
  final config = ConfigApp();

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
          appBar: AppBar(
            automaticallyImplyLeading: false,
            backgroundColor: config.background_smooth_navy,
            elevation: 0,
            centerTitle: false,
            bottom: PreferredSize(
              preferredSize: new Size(0.0, 0.0),
              child: Container(
                child: TabBar(
                  labelStyle: GoogleFonts.ptSans(
                      textStyle: Theme.of(context).textTheme.headline4,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: config.text_grey_color),
                  unselectedLabelColor: config.text_light_color,
                  tabs: [
                    Tab(text: "Prabayar"),
                    Tab(text: "Pascabayar"),
                    Tab(text: "Deposit")
                  ],
                ),
              ),
            ),
          ),
          backgroundColor: Colors.grey[200],
          body: TabBarView(
            children: [
              Sub_riwayat_prabayar(),
              Sub_riwayat_pascabayar(),
              Sub_riwayat_deposit(),
            ],
          )),
    );
  }
}

class Sub_riwayat_deposit extends StatefulWidget {
  Sub_riwayat_deposit({
    super.key,
  });

  @override
  State<Sub_riwayat_deposit> createState() => _Sub_riwayat_depositState();
}

class _Sub_riwayat_depositState extends State<Sub_riwayat_deposit> {
  final config = ConfigApp();

  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Riwayat_deposit_provider>(context).getRiwayatDeposit();
      await Provider.of<Beranda_provider>(context, listen: false)
          .get_data_beranda();
      loadData = true;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final riwayat = Provider.of<Riwayat_deposit_provider>(context);
    return Container(
        padding: EdgeInsets.only(
          left: 30,
          right: 30,
        ),
        child: ListView.builder(
            itemCount: riwayat.list != null
                ? riwayat.list!.length == 0
                    ? 1
                    : riwayat.list!.length
                : 1,
            itemBuilder: (BuildContext context, int index) {
              if (riwayat.list == null) {
                // return NotfoundRiwayatDepositWidget(config: config);
                return NotfoundWidget(config: config, label: "Riwayat Deposit");
              } else {
                if (riwayat.list!.length == 0) {
                  // return NotfoundRiwayatDepositWidget(config: config);
                  return NotfoundWidget(
                      config: config, label: "Riwayat Deposit");
                } else {
                  if (index == 0) {
                    return Column(
                      children: [
                        SizedBox(
                          height: 20,
                        ),
                        BoxListDeposit(
                            config: config,
                            tanggal: riwayat.list![index.toString()]
                                ['waktuRequest'],
                            saldo: riwayat.list![index.toString()]['nominal'],
                            status: riwayat.list![index.toString()]['status'],
                            kode:
                                'ID#' + riwayat.list![index.toString()]['kode'],
                            id: riwayat.list![index.toString()]['id'],
                            index: index),
                      ],
                    );
                  } else {
                    return BoxListDeposit(
                        config: config,
                        tanggal: riwayat.list![index.toString()]
                            ['waktuRequest'],
                        saldo: riwayat.list![index.toString()]['nominal'],
                        status: riwayat.list![index.toString()]['status'],
                        kode: 'ID#' + riwayat.list![index.toString()]['kode'],
                        id: riwayat.list![index.toString()]['id'],
                        index: index);
                  }
                }
              }
            }));
  }
}

class BoxListDeposit extends StatelessWidget {
  const BoxListDeposit(
      {super.key,
      required this.config,
      required this.tanggal,
      required this.saldo,
      required this.status,
      required this.kode,
      required this.id,
      required this.index});

  final ConfigApp config;
  final String tanggal;
  final String saldo;
  final String status;
  final String id;
  final String kode;
  final index;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        // if (status == 'proses') {
        //   Navigator.push(
        //     context,
        //     MaterialPageRoute(builder: (context) => Detail_tiket_deposit()),
        //   );
        // } else {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => Detail_deposit(status: status, id: id)),
        );
      },
      child: Container(
          // height: 65,
          // color: index % 2 == 1
          //     ? config.background_tab
          //     : Color.fromARGB(255, 223, 223, 223),
          //padding: EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 15),

          padding: EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 15),
          margin: EdgeInsets.only(top: 5, bottom: 5),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: Colors.white,
            // boxShadow: [
            //   BoxShadow(color: Colors.green, spreadRadius: 3),
            // ],
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                      child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tanggal,
                        style: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 12,
                            color: config.text_grey_color),
                      ),
                      Text(saldo,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: config.text_dark_color)),
                    ],
                  )),
                  Expanded(
                      child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(kode,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: config.text_dark_color)),
                      SizedBox(
                        height: 8,
                      ),
                      Container(
                          decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: config.color_shadow,
                                  spreadRadius: 2,
                                  blurRadius: 7,
                                  offset: Offset(0, 3),
                                ),
                              ],
                              color: status == 'proses'
                                  ? Colors.amber
                                  : (status == 'gagal'
                                      ? Colors.red
                                      : Colors.green),
                              borderRadius: BorderRadius.circular(5)),
                          padding: EdgeInsets.symmetric(vertical: 4),
                          width: 70,
                          child: Align(
                              alignment: Alignment.center,
                              child: Text(
                                status.toUpperCase(),
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 11,
                                    color: config.text_light_color),
                              ))),
                    ],
                  )),
                ],
              ),
            ],
          )),
    );
  }
}

class Sub_riwayat_pascabayar extends StatefulWidget {
  Sub_riwayat_pascabayar({
    super.key,
  });

  @override
  State<Sub_riwayat_pascabayar> createState() => _Sub_riwayat_pascabayarState();
}

class _Sub_riwayat_pascabayarState extends State<Sub_riwayat_pascabayar> {
  final config = ConfigApp();

  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Riwayat_pascabayar_provider>(context)
          .getRiwayatPascabayar();
      loadData = true;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final riwayat = Provider.of<Riwayat_pascabayar_provider>(context);
    return Container(
        padding: EdgeInsets.only(
          left: 30,
          right: 30,
        ),
        child: ListView.builder(
            itemCount: riwayat.list != null
                ? riwayat.list!.length == 0
                    ? 1
                    : riwayat.list!.length
                : 1,
            itemBuilder: (BuildContext context, int index) {
              if (riwayat.list == null) {
                return NotfoundWidget(
                    config: config, label: "Riwayat Transaksi");
              } else {
                if (riwayat.list == null) {
                  return NotfoundWidget(
                      config: config, label: "Riwayat Transaksi");
                } else {
                  if (riwayat.list!.length == 0) {
                    return NotfoundWidget(
                        config: config, label: "Riwayat Transaksi");
                  } else {
                    if (index == 0) {
                      return Column(
                        children: [
                          SizedBox(
                            height: 20,
                          ),
                          BoxListRiwayatPascabayar(
                            config: config,
                            type: 'pascabayar',
                            kode_transaksi: riwayat.list![index.toString()]
                                ['kode_transaksi'],
                            nama_produk: riwayat.list![index.toString()]
                                ['nama_produk'],
                            nomor_tujuan: riwayat.list![index.toString()]
                                ['nomor_tujuan'],
                            komisi: riwayat.list![index.toString()]['komisi'],
                            status: riwayat.list![index.toString()]['status'],
                            transaction_date: riwayat.list![index.toString()]
                                ['transaction_date'],
                            index: index,
                          ),
                        ],
                      );
                    } else {
                      return BoxListRiwayatPascabayar(
                          config: config,
                          type: 'pascabayar',
                          kode_transaksi: riwayat.list![index.toString()]
                              ['kode_transaksi'],
                          nama_produk: riwayat.list![index.toString()]
                              ['nama_produk'],
                          nomor_tujuan: riwayat.list![index.toString()]
                              ['nomor_tujuan'],
                          komisi: riwayat.list![index.toString()]['komisi'],
                          status: riwayat.list![index.toString()]['status'],
                          transaction_date: riwayat.list![index.toString()]
                              ['transaction_date'],
                          index: index);
                    }
                  }
                }
              }
            }));
  }
}

class Sub_riwayat_prabayar extends StatefulWidget {
  Sub_riwayat_prabayar({
    super.key,
  });

  @override
  State<Sub_riwayat_prabayar> createState() => _Sub_riwayat_prabayarState();
}

class _Sub_riwayat_prabayarState extends State<Sub_riwayat_prabayar> {
  final config = ConfigApp();
  bool loadData = false;
  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Riwayat_prabayar_provider>(context)
          .getRiwayatPrabayar();
      loadData = true;
    }
    super.didChangeDependencies();
  }

  //  @override
  @override
  Widget build(BuildContext context) {
    final riwayat = Provider.of<Riwayat_prabayar_provider>(context);
    return Container(
        padding: EdgeInsets.only(
          left: 30,
          right: 30,
        ),
        child: ListView.builder(
            itemCount: riwayat.list != null
                ? riwayat.list!.length == 0
                    ? 1
                    : riwayat.list!.length
                : 1,
            itemBuilder: (BuildContext context, int index) {
              if (riwayat.list == null) {
                return NotfoundWidget(
                    config: config, label: "Riwayat Transaksi");
              } else {
                if (riwayat.list!.length == 0) {
                  return NotfoundWidget(
                      config: config, label: "Riwayat Transaksi");
                } else {
                  if (index == 0) {
                    return Column(
                      children: [
                        SizedBox(
                          height: 20,
                        ),
                        BoxListRiwayat(
                            config: config,
                            type: 'prabayar',
                            waktu: riwayat.list![index.toString()]
                                ['transaction_date'],
                            name: riwayat.list![index.toString()]
                                ['name_produk'],
                            nomor_tujuan: riwayat.list![index.toString()]
                                ['nomor_tujuan'],
                            kode_transaksi: riwayat.list![index.toString()]
                                ['kode_transaksi'],
                            harga: riwayat.list![index.toString()]
                                ['selling_price'],
                            status: riwayat.list![index.toString()]['status'],
                            index: index),
                      ],
                    );
                  } else {
                    return BoxListRiwayat(
                        config: config,
                        type: 'prabayar',
                        waktu: riwayat.list![index.toString()]
                            ['transaction_date'],
                        name: riwayat.list![index.toString()]['name_produk'],
                        nomor_tujuan: riwayat.list![index.toString()]
                            ['nomor_tujuan'],
                        kode_transaksi: riwayat.list![index.toString()]
                            ['kode_transaksi'],
                        harga: riwayat.list![index.toString()]['selling_price'],
                        status: riwayat.list![index.toString()]['status'],
                        index: index);
                  }
                }
              }
            }));
  }
}

class BoxListRiwayatPascabayar extends StatelessWidget {
  const BoxListRiwayatPascabayar(
      {super.key,
      required this.config,
      required this.type,
      required this.kode_transaksi,
      required this.nama_produk,
      required this.nomor_tujuan,
      required this.komisi,
      required this.status,
      required this.transaction_date,
      required this.index});

  final ConfigApp config;
  final String type;
  final String kode_transaksi;
  final String nama_produk;
  final String nomor_tujuan;
  final String komisi;
  final String status;
  final String transaction_date;
  final index;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => Detail_transaksi_pascabayar(
                    kodeTrans: kode_transaksi,
                  )),
        );
      },
      child: Container(
          // color: index % 2 == 1
          //     ? config.background_tab
          //     : Color.fromARGB(255, 223, 223, 223),
          // padding: EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 15),
          padding: EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 15),
          margin: EdgeInsets.only(top: 5, bottom: 5),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: Colors.white,
            // boxShadow: [
            //   BoxShadow(color: Colors.green, spreadRadius: 3),
            // ],
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                      child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        transaction_date,
                        style: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 12,
                            color: config.text_grey_color),
                      ),
                      Text(nama_produk,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: config.text_dark_color)),
                      Text(nomor_tujuan,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 13,
                              color: config.text_dark_color)),
                    ],
                  )),
                  Expanded(
                      child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('ID#' + kode_transaksi,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: config.text_dark_color)),
                      SizedBox(
                        height: 3,
                      ),
                      Text(komisi,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 11,
                              color: config.text_dark_color)),
                      SizedBox(
                        height: 5,
                      ),
                      Container(
                          decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: config.color_shadow,
                                  spreadRadius: 2,
                                  blurRadius: 7,
                                  offset: Offset(0, 3),
                                ),
                              ],
                              color: status == "GAGAL"
                                  ? Colors.red
                                  : (status == "PROSES"
                                      ? Colors.orange
                                      : Colors.green),
                              borderRadius: BorderRadius.circular(5)),
                          padding: EdgeInsets.symmetric(vertical: 4),
                          width: 70,
                          child: Align(
                              alignment: Alignment.center,
                              child: Text(
                                status,
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 11,
                                    // fontWeight: FontWeight.bold,
                                    color: config.text_light_color),
                              ))),
                    ],
                  )),
                ],
              ),
            ],
          )),
    );
  }
}

class BoxListRiwayat extends StatelessWidget {
  const BoxListRiwayat(
      {super.key,
      required this.config,
      required this.type,
      required this.waktu,
      required this.name,
      required this.nomor_tujuan,
      required this.kode_transaksi,
      required this.harga,
      required this.status,
      required this.index});

  final ConfigApp config;

  final String type;

  final String waktu;
  final String name;
  final String nomor_tujuan;
  final String? kode_transaksi;
  final String harga;
  final String status;
  final index;

  @override
  Widget build(BuildContext context) {
    print("____________________");
    print("____________________");
    print(kode_transaksi);
    print("____________________");
    print("____________________");

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => Detail_transaksi(
                    kodeTrans: kode_transaksi!,
                  )),
        );
      },
      child: Container(
          // color: index % 2 == 1
          //     ? config.background_tab
          //     : Color.fromARGB(255, 255, 255, 255),
          padding: EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 15),
          margin: EdgeInsets.only(top: 5, bottom: 5),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: Colors.white,
            // boxShadow: [
            //   BoxShadow(color: Colors.green, spreadRadius: 3),
            // ],
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                      child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        waktu,
                        style: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 12,
                            color: config.text_grey_color),
                      ),
                      Text(name,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: config.text_dark_color)),
                      Text(nomor_tujuan,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 13,
                              color: config.text_dark_color)),
                    ],
                  )),
                  Expanded(
                      child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('ID#' + kode_transaksi!,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: config.text_dark_color)),
                      SizedBox(
                        height: 3,
                      ),
                      Text(harga,
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 11,
                              color: config.text_dark_color)),
                      SizedBox(
                        height: 5,
                      ),
                      Container(
                          decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: config.color_shadow,
                                  spreadRadius: 2,
                                  blurRadius: 7,
                                  offset: Offset(0, 3),
                                ),
                              ],
                              color: status == "GAGAL"
                                  ? Colors.red
                                  : (status == "PROSES"
                                      ? Colors.orange
                                      : Colors.green),
                              borderRadius: BorderRadius.circular(5)),
                          padding: EdgeInsets.symmetric(vertical: 4),
                          width: 70,
                          child: Align(
                              alignment: Alignment.center,
                              child: Text(
                                status,
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: config.text_light_color),
                              ))),
                    ],
                  )),
                ],
              ),
            ],
          )),
    );
  }
}
