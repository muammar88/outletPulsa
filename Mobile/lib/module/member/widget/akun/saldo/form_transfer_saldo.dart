import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:currency_text_input_formatter/currency_text_input_formatter.dart';
import 'package:provider/provider.dart';
import '../../../../../config/config.dart';
import '../../../../../provider/BerandaProvider.dart';
import '../../../../../provider/TransferSaldoProvider.dart';
import '../../../../../provider/loadProvider.dart';
import '../../../../../widget/CircularProgressWidget.dart';
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

  @override
  Widget build(BuildContext context) {
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
          'Transfer Saldo',
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
                                colors: [Color(0xFF1F2AAA), Color(0xFF3A47C5)],
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF1F2AAA).withOpacity(0.3),
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
          borderSide: const BorderSide(color: Color(0xFF1F2AAA), width: 1.5),
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
