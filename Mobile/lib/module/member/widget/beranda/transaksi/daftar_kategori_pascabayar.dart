import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/input_ppob_pascabayar.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/TransactionProvider.dart';
import '../../../../../widget/allBoxLoading.dart';
import '../../../../../widget/NotFound.dart';

class Daftar_kategori_pascabayar extends StatefulWidget {
  const Daftar_kategori_pascabayar(
      {required this.label,
      required this.title,
      required this.path,
      required this.tipe,
      super.key});

  final String label;
  final String title;
  final String path;
  final String tipe;

  @override
  State<Daftar_kategori_pascabayar> createState() =>
      _Daftar_kategori_pascabayarState();
}

class _Daftar_kategori_pascabayarState
    extends State<Daftar_kategori_pascabayar> {
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Transaction_provider>(context)
          .getDaftarKategoriPascabayar(
        widget.path,
      );
      loadData = true;
    }
    super.didChangeDependencies();
  }

  final config = ConfigApp();
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
          'Daftar Produk',
          style: GoogleFonts.ptSans(
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
              itemCount: trans.list_kategori_pascabayar != null
                  ? trans.list_kategori_pascabayar!.length == 0
                      ? 1
                      : trans.list_kategori_pascabayar!.length
                  : 1,
              itemBuilder: (BuildContext context, int index) {
                if (trans.list_kategori_pascabayar == null) {
                  return AllBoxLoading();
                } else {
                  if (trans.list_kategori_pascabayar!.length == 0) {
                    // return NotfoundProdukWidget(config: config);
                    return NotfoundWidget(
                        config: config, label: "Daftar Produk");
                  } else {
                    return BoxKategoriPascabayar(
                        config: config,
                        trans: trans,
                        index: index,
                        length: trans.list_kategori_pascabayar!.length);
                  }
                }
              })),
    );
  }
}

class BoxKategoriPascabayar extends StatelessWidget {
  const BoxKategoriPascabayar(
      {super.key,
      required this.config,
      required this.trans,
      required this.index,
      required this.length});

  final ConfigApp config;
  final Transaction_provider trans;
  final index;
  final length;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => Input_ppob_pascabayar(
                  name: trans.list_kategori_pascabayar![index.toString()]
                      ['name'],
                  kode: trans.list_kategori_pascabayar![index.toString()]
                      ['kode'],
                  status: trans.list_kategori_pascabayar![index.toString()]
                      ['status'],
                  fee: trans.list_kategori_pascabayar![index.toString()]
                      ['fee'])),
        );
      },
      child: Container(
        // constraints: BoxConstraints(
        //     minHeight: 40,
        //     minWidth: double.infinity,
        //     maxHeight: double.infinity),
        // color: index % 2 == 1
        //     ? config.background_tab
        //     : Color.fromARGB(255, 223, 223, 223),
        // margin: EdgeInsets.only(
        //     top: (index == 0 ? 20 : 0),
        //     bottom:
        //         (index == trans.list_kategori_pascabayar!.length - 1 ? 50 : 0)),
        // padding: EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 15),
        constraints: BoxConstraints(
            minHeight: 40,
            minWidth: double.infinity,
            maxHeight: double.infinity),
        // color: index % 2 == 1
        //     ? config.background_tab
        //     : Color.fromARGB(255, 223, 223, 223),
        // margin: EdgeInsets.only(
        //     top: (index == 0 ? 20 : 0),
        //     bottom: (index == trans.list_kategori!.length - 1 ? 50 : 0)),
        // padding: EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 10),

        padding: EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 10),
        // margin: EdgeInsets.only(top: 5, bottom: 5),
        margin: EdgeInsets.only(
            top: (index == 0 ? 20 : 5), bottom: (length == index + 1 ? 50 : 5)),
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
                // Expanded(
                //   flex: 1,
                //   child: Container(
                //     height: 50,
                //     padding: EdgeInsets.symmetric(horizontal: 5, vertical: 0),
                //     color: Colors.white,
                //     child: Center(
                //       child: Image.asset(
                //           'assets/img/' +
                //               (trans.list_kategori![index.toString()]['bank'] ==
                //                       'true'
                //                   ? 'BANK'
                //                   : trans.list_kategori![index.toString()]
                //                       ['kode']) +
                //               '.png',
                //           width: 100,
                //           fit: BoxFit.fill),
                //     ),
                //   ),
                // ),
                Expanded(
                  // flex: 3,
                  child: Container(
                    margin: EdgeInsets.symmetric(horizontal: 10),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                            trans.list_kategori_pascabayar![index.toString()]
                                ['kode'],
                            style: GoogleFonts.ptSans(
                                textStyle:
                                    Theme.of(context).textTheme.headlineMedium,
                                fontSize: 11,
                                // fontWeight: FontWeight.bold,
                                color: config.text_dark_color)),
                        Text(
                            trans.list_kategori_pascabayar![index.toString()]
                                ['name'],
                            style: GoogleFonts.ptSans(
                                textStyle:
                                    Theme.of(context).textTheme.headlineMedium,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: config.text_dark_color)),
                      ],
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                            'Fee : ' +
                                trans.list_kategori_pascabayar![index
                                    .toString()]['fee'],
                            style: GoogleFonts.ptSans(
                                textStyle:
                                    Theme.of(context).textTheme.headlineMedium,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: config.text_dark_color)),
                        SizedBox(
                          height: 3,
                        ),
                        Container(
                          width: 80,
                          decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: config.color_shadow,
                                  spreadRadius: 2,
                                  blurRadius: 7,
                                  offset: Offset(0, 3),
                                ),
                              ],
                              color: trans.list_kategori_pascabayar![
                                          index.toString()]['status'] ==
                                      'active'
                                  ? Colors.green
                                  : Colors.red,
                              borderRadius: BorderRadius.circular(5)),
                          padding: EdgeInsets.symmetric(vertical: 4),
                          child: Text(
                              trans.list_kategori_pascabayar![index.toString()]
                                  ['status'],
                              textAlign: TextAlign.center,
                              style: GoogleFonts.ptSans(
                                  textStyle:
                                      Theme.of(context).textTheme.headlineMedium,
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: config.text_light_color)),
                        ),
                      ],
                    ),
                  ),
                )
              ],
            ),
            // SizedBox(
            //   height: 10,
            // ),
            // Divider()
          ],
        ),
      ),
    );
  }
}
