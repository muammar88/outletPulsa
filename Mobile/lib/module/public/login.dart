import 'package:alert_notification/alert_notification.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:outletpulsa/module/public/registration.dart';
import 'package:outletpulsa/provider/AuthenticationProvider.dart';
import 'package:provider/provider.dart';
import 'package:smart_alert_dialog/smart_alert_dialog.dart';
import 'package:outletpulsa/config/config.dart';
import 'package:outletpulsa/models/model_void.dart';
import 'package:outletpulsa/provider/BerandaProvider.dart';
import 'package:outletpulsa/provider/loadProvider.dart';
import 'package:outletpulsa/widget/CircularProgressWidget.dart';
import 'package:outletpulsa/module/member/main.dart';
import 'package:outletpulsa/module/public/reset_password.dart';
import 'package:outletpulsa/widget/loading_overlay.dart';

class Login_page extends StatefulWidget {
  const Login_page({super.key});

  @override
  State<Login_page> createState() => _Login_pageState();
}

class _Login_pageState extends State<Login_page>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  String? nomor_whatsapp;
  String? password;
  bool? _passwordVisible;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

    _passwordVisible = false;
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );
    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
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

  void _showSnackBar(String message, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor:
            isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        content: Text(
          message,
          style: GoogleFonts.poppins(
            fontSize: 13,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Colors.white,
        body: Consumer<Load_provider>(
          builder: (context, loader, child) => Stack(
            children: [
              Center(
                child: SingleChildScrollView(
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Form(
                        key: _formKey,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 30, vertical: 20),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Image.asset('assets/img/vertical-logo.png',
                                  width: 120, height: 120),
                              Text(
                                "OutletPulsa",
                                style: GoogleFonts.poppins(
                                    textStyle: Theme.of(context)
                                        .textTheme
                                        .headlineLarge,
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: cnf.text_navy_color),
                              ),
                              const SizedBox(height: 40),
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(30),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.grey.withOpacity(0.1),
                                      spreadRadius: 2,
                                      blurRadius: 15,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                                ),
                                child: TextFormField(
                                  onChanged: (text) =>
                                      setState(() => nomor_whatsapp = text),
                                  onSaved: (val) => nomor_whatsapp = val!,
                                  autocorrect: false,
                                  keyboardType: TextInputType.number,
                                  style: GoogleFonts.poppins(
                                      textStyle: Theme.of(context)
                                          .textTheme
                                          .headlineLarge,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.black87),
                                  decoration: InputDecoration(
                                    prefixIcon: const Icon(Icons.phone_android,
                                        color: Colors.grey),
                                    hintText: "Nomor Whatsapp",
                                    hintStyle:
                                        GoogleFonts.poppins(color: Colors.grey),
                                    floatingLabelBehavior:
                                        FloatingLabelBehavior.never,
                                    filled: true,
                                    fillColor: Colors.transparent,
                                    contentPadding: const EdgeInsets.symmetric(
                                        vertical: 20.0, horizontal: 20.0),
                                    border: InputBorder.none,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 25),
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(30),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.grey.withOpacity(0.1),
                                      spreadRadius: 2,
                                      blurRadius: 15,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                                ),
                                child: TextFormField(
                                  onChanged: (text) =>
                                      setState(() => password = text),
                                  onSaved: (val) => password = val,
                                  obscureText: !_passwordVisible!,
                                  enableSuggestions: false,
                                  autocorrect: false,
                                  style: GoogleFonts.poppins(
                                      textStyle: Theme.of(context)
                                          .textTheme
                                          .headlineLarge,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.black87),
                                  decoration: InputDecoration(
                                      prefixIcon: const Icon(Icons.lock_outline,
                                          color: Colors.grey),
                                      hintText: "Password",
                                      hintStyle:
                                          GoogleFonts.poppins(color: Colors.grey),
                                      floatingLabelBehavior:
                                          FloatingLabelBehavior.never,
                                      filled: true,
                                      fillColor: Colors.transparent,
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                              vertical: 20.0, horizontal: 20.0),
                                      border: InputBorder.none,
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _passwordVisible!
                                              ? Icons.visibility
                                              : Icons.visibility_off,
                                          color: Colors.grey.shade600,
                                        ),
                                        onPressed: () {
                                          setState(() {
                                            _passwordVisible =
                                                !_passwordVisible!;
                                          });
                                        },
                                      )),
                                ),
                              ),
                              const SizedBox(height: 35),
                              SizedBox(
                                width: double.infinity,
                                height: 55,
                                child: ElevatedButton(
                                    onPressed: () async {
                                      if (_formKey.currentState != null &&
                                          _formKey.currentState!.validate()) {
                                        var err = false;
                                        var err_msg = '';
                                        if (nomor_whatsapp == null ||
                                            nomor_whatsapp == '') {
                                          err_msg += 'Nomor whatsapp ';
                                          err = true;
                                        }
                                        if (password == null ||
                                            password == '') {
                                          if (err == true) {
                                            err_msg += '& ';
                                          }
                                          err_msg += 'Password ';
                                          err = true;
                                        }
                                        if (err == true) {
                                          err_msg += 'tidak boleh kosong.';
                                        }

                                        if (err == false) {
                                          loader.isLoad = true;
                                          final auth = Provider.of<
                                                  Authentication_provider>(
                                              context,
                                              listen: false);
                                          var feedBack =
                                              await auth.submit_login(
                                                  nomor_whatsapp!, password!);
                                          loader.isLoad = false;

                                          if (feedBack.error == false) {
                                            _showSnackBar(
                                                feedBack.errorMsg ??
                                                    'Login berhasil',
                                                isSuccess: true);
                                          } else {
                                            _showSnackBar(
                                                feedBack.errorMsg ??
                                                    'Gagal login',
                                                isSuccess: false);
                                          }
                                        } else {
                                          _showSnackBar(err_msg,
                                              isSuccess: false);
                                        }
                                      }
                                    },
                                    child: Text(
                                      "Login",
                                      style: GoogleFonts.poppins(
                                          textStyle: Theme.of(context)
                                              .textTheme
                                              .headlineMedium,
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(30.0),
                                      ),
                                      backgroundColor: cnf.btn_primary_color,
                                      elevation: 5,
                                      shadowColor: cnf.btn_primary_color
                                          .withOpacity(0.4),
                                    )),
                              ),
                              const SizedBox(height: 35),
                              Row(
                                children: [
                                  Expanded(
                                    child: Divider(
                                      color: Colors.grey.shade300,
                                      thickness: 1,
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 15),
                                    child: Text(
                                      "Atau",
                                      style: GoogleFonts.poppins(
                                          textStyle: Theme.of(context)
                                              .textTheme
                                              .headlineMedium,
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.grey.shade500),
                                    ),
                                  ),
                                  Expanded(
                                    child: Divider(
                                      color: Colors.grey.shade300,
                                      thickness: 1,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 35),
                              SizedBox(
                                width: double.infinity,
                                height: 55,
                                child: OutlinedButton(
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
                                    style: GoogleFonts.poppins(
                                        textStyle: Theme.of(context)
                                            .textTheme
                                            .headlineMedium,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: cnf.btn_primary_color),
                                  ),
                                  style: OutlinedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    side: BorderSide(
                                        color: cnf.btn_primary_color,
                                        width: 1.5),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(30.0),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 15),
                              SizedBox(
                                width: double.infinity,
                                height: 55,
                                child: ElevatedButton(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (context) =>
                                                const Register_page()),
                                      );
                                    },
                                    child: Text(
                                      "Registrasi",
                                      style: GoogleFonts.poppins(
                                          textStyle: Theme.of(context)
                                              .textTheme
                                              .headlineMedium,
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(30.0),
                                      ),
                                      backgroundColor: cnf.text_navy_color,
                                      elevation: 5,
                                      shadowColor:
                                          cnf.text_navy_color.withOpacity(0.4),
                                    )),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              loader.isLoad == true
                  ? CircularProgressWidget()
                  : const SizedBox(),
            ],
          ),
        ));
  }
}
