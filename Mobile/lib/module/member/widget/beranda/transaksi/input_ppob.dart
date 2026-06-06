import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/TransactionProvider.dart';
import '../../../../../provider/loadProvider.dart';
import '../../../../../widget/CircularProgressWidget.dart';
import 'daftar_operator.dart';
import 'daftar_produk.dart';

class Input_ppob extends StatefulWidget {
  const Input_ppob({
    required this.label,
    required this.path,
    required this.title,
    required this.tipe,
    required this.checkPrefix,
    super.key,
  });

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
    bool isPrabayar = widget.tipe == 'prabayar';
    String inputLabel = isPrabayar ? 'Nomor Tujuan' : 'ID Pelanggan';
    IconData inputIcon =
        isPrabayar ? TablerIcons.device_mobile : TablerIcons.id;

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        elevation: 0,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF1F2AAA), Color(0xFF3A47C5)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(TablerIcons.arrow_left, color: Colors.white),
        ),
        centerTitle: true,
        title: Text(
          widget.title,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
      ),
      body: Consumer<Load_provider>(
        builder: (context, loader, child) => Stack(
          children: [
            Form(
              key: _formKey,
              child: ListView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(20),
                children: [
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1F2AAA).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(inputIcon,
                                  color: const Color(0xFF1F2AAA), size: 20),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Masukkan $inputLabel',
                              style: GoogleFonts.poppins(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF1A1A2E),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        TextFormField(
                          onChanged: (text) => setState(() => nomor_tujuan = text),
                          onSaved: (val) => nomor_tujuan = val!,
                          enableSuggestions: false,
                          autocorrect: false,
                          keyboardType: TextInputType.number,
                          style: GoogleFonts.poppins(
                            fontSize: 15,
                            fontWeight: FontWeight.w500,
                            color: const Color(0xFF1A1A2E),
                          ),
                          decoration: InputDecoration(
                            hintText: 'Contoh: ${isPrabayar ? "08123456789" : "1234567890"}',
                            hintStyle: GoogleFonts.poppins(
                              fontSize: 13,
                              color: Colors.grey[400],
                            ),
                            floatingLabelBehavior: FloatingLabelBehavior.never,
                            filled: true,
                            fillColor: const Color(0xFFF8F9FA),
                            contentPadding: const EdgeInsets.symmetric(
                                vertical: 16.0, horizontal: 16.0),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: Colors.grey.shade200,
                                width: 1.5,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(
                                color: Color(0xFF1F2AAA),
                                width: 1.5,
                              ),
                            ),
                            prefixIcon: Icon(
                              isPrabayar ? TablerIcons.phone : TablerIcons.hash,
                              color: Colors.grey[400],
                              size: 20,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        GestureDetector(
                          onTap: () async {
                            var err = false;
                            var err_msg = '';
                            if (nomor_tujuan == null ||
                                nomor_tujuan!.trim().isEmpty) {
                              err_msg = '$inputLabel wajib diisi';
                              err = true;
                            }
                            if (err == false) {
                              loader.isLoad = true;
                              if (widget.checkPrefix == false) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => Daftar_produk(
                                      nomor_tujuan: nomor_tujuan!,
                                      label: widget.label,
                                      path: widget.path,
                                      title: widget.title,
                                      tipe: widget.tipe,
                                      prefix: widget.checkPrefix,
                                    ),
                                  ),
                                );
                                loader.isLoad = false;
                              } else {
                                final trans = Provider.of<Transaction_provider>(
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
                                        builder: (context) => Daftar_operator(
                                          nomor_tujuan: nomor_tujuan!,
                                          label: widget.label,
                                          path: widget.path,
                                          title: widget.title,
                                          tipe: widget.tipe,
                                          prefix: widget.checkPrefix,
                                        ),
                                      ),
                                    );
                                  } else {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => Daftar_produk(
                                          nomor_tujuan: nomor_tujuan!,
                                          label: widget.label,
                                          path: widget.path,
                                          title: widget.title,
                                          tipe: widget.tipe,
                                          prefix: true,
                                        ),
                                      ),
                                    );
                                  }
                                } else {
                                  loader.isLoad = false;
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      backgroundColor: const Color(0xFFD32F2F),
                                      behavior: SnackBarBehavior.floating,
                                      shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10)),
                                      content: Text(
                                        trans.errorMsg!,
                                        style: GoogleFonts.poppins(
                                          fontSize: 13,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  );
                                }
                              }
                            } else {
                              loader.isLoad = false;
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  backgroundColor: const Color(0xFFD32F2F),
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10)),
                                  content: Text(
                                    err_msg,
                                    style: GoogleFonts.poppins(
                                      fontSize: 13,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              );
                            }
                          },
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF1F2AAA), Color(0xFF3A47C5)],
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color:
                                      const Color(0xFF1F2AAA).withOpacity(0.3),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  "Lanjutkan",
                                  style: GoogleFonts.poppins(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Icon(TablerIcons.arrow_right,
                                    size: 18, color: Colors.white),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            if (loader.isLoad == true) CircularProgressWidget() else const SizedBox(),
          ],
        ),
      ),
    );
  }
}
