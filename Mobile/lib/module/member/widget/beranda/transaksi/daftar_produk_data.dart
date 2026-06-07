import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/TransactionProvider.dart';
import '../../../../../widget/NotFound.dart';
import '../../../../../widget/allBoxLoading.dart';
import 'konfirmasi_pembelian.dart';

class Daftar_produk_data extends StatefulWidget {
  const Daftar_produk_data(
      {required this.id,
      required this.kode,
      required this.name,
      required this.nomor_tujuan,
      super.key});

  final String id;
  final String kode;
  final String name;
  final String nomor_tujuan;

  @override
  State<Daftar_produk_data> createState() => _Daftar_produk_dataState();
}

class _Daftar_produk_dataState extends State<Daftar_produk_data> {
  final config = ConfigApp();

  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Transaction_provider>(context).getDaftarProdukData(
          widget.id, widget.kode, widget.name, widget.nomor_tujuan);
      loadData = true;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final trans = Provider.of<Transaction_provider>(context);
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
            'Daftar Produk Data',
            style: GoogleFonts.poppins(
                textStyle: Theme.of(context).textTheme.headlineMedium,
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: config.text_light_color),
          ),
        ),
        backgroundColor: Colors.grey[200],
        body: Container(
            padding: EdgeInsets.only(
              left: 30,
              right: 30,
            ),
            child: ListView.builder(
                itemCount: trans.list_produk != null
                    ? trans.list_produk!.length == 0
                        ? 1
                        : trans.list_produk!.length
                    : 1,
                itemBuilder: (BuildContext context, int index) {
                  if (trans.list_produk == null) {
                    return AllBoxLoading();
                  } else {
                    if (trans.list_produk!.length == 0) {
                      // return NotfoundProdukWidget(config: config);
                      return NotfoundWidget(
                          config: config, label: "Daftar Produk Data");
                    } else {
                      if (index == 0) {
                        return Container(
                          padding: EdgeInsets.only(top: 20),
                          child: BoxListProduk(
                              config: config,
                              kode: trans.list_produk![index.toString()]
                                  ['kode'],
                              operator: trans.list_produk![index.toString()]
                                  ['operator'],
                              nominal: trans.list_produk![index.toString()]
                                  ['name'],
                              harga: trans.list_produk![index.toString()]
                                  ['price'],
                              status: trans.list_produk![index.toString()]
                                  ['status'],
                              nomor_tujuan: widget.nomor_tujuan),
                        );
                      } else {
                        if (index == (trans.list_produk!.length - 1)) {
                          return Container(
                            padding: EdgeInsets.only(bottom: 50),
                            child: BoxListProduk(
                                config: config,
                                kode: trans.list_produk![index.toString()]
                                    ['kode'],
                                operator: trans.list_produk![index.toString()]
                                    ['operator'],
                                nominal: trans.list_produk![index.toString()]
                                    ['name'],
                                harga: trans.list_produk![index.toString()]
                                    ['price'],
                                status: trans.list_produk![index.toString()]
                                    ['status'],
                                nomor_tujuan: widget.nomor_tujuan),
                          );
                        } else {
                          return BoxListProduk(
                              config: config,
                              kode: trans.list_produk![index.toString()]
                                  ['kode'],
                              operator: trans.list_produk![index.toString()]
                                  ['operator'],
                              nominal: trans.list_produk![index.toString()]
                                  ['name'],
                              harga: trans.list_produk![index.toString()]
                                  ['price'],
                              status: trans.list_produk![index.toString()]
                                  ['status'],
                              nomor_tujuan: widget.nomor_tujuan);
                        }
                      }
                    }
                  }
                })));
  }
}

class BoxListProduk extends StatelessWidget {
  const BoxListProduk(
      {super.key,
      required this.config,
      required this.kode,
      required this.nominal,
      required this.operator,
      required this.harga,
      required this.status,
      required this.nomor_tujuan});

  final ConfigApp config;
  final String kode;
  final String nominal;
  final String operator;
  final String harga;
  final String status;
  final String nomor_tujuan;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        if (status == 'active') {
          Navigator.push(
            context,
            MaterialPageRoute(
                builder: (context) => Konfirmasi_pembelian(
                    kode: kode,
                    nominal: nominal,
                    operator: operator,
                    harga: harga,
                    nomor_tujuan: nomor_tujuan)),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              backgroundColor: const Color.fromARGB(255, 163, 57, 49),
              behavior: SnackBarBehavior.floating,
              content: Text('Produk tidak aktif tidak dapat dibeli',
                  style: GoogleFonts.poppins(
                      textStyle: Theme.of(context).textTheme.headlineMedium,
                      fontSize: 12,
                      color: config.text_light_color))));
        }
      },
      child: Container(
          // height: 70,
          constraints: BoxConstraints(minHeight: 50),
          padding: EdgeInsets.only(left: 10, right: 10, top: 5, bottom: 10),
          margin: EdgeInsets.only(top: 5, bottom: 5),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: Colors.white,
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
                        kode,
                        style: GoogleFonts.poppins(
                            textStyle: Theme.of(context).textTheme.headlineMedium,
                            fontSize: 12,
                            color: config.text_grey_color),
                      ),
                      Text(nominal,
                          // overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.poppins(
                              textStyle: Theme.of(context).textTheme.headlineMedium,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: config.text_dark_color)),
                      Text(
                        operator,
                        // overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.poppins(
                            textStyle: Theme.of(context).textTheme.headlineMedium,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: config.text_grey_color),
                      ),
                    ],
                  )),
                  Expanded(
                      child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      SizedBox(
                        height: 8,
                      ),
                      Container(
                        margin: EdgeInsets.symmetric(horizontal: 10),
                        child: Text(harga,
                            style: GoogleFonts.poppins(
                                textStyle:
                                    Theme.of(context).textTheme.headlineMedium,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: config.text_dark_color)),
                      ),
                      SizedBox(
                        height: 2,
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
                              color: status == 'active'
                                  ? Colors.green
                                  : Colors.red,
                              borderRadius: BorderRadius.circular(5)),
                          padding: EdgeInsets.symmetric(vertical: 4),
                          width: 70,
                          child: Align(
                              alignment: Alignment.center,
                              child: Text(
                                status.toUpperCase(),
                                style: GoogleFonts.poppins(
                                    textStyle:
                                        Theme.of(context).textTheme.headlineMedium,
                                    fontSize: 11,
                                    color: config.text_light_color),
                              ))),
                    ],
                  )),
                ],
              ),
              // Divider(
              //   color: config.text_grey_color,
              // ),
            ],
          )),
    );
  }
}
