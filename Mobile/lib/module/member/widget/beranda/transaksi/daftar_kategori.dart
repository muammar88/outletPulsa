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
          style: GoogleFonts.poppins(
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
    int staggerIndex = index > 15 ? 15 : index;

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 300 + (staggerIndex * 50)),
      curve: Curves.easeOutQuart,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 50 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Container(
        margin: EdgeInsets.only(
            top: index == 0 ? 20 : 6, bottom: lengths == index + 1 ? 50 : 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              spreadRadius: 0,
              offset: Offset(0, 4),
            )
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
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
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    height: 50,
                    width: 50,
                    padding: EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Image.asset(
                          'assets/img/' +
                              (trans.list_kategori![index.toString()]['bank'] ==
                                      'true'
                                  ? 'BANK'
                                  : trans.list_kategori![index.toString()]
                                      ['kode']) +
                              '.png',
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) =>
                              Icon(Icons.category, color: Colors.grey)),
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          trans.list_kategori![index.toString()]['name'],
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: config.text_dark_color,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          trans.list_kategori![index.toString()]['kode'],
                          style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.chevron_right_rounded,
                    color: Colors.grey[400],
                    size: 24,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
