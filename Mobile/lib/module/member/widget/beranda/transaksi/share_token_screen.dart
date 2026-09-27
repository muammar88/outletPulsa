import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter/services.dart';

class ShareTokenScreen extends StatelessWidget {
  final Map<String, String> tokenData;
  final String dateTransaction;
  final String customerNumber;
  final String productName;

  const ShareTokenScreen({
    super.key,
    required this.tokenData,
    required this.dateTransaction,
    required this.customerNumber,
    required this.productName,
  });

  void _shareText() {
    final text = '''
*STRUK TOKEN LISTRIK*
--------------------------------
Tanggal    : $dateTransaction
Produk     : $productName
No. Meter  : $customerNumber

Nama       : ${tokenData['name']}
Tarif/Daya : ${tokenData['tarif_daya']}
Jml KWH    : ${tokenData['kwh']}

*TOKEN:*
${tokenData['token']}
--------------------------------
Terima kasih!
''';
    Share.share(text);
  }

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF2E7D32),
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: Row(
          children: [
            const Icon(TablerIcons.circle_check, color: Colors.white, size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: Text(message, style: GoogleFonts.poppins(fontSize: 13, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF8898AA),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: GoogleFonts.poppins(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF1A1A2E),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F8),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: const Color(0xFF0F1F6E),
        centerTitle: true,
        title: Text(
          'Token Listrik',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 18,
            color: Colors.white,
          ),
        ),
        leading: IconButton(
          icon: const Icon(TablerIcons.arrow_left, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F1F6E).withOpacity(0.06),
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
                        color: const Color(0xFFFEF3C7),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(TablerIcons.bulb, color: Color(0xFFD97706), size: 40),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Transaksi Berhasil',
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1A1A2E),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      dateTransaction,
                      style: GoogleFonts.poppins(
                        fontSize: 13,
                        color: const Color(0xFF6B7280),
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8F9FA),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Column(
                        children: [
                          _buildDetailRow('Produk', productName),
                          Divider(color: Colors.grey.shade200, height: 16),
                          _buildDetailRow('No. Meter', customerNumber),
                          Divider(color: Colors.grey.shade200, height: 16),
                          _buildDetailRow('Nama', tokenData['name'] ?? '-'),
                          Divider(color: Colors.grey.shade200, height: 16),
                          _buildDetailRow('Tarif/Daya', tokenData['tarif_daya'] ?? '-'),
                          Divider(color: Colors.grey.shade200, height: 16),
                          _buildDetailRow('Jml KWH', tokenData['kwh'] ?? '-'),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F1F6E).withOpacity(0.03),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: const Color(0xFF0F1F6E).withOpacity(0.1),
                          width: 2,
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            'NOMOR TOKEN',
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF0F1F6E),
                              letterSpacing: 2,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            tokenData['token'] ?? '-',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.outfit(
                              fontSize: 28,
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF1A1A2E),
                              letterSpacing: 3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        await Clipboard.setData(ClipboardData(text: tokenData['token'] ?? ''));
                        if (context.mounted) {
                          _showSnackBar(context, 'Token berhasil disalin');
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Color(0xFF0F1F6E), width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      icon: const Icon(TablerIcons.copy, color: Color(0xFF0F1F6E), size: 20),
                      label: Text(
                        "SALIN TOKEN",
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF0F1F6E),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _shareText,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F1F6E),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 0,
                      ),
                      icon: const Icon(TablerIcons.share, color: Colors.white, size: 20),
                      label: Text(
                        "BAGIKAN",
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
