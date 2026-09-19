import 'package:flutter/material.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

class PaymentInstructionScreen extends StatelessWidget {
  final Map<String, dynamic> transactionData;

  const PaymentInstructionScreen({super.key, required this.transactionData});

  static const Color _kPrimary = Color(0xFF0F1F6E);

  void _copyToClipboard(BuildContext context, String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$label berhasil disalin')),
    );
  }

  Future<void> _launchUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url)) {
      debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isQris = transactionData['payment_method'] == 'QRIS';
    final isEwallet = transactionData['payment_method'] == 'EWALLET';
    final isVa = transactionData['payment_method'] == 'VA';

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        backgroundColor: _kPrimary,
        title: Text('Instruksi Pembayaran', style: GoogleFonts.poppins(fontSize: 18)),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 5)),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    'Selesaikan Pembayaran Anda',
                    style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Total Tagihan',
                    style: GoogleFonts.poppins(color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Rp ${transactionData['total_amount']}',
                    style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.bold, color: _kPrimary),
                  ),
                  const SizedBox(height: 24),
                  
                  if (isVa) ...[
                    Text('Bank ${transactionData['bank_name']}', style: GoogleFonts.poppins(fontSize: 16)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8F9FA),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              transactionData['virtual_account'] ?? '-',
                              style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(TablerIcons.copy, color: _kPrimary),
                            onPressed: () => _copyToClipboard(context, transactionData['virtual_account'], 'Nomor VA'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text('Batas Waktu: ${transactionData['expired_at'] ?? '-'}', style: GoogleFonts.poppins(color: Colors.red)),
                  ] else if (isQris) ...[
                    Text('Scan QRIS', style: GoogleFonts.poppins(fontSize: 16)),
                    const SizedBox(height: 16),
                    if (transactionData['imageqris'] != null)
                      Image.network(transactionData['imageqris'], width: 250, height: 250),
                    const SizedBox(height: 16),
                    Text('Batas Waktu: ${transactionData['expired_at'] ?? '-'}', style: GoogleFonts.poppins(color: Colors.red)),
                  ] else if (isEwallet) ...[
                    Text('Checkout dengan E-Wallet', style: GoogleFonts.poppins(fontSize: 16)),
                    const SizedBox(height: 16),
                    if (transactionData['checkout_url'] != null)
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _kPrimary,
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () => _launchUrl(transactionData['checkout_url']),
                        child: Text('Buka Aplikasi E-Wallet', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
                      )
                    else 
                      Text('Selesaikan pembayaran pada aplikasi E-Wallet di HP Anda (Push Notification).', textAlign: TextAlign.center, style: GoogleFonts.poppins(color: Colors.grey.shade700)),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: _kPrimary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: _kPrimary),
                ),
              ),
              onPressed: () => Navigator.popUntil(context, (route) => route.isFirst),
              child: Text('Kembali ke Beranda', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
