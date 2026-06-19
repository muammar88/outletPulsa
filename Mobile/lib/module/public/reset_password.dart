import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'package:outletpulsa/config/config.dart';
import 'package:outletpulsa/provider/RegistrasiProvider.dart';
import 'package:outletpulsa/provider/loadProvider.dart';
import 'package:outletpulsa/widget/CircularProgressWidget.dart';
import 'package:outletpulsa/module/public/login.dart';

const _kPrimary = Color(0xFF0F1F6E);
const _kPrimaryLight = Color(0xFF1A3DB5);

/// Breakpoint untuk wide layout (tablet / web / desktop)
const _kWideBreakpoint = 700.0;

class ResetPassword extends StatefulWidget {
  const ResetPassword({super.key});

  @override
  State<ResetPassword> createState() => _ResetPasswordState();
}

class _ResetPasswordState extends State<ResetPassword>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();

  String? nomor_whatsapp;
  String? otp;

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
    _fadeAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
    _slideAnim =
        Tween<Offset>(begin: const Offset(0, 0.12), end: Offset.zero).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  final cnf = ConfigApp();

  // ── Snackbar Helper ──────────────────────────
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

  // ── Get OTP ──────────────────────────────────
  Future<void> _getOTP(Load_provider loader) async {
    if (nomor_whatsapp == null || nomor_whatsapp!.isEmpty) {
      _showSnackBar('Nomor WhatsApp tidak boleh kosong', isSuccess: false);
      return;
    }
    loader.isLoad = true;
    final reg = Provider.of<Registrasi_provider>(context, listen: false);
    final feedBack = await reg.getOTPResetPassword(nomor_whatsapp!);
    loader.isLoad = false;
    _showSnackBar(feedBack.errorMsg ?? '', isSuccess: feedBack.error == false);
  }

  // ── Submit Reset ──────────────────────────────
  Future<void> _doReset(Load_provider loader) async {
    if (_formKey.currentState == null || !_formKey.currentState!.validate())
      return;

    var errMsg = '';
    if (nomor_whatsapp == null || nomor_whatsapp!.isEmpty)
      errMsg += 'Nomor WhatsApp tidak boleh kosong.\n';
    if (otp == null || otp!.isEmpty) errMsg += 'OTP tidak boleh kosong.\n';

    if (errMsg.isNotEmpty) {
      _showSnackBar(errMsg.trim(), isSuccess: false);
      return;
    }

    loader.isLoad = true;
    final reg = Provider.of<Registrasi_provider>(context, listen: false);
    final feedBack = await reg.resetPassword(nomor_whatsapp!, otp!);
    loader.isLoad = false;

    _showSnackBar(feedBack.errorMsg ?? '', isSuccess: feedBack.error == false);
    if (feedBack.error == false) {
      Navigator.of(context).pop();
    }
  }

  // ─── Brand Panel (kiri pada wide layout) ───────────────────────
  Widget _buildBrandPanel({bool compact = false}) {
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
            // Dekorasi lingkaran
            Positioned(
                top: -50, right: -50, child: _Circle(size: 200, opacity: 0.05)),
            Positioned(
                top: 50, right: 50, child: _Circle(size: 90, opacity: 0.06)),
            Positioned(
                bottom: -40, left: -40, child: _Circle(size: 130, opacity: 0.04)),

            // Tombol Back
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
                    border: Border.all(color: Colors.white24, width: 1),
                  ),
                  child: const Icon(
                    TablerIcons.arrow_left,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ),

            Center(
              child: Padding(
                padding: EdgeInsets.all(compact ? 24.0 : 48.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: EdgeInsets.all(compact ? 16 : 20),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(compact ? 20 : 28),
                        border: Border.all(color: Colors.white24),
                      ),
                      child: Icon(
                        TablerIcons.lock_off,
                        color: Colors.white,
                        size: compact ? 48 : 64,
                      ),
                    ),
                    SizedBox(height: compact ? 16 : 24),
                    Text(
                      'Lupa Password?',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: compact ? 22 : 32,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Jangan khawatir! Anda bisa mereset password via WhatsApp.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: compact ? 12 : 14,
                        color: Colors.white70,
                        height: 1.5,
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

  // ─── Form Card ─────────────────────────────────────────────────
  Widget _buildFormCard(Load_provider loader, {bool isWide = false}) {
    return Container(
      width: double.infinity,
      constraints: BoxConstraints(maxWidth: isWide ? 420 : 480),
      padding: EdgeInsets.fromLTRB(
          isWide ? 40 : 24, isWide ? 40 : 28, isWide ? 40 : 24, 32),
      decoration: isWide
          ? null
          : BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: _kPrimary.withOpacity(0.18),
                  blurRadius: 40,
                  offset: const Offset(0, 16),
                ),
              ],
            ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Nomor WA ──
            _FieldLabel('Nomor WhatsApp Terdaftar'),
            const SizedBox(height: 8),
            AuthInput(
              hintText: 'Contoh: 08xxxxxxxxxx',
              icon: TablerIcons.device_mobile,
              keyboardType: TextInputType.number,
              onChanged: (v) => setState(() => nomor_whatsapp = v),
              onSaved: (v) => nomor_whatsapp = v!,
              validator: (v) {
                if (v == null || v.isEmpty)
                  return 'Nomor WA tidak boleh kosong';
                if (v.length < 10 || v.length > 13)
                  return 'Format nomor WA tidak sesuai';
                return null;
              },
            ),
            const SizedBox(height: 18),

            // ── OTP Row ──
            _FieldLabel('Kode OTP'),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: AuthInput(
                    hintText: 'Masukkan OTP',
                    icon: TablerIcons.message_2,
                    keyboardType: TextInputType.number,
                    onChanged: (v) => setState(() => otp = v),
                    onSaved: (v) => otp = v!,
                    validator: (v) => (v == null || v.isEmpty)
                        ? 'OTP tidak boleh kosong'
                        : null,
                  ),
                ),
                const SizedBox(width: 10),
                // Tombol Get OTP
                SizedBox(
                  height: 52,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [_kPrimary, _kPrimaryLight],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: _kPrimary.withOpacity(0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: () => _getOTP(loader),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Text(
                        'Kirim OTP',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // ── Tombol Reset ──
            SizedBox(
              width: double.infinity,
              height: 52,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [_kPrimary, _kPrimaryLight],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: _kPrimary.withOpacity(0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: () => _doReset(loader),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    'Reset Password Baru',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // ── Link ke Login ──
            Center(
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: RichText(
                  text: TextSpan(
                    style: GoogleFonts.poppins(fontSize: 13),
                    children: [
                      TextSpan(
                        text: 'Ingat password Anda? ',
                        style: TextStyle(color: Colors.grey.shade500),
                      ),
                      const TextSpan(
                        text: 'Masuk di sini',
                        style: TextStyle(
                          color: _kPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
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
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: const Color(0xFFF0F2F8),
        body: Consumer<Load_provider>(
          builder: (context, loader, _) => Stack(
            children: [
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth >= _kWideBreakpoint;

                  // ── WIDE: 2-column layout ───────────────────
                  if (isWide) {
                    return Row(
                      children: [
                        // Kiri: Brand panel
                        Expanded(
                          flex: 5,
                          child: _buildBrandPanel(),
                        ),
                        // Kanan: Form
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

                  // ── NARROW: 1-column layout ─────────────────
                  return SafeArea(
                    top: false,
                    child: LayoutBuilder(
                      builder: (context, safeConstraints) {
                        return SingleChildScrollView(
                          physics: const BouncingScrollPhysics(),
                          child: ConstrainedBox(
                            constraints: BoxConstraints(
                              minHeight: safeConstraints.maxHeight,
                            ),
                            child: IntrinsicHeight(
                              child: FadeTransition(
                                opacity: _fadeAnim,
                                child: SlideTransition(
                                  position: _slideAnim,
                                  child: Column(
                                    children: [
                                      // Gradient header (compact brand)
                                      _buildBrandPanel(compact: true),

                                      // Remaining area: Form + Footer
                                      Expanded(
                                        child: Container(
                                          width: double.infinity,
                                          color: const Color(0xFFF0F2F8),
                                          child: Column(
                                            children: [
                                              // Card area (centered vertically)
                                              Expanded(
                                                child: Center(
                                                  child: Padding(
                                                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
                                                    child: Transform.translate(
                                                      offset: const Offset(0, -20),
                                                      child: Container(
                                                        decoration: BoxDecoration(
                                                          color: Colors.white,
                                                          borderRadius: BorderRadius.circular(28),
                                                          boxShadow: [
                                                            BoxShadow(
                                                              color: _kPrimary.withOpacity(0.12),
                                                              blurRadius: 30,
                                                              offset: const Offset(0, 10),
                                                            ),
                                                          ],
                                                        ),
                                                        child: _buildFormCard(loader),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),

                                              // Footer
                                              Container(
                                                width: double.infinity,
                                                padding: const EdgeInsets.only(bottom: 24),
                                                child: Text(
                                                  '© 2024 OutletPulsa',
                                                  textAlign: TextAlign.center,
                                                  style: GoogleFonts.poppins(
                                                    fontSize: 11,
                                                    color: Colors.grey.shade400,
                                                  ),
                                                ),
                                              ),
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
              ),

              // Loading overlay
              if (loader.isLoad == true) CircularProgressWidget(),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Shared Widgets (lokal)
// ─────────────────────────────────────────────
class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Text(
        text,
        style: GoogleFonts.poppins(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: const Color(0xFF374151),
        ),
      );
}

class _Circle extends StatelessWidget {
  const _Circle({required this.size, required this.opacity});
  final double size;
  final double opacity;
  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withOpacity(opacity),
        ),
      );
}
