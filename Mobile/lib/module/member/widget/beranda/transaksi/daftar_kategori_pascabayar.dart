import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/module/member/widget/beranda/transaksi/input_ppob_pascabayar.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/TransactionProvider.dart';
import '../../../../../widget/allBoxLoading.dart';
import '../../../../../widget/NotFound.dart';
import '../../../../../widget/ErrorStateWidget.dart';

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
          style: GoogleFonts.poppins(
              textStyle: Theme.of(context).textTheme.headlineMedium,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: config.text_light_color),
        ),
      ),
      backgroundColor: Colors.grey[200],
      body: trans.error == true
          ? ErrorStateWidget(
              config: config,
              errorMessage: trans.errorMsg ?? 'Terjadi kesalahan sistem',
              onRetry: () {
                trans.getDaftarKategoriPascabayar(widget.path);
              },
            )
          : Container(
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
    String feeStr = trans.list_kategori_pascabayar![index.toString()]['fee'].toString();
    String formattedFee = feeStr.replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.');
    String statusStr = trans.list_kategori_pascabayar![index.toString()]['status'].toString();

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (context) => Input_ppob_pascabayar(
                  name: trans.list_kategori_pascabayar![index.toString()]
                      ['name'].toString(),
                  kode: trans.list_kategori_pascabayar![index.toString()]
                      ['kode'].toString(),
                  status: trans.list_kategori_pascabayar![index.toString()]
                      ['status'].toString(),
                  fee: trans.list_kategori_pascabayar![index.toString()]
                      ['fee'].toString())),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: EdgeInsets.only(
            left: 2, right: 2, top: (index == 0 ? 20 : 8), bottom: (length == index + 1 ? 50 : 8)),
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.08),
              spreadRadius: 2,
              blurRadius: 12,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: config.text_navy_color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.receipt_long_rounded,
                color: config.text_navy_color,
                size: 26,
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    trans.list_kategori_pascabayar![index.toString()]['name'].toString(),
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 4),
                  Text(
                    trans.list_kategori_pascabayar![index.toString()]['kode'].toString(),
                    style: GoogleFonts.poppins(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey.shade500,
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  'Fee: Rp $formattedFee',
                  style: GoogleFonts.poppins(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: config.text_navy_color,
                  ),
                ),
                SizedBox(height: 8),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusStr.toLowerCase() == 'active'
                        ? Colors.green.shade50
                        : Colors.red.shade50,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: statusStr.toLowerCase() == 'active'
                          ? Colors.green.shade200
                          : Colors.red.shade200,
                      width: 1,
                    )
                  ),
                  child: Text(
                    statusStr.toUpperCase(),
                    style: GoogleFonts.poppins(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: statusStr.toLowerCase() == 'active'
                          ? Colors.green.shade700
                          : Colors.red.shade700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
