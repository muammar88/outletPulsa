import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:currency_text_input_formatter/currency_text_input_formatter.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/core/constants/config.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/shared/providers/TransferSaldoProvider.dart';
import 'package:outletpulsa/shared/providers/loadProvider.dart';
import 'package:outletpulsa/shared/widgets/CircularProgressWidget.dart';
import 'package:flutter/services.dart';

class Form_transfer_saldo extends StatefulWidget {
  Form_transfer_saldo({super.key});

  @override
  State<Form_transfer_saldo> createState() => _Form_transfer_saldoState();
}

class _Form_transfer_saldoState extends State<Form_transfer_saldo> {
  final config = ConfigApp();
  final _formKey = GlobalKey<FormState>();
  var nomorTujuanController = TextEditingController();
  var nominalTransferController = TextEditingController();

  @override
  void dispose() {
    nomorTujuanController.dispose();
    nominalTransferController.dispose();
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
                      'Transfer Saldo',
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
                      'Kirim saldo Anda ke pengguna lain dengan mudah dan cepat',
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
      body: Consumer<Load_provider>(
        builder: (context, loader, child) => Column(
          children: [
            _buildBrandPanel(compact: true),
            Expanded(
              child: Stack(
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
                        // --- Nomor Tujuan ---
                        _buildInputLabel('Nomor Tujuan', TablerIcons.device_mobile),
                        const SizedBox(height: 10),
                        _buildTextField(
                          controller: nomorTujuanController,
                          hint: 'Contoh: 081234567890',
                          icon: TablerIcons.phone,
                          keyboardType: TextInputType.number,
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // --- Nominal Transfer ---
                        _buildInputLabel('Nominal Transfer', TablerIcons.wallet),
                        const SizedBox(height: 10),
                        _buildTextField(
                          controller: nominalTransferController,
                          hint: 'Contoh: Rp 50.000',
                          icon: TablerIcons.cash,
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            CurrencyTextInputFormatter.currency(
                              locale: 'id',
                              decimalDigits: 0,
                              symbol: 'Rp ',
                            )
                          ],
                        ),
                        
                        const SizedBox(height: 32),
                        
                        // --- Transfer Button ---
                        GestureDetector(
                          onTap: () => _submitTransfer(loader),
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF0F1F6E), Color(0xFF1A3DB5)],
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
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(TablerIcons.send,
                                    size: 18, color: Colors.white),
                                const SizedBox(width: 8),
                                Text(
                                  "Transfer Sekarang",
                                  style: GoogleFonts.poppins(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
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
              ],
            ),
          ),
          if (loader.isLoad == true) CircularProgressWidget() else const SizedBox(),
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

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    required TextInputType keyboardType,
    List<TextInputFormatter>? inputFormatters,
  }) {
    return TextFormField(
      controller: controller,
      onSaved: (val) {
        setState(() {
          controller.text = val.toString();
        });
      },
      autocorrect: false,
      enableSuggestions: false,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      style: GoogleFonts.poppins(
        fontSize: 15,
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
        prefixIcon: Icon(icon, color: Colors.grey[400], size: 20),
      ),
    );
  }

  Future<void> _submitTransfer(Load_provider loader) async {
    _formKey.currentState!.save();

    var err = false;
    var errMsg = '';

    if (nomorTujuanController.text.isEmpty) {
      errMsg = 'Nomor tujuan wajib diisi';
      err = true;
    } else if (nominalTransferController.text.isEmpty) {
      errMsg = 'Nominal transfer wajib diisi';
      err = true;
    }

    if (!err) {
      loader.isLoad = true;
      final transfer = Provider.of<Transfer_saldo_provider>(context, listen: false);

      await transfer.transferSaldo(
        nomorTujuanController.text,
        nominalTransferController.text,
      );

      if (transfer.error != null) {
        loader.isLoad = false;
        if (transfer.error == false) {
          await Provider.of<Beranda_provider>(context, listen: false).get_data_beranda();
          _showSnackBar(transfer.errorMsg ?? 'Transfer Berhasil', isSuccess: true);
          Navigator.pop(context);
        } else {
          _showSnackBar(transfer.errorMsg ?? 'Transfer Gagal', isSuccess: false);
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
