import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/config/config.dart';
import 'package:outletpulsa/provider/RegistrasiProvider.dart';
import 'package:outletpulsa/provider/loadProvider.dart';
import 'package:outletpulsa/widget/CircularProgressWidget.dart';
import 'package:outletpulsa/widget/loading_overlay.dart';

class ResetPassword extends StatefulWidget {
  const ResetPassword({super.key});

  @override
  State<ResetPassword> createState() => _ResetPasswordState();
}

class _ResetPasswordState extends State<ResetPassword>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final cnf = new ConfigApp();

  String? nomor_whatsapp;
  String? otp;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();

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

  Widget _buildInput({
    required String hintText,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    Widget? suffixIcon,
    required void Function(String?) onSaved,
    required void Function(String) onChanged,
    String? Function(String?)? validator,
  }) {
    return Container(
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
        onChanged: onChanged,
        onSaved: onSaved,
        validator: validator,
        autocorrect: false,
        obscureText: obscureText,
        enableSuggestions: !obscureText,
        keyboardType: keyboardType,
        style: GoogleFonts.poppins(
            textStyle: Theme.of(context).textTheme.headlineLarge,
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.black87),
        decoration: InputDecoration(
          prefixIcon: Icon(icon, color: Colors.grey),
          hintText: hintText,
          hintStyle: GoogleFonts.poppins(color: Colors.grey),
          floatingLabelBehavior: FloatingLabelBehavior.never,
          filled: true,
          fillColor: Colors.transparent,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 20.0, horizontal: 20.0),
          border: InputBorder.none,
          suffixIcon: suffixIcon,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
            child: Consumer<Load_provider>(
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
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.center,
                                        children: [
                                          Image.asset(
                                              'assets/img/vertical-logo.png',
                                              width: 100,
                                              height: 100),
                                          const SizedBox(height: 15),
                                          Text(
                                            "Reset Password",
                                            style: GoogleFonts.poppins(
                                                textStyle: Theme.of(context)
                                                    .textTheme
                                                    .headlineLarge,
                                                fontSize: 28,
                                                fontWeight: FontWeight.bold,
                                                color: cnf.text_navy_color),
                                          ),
                                          const SizedBox(height: 40),
                                          _buildInput(
                                            hintText: "Nomor Whatsapp",
                                            icon: Icons.phone_android,
                                            keyboardType: TextInputType.number,
                                            onChanged: (text) => setState(
                                                () => nomor_whatsapp = text),
                                            onSaved: (val) =>
                                                nomor_whatsapp = val!,
                                            validator: (text) {
                                              if (text == null || text.isEmpty)
                                                return 'Nomor Whatsapp tidak boleh kosong';
                                              return null;
                                            },
                                          ),
                                          const SizedBox(height: 25),
                                          Row(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Expanded(
                                                child: _buildInput(
                                                  hintText: "OTP",
                                                  icon: Icons.message_outlined,
                                                  keyboardType:
                                                      TextInputType.number,
                                                  onChanged: (text) => setState(
                                                      () => otp = text),
                                                  onSaved: (val) => otp = val!,
                                                  validator: (text) {
                                                    if (text == null ||
                                                        text.isEmpty)
                                                      return 'Token tidak boleh kosong';
                                                    return null;
                                                  },
                                                ),
                                              ),
                                              const SizedBox(width: 15),
                                              SizedBox(
                                                  height: 60,
                                                  child: ElevatedButton(
                                                    onPressed: () async {
                                                      var err = false;
                                                      var err_msg = '';
                                                      if (nomor_whatsapp ==
                                                              null ||
                                                          nomor_whatsapp ==
                                                              '') {
                                                        err_msg +=
                                                            'Nomor Whatsapp ';
                                                        err = true;
                                                      }
                                                      if (err == true)
                                                        err_msg +=
                                                            'tidak boleh kosong.';

                                                      if (err == false) {
                                                        loader.isLoad = true;
                                                        final reg = Provider.of<
                                                                Registrasi_provider>(
                                                            context,
                                                            listen: false);
                                                        var feedBack = await reg
                                                            .getOTPResetPassword(
                                                                nomor_whatsapp!);
                                                        loader.isLoad = false;

                                                        if (feedBack.error ==
                                                            false) {
                                                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                                              backgroundColor:
                                                                  Colors.teal,
                                                              behavior:
                                                                  SnackBarBehavior
                                                                      .floating,
                                                              content: Text(
                                                                  feedBack
                                                                      .errorMsg!,
                                                                  style: GoogleFonts.poppins(
                                                                      fontSize:
                                                                          12,
                                                                      color: Colors
                                                                          .white))));
                                                        } else {
                                                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                                              backgroundColor:
                                                                  const Color
                                                                      .fromARGB(
                                                                      255,
                                                                      163,
                                                                      57,
                                                                      49),
                                                              behavior:
                                                                  SnackBarBehavior
                                                                      .floating,
                                                              content: Text(
                                                                  feedBack
                                                                      .errorMsg!,
                                                                  style: GoogleFonts.poppins(
                                                                      fontSize:
                                                                          12,
                                                                      color: Colors.white))));
                                                        }
                                                      } else {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(SnackBar(
                                                                backgroundColor:
                                                                    const Color.fromARGB(
                                                                        255,
                                                                        163,
                                                                        57,
                                                                        49),
                                                                behavior:
                                                                    SnackBarBehavior
                                                                        .floating,
                                                                content: Text(
                                                                    err_msg,
                                                                    style: GoogleFonts.poppins(
                                                                        fontSize:
                                                                            12,
                                                                        color: Colors
                                                                            .white))));
                                                      }
                                                    },
                                                    child: Text("GET OTP",
                                                        style:
                                                            GoogleFonts.poppins(
                                                                fontSize: 14,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                                color: Colors
                                                                    .white)),
                                                    style: ElevatedButton.styleFrom(
                                                        shape: RoundedRectangleBorder(
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        30)),
                                                        backgroundColor:
                                                            cnf.text_navy_color,
                                                        elevation: 5,
                                                        shadowColor: cnf
                                                            .text_navy_color
                                                            .withOpacity(0.4)),
                                                  ))
                                            ],
                                          ),
                                          const SizedBox(height: 35),
                                          SizedBox(
                                            width: double.infinity,
                                            height: 55,
                                            child: ElevatedButton(
                                                onPressed: () async {
                                                  if (_formKey.currentState !=
                                                          null &&
                                                      _formKey.currentState!
                                                          .validate()) {
                                                    var err = false;
                                                    var err_msg = '';
                                                    if (nomor_whatsapp ==
                                                            null ||
                                                        nomor_whatsapp == '') {
                                                      err_msg +=
                                                          'Nomor whatsapp tidak boleh kosong.\n';
                                                      err = true;
                                                    }
                                                    if (otp == null ||
                                                        otp == '') {
                                                      err_msg +=
                                                          'OTP tidak boleh kosong.\n';
                                                      err = true;
                                                    }

                                                    if (err == false) {
                                                      loader.isLoad = true;
                                                      final reg_to = Provider
                                                          .of<Registrasi_provider>(
                                                              context,
                                                              listen: false);
                                                      var feedBack = await reg_to
                                                          .resetPassword(
                                                              nomor_whatsapp!,
                                                              otp!);
                                                      loader.isLoad = false;

                                                      if (feedBack.error ==
                                                          false) {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(SnackBar(
                                                                backgroundColor:
                                                                    Colors.teal,
                                                                behavior:
                                                                    SnackBarBehavior
                                                                        .floating,
                                                                content: Text(
                                                                    feedBack
                                                                        .errorMsg!,
                                                                    style: GoogleFonts.poppins(
                                                                        fontSize:
                                                                            12,
                                                                        color: Colors
                                                                            .white))));
                                                        Navigator.of(context)
                                                            .pop();
                                                      } else {
                                                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                                            backgroundColor:
                                                                const Color.fromARGB(
                                                                    255,
                                                                    163,
                                                                    57,
                                                                    49),
                                                            behavior:
                                                                SnackBarBehavior
                                                                    .floating,
                                                            content: Text(
                                                                feedBack
                                                                    .errorMsg!,
                                                                style: GoogleFonts.poppins(
                                                                    fontSize:
                                                                        12,
                                                                    color: Colors
                                                                        .white))));
                                                      }
                                                    } else {
                                                      ScaffoldMessenger.of(context)
                                                          .showSnackBar(SnackBar(
                                                              backgroundColor:
                                                                  const Color.fromARGB(
                                                                      255,
                                                                      163,
                                                                      57,
                                                                      49),
                                                              behavior:
                                                                  SnackBarBehavior
                                                                      .floating,
                                                              content: Text(
                                                                  err_msg
                                                                      .trim(),
                                                                  style: GoogleFonts.poppins(
                                                                      fontSize:
                                                                          12,
                                                                      color: Colors
                                                                          .white))));
                                                    }
                                                  }
                                                },
                                                child: Text(
                                                  "Reset Password",
                                                  style: GoogleFonts.poppins(
                                                      fontSize: 18,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: Colors.white),
                                                ),
                                                style: ElevatedButton.styleFrom(
                                                  shape: RoundedRectangleBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              30.0)),
                                                  backgroundColor:
                                                      cnf.text_navy_color,
                                                  elevation: 5,
                                                  shadowColor: cnf
                                                      .text_navy_color
                                                      .withOpacity(0.4),
                                                )),
                                          ),
                                          const SizedBox(height: 30),
                                        ],
                                      )),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                            top: 15,
                            left: 15,
                            child: Container(
                                decoration: BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.05),
                                        blurRadius: 10,
                                        spreadRadius: 2,
                                      )
                                    ]),
                                child: IconButton(
                                  icon: Padding(
                                    padding: const EdgeInsets.only(left: 6.0),
                                    child: Icon(Icons.arrow_back_ios,
                                        color: cnf.text_navy_color, size: 20),
                                  ),
                                  onPressed: () => Navigator.pop(context),
                                ))),
                        loader.isLoad == true
                            ? CircularProgressWidget()
                            : const SizedBox(),
                      ],
                    ))));
  }
}
