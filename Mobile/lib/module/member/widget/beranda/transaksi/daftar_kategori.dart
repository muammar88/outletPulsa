import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/TransactionProvider.dart';
import '../../../../../widget/allBoxLoading.dart';
import '../../../../../widget/NotFound.dart';
import 'input_ppob.dart';

class Daftar_kategori extends StatefulWidget {
  const Daftar_kategori(
      {required this.label,
      required this.title,
      required this.path,
      required this.tipe,
      super.key});

  final String label;
  final String title;
  final String path;
  final String tipe;
  //: label, title: title, path: path, tipe: tipe

  @override
  State<Daftar_kategori> createState() => _Daftar_kategoriState();
}

class _Daftar_kategoriState extends State<Daftar_kategori> {
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    // final auth = Provider.of<Transaction_provider>(context);
    if (loadData == false) {
      // await Provider.of<Transaction_provider>(context).emptyListKategori();
      await Provider.of<Transaction_provider>(context).getDaftarKategori(
        widget.path,
      );
      // print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
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
          'Daftar Kategori',
          style: GoogleFonts.ptSans(
              textStyle: Theme.of(context).textTheme.headlineMedium,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: config.text_light_color),
        ),
      ),
      backgroundColor: Colors.grey[200],
      body: Container(
          // margin: EdgeInsets.only(top: 20),
          padding: EdgeInsets.only(
            left: 30,
            right: 30,
          ),
          child: ListView.builder(
              itemCount: trans.list_kategori != null
                  ? trans.list_kategori!.length == 0
                      ? 1
                      : trans.list_kategori!.length
                  : 1,
              itemBuilder: (BuildContext context, int index) {
                if (trans.list_kategori == null) {
                  //return NotfoundProdukWidget(config: config);
                  return AllBoxLoading();
                } else {
                  if (trans.list_kategori!.length == 0) {
                    // return NotfoundProdukWidget(config: config);
                    return NotfoundWidget(
                        config: config, label: "Daftar Kategori");
                  } else {
                    return BoxKategori(
                        config: config,
                        trans: trans,
                        index: index,
                        lengths: trans.list_kategori!.length);
                  }
                }
              })),
    );
  }
}

class BoxKategori extends StatelessWidget {
  const BoxKategori(
      {super.key,
      required this.config,
      required this.trans,
      required this.index,
      required this.lengths});

  final ConfigApp config;
  final Transaction_provider trans;
  final index;
  final lengths;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => Input_ppob(
                  label: trans.list_kategori![index.toString()]['name'],
                  title: trans.list_kategori![index.toString()]['name'],
                  path: trans.list_kategori![index.toString()]['kode'],
                  tipe: 'prabayar',
                  checkPrefix: false)),
        );
      },
      child: Container(
        margin: EdgeInsets.only(
            top: (index == 0 ? 20 : 0),
            bottom: (lengths == index + 1 ? 50 : 0)),
        child: Row(
          children: [
            Container(
              height: 50,
              width: 50,
              padding: EdgeInsets.symmetric(horizontal: 5, vertical: 0),
              decoration: BoxDecoration(
                  color: Color.fromARGB(255, 255, 255, 255),
                  borderRadius: BorderRadius.circular(10)),
              child: Center(
                child: Image.asset(
                    'assets/img/' +
                        (trans.list_kategori![index.toString()]['bank'] ==
                                'true'
                            ? 'BANK'
                            : trans.list_kategori![index.toString()]['kode']) +
                        '.png',
                    width: 100,
                    fit: BoxFit.fill),
              ),
            ),
            SizedBox(
              width: 10,
            ),
            Expanded(
              child: Container(
                // margin: EdgeInsets.only(top: (index == 0 ? 20 : 0)),
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

                padding:
                    EdgeInsets.only(left: 10, right: 10, top: 10, bottom: 10),
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
                        Container(
                          margin: EdgeInsets.symmetric(horizontal: 10),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                  trans.list_kategori![index.toString()]
                                      ['kode'],
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.ptSans(
                                      textStyle:
                                          Theme.of(context).textTheme.headlineMedium,
                                      fontSize: 11,
                                      // fontWeight: FontWeight.bold,
                                      color: config.text_dark_color)),
                              Text(
                                  trans.list_kategori![index.toString()]
                                      ['name'],
                                  textAlign: TextAlign.left,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.ptSans(
                                      textStyle:
                                          Theme.of(context).textTheme.headlineMedium,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: config.text_dark_color)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    // SizedBox(
                    //   height: 10,
                    // ),
                    // Divider()
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
