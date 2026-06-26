import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:flutter_native_contact_picker/flutter_native_contact_picker.dart';
import 'package:flutter_native_contact_picker/model/contact.dart';

import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/TransactionProvider.dart';
import 'package:outletpulsa/shared/providers/loadProvider.dart';
import 'package:outletpulsa/shared/widgets/CircularProgressWidget.dart';
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

class _Input_ppobState extends State<Input_ppob>
    with SingleTickerProviderStateMixin {
  final config = ConfigApp();
  final _formKey = GlobalKey<FormState>();
  String? nomor_tujuan;
  final TextEditingController _nomorController = TextEditingController();
  final FlutterNativeContactPicker _contactPicker = FlutterNativeContactPicker();

  static const double _kWideBreakpoint = 700.0;
  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
    _slideAnim =
        Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    _nomorController.dispose();
    super.dispose();
  }

  void _showSnackBar(String message, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor:
            isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: Row(
          children: [
            Icon(
              isSuccess ? TablerIcons.circle_check : TablerIcons.alert_circle,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(message,
                  style:
                      GoogleFonts.poppins(fontSize: 13, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitForm(Load_provider loader) async {
    bool isPrabayar = widget.tipe == 'prabayar';
    String inputLabel = isPrabayar ? 'Nomor Tujuan' : 'ID Pelanggan';

    var err = false;
    var err_msg = '';

    if (nomor_tujuan == null || nomor_tujuan!.trim().isEmpty) {
      err_msg = '$inputLabel wajib diisi';
      err = true;
    }

    if (!err) {
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
        final trans = Provider.of<Transaction_provider>(context, listen: false);
        await trans.getPrefix(nomor_tujuan!, widget.path);

        if (trans.error == false) {
          loader.isLoad = false;
          if (widget.path == 'PD' || widget.path == 'PTP') {
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
                  path: trans.operatorCode ?? widget.path,
                  title: widget.title,
                  tipe: widget.tipe,
                  prefix: true,
                ),
              ),
            );
          }
        } else {
          loader.isLoad = false;
          _showSnackBar(trans.errorMsg ?? 'Terjadi kesalahan',
              isSuccess: false);
        }
      }
    } else {
      loader.isLoad = false;
      _showSnackBar(err_msg, isSuccess: false);
    }
  }

  IconData _getCategoryIcon(String path) {
    switch (path) {
      case 'PIU':
        return TablerIcons.device_mobile;
      case 'PT':
        return TablerIcons.arrows_exchange;
      case 'PD':
        return TablerIcons.wifi;
      case 'PTP':
        return TablerIcons.phone_call;
      case 'PS':
        return TablerIcons.message;
      case 'PI':
        return TablerIcons.world;
      case 'TLOF':
        return TablerIcons.bolt;
      case 'UD':
        return TablerIcons.wallet;
      case 'WIFI':
        return TablerIcons.router;
      case 'ET':
        return TablerIcons.car;
      default:
        return TablerIcons.category;
    }
  }

  Widget _buildBrandPanel({bool compact = false}) {
    bool isPrabayar = widget.tipe == 'prabayar';
    IconData headerIcon = _getCategoryIcon(widget.path);

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [_kPrimary, _kPrimaryLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Stack(
          children: [
            Positioned(
                top: -50, right: -50, child: _Circle(size: 200, opacity: 0.05)),
            Positioned(
                top: 50, right: 50, child: _Circle(size: 90, opacity: 0.06)),
            Positioned(
                bottom: -40,
                left: -40,
                child: _Circle(size: 130, opacity: 0.04)),
            Positioned(
              top: compact ? 0 : 16,
              left: compact ? 0 : 16,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 40,
                  height: 40,
                  margin: compact ? const EdgeInsets.all(16) : EdgeInsets.zero,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(TablerIcons.arrow_left,
                      color: Colors.white, size: 20),
                ),
              ),
            ),
            Center(
              child: Padding(
                padding: EdgeInsets.symmetric(
                    horizontal: 32, vertical: compact ? 48 : 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: Colors.white.withOpacity(0.2), width: 1.5),
                      ),
                      child: Icon(headerIcon, size: 40, color: Colors.white),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      widget.title,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: compact ? 28 : 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      isPrabayar
                          ? 'Masukkan nomor tujuan untuk melanjutkan transaksi'
                          : 'Masukkan ID pelanggan untuk melanjutkan transaksi',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: compact ? 13 : 15,
                        color: Colors.white.withOpacity(0.85),
                        height: 1.5,
                      ),
                    ),
                    if (compact) const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFormCard(Load_provider loader, {bool isWide = false}) {
    bool isPrabayar = widget.tipe == 'prabayar';
    String inputLabel = isPrabayar ? 'Nomor Tujuan' : 'ID Pelanggan';
    IconData inputIcon = _getCategoryIcon(widget.path);

    return Form(
      key: _formKey,
      child: Container(
        padding: EdgeInsets.all(isWide ? 40 : 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          boxShadow: isWide
              ? [
                  BoxShadow(
                    color: _kPrimary.withOpacity(0.08),
                    blurRadius: 40,
                    offset: const Offset(0, 15),
                  )
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(inputIcon, color: _kPrimary.withOpacity(0.7), size: 20),
                const SizedBox(width: 8),
                Text(
                  'Masukkan $inputLabel',
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: _kPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nomorController,
              onChanged: (text) => setState(() => nomor_tujuan = text),
              onSaved: (val) => nomor_tujuan = val!,
              enableSuggestions: false,
              autocorrect: false,
              keyboardType: TextInputType.number,
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF1A1A2E),
              ),
              decoration: InputDecoration(
                hintText:
                    isPrabayar ? "Contoh: 08123456789" : "Contoh: 1234567890",
                hintStyle: GoogleFonts.poppins(
                  fontSize: 14,
                  color: Colors.grey[400],
                  fontWeight: FontWeight.w400,
                ),
                filled: true,
                fillColor: const Color(0xFFF8F9FA),
                contentPadding: const EdgeInsets.symmetric(
                    vertical: 18.0, horizontal: 20.0),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide:
                      BorderSide(color: Colors.grey.shade200, width: 1.5),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: _kPrimary, width: 2),
                ),
                prefixIcon: Padding(
                  padding: const EdgeInsets.only(left: 16, right: 12),
                  child: Icon(
                    isPrabayar ? TablerIcons.phone : TablerIcons.hash,
                    color: Colors.grey[400],
                    size: 22,
                  ),
                ),
                prefixIconConstraints: const BoxConstraints(minWidth: 40),
                suffixIcon: IconButton(
                  icon: const Icon(TablerIcons.address_book, color: _kPrimary),
                  onPressed: () async {
                    Contact? contact = await _contactPicker.selectContact();
                    if (contact != null && contact.phoneNumbers != null && contact.phoneNumbers!.isNotEmpty) {
                      String phone = contact.phoneNumbers!.first.replaceAll(RegExp(r'[^\d+]'), '');
                      if (phone.startsWith('+62')) {
                        phone = '0${phone.substring(3)}';
                      } else if (phone.startsWith('62')) {
                        phone = '0${phone.substring(2)}';
                      }
                      setState(() {
                        nomor_tujuan = phone;
                        _nomorController.text = phone;
                      });
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 36),
            GestureDetector(
              onTap: loader.isLoad == true ? null : () => _submitForm(loader),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 18),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: loader.isLoad == true
                        ? [Colors.grey.shade400, Colors.grey.shade500]
                        : [_kPrimary, _kPrimaryLight],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: loader.isLoad == true
                      ? null
                      : [
                          BoxShadow(
                            color: _kPrimary.withOpacity(0.3),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (loader.isLoad == true)
                      const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2.5,
                        ),
                      )
                    else
                      const Icon(TablerIcons.arrow_right,
                          size: 22, color: Colors.white),
                    const SizedBox(width: 10),
                    Text(
                      loader.isLoad == true ? "Memproses..." : "Lanjutkan",
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      body: Consumer<Load_provider>(
        builder: (context, loader, child) {
          return LayoutBuilder(
            builder: (context, constraints) {
              bool isWide = constraints.maxWidth >= _kWideBreakpoint;

              if (isWide) {
                return Row(
                  children: [
                    Expanded(flex: 5, child: _buildBrandPanel()),
                    Expanded(
                      flex: 6,
                      child: Container(
                        color: Colors.white,
                        child: SafeArea(
                          child: Center(
                            child: SingleChildScrollView(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 48, vertical: 32),
                              physics: const BouncingScrollPhysics(),
                              child: FadeTransition(
                                opacity: _fadeAnim,
                                child: SlideTransition(
                                  position: _slideAnim,
                                  child: _buildFormCard(loader, isWide: true),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              }

              return SafeArea(
                top: false,
                child: LayoutBuilder(
                  builder: (context, safeConstraints) {
                    return SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                            minHeight: safeConstraints.maxHeight),
                        child: IntrinsicHeight(
                          child: FadeTransition(
                            opacity: _fadeAnim,
                            child: SlideTransition(
                              position: _slideAnim,
                              child: Column(
                                children: [
                                  _buildBrandPanel(compact: true),
                                  Expanded(
                                    child: Container(
                                      width: double.infinity,
                                      color: const Color(0xFFF0F2F8),
                                      child: Column(
                                        children: [
                                          Transform.translate(
                                            offset: const Offset(0, -30),
                                            child: Padding(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 20),
                                              child: Container(
                                                decoration: BoxDecoration(
                                                  color: Colors.white,
                                                  borderRadius:
                                                      BorderRadius.circular(28),
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: _kPrimary
                                                          .withOpacity(0.08),
                                                      blurRadius: 30,
                                                      offset:
                                                          const Offset(0, 10),
                                                    ),
                                                  ],
                                                ),
                                                child: _buildFormCard(loader),
                                              ),
                                            ),
                                          ),
                                          const Spacer(),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _Circle extends StatelessWidget {
  final double size;
  final double opacity;

  const _Circle({required this.size, required this.opacity});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withOpacity(opacity),
      ),
    );
  }
}
