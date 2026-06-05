import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import '../../provider/TransactionProvider.dart';
import '../../provider/loadProvider.dart';
import '../../widget/CircularProgressWidget.dart';
import 'daftar_operator.dart';
import 'daftar_produk.dart';

class Input_ppob extends StatefulWidget {
  Input_ppob(
      {required this.label,
      required this.path,
      required this.title,
      required this.tipe,
      required this.checkPrefix,
      super.key});

  final String label;
  final String path;
  final String title;
  final String tipe;
  final bool checkPrefix;

  @override
  State<Input_ppob> createState() => _Input_ppobState();
}

class _Input_ppobState extends State<Input_ppob> {
  final config = ConfigApp();
  final _formKey = GlobalKey<FormState>();
  String? nomor_tujuan;

  @override
  Widget build(BuildContext context) {
    // print(config.text_light_color);
    // print(config.text_light_color);
    // print(config.text_light_color);
    // print(config.text_light_color);

    //print(widget.label);
    print(widget.path);
    // print(widget.title);
    // print(widget.tipe);

    return Scaffold(
        appBar: AppBar(
          leading: IconButton(
              onPressed: () {
                Navigator.pop(context);
              },
              icon: Icon(
                Icons.arrow_back,
                color: Colors.white,
              )),
          backgroundColor: config.background_smooth_navy,
          elevation: 0,
          centerTitle: true,
          title: Text(
            widget.title,
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
                        padding:
                            EdgeInsets.symmetric(vertical: 15, horizontal: 15),
                        margin:
                            EdgeInsets.symmetric(vertical: 15, horizontal: 15),
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
                              widget.tipe == 'prabayar'
                                  ? 'Nomor Tujuan'
                                  : 'ID Pelanggan',
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
                              enableSuggestions: false,
                              autocorrect: false,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(
                                hintText: widget.tipe == 'prabayar'
                                    ? 'Nomor Tujuan'
                                    : 'ID Pelanggan',
                                hintStyle: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
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
                                  borderRadius: new BorderRadius.circular(5.0),
                                  borderSide: BorderSide(
                                      color: config.input_light_color),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: new BorderRadius.circular(5.0),
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
                                          err_msg += 'Nomor tujuan wajib diisi';
                                          err = true;
                                        }
                                        if (err == false) {
                                          loader.isLoad = true;
                                          if (widget.checkPrefix == false) {
                                            Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                    builder: (context) =>
                                                        Daftar_produk(
                                                            nomor_tujuan:
                                                                nomor_tujuan!,
                                                            label: widget.label,
                                                            path: widget.path,
                                                            title: widget.title,
                                                            tipe: widget.tipe,
                                                            prefix: widget
                                                                .checkPrefix)));
                                            loader.isLoad = false;
                                          } else {
                                            final trans = Provider.of<
                                                    Transaction_provider>(
                                                context,
                                                listen: false);
                                            await trans.getPrefix(
                                                nomor_tujuan!, widget.path);
                                            if (trans.error == false) {
                                              loader.isLoad = false;
                                              if (widget.path == 'PD' ||
                                                  widget.path == 'PTP') {
                                                Navigator.push(
                                                    context,
                                                    MaterialPageRoute(
                                                        builder: (context) =>
                                                            Daftar_operator(
                                                                nomor_tujuan:
                                                                    nomor_tujuan!,
                                                                label: widget
                                                                    .label,
                                                                path:
                                                                    widget.path,
                                                                title: widget
                                                                    .title,
                                                                tipe:
                                                                    widget.tipe,
                                                                prefix: widget
                                                                    .checkPrefix)));
                                              } else {
                                                Navigator.push(
                                                    context,
                                                    MaterialPageRoute(
                                                        builder: (context) =>
                                                            Daftar_produk(
                                                                nomor_tujuan:
                                                                    nomor_tujuan!,
                                                                label: widget
                                                                    .label,
                                                                path:
                                                                    widget.path,
                                                                title: widget
                                                                    .title,
                                                                tipe:
                                                                    widget.tipe,
                                                                prefix: true)));
                                              }
                                            } else {
                                              loader.isLoad = false;
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(SnackBar(
                                                      backgroundColor:
                                                          const Color.fromARGB(
                                                              255, 163, 57, 49),
                                                      behavior: SnackBarBehavior
                                                          .floating,
                                                      content: Text(
                                                          trans.errorMsg!,
                                                          style: GoogleFonts.ptSans(
                                                              textStyle: Theme.of(
                                                                      context)
                                                                  .textTheme
                                                                  .headline4,
                                                              fontSize: 12,
                                                              color: config
                                                                  .text_light_color))));
                                            }
                                          }
                                        } else {
                                          loader.isLoad = false;
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(SnackBar(
                                                  backgroundColor:
                                                      const Color.fromARGB(
                                                          255, 163, 57, 49),
                                                  behavior:
                                                      SnackBarBehavior.floating,
                                                  content: Text(err_msg,
                                                      style: GoogleFonts.ptSans(
                                                          textStyle:
                                                              Theme.of(context)
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
          ),
        ));
  }
}
