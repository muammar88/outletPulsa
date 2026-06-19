import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
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

const _kPrimary      = Color(0xFF0F1F6E);
const _kPrimaryLight = Color(0xFF1A3DB5);

/// Breakpoint untuk wide layout (tablet / web / desktop)
const _kWideBreakpoint = 700.0;

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
  bool _passwordVisible = false;

  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900));
    _fadeAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(parent: _animController, curve: Curves.easeOut));
    _slideAnim =
        Tween<Offset>(begin: const Offset(0, 0.12), end: Offset.zero)
            .animate(CurvedAnimation(
                parent: _animController, curve: Curves.easeOutCubic));
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  final cnf = ConfigApp();

  void _showSnackBar(String message, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      backgroundColor:
          isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      content: Row(children: [
        Icon(
          isSuccess ? TablerIcons.circle_check : TablerIcons.alert_circle,
          color: Colors.white,
          size: 18,
        ),
        const SizedBox(width: 10),
        Expanded(
            child: Text(message,
                style: GoogleFonts.poppins(
                    fontSize: 13, color: Colors.white))),
      ]),
    ));
  }

  Future<void> _doLogin(Load_provider loader) async {
    if (_formKey.currentState == null ||
        !_formKey.currentState!.validate()) return;

    var errMsg = '';
    if (nomor_whatsapp == null || nomor_whatsapp!.isEmpty)
      errMsg += 'Nomor WhatsApp tidak boleh kosong. ';
    if (password == null || password!.isEmpty)
      errMsg += 'Password tidak boleh kosong.';
    if (errMsg.isNotEmpty) {
      _showSnackBar(errMsg.trim(), isSuccess: false);
      return;
    }

    loader.isLoad = true;
    final auth =
        Provider.of<Authentication_provider>(context, listen: false);
    final feedBack = await auth.submit_login(nomor_whatsapp!, password!);
    loader.isLoad = false;

    _showSnackBar(
      feedBack.errorMsg ??
          (feedBack.error == false ? 'Login berhasil' : 'Gagal login'),
      isSuccess: feedBack.error == false,
    );
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
      child: Stack(
        children: [
          // Dekorasi lingkaran
          Positioned(top: -60, right: -60,
              child: _Circle(size: 220, opacity: 0.05)),
          Positioned(top: 60, right: 40,
              child: _Circle(size: 100, opacity: 0.06)),
          Positioned(bottom: -40, left: -40,
              child: _Circle(size: 160, opacity: 0.04)),

          Center(
            child: Padding(
              padding: EdgeInsets.all(compact ? 32.0 : 48.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    margin: EdgeInsets.only(top: compact ? 24 : 0),
                    padding: EdgeInsets.all(compact ? 14 : 20),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.12),
                      borderRadius:
                          BorderRadius.circular(compact ? 20 : 28),
                      border: Border.all(color: Colors.white24),
                    ),
                    child: Image.asset(
                      'assets/img/vertical-logo.png',
                      width: compact ? 56 : 80,
                      height: compact ? 56 : 80,
                      errorBuilder: (_, __, ___) => Icon(
                        TablerIcons.bolt,
                        color: Colors.white,
                        size: compact ? 48 : 64,
                      ),
                    ),
                  ),
                  SizedBox(height: compact ? 16 : 24),
                  Text(
                    'OutletPulsa',
                    style: GoogleFonts.poppins(
                      fontSize: compact ? 24 : 32,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Platform top-up & pembayaran\nterpercaya',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      fontSize: compact ? 12 : 14,
                      color: Colors.white70,
                      height: 1.5,
                    ),
                  ),
                  if (!compact) ...[
                    const SizedBox(height: 40),
                    _FeatureItem(
                        icon: TablerIcons.bolt,
                        text: 'Pulsa & Paket Data Instan'),
                    const SizedBox(height: 14),
                    _FeatureItem(
                        icon: TablerIcons.receipt,
                        text: 'Bayar Tagihan Mudah'),
                    const SizedBox(height: 14),
                    _FeatureItem(
                        icon: TablerIcons.shield_check,
                        text: 'Transaksi Aman & Terjamin'),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Form Card ─────────────────────────────────────────────────
  Widget _buildFormCard(Load_provider loader,
      {bool isWide = false}) {
    return Container(
      width: double.infinity,
      constraints: BoxConstraints(maxWidth: isWide ? 420 : 480),
      padding: EdgeInsets.fromLTRB(
          isWide ? 40 : 24, isWide ? 40 : 32, isWide ? 40 : 24, 32),
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
            Text('Masuk ke Akun',
                style: GoogleFonts.poppins(
                    fontSize: isWide ? 28 : 22,
                    fontWeight: FontWeight.w800,
                    color: _kPrimary)),
            const SizedBox(height: 4),
            Text('Selamat datang kembali 👋',
                style: GoogleFonts.poppins(
                    fontSize: 13, color: Colors.grey.shade500)),
            const SizedBox(height: 28),

            // Nomor WA
            _FieldLabel('Nomor WhatsApp'),
            const SizedBox(height: 8),
            AuthInput(
              hintText: 'Contoh: 08xxxxxxxxxx',
              icon: TablerIcons.device_mobile,
              keyboardType: TextInputType.number,
              onChanged: (v) => nomor_whatsapp = v,
              onSaved: (v) => nomor_whatsapp = v!,
            ),
            const SizedBox(height: 20),

            // Password
            _FieldLabel('Password'),
            const SizedBox(height: 8),
            AuthInput(
              hintText: 'Masukkan password',
              icon: TablerIcons.lock,
              obscureText: !_passwordVisible,
              onChanged: (v) => password = v,
              onSaved: (v) => password = v,
              suffixIcon: IconButton(
                icon: Icon(
                  _passwordVisible
                      ? TablerIcons.eye
                      : TablerIcons.eye_off,
                  color: Colors.grey.shade500,
                  size: 20,
                ),
                onPressed: () =>
                    setState(() => _passwordVisible = !_passwordVisible),
              ),
            ),
            const SizedBox(height: 32),

            // Tombol Login
            _GradientButton(
              label: 'Masuk',
              onPressed: () => _doLogin(loader),
            ),
            const SizedBox(height: 20),

            // Divider
            Row(children: [
              Expanded(
                  child: Divider(
                      color: Colors.grey.shade200, thickness: 1)),
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12),
                child: Text('atau',
                    style: GoogleFonts.poppins(
                        fontSize: 12,
                        color: Colors.grey.shade400)),
              ),
              Expanded(
                  child: Divider(
                      color: Colors.grey.shade200, thickness: 1)),
            ]),
            const SizedBox(height: 20),

            // Lupa Password
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton(
                onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const ResetPassword())),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(
                      color: _kPrimary.withOpacity(0.3), width: 1.5),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: Text('Lupa Password',
                    style: GoogleFonts.poppins(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: _kPrimary)),
              ),
            ),
            const SizedBox(height: 12),

            // Registrasi
            SizedBox(
              width: double.infinity,
              height: 52,
              child: TextButton(
                onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const Register_page())),
                style: TextButton.styleFrom(
                  backgroundColor: _kPrimary.withOpacity(0.06),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: RichText(
                  text: TextSpan(
                    style: GoogleFonts.poppins(fontSize: 13),
                    children: [
                      TextSpan(
                          text: 'Belum punya akun? ',
                          style: TextStyle(
                              color: Colors.grey.shade600)),
                      const TextSpan(
                        text: 'Daftar Sekarang',
                        style: TextStyle(
                            color: _kPrimary,
                            fontWeight: FontWeight.w700),
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
                                  physics:
                                      const BouncingScrollPhysics(),
                                  child: FadeTransition(
                                    opacity: _fadeAnim,
                                    child: SlideTransition(
                                      position: _slideAnim,
                                      child: _buildFormCard(loader,
                                          isWide: true),
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
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: FadeTransition(
                        opacity: _fadeAnim,
                        child: SlideTransition(
                          position: _slideAnim,
                          child: Column(
                            children: [
                              // Gradient header (compact brand)
                              _buildBrandPanel(compact: true),

                              // White area with form card
                              Container(
                                color: const Color(0xFFF0F2F8),
                                padding: const EdgeInsets.fromLTRB(
                                    20, 0, 20, 40),
                                child: Transform.translate(
                                  offset: const Offset(0, -20),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius:
                                          BorderRadius.circular(28),
                                      boxShadow: [
                                        BoxShadow(
                                          color: _kPrimary
                                              .withOpacity(0.12),
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

                              Container(
                                width: double.infinity,
                                color: const Color(0xFFF0F2F8),
                                padding:
                                    const EdgeInsets.only(bottom: 24),
                                child: Text(
                                  '© 2024 OutletPulsa',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.poppins(
                                      fontSize: 11,
                                      color: Colors.grey.shade400),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
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
// Shared Widgets
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

class _GradientButton extends StatelessWidget {
  const _GradientButton(
      {required this.label, required this.onPressed});
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
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
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14)),
          ),
          child: Text(
            label,
            style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Colors.white),
          ),
        ),
      ),
    );
  }
}

class AuthInput extends StatelessWidget {
  const AuthInput({
    super.key,
    required this.hintText,
    required this.icon,
    this.keyboardType,
    this.obscureText = false,
    this.onChanged,
    this.onSaved,
    this.validator,
    this.suffixIcon,
  });

  final String hintText;
  final IconData icon;
  final TextInputType? keyboardType;
  final bool obscureText;
  final void Function(String)? onChanged;
  final void Function(String?)? onSaved;
  final String? Function(String?)? validator;
  final Widget? suffixIcon;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5E9F2), width: 1.5),
      ),
      child: TextFormField(
        onChanged: onChanged,
        onSaved: onSaved,
        validator: validator,
        obscureText: obscureText,
        keyboardType: keyboardType,
        autocorrect: false,
        enableSuggestions: !obscureText,
        style: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: const Color(0xFF1A1A2E),
        ),
        decoration: InputDecoration(
          prefixIcon:
              Icon(icon, color: _kPrimary.withOpacity(0.5), size: 20),
          hintText: hintText,
          hintStyle: GoogleFonts.poppins(
              fontSize: 13, color: Colors.grey.shade400),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
              vertical: 16, horizontal: 16),
          suffixIcon: suffixIcon,
        ),
      ),
    );
  }
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

class _FeatureItem extends StatelessWidget {
  const _FeatureItem({required this.icon, required this.text});
  final IconData icon;
  final String text;
  @override
  Widget build(BuildContext context) => Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 12),
          Text(
            text,
            style: GoogleFonts.poppins(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
        ],
      );
}
