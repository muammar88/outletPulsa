import 'package:alert_notification/alert_notification.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/module/login/register_page.dart';
import 'package:outletpulsa/provider/AuthenticationProvider.dart';
import 'package:provider/provider.dart';
import 'package:smart_alert_dialog/smart_alert_dialog.dart';
// import 'package:smart_alert_dialog/models/alert_dialog_text.dart';
// import 'package:quickalert/quickalert.dart';

// import 'package:awesome_snackbar_content/awesome_snackbar_content.dart';

import '../../config/config.dart';
import '../../models/model_void.dart';
import '../../provider/BerandaProvider.dart';
import '../../provider/loadProvider.dart';
import '../../widget/CircularProgressWidget.dart';
import '../home/home_page.dart';
import 'reset_password_page.dart';

class Login_page extends StatefulWidget {
  const Login_page({super.key});

  @override
  State<Login_page> createState() => _Login_pageState();
}

class _Login_pageState extends State<Login_page> {
  final _formKey = GlobalKey<FormState>();
  String? nomor_whatsapp;
  String? password;
  bool? _passwordVisible;

  @override
  void initState() {
    _passwordVisible = false;
  }

  final cnf = new ConfigApp();

  void _yesNoSmartAlert(BuildContext context, title, msg) {
    showDialog(
      context: context,
      builder: (_) => SmartAlertDialog(
        title: title,
        message: msg,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: cnf.background_color,
        body: Consumer<Load_provider>(
          builder: (context, loader, child) => Stack(
            children: [
              Form(
                key: _formKey,
                child: ListView(
                    padding: EdgeInsets.only(
                        top: 20, bottom: 20, left: 40, right: 40),
                    children: [
                      SizedBox(
                        height: 100,
                      ),
                      Container(
                          child: Image.asset('assets/img/vertical-logo.png',
                              width: 100, height: 100)),
                      SizedBox(
                        height: 30,
                      ),
                      TextFormField(
                          onChanged: (text) =>
                              setState(() => nomor_whatsapp = text),
                          onSaved: (val) => nomor_whatsapp = val!,
                          autocorrect: false,
                          keyboardType: TextInputType.number,
                          style: GoogleFonts.ptSans(\n                              textStyle: Theme.of(context).textTheme.headlineLarge,\n                              fontSize: 14,\n                              fontWeight: FontWeight.bold,\n                              color: cnf.text_dark_color),
                          decoration: InputDecoration(
                            hintText: "Nomor Whatsapp",
                            floatingLabelBehavior: FloatingLabelBehavior.never,
                            filled: true,
                            fillColor: cnf.input_light_color,
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
                      TextFormField(
                        onChanged: (text) => setState(() => password = text),
                        onSaved: (val) => password = val,
                        obscureText: !_passwordVisible!,
                        enableSuggestions: false,
                        autocorrect: false,
                            style: GoogleFonts.ptSans(\n                            textStyle: Theme.of(context).textTheme.headlineLarge,\n                            fontSize: 14,\n                            fontWeight: FontWeight.bold,\n                            color: cnf.text_dark_color),
                        decoration: InputDecoration(
                            hintText: "Password",
                            floatingLabelBehavior: FloatingLabelBehavior.never,
                            filled: true,
                            fillColor: cnf.input_light_color,
                            contentPadding: const EdgeInsets.symmetric(
                                vertical: 15.0, horizontal: 10.0),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: new BorderRadius.circular(5.0),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: new BorderRadius.circular(5.0),
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                // Based on passwordVisible state choose the icon
                                _passwordVisible!
                                    ? Icons.visibility
                                    : Icons.visibility_off,
                                color: cnf.text_dark_color,
                              ),
                              onPressed: () {
                                // Update the state i.e. toogle the state of passwordVisible variable
                                setState(() {
                                  _passwordVisible = !_passwordVisible!;
                                });
                              },
                            )),
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
                                if (nomor_whatsapp == null ||
                                    nomor_whatsapp == '') {
                                  err_msg += 'Nomor whatsapp ';
                                  err = true;
                                }
                                if (password == null || password == '') {
                                  if (err == true) {
                                    err_msg += ' & ';
                                  }
                                  err_msg += 'Password ';
                                  err = true;
                                }
                                if (err == true) {
                                  err_msg += 'tidak boleh kosong.';
                                }
                                if (err == false) {
                                  // set loading
                                  loader.isLoad = true;

                                  final auth =
                                      Provider.of<Authentication_provider>(
                                          context,
                                          listen: false);
                                  var feedBack = await auth.submit_login(
                                      nomor_whatsapp!, password!);
                                  if (feedBack.error == false) {
                                    // set loading
                                    //loader.isLoad = false;

                                    ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                            backgroundColor: Colors.teal,
                                            behavior: SnackBarBehavior.floating,
                                            content: Text(
                                                feedBack.errorMsg!,
                                                style: GoogleFonts.ptSans(
                                                    textStyle: Theme.of(context)\n                                                        .textTheme\n                                                        .headlineLarge,\n                                                    fontSize: 12,\n                                                    color: cnf\n                                                        .text_light_color))));\n                                  } else {
                                    // set loading
                                    loader.isLoad = false;

                                    ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                            backgroundColor:
                                                const Color
                                                    .fromARGB(255, 163, 57, 49),
                                            behavior: SnackBarBehavior.floating,
                                            content: Text(
                                                feedBack.errorMsg!,
                                                style: GoogleFonts.ptSans(
                                                    textStyle: Theme.of(context)
                                                        .textTheme
                                                        .headline4,
                                                    fontSize: 12,
                                                    color: cnf
                                                        .text_light_color))));
                                  }
                                  // });
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          backgroundColor: const Color.fromARGB(
                                              255, 163, 57, 49),
                                          behavior: SnackBarBehavior.floating,
                                          content: Text(
                                              err_msg,
                                              style: GoogleFonts
                                                  .ptSans(
                                                      textStyle:
                                                          Theme.of(
                                                                  context)
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
                            "Login",
                            style: GoogleFonts.ptSans(
                                textStyle:
                                    Theme.of(context).textTheme.headline4,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: cnf.text_light_color),
                          ),
                          style: ButtonStyle(
                            shape: MaterialStateProperty.all<
                                RoundedRectangleBorder>(RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(5.0),
                            )),
                            backgroundColor: MaterialStateProperty.all(
                                cnf.btn_primary_color),
                            // padding: MaterialStateProperty.all(EdgeInsets.only(
                            //     top: 17, bottom: 16, left: 20, right: 20)

                            //     ),
                          )),
                      SizedBox(
                        height: 30,
                      ),
                      Center(
                        child: Text(
                          "Atau",
                          style: GoogleFonts.ptSans(
                              textStyle: Theme.of(context).textTheme.headline4,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: cnf.text_light_color),
                        ),
                      ),
                      SizedBox(
                        height: 30,
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () async {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) =>
                                          const ResetPassword()),
                                );
                              },
                              child: Text(
                                "Lupa Password",
                                style: GoogleFonts.ptSans(
                                    textStyle:
                                        Theme.of(context).textTheme.headline4,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: cnf.text_light_color),
                              ),
                              style: OutlinedButton.styleFrom(
                                backgroundColor: cnf.background_color,
                                side: BorderSide(color: Colors.white),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(5.0),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: 10,
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                                onPressed: () async {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) =>
                                            const Register_page()),
                                  );
                                },
                                child: Text(
                                  "Registrasi",
                                  style: GoogleFonts.ptSans(
                                      textStyle:
                                          Theme.of(context).textTheme.headline4,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: cnf.text_dark_color),
                                ),
                                style: ButtonStyle(
                                  shape: MaterialStateProperty.all<
                                          RoundedRectangleBorder>(
                                      RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(5.0),
                                  )),
                                  backgroundColor: MaterialStateProperty.all(
                                      Color(0xFF9BBEC8)),
                                  // padding: MaterialStateProperty.all(
                                  //     EdgeInsets.only(
                                  //         top: 17,
                                  //         bottom: 16,
                                  //         left: 20,
                                  //         right: 20)),
                                )),
                          ),
                        ],
                      )
                      // Row(
                      //   children: [
                      //     Text(
                      //       'Tidak punya akun?,  ',
                      //       style: GoogleFonts.ptSans(
                      //           textStyle:
                      //               Theme.of(context).textTheme.headline4,
                      //           fontSize: 13,
                      //           color: cnf.text_light_color),
                      //     ),
                      //     SizedBox(
                      //       width: 5,
                      //     ),
                      //     InkWell(
                      //       onTap: () {
                      //         Navigator.push(
                      //           context,
                      //           MaterialPageRoute(
                      //               builder: (context) =>
                      //                   const Register_page()),
                      //         );
                      //       },
                      //       child: new Text(
                      //         'DAFTAR SEKARANG',
                      //         style: GoogleFonts.ptSans(
                      //             textStyle:
                      //                 Theme.of(context).textTheme.headline4,
                      //             fontSize: 14,
                      //             fontWeight: FontWeight.bold,
                      //             color: cnf.text_light_color),
                      //       ),
                      //     ),
                      //   ],
                      // ),
                    ]),
              ),
              loader.isLoad == true ? CircularProgressWidget() : SizedBox(),
            ],
          ),
        ));
  }
}
