import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/BerandaProvider.dart';
import '../../../../../provider/UpdateAkunProvider.dart';

class Update_password extends StatefulWidget {
  const Update_password({super.key});

  @override
  State<Update_password> createState() => _Update_passwordState();
}

class _Update_passwordState extends State<Update_password> {
  final config = ConfigApp();
  final _formKey = GlobalKey<FormState>();

  var passwordLamaController = TextEditingController();
  var passwordBaruController = TextEditingController();
  var konfirmasiPasswordBaruController = TextEditingController();

  bool _obscureLama = true;
  bool _obscureBaru = true;
  bool _obscureKonf = true;

  @override
  void dispose() {
    passwordLamaController.dispose();
    passwordBaruController.dispose();
    konfirmasiPasswordBaruController.dispose();
    super.dispose();
  }

  static const Color _kPrimary = Color(0xFF0F1F6E);
  static const Color _kPrimaryLight = Color(0xFF1A3DB5);

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
            Positioned(top: -50, right: -50, child: _Circle(size: 200, opacity: 0.05)),
            Positioned(top: 50, right: 50, child: _Circle(size: 90, opacity: 0.06)),
            Positioned(bottom: -40, left: -40, child: _Circle(size: 130, opacity: 0.04)),

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
                  child: const Icon(TablerIcons.arrow_left, color: Colors.white, size: 20),
                ),
              ),
            ),

            Center(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: compact ? 32 : 0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(height: 16),
                    Text(
                      'Update Password',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: compact ? 26 : 36,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.2,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Pastikan akun Anda aman dengan memperbarui kata sandi secara berkala',
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            _buildBrandPanel(compact: true),
            Expanded(
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
                  // --- Password Lama ---
                  _buildInputLabel('Password Lama', TablerIcons.lock_open),
                  const SizedBox(height: 10),
                  _buildPasswordField(
                    controller: passwordLamaController,
                    hint: 'Masukkan password lama',
                    obscure: _obscureLama,
                    onToggleObscure: () => setState(() => _obscureLama = !_obscureLama),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // --- Password Baru ---
                  _buildInputLabel('Password Baru', TablerIcons.lock_plus),
                  const SizedBox(height: 10),
                  _buildPasswordField(
                    controller: passwordBaruController,
                    hint: 'Masukkan password baru',
                    obscure: _obscureBaru,
                    onToggleObscure: () => setState(() => _obscureBaru = !_obscureBaru),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // --- Konfirmasi Password Baru ---
                  _buildInputLabel('Konfirmasi Password Baru', TablerIcons.lock_check),
                  const SizedBox(height: 10),
                  _buildPasswordField(
                    controller: konfirmasiPasswordBaruController,
                    hint: 'Ulangi password baru',
                    obscure: _obscureKonf,
                    onToggleObscure: () => setState(() => _obscureKonf = !_obscureKonf),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // --- Simpan Button ---
                  Consumer<Update_akun_provider>(
                    builder: (context, provider, child) {
                      return GestureDetector(
                        onTap: provider.isLoading ? null : () => _submitForm(provider),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: provider.isLoading
                                  ? [Colors.grey, Colors.grey.shade400]
                                  : [const Color(0xFF0F1F6E), const Color(0xFF1A3DB5)],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF0F1F6E).withOpacity(0.3),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: provider.isLoading
                              ? const Center(
                                  child: SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  ),
                                )
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(TablerIcons.device_floppy,
                                        size: 18, color: Colors.white),
                                    const SizedBox(width: 8),
                                    Text(
                                      "Simpan Perubahan",
                                      style: GoogleFonts.poppins(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      );
                    }
                  ),
                ],
              ),
            ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputLabel(String text, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF1A1A2E).withOpacity(0.6), size: 18),
        const SizedBox(width: 8),
        Text(
          text,
          style: GoogleFonts.poppins(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF1A1A2E),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordField({
    required TextEditingController controller,
    required String hint,
    required bool obscure,
    required VoidCallback onToggleObscure,
  }) {
    return TextFormField(
      controller: controller,
      onSaved: (val) {
        setState(() {
          controller.text = val.toString();
        });
      },
      autocorrect: false,
      obscureText: obscure,
      style: GoogleFonts.poppins(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: const Color(0xFF1A1A2E),
      ),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.poppins(
          fontSize: 13,
          color: Colors.grey[400],
        ),
        floatingLabelBehavior: FloatingLabelBehavior.never,
        filled: true,
        fillColor: const Color(0xFFF8F9FA),
        contentPadding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 16.0),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF0F1F6E), width: 1.5),
        ),
        prefixIcon: Icon(TablerIcons.lock, color: Colors.grey[400], size: 20),
        suffixIcon: IconButton(
          icon: Icon(
            obscure ? TablerIcons.eye_off : TablerIcons.eye,
            color: Colors.grey[500],
            size: 20,
          ),
          onPressed: onToggleObscure,
        ),
      ),
    );
  }

  Future<void> _submitForm(Update_akun_provider update) async {
    _formKey.currentState!.save();
    var err = false;
    var errMsg = '';

    if (passwordLamaController.text.isEmpty) {
      errMsg = 'Password Lama wajib diisi';
      err = true;
    } else if (passwordBaruController.text.isEmpty) {
      errMsg = 'Password Baru wajib diisi';
      err = true;
    } else if (konfirmasiPasswordBaruController.text.isEmpty) {
      errMsg = 'Konfirmasi Password Baru wajib diisi';
      err = true;
    } else if (konfirmasiPasswordBaruController.text != passwordBaruController.text) {
      errMsg = 'Konfirmasi Password harus sama dengan Password Baru';
      err = true;
    }

    if (!err) {
      await update.updatePasswordAkun(
        passwordLamaController.text,
        passwordBaruController.text,
        konfirmasiPasswordBaruController.text,
      );

      if (update.error != null) {
        if (update.error == false) {
          await Provider.of<Beranda_provider>(context, listen: false).get_data_beranda();
          _showSnackBar(update.errorMsg ?? 'Password berhasil diubah', isSuccess: true);
          if (mounted) Navigator.pop(context);
        } else {
          _showSnackBar(update.errorMsg ?? 'Gagal mengubah password', isSuccess: false);
        }
      }
    } else {
      _showSnackBar(errMsg, isSuccess: false);
    }
  }

  void _showSnackBar(String message, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: isSuccess ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
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
