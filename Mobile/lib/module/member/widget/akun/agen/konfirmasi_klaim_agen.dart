import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:provider/provider.dart';
import 'package:outletpulsa/shared/providers/BerandaProvider.dart';
import 'package:outletpulsa/shared/providers/AgenProvider.dart';
import 'package:intl/intl.dart';

class KonfirmasiKlaimAgen extends StatefulWidget {
  final int totalKlaim;

  const KonfirmasiKlaimAgen({Key? key, required this.totalKlaim}) : super(key: key);

  @override
  State<KonfirmasiKlaimAgen> createState() => _KonfirmasiKlaimAgenState();
}

class _KonfirmasiKlaimAgenState extends State<KonfirmasiKlaimAgen> {
  static const Color _kPrimary = Color(0xFF0F1F6E);
  bool _isLoading = false;

  String formatCurrency(dynamic number) {
    if (number == null) return 'Rp 0';
    final formatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    return formatter.format(number);
  }

  void _submitKlaim() async {
    setState(() {
      _isLoading = true;
    });

    final agenProv = Provider.of<Agen_provider>(context, listen: false);
    final berandaProv = Provider.of<Beranda_provider>(context, listen: false);

    await agenProv.klaimFeeAgen();
    await berandaProv.get_data_beranda(); // refresh saldo utama

    if (mounted) {
      setState(() {
        _isLoading = false;
      });

      if (agenProv.error == false) {
        // Success dialog
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(TablerIcons.circle_check_filled, color: Colors.green, size: 80),
                const SizedBox(height: 16),
                Text('Klaim Berhasil!', style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(agenProv.errorMsg ?? 'Saldo keagenan berhasil dicairkan.', textAlign: TextAlign.center, style: GoogleFonts.poppins()),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _kPrimary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      Navigator.pop(context); // close dialog
                      Navigator.pop(context); // back to info keagenan
                    },
                    child: Text('Kembali', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(agenProv.errorMsg ?? 'Gagal klaim saldo.', style: GoogleFonts.poppins()),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(TablerIcons.arrow_left, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Konfirmasi Pencairan',
          style: GoogleFonts.poppins(color: Colors.black87, fontWeight: FontWeight.w600, fontSize: 16),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE65100).withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(TablerIcons.cash, color: Color(0xFFE65100), size: 40),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Nominal Pencairan',
                    style: GoogleFonts.poppins(color: Colors.grey[600], fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    formatCurrency(widget.totalKlaim),
                    style: GoogleFonts.outfit(
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF1A1A2E),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Divider(),
                  const SizedBox(height: 24),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(TablerIcons.info_circle, color: Colors.blue, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Pencairan akan ditambahkan ke saldo utama Anda dan diproses secara instan.',
                          style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[700], height: 1.5),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: ElevatedButton(
            onPressed: _isLoading ? null : _submitKlaim,
            style: ElevatedButton.styleFrom(
              backgroundColor: _kPrimary,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: _isLoading
                ? const SizedBox(
                    height: 24,
                    width: 24,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                  )
                : Text(
                    'Konfirmasi Pencairan',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}
