import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/provider/TransactionProvider.dart';
import 'package:provider/provider.dart';
import '../../../../../config/config.dart';
import '../../../../../widget/allBoxLoading.dart';
import '../../../../../widget/NotFound.dart';
import 'konfirmasi_pembelian.dart';

class Daftar_produk extends StatefulWidget {
  Daftar_produk(
      {required this.nomor_tujuan,
      required this.label,
      required this.path,
      required this.title,
      required this.tipe,
      required this.prefix,
      super.key});

  final String nomor_tujuan;
  final String label;
  final String path;
  final String title;
  final String tipe;
  final bool prefix;

  @override
  State<Daftar_produk> createState() => _Daftar_produkState();
}

class _Daftar_produkState extends State<Daftar_produk> {
  final config = ConfigApp();

  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Transaction_provider>(context, listen: false)
          .getDaftarProduk(operator: widget.path);
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
            'Daftar Produk',
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
                  if (trans.error == true && trans.errorMsg != null) {
                    return Center(
                      child: Container(
                        padding: EdgeInsets.only(top: 50),
                        child: Text(
                          trans.errorMsg!,
                          style: GoogleFonts.poppins(color: Colors.red),
                        ),
                      ),
                    );
                  }
                  if (trans.list_produk == null) {
                    return AllBoxLoading();
                  } else {
                    if (trans.list_produk!.length == 0) {
                      return NotfoundWidget(
                          config: config, label: "Daftar Produk Kosong");
                    } else {
                      if (index == 0) {
                        return Container(
                          padding: EdgeInsets.only(top: 20),
                          child: BoxListProduk(
                              index: index,
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
                                index: index,
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
                              index: index,
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
      required this.index,
      required this.config,
      required this.kode,
      required this.nominal,
      required this.operator,
      required this.harga,
      required this.status,
      required this.nomor_tujuan});

  final int index;
  final ConfigApp config;
  final String kode;
  final String nominal;
  final String operator;
  final String harga;
  final String status;
  final String nomor_tujuan;

  @override
  Widget build(BuildContext context) {
    bool isActive = status == 'active';
    int staggerIndex = index > 15 ? 15 : index; // Limit the max stagger time

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
      margin: EdgeInsets.symmetric(vertical: 6, horizontal: 2),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            spreadRadius: 0,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            if (isActive) {
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
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  content: Text('Produk sedang gangguan / tidak dapat dibeli',
                      style: GoogleFonts.poppins(
                          fontSize: 14,
                          color: config.text_light_color))));
            }
          },
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Leading Icon
                Container(
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isActive
                        ? config.btn_primary_color.withOpacity(0.1)
                        : Colors.grey.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    isActive ? Icons.phone_android_rounded : Icons.block_rounded,
                    color: isActive ? config.btn_primary_color : Colors.grey,
                    size: 24,
                  ),
                ),
                SizedBox(width: 16),
                
                // Content Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        nominal,
                        style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: isActive ? config.text_dark_color : Colors.grey),
                      ),
                      SizedBox(height: 4),
                      Text(
                        operator,
                        style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: config.text_grey_color),
                      ),
                      SizedBox(height: 6),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: config.background_tab,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          kode,
                          style: GoogleFonts.poppins(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: config.text_grey_color),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Price and Badge
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      harga,
                      style: GoogleFonts.poppins(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: isActive ? config.btn_primary_color : Colors.grey),
                    ),
                    SizedBox(height: 8),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isActive ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isActive ? Colors.green.withOpacity(0.4) : Colors.red.withOpacity(0.4),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        isActive ? 'Tersedia' : 'Gangguan',
                        style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isActive ? Colors.green[700] : Colors.red[700]),
                      ),
                    ),
                  ],
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
