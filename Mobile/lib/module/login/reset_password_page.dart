import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../config/config.dart';
import '../../provider/RegistrasiProvider.dart';
import '../../provider/loadProvider.dart';
import '../../widget/CircularProgressWidget.dart';

class ResetPassword extends StatefulWidget {
  const ResetPassword({super.key});

  @override
  State<ResetPassword> createState() => _ResetPasswordState();
}

class _ResetPasswordState extends State<ResetPassword> {
  final _formKey = GlobalKey<FormState>();
  final cnf = new ConfigApp();

  String? nomor_whatsapp;
  String? otp;

  @override
  Widget build(BuildContext context) {
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
        body: Form(
          key: _formKey,
          child: ListView(
              padding:
                  EdgeInsets.only(top: 10, bottom: 20, left: 40, right: 40),
              children: [
                Container(
                    child: Image.asset('assets/img/vertical-logo.png',
                        width: 100, height: 100)),
                SizedBox(
                  height: 30,
                ),
                TextFormField(
                    onChanged: (text) => setState(() => nomor_whatsapp = text),
                    onSaved: (val) => nomor_whatsapp = val!,
                    validator: (text) {
                      if (text == null || text.isEmpty) {
                        return 'Nomor Whatsapp tidak boleh kosong';
                      }
                      return null;
                    },
                    autocorrect: false,
                    style: GoogleFonts.ptSans(
                        textStyle: Theme.of(context).textTheme.headline4,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: cnf.text_dark_color),
                    decoration: InputDecoration(
                      hintText: "Nomor Whatsapp",
                      floatingLabelBehavior: FloatingLabelBehavior.never,
                      filled: true,
                      fillColor: cnf.input_light_color,
                      // fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 15.0, horizontal: 10.0),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: new BorderRadius.circular(5.0),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: new BorderRadius.circular(5.0),
                      ),
                    )),
                SizedBox(
                  height: 20,
                ),
                Row(
                  children: [
                    Flexible(
                      child: TextFormField(
                          onChanged: (text) => setState(() => otp = text),
                          onSaved: (val) => otp = val!,
                          validator: (text) {
                            if (text == null || text.isEmpty) {
                              return 'Token tidak boleh kosong';
                            }
                            return null;
                          },
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: cnf.text_dark_color),
                          autocorrect: false,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            hintText: "OTP",
                            floatingLabelBehavior: FloatingLabelBehavior.never,
                            filled: true,
                            fillColor: cnf.input_light_color,
                            contentPadding: const EdgeInsets.symmetric(
                                vertical: 15.0, horizontal: 10.0),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: new BorderRadius.only(
                                  topLeft: Radius.circular(5.0),
                                  bottomLeft: Radius.circular(5.0)),
                              borderSide:
                                  BorderSide(color: cnf.text_light_color),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: new BorderRadius.only(
                                  topLeft: Radius.circular(5.0),
                                  bottomLeft: Radius.circular(5.0)),
                              borderSide:
                                  BorderSide(color: cnf.text_light_color),
                            ),
                          )),
                    ),
                    ElevatedButton(
                        onPressed: () async {
                          var err = false;
                          var err_msg = '';
                          if (nomor_whatsapp == null || nomor_whatsapp == '') {
                            err_msg += 'Nomor Whatsapp ';
                            err = true;
                          }
                          if (err == true) {
                            err_msg += 'tidak boleh kosong.';
                          }
                          if (err == false) {
                            final reg = Provider.of<Registrasi_provider>(
                                context,
                                listen: false);
                            var feedBack =
                                await reg.getOTPResetPassword(nomor_whatsapp!);
                            if (feedBack.error == false) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                      backgroundColor: Colors.teal,
                                      behavior: SnackBarBehavior.floating,
                                      content: Text(feedBack.errorMsg!,
                                          style: GoogleFonts.ptSans(
                                              textStyle: Theme.of(context)
                                                  .textTheme
                                                  .headline4,
                                              fontSize: 12,
                                              color: cnf.text_light_color))));
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                      backgroundColor: const Color.fromARGB(
                                          255, 163, 57, 49),
                                      behavior: SnackBarBehavior.floating,
                                      content: Text(feedBack.errorMsg!,
                                          style: GoogleFonts.ptSans(
                                              textStyle: Theme.of(context)
                                                  .textTheme
                                                  .headline4,
                                              fontSize: 12,
                                              color: cnf.text_light_color))));
                            }
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                backgroundColor:
                                    const Color.fromARGB(255, 163, 57, 49),
                                behavior: SnackBarBehavior.floating,
                                content: Text(err_msg,
                                    style: GoogleFonts.ptSans(
                                        textStyle: Theme.of(context)
                                            .textTheme
                                            .headline4,
                                        fontSize: 12,
                                        color: cnf.text_light_color))));
                          }
                        },
                        child: Text(
                          "GET OTP",
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: cnf.text_light_color),
                        ),
                        style: ButtonStyle(
                            shape: MaterialStateProperty.all<
                                RoundedRectangleBorder>(RoundedRectangleBorder(
                              borderRadius: new BorderRadius.only(
                                  topRight: Radius.circular(5.0),
                                  bottomRight: Radius.circular(5.0)),
                            )),
                            backgroundColor: MaterialStateProperty.all(
                                cnf.btn_primary_color),
                            padding: MaterialStateProperty.all(EdgeInsets.only(
                                top: 16, bottom: 16, left: 20, right: 20)),
                            textStyle: MaterialStateProperty.all(
                                TextStyle(fontSize: 14))))
                  ],
                ),
                SizedBox(
                  height: 20,
                ),
                ElevatedButton(
                    onPressed: () async {
                      if (_formKey.currentState != null) {
                        if (_formKey.currentState!.validate()) {
                          var err = false;
                          var err_msg = '';
                          // NOMOR WHATSAPP
                          if (nomor_whatsapp == null || nomor_whatsapp == '') {
                            err_msg += 'Nomor whatsapp tidak boleh kosong.';
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
                          // proses registrasi
                          if (err == false) {
                            final reg_to = Provider.of<Registrasi_provider>(
                                context,
                                listen: false);
                            var feedBack = await reg_to.resetPassword(
                                nomor_whatsapp!, otp!);

                            if (feedBack.error == false) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                      backgroundColor: Colors.teal,
                                      behavior: SnackBarBehavior.floating,
                                      content: Text(feedBack.errorMsg!,
                                          style: GoogleFonts.ptSans(
                                              textStyle: Theme.of(context)
                                                  .textTheme
                                                  .headline4,
                                              fontSize: 12,
                                              color: cnf.text_light_color))));
                              Navigator.of(context).pop();
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                      backgroundColor: const Color.fromARGB(
                                          255, 163, 57, 49),
                                      behavior: SnackBarBehavior.floating,
                                      content: Text(feedBack.errorMsg!,
                                          style: GoogleFonts.ptSans(
                                              textStyle: Theme.of(context)
                                                  .textTheme
                                                  .headline4,
                                              fontSize: 12,
                                              color: cnf.text_light_color))));
                            }
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                backgroundColor:
                                    const Color.fromARGB(255, 163, 57, 49),
                                behavior: SnackBarBehavior.floating,
                                content: Text(err_msg,
                                    style: GoogleFonts.ptSans(
                                        textStyle: Theme.of(context)
                                            .textTheme
                                            .headline4,
                                        fontSize: 12,
                                        color: cnf.text_light_color))));
                          }
                        }
                      }
                    },
                    child: Text(
                      "Reset Password",
                      style: GoogleFonts.ptSans(
                          textStyle: Theme.of(context).textTheme.headline4,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: cnf.text_light_color),
                    ),
                    style: ButtonStyle(
                      shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                          RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5.0),
                      )),
                      backgroundColor:
                          MaterialStateProperty.all(cnf.btn_primary_color),
                      // padding: MaterialStateProperty.all(EdgeInsets.only(
                      //     top: 17, bottom: 16, left: 20, right: 20)),
                    ))
              ]),
        ));
  }
}
