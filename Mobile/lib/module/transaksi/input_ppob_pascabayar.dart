import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import '../../provider/TransactionProvider.dart';
import '../../provider/loadProvider.dart';
import '../../widget/CircularProgressWidget.dart';
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
          style: GoogleFonts.ptSans(
              textStyle: Theme.of(context).textTheme.headline4,
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
                                vertical: 15, horizontal: 15),
                            margin: EdgeInsets.symmetric(
                                vertical: 15, horizontal: 15),
                            height: 180,
                            decoration: BoxDecoration(
                                // boxShadow: [
                                //   BoxShadow(
                                //     color: config.color_shadow,
                                //     spreadRadius: 2,
                                //     blurRadius: 7,
                                //     offset: Offset(0, 3),
                                //   ),
                                // ],
                                color: config.text_light_color,
                                borderRadius: BorderRadius.circular(10)),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'ID Pelanggan',
                                  style: GoogleFonts.ptSans(
                                      textStyle:
                                          Theme.of(context).textTheme.headline4,
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: config.text_dark_color),
                                ),
                                SizedBox(
                                  height: 10,
                                ),
                                TextFormField(
                                  onChanged: (text) =>
                                      setState(() => nomor_tujuan = text),
                                  onSaved: (val) => nomor_tujuan = val!,
                                  // validator: (text) {
                                  //   if (text == null || text.isEmpty) {
                                  //     return widget.tipe == 'prabayar'
                                  //         ? 'Nomor Tujuan tidak boleh kosong'
                                  //         : 'ID Pelanggan tidak boleh kosong';
                                  //   }
                                  //   return null;
                                  // },
                                  enableSuggestions: false,
                                  autocorrect: false,
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                    hintText: 'ID Pelanggan',
                                    hintStyle: GoogleFonts.ptSans(
                                        textStyle: Theme.of(context)
                                            .textTheme
                                            .headline4,
                                        fontSize: 13,
                                        // fontWeight: FontWeight.bold,
                                        color: config.text_dark_color),
                                    floatingLabelBehavior:
                                        FloatingLabelBehavior.never,
                                    filled: true,
                                    fillColor: config.input_grey_color,
                                    contentPadding: const EdgeInsets.symmetric(
                                        vertical: 15.0, horizontal: 10.0),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius:
                                          new BorderRadius.circular(5.0),
                                      borderSide: BorderSide(
                                          color: config.input_light_color),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius:
                                          new BorderRadius.circular(5.0),
                                      borderSide: BorderSide(
                                          color: config.input_light_color),
                                    ),
                                  ),
                                ),
                                SizedBox(
                                  height: 15,
                                ),
                                Row(
                                  children: [
                                    Expanded(
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
                                                          style: GoogleFonts.ptSans(
                                                              textStyle: Theme.of(
                                                                      context)
                                                                  .textTheme
                                                                  .headline4,
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
                                                        style: GoogleFonts.ptSans(
                                                            textStyle: Theme.of(
                                                                    context)
                                                                .textTheme
                                                                .headline4,
                                                            fontSize: 12,
                                                            color: config
                                                                .text_light_color))));
                                              }

                                              // print("++++++++++=1");
                                              // if (widget.checkPrefix == false) {
                                              //   print("++++++++++=2");
                                              //   Navigator.push(
                                              //       context,
                                              //       MaterialPageRoute(
                                              //           builder: (context) => Daftar_produk(
                                              //               nomor_tujuan: nomor_tujuan!,
                                              //               label: widget.label,
                                              //               path: widget.path,
                                              //               title: widget.title,
                                              //               tipe: widget.tipe,
                                              //               prefix: widget.checkPrefix)));
                                              // } else {
                                              //   print("++++++++++=3");
                                              //   final trans =
                                              //       Provider.of<Transaction_provider>(
                                              //           context,
                                              //           listen: false);
                                              //   await trans.getPrefix(
                                              //       nomor_tujuan!, widget.path!);
                                              //   if (trans.error == false) {
                                              //     print("++++++++++=4");
                                              //     Navigator.push(
                                              //         context,
                                              //         MaterialPageRoute(
                                              //             builder: (context) =>
                                              //                 Daftar_produk(
                                              //                     nomor_tujuan:
                                              //                         nomor_tujuan!,
                                              //                     label: widget.label,
                                              //                     path: widget.path,
                                              //                     title: widget.title,
                                              //                     tipe: widget.tipe,
                                              //                     prefix: true)));
                                              //   } else {
                                              //     print("++++++++++=5");
                                              //     print(trans.error);
                                              //     print(trans.errorMsg);
                                              //     print("++++++++++=5");
                                              //     ScaffoldMessenger.of(context)
                                              //         .showSnackBar(SnackBar(
                                              //             backgroundColor:
                                              //                 const Color.fromARGB(
                                              //                     255, 163, 57, 49),
                                              //             behavior:
                                              //                 SnackBarBehavior.floating,
                                              //             content: Text(trans.errorMsg!,
                                              //                 style: GoogleFonts.ptSans(
                                              //                     textStyle:
                                              //                         Theme.of(context)
                                              //                             .textTheme
                                              //                             .headline4,
                                              //                     fontSize: 12,
                                              //                     color: config
                                              //                         .text_light_color))));
                                              //   }
                                              // }
                                            } else {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(SnackBar(
                                                      backgroundColor:
                                                          const Color.fromARGB(
                                                              255, 163, 57, 49),
                                                      behavior: SnackBarBehavior
                                                          .floating,
                                                      content: Text(err_msg,
                                                          style: GoogleFonts.ptSans(
                                                              textStyle: Theme.of(
                                                                      context)
                                                                  .textTheme
                                                                  .headline4,
                                                              fontSize: 12,
                                                              color: config
                                                                  .text_light_color))));
                                            }
                                          },
                                          child: Text(
                                            "Lanjutkan",
                                            style: GoogleFonts.ptSans(
                                                textStyle: Theme.of(context)
                                                    .textTheme
                                                    .headline4,
                                                fontSize: 13,
                                                fontWeight: FontWeight.bold,
                                                color: config.text_light_color),
                                          ),
                                          style: ButtonStyle(
                                            shape: MaterialStateProperty.all<
                                                    RoundedRectangleBorder>(
                                                RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(5.0),
                                            )),
                                            backgroundColor:
                                                MaterialStateProperty.all(
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
