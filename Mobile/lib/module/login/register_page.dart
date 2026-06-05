import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/config.dart';
import '../../provider/RegistrasiProvider.dart';
import '../../provider/loadProvider.dart';
import '../../widget/CircularProgressWidget.dart';
import 'login_page.dart';

class Register_page extends StatefulWidget {
  const Register_page({super.key});

  @override
  State<Register_page> createState() => _Register_pageState();
}

class _Register_pageState extends State<Register_page> {
  final _formKey = GlobalKey<FormState>();

  String? nomor_whatsapp;
  String? nama_pengguna;
  String? kode_referal;
  String? otp;
  String? password;
  String? konf_password;

  bool? _passwordVisible;
  bool? _konfpasswordVisible;

  @override
  void initState() {
    _passwordVisible = false;
    _konfpasswordVisible = false;
  }

  // bool? isLoad = false;

  final cnf = new ConfigApp();
  @override
  Widget build(BuildContext context) {
    // final load = Provider.of<Load_provider>(context, listen: false);
    return Scaffold(
        backgroundColor: cnf.background_color,
        appBar: AppBar(
          leading: Padding(
            padding: EdgeInsets.only(left: 30),
            child: IconButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                icon: Icon(
                  Icons.arrow_back,
                  color: Colors.white,
                )),
          ),
          backgroundColor: cnf.background_smooth_navy,
          elevation: 0,
        ),
        body: Consumer<Load_provider>(
            builder: (context, loader, child) => Stack(
                  children: [
                    Form(
                        key: _formKey,
                        child: ListView(
                          padding: EdgeInsets.only(
                              top: 10, bottom: 20, left: 40, right: 40),
                          children: [
                            Container(
                                child: Image.asset(
                                    'assets/img/vertical-logo.png',
                                    width: 100,
                                    height: 100)),
                            SizedBox(
                              height: 30,
                            ),
                            TextFormField(
                                onChanged: (text) =>
                                    setState(() => nama_pengguna = text),
                                onSaved: (val) => nama_pengguna = val!,
                                validator: (text) {
                                  if (text == null || text.isEmpty) {
                                    return 'Nama Pengguna tidak boleh kosong';
                                  }
                                  return null;
                                },
                                autocorrect: false,
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: cnf.text_dark_color),
                                decoration: InputDecoration(
                                  hintText: "Nama Pengguna",
                                  floatingLabelBehavior:
                                      FloatingLabelBehavior.never,
                                  filled: true,
                                  fillColor: cnf.input_light_color,
                                  contentPadding: const EdgeInsets.symmetric(
                                      vertical: 15.0, horizontal: 10.0),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius:
                                        new BorderRadius.circular(5.0),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius:
                                        new BorderRadius.circular(5.0),
                                  ),
                                )),
                            SizedBox(
                              height: 20,
                            ),
                            TextFormField(
                                onChanged: (text) =>
                                    setState(() => nomor_whatsapp = text),
                                onSaved: (val) => nomor_whatsapp = val!,
                                validator: (text) {
                                  if (text == null || text.isEmpty) {
                                    return 'Nomor WA tidak boleh kosong';
                                  }
                                  if (text.length < 10 || text.length > 13) {
                                    return 'Format Nomor WA tidak sesuai';
                                  }
                                  return null;
                                },
                                autocorrect: false,
                                keyboardType: TextInputType.number,
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: cnf.text_dark_color),
                                decoration: InputDecoration(
                                  hintText: "Nomor Whatsapp",
                                  floatingLabelBehavior:
                                      FloatingLabelBehavior.never,
                                  filled: true,
                                  fillColor: cnf.input_light_color,
                                  contentPadding: const EdgeInsets.symmetric(
                                      vertical: 15.0, horizontal: 10.0),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius:
                                        new BorderRadius.circular(5.0),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius:
                                        new BorderRadius.circular(5.0),
                                  ),
                                )),
                            SizedBox(
                              height: 20,
                            ),
                            Row(
                              children: [
                                Flexible(
                                  child: TextFormField(
                                      onChanged: (text) =>
                                          setState(() => otp = text),
                                      onSaved: (val) => otp = val!,
                                      validator: (text) {
                                        if (text == null || text.isEmpty) {
                                          return 'Token tidak boleh kosong';
                                        }
                                        return null;
                                      },
                                      style: GoogleFonts.ptSans(
                                          textStyle: Theme.of(context)
                                              .textTheme
                                              .headline4,
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: cnf.text_dark_color),
                                      autocorrect: false,
                                      keyboardType: TextInputType.number,
                                      decoration: InputDecoration(
                                        hintText: "OTP",
                                        floatingLabelBehavior:
                                            FloatingLabelBehavior.never,
                                        filled: true,
                                        fillColor: cnf.input_light_color,
                                        contentPadding:
                                            const EdgeInsets.symmetric(
                                                vertical: 15.0,
                                                horizontal: 10.0),
                                        enabledBorder: OutlineInputBorder(
                                          borderRadius: new BorderRadius.only(
                                              topLeft: Radius.circular(5.0),
                                              bottomLeft: Radius.circular(5.0)),
                                          borderSide: BorderSide(
                                              color: cnf.text_light_color),
                                        ),
                                        focusedBorder: OutlineInputBorder(
                                          borderRadius: new BorderRadius.only(
                                              topLeft: Radius.circular(5.0),
                                              bottomLeft: Radius.circular(5.0)),
                                          borderSide: BorderSide(
                                              color: cnf.text_light_color),
                                        ),
                                      )),
                                ),
                                ElevatedButton(
                                    onPressed: () async {
                                      var err = false;
                                      var err_msg = '';
                                      if (nomor_whatsapp == null ||
                                          nomor_whatsapp == '') {
                                        err_msg += 'Nomor whatsapp ';
                                        err = true;
                                      }
                                      if (err == true) {
                                        err_msg += 'tidak boleh kosong.';
                                      }
                                      if (err == false) {
                                        loader.isLoad = true;
                                        final reg =
                                            Provider.of<Registrasi_provider>(
                                                context,
                                                listen: false);
                                        var feedBack =
                                            await reg.getOTP(nomor_whatsapp!);
                                        if (feedBack.error == false) {
                                          loader.isLoad = false;
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(SnackBar(
                                                  backgroundColor: Colors.teal,
                                                  behavior:
                                                      SnackBarBehavior.floating,
                                                  content: Text(
                                                      feedBack.errorMsg!,
                                                      style: GoogleFonts.ptSans(
                                                          textStyle:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .headline4,
                                                          fontSize: 12,
                                                          color: cnf
                                                              .text_light_color))));
                                        } else {
                                          loader.isLoad = false;
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(SnackBar(
                                                  backgroundColor:
                                                      const Color.fromARGB(
                                                          255, 163, 57, 49),
                                                  behavior:
                                                      SnackBarBehavior.floating,
                                                  content: Text(
                                                      feedBack.errorMsg!,
                                                      style: GoogleFonts.ptSans(
                                                          textStyle:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .headline4,
                                                          fontSize: 12,
                                                          color: cnf
                                                              .text_light_color))));
                                        }
                                      } else {
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
                                                        color: cnf
                                                            .text_light_color))));
                                      }
                                    },
                                    child: Text(
                                      "GET OTP",
                                      style: GoogleFonts.ptSans(
                                          textStyle: Theme.of(context)
                                              .textTheme
                                              .headline4,
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                          color: cnf.text_light_color),
                                    ),
                                    style: ButtonStyle(
                                        shape: MaterialStateProperty.all<
                                                RoundedRectangleBorder>(
                                            RoundedRectangleBorder(
                                          borderRadius: new BorderRadius.only(
                                              topRight: Radius.circular(5.0),
                                              bottomRight:
                                                  Radius.circular(5.0)),
                                        )),
                                        backgroundColor:
                                            MaterialStateProperty.all(
                                                cnf.btn_primary_color),
                                        padding: MaterialStateProperty.all(
                                            EdgeInsets.only(
                                                top: 16,
                                                bottom: 16,
                                                left: 20,
                                                right: 20)),
                                        textStyle: MaterialStateProperty.all(
                                            TextStyle(fontSize: 14))))
                              ],
                            ),
                            SizedBox(
                              height: 20,
                            ),
                            TextFormField(
                                onChanged: (text) =>
                                    setState(() => kode_referal = text),
                                onSaved: (val) => kode_referal = val!,
                                autocorrect: false,
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: cnf.text_dark_color),
                                decoration: InputDecoration(
                                  hintText: "Kode Member Agen (Optional)",
                                  floatingLabelBehavior:
                                      FloatingLabelBehavior.never,
                                  filled: true,
                                  fillColor: cnf.input_light_color,
                                  contentPadding: const EdgeInsets.symmetric(
                                      vertical: 15.0, horizontal: 10.0),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius:
                                        new BorderRadius.circular(5.0),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius:
                                        new BorderRadius.circular(5.0),
                                  ),
                                )),
                            SizedBox(
                              height: 20,
                            ),
                            TextFormField(
                                onChanged: (text) =>
                                    setState(() => password = text),
                                onSaved: (val) => password = val!,
                                validator: (text) {
                                  if (text == null || text.isEmpty) {
                                    return 'Password tidak boleh kosong';
                                  }
                                  return null;
                                },
                                autocorrect: false,
                                obscureText: !_passwordVisible!,
                                enableSuggestions: false,
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: cnf.text_dark_color),
                                decoration: InputDecoration(
                                    hintText: "Password",
                                    floatingLabelBehavior:
                                        FloatingLabelBehavior.never,
                                    filled: true,
                                    fillColor: cnf.input_light_color,
                                    contentPadding: const EdgeInsets.symmetric(
                                        vertical: 15.0, horizontal: 10.0),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius:
                                          new BorderRadius.circular(5.0),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius:
                                          new BorderRadius.circular(5.0),
                                    ),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _passwordVisible!
                                            ? Icons.visibility
                                            : Icons.visibility_off,
                                        color: cnf.text_dark_color,
                                      ),
                                      onPressed: () {
                                        setState(() {
                                          _passwordVisible = !_passwordVisible!;
                                        });
                                      },
                                    ))),
                            SizedBox(
                              height: 20,
                            ),
                            TextFormField(
                                onChanged: (text) =>
                                    setState(() => konf_password = text),
                                onSaved: (val) => konf_password = val!,
                                validator: (text) {
                                  if (text == null || text.isEmpty) {
                                    return 'Konfirmasi Password tidak boleh kosong';
                                  }
                                  return null;
                                },
                                autocorrect: false,
                                obscureText: !_konfpasswordVisible!,
                                enableSuggestions: false,
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: cnf.text_dark_color),
                                decoration: InputDecoration(
                                    hintText: "Konfirmasi Password",
                                    floatingLabelBehavior:
                                        FloatingLabelBehavior.never,
                                    filled: true,
                                    fillColor: cnf.input_light_color,
                                    contentPadding: const EdgeInsets.symmetric(
                                        vertical: 15.0, horizontal: 10.0),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius:
                                          new BorderRadius.circular(5.0),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius:
                                          new BorderRadius.circular(5.0),
                                    ),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _konfpasswordVisible!
                                            ? Icons.visibility
                                            : Icons.visibility_off,
                                        color: cnf.text_dark_color,
                                      ),
                                      onPressed: () {
                                        setState(() {
                                          _konfpasswordVisible =
                                              !_konfpasswordVisible!;
                                        });
                                      },
                                    ))),
                            SizedBox(
                              height: 20,
                            ),
                            ElevatedButton(
                                onPressed: () async {
                                  if (_formKey.currentState != null) {
                                    if (_formKey.currentState!.validate()) {
                                      var err = false;
                                      var err_msg = '';
                                      // NAMA PENGGUNA
                                      if (nama_pengguna == null ||
                                          nama_pengguna == '') {
                                        err_msg +=
                                            'Nama pengguna tidak boleh kosong.';
                                        err = true;
                                      }
                                      // NOMOR WHATSAPP
                                      if (nomor_whatsapp == null ||
                                          nomor_whatsapp == '') {
                                        err_msg +=
                                            'Nomor whatsapp tidak boleh kosong.';
                                        err = true;
                                      }
                                      // OTP
                                      if (otp == null || otp == '') {
                                        if (err == true) {
                                          err_msg += ' & ';
                                        }
                                        err_msg += 'OTP tidak boleh kosong.';
                                        err = true;
                                      }
                                      // PASSWORD
                                      if (password == null || password == '') {
                                        if (err == true) {
                                          err_msg += ' & ';
                                        }
                                        err_msg +=
                                            'Password tidak boleh kosong.';
                                        err = true;
                                      }
                                      // KONFORMASI PASSWORD
                                      if (konf_password == null ||
                                          konf_password == '') {
                                        if (err == true) {
                                          err_msg += ' & ';
                                        }
                                        err_msg +=
                                            'Konfirmasi Password tidak boleh kosong.';
                                        err = true;
                                      } else {
                                        // CHECK KONFIRMASI PASSWORD HARUS SAMA DENGAN PASSWORD
                                        if (password != konf_password) {
                                          err_msg +=
                                              'Konfirmasi Password Harus Sama dengan Password ';
                                          err = true;
                                        }
                                      }

                                      if (kode_referal == null) {
                                        kode_referal = '';
                                      }

                                      // proses registrasi
                                      if (err == false) {
                                        loader.isLoad = true;
                                        final reg_to =
                                            Provider.of<Registrasi_provider>(
                                                context,
                                                listen: false);
                                        var feedBack =
                                            await reg_to.registrasiMember(
                                                nama_pengguna!,
                                                nomor_whatsapp!,
                                                otp!,
                                                password!,
                                                kode_referal!);
                                        if (feedBack.error == false) {
                                          loader.isLoad = false;
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(SnackBar(
                                                  backgroundColor: Colors.teal,
                                                  behavior:
                                                      SnackBarBehavior.floating,
                                                  content: Text(
                                                      feedBack.errorMsg!,
                                                      style: GoogleFonts.ptSans(
                                                          textStyle:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .headline4,
                                                          fontSize: 12,
                                                          color: cnf
                                                              .text_light_color))));
                                          Navigator.of(context).pop();
                                        } else {
                                          loader.isLoad = false;
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(SnackBar(
                                                  backgroundColor:
                                                      const Color.fromARGB(
                                                          255, 163, 57, 49),
                                                  behavior:
                                                      SnackBarBehavior.floating,
                                                  content: Text(
                                                      feedBack.errorMsg!,
                                                      style: GoogleFonts.ptSans(
                                                          textStyle:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .headline4,
                                                          fontSize: 12,
                                                          color: cnf
                                                              .text_light_color))));
                                        }
                                      } else {
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
                                                        color: cnf
                                                            .text_light_color))));
                                      }
                                    }
                                  }
                                },
                                child: Text(
                                  "Mendaftar Sekarang",
                                  style: GoogleFonts.ptSans(
                                      textStyle:
                                          Theme.of(context).textTheme.headline4,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: cnf.text_light_color),
                                ),
                                style: ButtonStyle(
                                  shape: MaterialStateProperty.all<
                                          RoundedRectangleBorder>(
                                      RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(5.0),
                                  )),
                                  backgroundColor: MaterialStateProperty.all(
                                      cnf.btn_primary_color),
                                )),
                          ],
                        )),
                    loader.isLoad == true
                        ? CircularProgressWidget()
                        : SizedBox(),
                  ],
                )));
  }
}
