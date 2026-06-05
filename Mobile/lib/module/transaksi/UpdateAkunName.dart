import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../config/config.dart';
import '../../provider/BerandaProvider.dart';
import '../../provider/TransactionProvider.dart';
import '../../provider/UpdateAkunProvider.dart';
import 'daftar_produk.dart';

class Update_akun_name extends StatefulWidget {
  Update_akun_name({required this.name, super.key});
  final String name;
  @override
  State<Update_akun_name> createState() => _Update_akun_nameState();
}

class _Update_akun_nameState extends State<Update_akun_name> {
  final config = ConfigApp();
  final _formKey = GlobalKey<FormState>();
  String? newName;
  var textController = new TextEditingController();
  // TextEditingController controller =
  //     new TextEditingController(text: widget.name!);

  @override
  Widget build(BuildContext context) {
    textController.text = widget.name;
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
          'Update Nama Akun',
          style: GoogleFonts.ptSans(
              textStyle: Theme.of(context).textTheme.headline4,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: config.text_light_color),
        ),
      ),
      backgroundColor: Colors.grey[200],
      body: Form(
        key: _formKey,
        child: Container(
            padding: EdgeInsets.only(left: 20, right: 20, top: 0, bottom: 25),
            child: ListView(children: [
              SizedBox(
                height: 10,
              ),
              Container(
                padding: EdgeInsets.symmetric(vertical: 15, horizontal: 15),
                margin: EdgeInsets.symmetric(vertical: 15, horizontal: 15),
                height: 170,
                decoration: BoxDecoration(
                    color: config.text_light_color,
                    borderRadius: BorderRadius.circular(10)),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Nama Akun',
                      style: GoogleFonts.ptSans(
                          textStyle: Theme.of(context).textTheme.headline4,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: config.text_dark_color),
                    ),
                    SizedBox(
                      height: 10,
                    ),
                    TextFormField(
                      controller: textController,
                      onSaved: (val) {
                        setState(() {
                          textController.text = val.toString();
                        });
                      },
                      autocorrect: false,
                      style: GoogleFonts.ptSans(
                          textStyle: Theme.of(context).textTheme.headline4,
                          fontSize: 12,
                          color: config.text_dark_color),
                      decoration: InputDecoration(
                        hintText: 'Nama Akun',
                        hintStyle: GoogleFonts.ptSans(
                            textStyle: Theme.of(context).textTheme.headline4,
                            fontSize: 12,
                            color: config.text_dark_color),
                        floatingLabelBehavior: FloatingLabelBehavior.never,
                        filled: true,
                        fillColor: config.input_grey_color,
                        contentPadding: const EdgeInsets.symmetric(
                            vertical: 15.0, horizontal: 10.0),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: new BorderRadius.circular(5.0),
                          borderSide:
                              BorderSide(color: config.input_light_color),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: new BorderRadius.circular(5.0),
                          borderSide:
                              BorderSide(color: config.input_light_color),
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
                                _formKey.currentState!.save();

                                // print(textController.text);
                                // _saveAkunDataChanged(context);
                                var err = false;
                                var err_msg = '';
                                if (textController.text == '') {
                                  err_msg += 'Nama Akun wajib diisi';
                                  err = true;
                                }
                                if (err == false) {
                                  final update =
                                      Provider.of<Update_akun_provider>(context,
                                          listen: false);
                                  await update
                                      .updateNamaAkun(textController.text);

                                  if (update.error! != null) {
                                    if (update.error == false) {
                                      await Provider.of<Beranda_provider>(
                                              context,
                                              listen: false)
                                          .get_data_beranda();
                                      //failed
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(SnackBar(
                                              backgroundColor: Colors.teal,
                                              behavior:
                                                  SnackBarBehavior.floating,
                                              content: Text(update.errorMsg!,
                                                  style: GoogleFonts.ptSans(
                                                      textStyle:
                                                          Theme.of(context)
                                                              .textTheme
                                                              .headline4,
                                                      fontSize: 12,
                                                      color: config
                                                          .text_light_color))));
                                      Navigator.pop(context);
                                    } else {
                                      //failed
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(SnackBar(
                                              backgroundColor:
                                                  const Color.fromARGB(
                                                      255, 163, 57, 49),
                                              behavior:
                                                  SnackBarBehavior.floating,
                                              content: Text(update.errorMsg!,
                                                  style: GoogleFonts.ptSans(
                                                      textStyle:
                                                          Theme.of(context)
                                                              .textTheme
                                                              .headline4,
                                                      fontSize: 12,
                                                      color: config
                                                          .text_light_color))));
                                    }
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
                                  //       nomor_tujuan!, widget.path);
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
                                  ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          backgroundColor: const Color.fromARGB(
                                              255, 163, 57, 49),
                                          behavior: SnackBarBehavior.floating,
                                          content: Text(err_msg,
                                              style: GoogleFonts.ptSans(
                                                  textStyle: Theme.of(context)
                                                      .textTheme
                                                      .headline4,
                                                  fontSize: 12,
                                                  color: config
                                                      .text_light_color))));
                                }
                              },
                              child: Text(
                                "Simpan Perubahan",
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: config.text_light_color),
                              ),
                              style: ButtonStyle(
                                shape: MaterialStateProperty.all<
                                        RoundedRectangleBorder>(
                                    RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(5.0),
                                )),
                                backgroundColor: MaterialStateProperty.all(
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
    );
  }
}
