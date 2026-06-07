import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../../../config/config.dart';
import '../../../../../provider/TransactionProvider.dart';
import '../../../../../provider/loadProvider.dart';
import '../../../../../widget/CircularProgressWidget.dart';
import 'konfirmasi_pembelian_pascabayar.dart';

class Input_ppob_pascabayar extends StatefulWidget {
  Input_ppob_pascabayar(
      {required this.kode,
      required this.name,
      required this.fee,
      required this.status,
      super.key});

  final String kode;
  final String name;
  final String fee;
  final String status;

  @override
  State<Input_ppob_pascabayar> createState() => _Input_ppob_pascabayarState();
}

class _Input_ppob_pascabayarState extends State<Input_ppob_pascabayar> {
  final config = ConfigApp();
  final _formKey = GlobalKey<FormState>();
  String? nomor_tujuan;
  @override
  Widget build(BuildContext context) {
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
          widget.name,
          style: GoogleFonts.poppins(
              textStyle: Theme.of(context).textTheme.headlineMedium,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: config.text_light_color),
        ),
      ),
      backgroundColor: Colors.grey[200],
      body: Consumer<Load_provider>(
          builder: (context, loader, child) => Stack(
                children: [
                  Form(
                    key: _formKey,
                    child: Container(
                        padding: EdgeInsets.only(
                            left: 20, right: 20, top: 0, bottom: 25),
                        child: ListView(children: [
                          SizedBox(
                            height: 10,
                          ),
                          Container(
                            padding: EdgeInsets.symmetric(
                                vertical: 25, horizontal: 20),
                            margin: EdgeInsets.symmetric(
                                vertical: 15, horizontal: 15),
                            decoration: BoxDecoration(
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.08),
                                    spreadRadius: 4,
                                    blurRadius: 15,
                                    offset: Offset(0, 5),
                                  ),
                                ],
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20)),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: config.text_navy_color.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(10)
                                      ),
                                      child: Icon(Icons.confirmation_num_outlined, color: config.text_navy_color, size: 24),
                                    ),
                                    SizedBox(width: 15),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Masukkan ID Pelanggan',
                                            style: GoogleFonts.poppins(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w600,
                                                color: Colors.black87),
                                          ),
                                          SizedBox(height: 2),
                                          Text(
                                            'Pastikan ID sudah benar.',
                                            style: GoogleFonts.poppins(
                                                fontSize: 11,
                                                color: Colors.grey.shade500),
                                          ),
                                        ]
                                      )
                                    )
                                  ],
                                ),
                                SizedBox(height: 25),
                                TextFormField(
                                  onChanged: (text) =>
                                      setState(() => nomor_tujuan = text),
                                  onSaved: (val) => nomor_tujuan = val!,
                                  enableSuggestions: false,
                                  autocorrect: false,
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                    hintText: 'Contoh: 1234567890',
                                    hintStyle: GoogleFonts.poppins(
                                        fontSize: 13,
                                        color: Colors.grey.shade400),
                                    prefixIcon: Icon(Icons.tag, color: Colors.grey.shade400, size: 20),
                                    floatingLabelBehavior:
                                        FloatingLabelBehavior.never,
                                    filled: true,
                                    fillColor: Colors.grey.shade50,
                                    contentPadding: const EdgeInsets.symmetric(
                                        vertical: 18.0, horizontal: 15.0),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius:
                                          new BorderRadius.circular(12.0),
                                      borderSide: BorderSide(
                                          color: Colors.grey.shade200),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius:
                                          new BorderRadius.circular(12.0),
                                      borderSide: BorderSide(
                                          color: config.text_navy_color),
                                    ),
                                  ),
                                ),
                                SizedBox(height: 25),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                      onPressed: () async {
                                        var err = false;
                                        var err_msg = '';
                                        if (nomor_tujuan == null ||
                                            nomor_tujuan == '') {
                                          err_msg +=
                                              'Nomor tujuan wajib diisi';
                                          err = true;
                                        }
                                        if (err == false) {
                                          if (widget.status == 'active') {
                                            loader.isLoad = true;
                                            print("widget.kode");
                                            print(widget.kode);
                                            print("widget.kode");
                                            final trans = Provider.of<
                                                    Transaction_provider>(
                                                context,
                                                listen: false);
                                            var feedBack = await trans
                                                .inquiryPascabayar(
                                              widget.kode,
                                              nomor_tujuan!,
                                            );
                                            if (feedBack.error == false) {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                    builder: (context) =>
                                                        Konfirmasi_pembelian_pascabayar(
                                                          trId: feedBack
                                                              .trId!,
                                                          refId: feedBack
                                                              .refId!,
                                                          kode: feedBack
                                                              .kodeProduct!,
                                                          nomor_tujuan:
                                                              nomor_tujuan!,
                                                          namaPelanggan:
                                                              feedBack
                                                                  .namaPelanggan!,
                                                          name: widget.name,
                                                          status:
                                                              widget.status,
                                                          fee: widget.fee,
                                                          nominal: feedBack
                                                              .nominal!,
                                                          totalTagihan: feedBack
                                                              .totalTagihan!,
                                                          biaya_admin: feedBack
                                                              .biayaAdmin!,
                                                        )),
                                              );
                                            } else {
                                              loader.isLoad = false;
                                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                                  backgroundColor:
                                                      const Color.fromARGB(
                                                          255, 163, 57, 49),
                                                  behavior: SnackBarBehavior
                                                      .floating,
                                                  content: Text(
                                                      feedBack.errorMsg!,
                                                      style: GoogleFonts.poppins(
                                                          textStyle: Theme.of(
                                                                  context)
                                                              .textTheme
                                                              .headlineMedium,
                                                          fontSize: 12,
                                                          color: config
                                                              .text_light_color))));
                                            }
                                          } else {
                                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                                backgroundColor:
                                                    const Color.fromARGB(
                                                        255, 163, 57, 49),
                                                behavior: SnackBarBehavior
                                                    .floating,
                                                content: Text(
                                                    'Produk tidak aktif tidak dapat dibeli',
                                                    style: GoogleFonts.poppins(
                                                        textStyle: Theme.of(
                                                                context)
                                                            .textTheme
                                                            .headlineMedium,
                                                        fontSize: 12,
                                                        color: config
                                                            .text_light_color))));
                                          }
                                        } else {
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(SnackBar(
                                                  backgroundColor:
                                                      const Color.fromARGB(
                                                          255, 163, 57, 49),
                                                  behavior: SnackBarBehavior
                                                      .floating,
                                                  content: Text(err_msg,
                                                      style: GoogleFonts.poppins(
                                                          textStyle: Theme.of(
                                                                  context)
                                                              .textTheme
                                                              .headlineMedium,
                                                          fontSize: 12,
                                                          color: config
                                                              .text_light_color))));
                                        }
                                      },
                                      child: Text(
                                        "Lanjutkan Pembayaran",
                                        style: GoogleFonts.poppins(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: config.text_light_color),
                                      ),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: config.btn_primary_color,
                                        padding: EdgeInsets.symmetric(vertical: 16),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12.0),
                                        ),
                                        elevation: 0,
                                      )),
                                ),
                              ],
                            ),
                          )
                        ])),
                  ),
                  loader.isLoad == true ? CircularProgressWidget() : SizedBox(),
                ],
              )),
    );
  }
}
