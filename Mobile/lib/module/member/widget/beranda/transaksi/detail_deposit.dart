import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_tabler_icons/flutter_tabler_icons.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../../../config/config.dart';
import '../../../../../provider/DepositProvider.dart';

class Detail_deposit extends StatefulWidget {
  Detail_deposit({super.key, required this.status, required this.id});

  final String status;
  final String id;

  @override
  State<Detail_deposit> createState() => _Detail_depositState();
}

class _Detail_depositState extends State<Detail_deposit> {
  final config = ConfigApp();
  bool loadData = false;

  @override
  void didChangeDependencies() async {
    if (loadData == false) {
      await Provider.of<Deposit_provider>(context).getDetailDeposit(widget.id);
      loadData = true;
    }
    super.didChangeDependencies();
  }

  String _formatCurrency(String amount) {
    try {
      double val = double.parse(amount);
      return NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0).format(val);
    } catch (e) {
      return 'Rp ' + amount;
    }
  }

  String _formatDate(String rawDate) {
    try {
      DateTime dt = DateTime.parse(rawDate).toLocal();
      return DateFormat('dd MMM yyyy • HH:mm').format(dt);
    } catch (e) {
      return rawDate;
    }
  }

  @override
  Widget build(BuildContext context) {
    final deposit = Provider.of<Deposit_provider>(context);
    final s = (deposit.status_deposit ?? widget.status).toLowerCase();
    
    Color statusColor;
    IconData statusIcon;
    String statusTitle;

    if (s == 'gagal' || s == 'failed') {
      statusColor = const Color(0xFFE53935);
      statusIcon = TablerIcons.x;
      statusTitle = 'Deposit Gagal';
    } else if (s == 'proses' || s == 'pending') {
      statusColor = const Color(0xFFF9A825);
      statusIcon = TablerIcons.clock;
      statusTitle = 'Deposit Diproses';
    } else {
      statusColor = const Color(0xFF43A047);
      statusIcon = TablerIcons.check;
      statusTitle = 'Deposit Berhasil';
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF4F6F9),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF1A1A2E)),
        ),
        title: Text(
          'Detail Transaksi',
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF1A1A2E),
          ),
        ),
      ),
      body: loadData && deposit.kode == null && deposit.error == true
          ? Center(
              child: Text(
                deposit.errorMsg ?? 'Gagal memuat detail',
                style: GoogleFonts.poppins(color: Colors.red),
              ),
            )
          : deposit.kode == null
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Column(
                    children: [
                      // Card Utama
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0F1F6E).withOpacity(0.04),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            const SizedBox(height: 30),
                            // Icon Status
                            Container(
                              width: 70,
                              height: 70,
                              decoration: BoxDecoration(
                                color: statusColor.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Container(
                                  width: 50,
                                  height: 50,
                                  decoration: BoxDecoration(
                                    color: statusColor,
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: statusColor.withOpacity(0.3),
                                        blurRadius: 12,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: Icon(statusIcon, color: Colors.white, size: 28),
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              statusTitle,
                              style: GoogleFonts.outfit(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1A1A2E),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _formatDate(deposit.waktu_kirim ?? ''),
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: const Color(0xFF6B7280),
                              ),
                            ),
                            const SizedBox(height: 24),
                            
                            // Nominal
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 20),
                              decoration: const BoxDecoration(
                                color: Color(0xFFF8FAFC),
                                border: Border.symmetric(
                                  horizontal: BorderSide(color: Color(0xFFEEF2F6)),
                                )
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    'Nominal Deposit',
                                    style: GoogleFonts.poppins(
                                      fontSize: 13,
                                      color: const Color(0xFF6B7280),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    _formatCurrency(deposit.nominal ?? '0'),
                                    style: GoogleFonts.outfit(
                                      fontSize: 32,
                                      fontWeight: FontWeight.w700,
                                      color: config.background_color,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 10),
                            
                            // Detail List
                            Padding(
                              padding: const EdgeInsets.all(24.0),
                              child: Column(
                                children: [
                                  _buildDetailRow('Kode Transaksi', '#${deposit.kode ?? '-'}'),
                                  _buildDetailRow('Metode Pembayaran', 'Transfer Bank'),
                                  _buildDetailRow('Bank Tujuan', deposit.bank_tujuan_transfer ?? '-'),
                                  _buildDetailRow('Nama Rekening', deposit.nama_akun ?? '-'),
                                  _buildDetailRow(
                                    'Nomor Rekening', 
                                    deposit.nomor_rekening_akun ?? '-',
                                    isCopyable: true,
                                  ),
                                  if (deposit.status_deposit?.toLowerCase() == 'gagal') ...[
                                    const Padding(
                                      padding: EdgeInsets.symmetric(vertical: 12),
                                      child: Divider(color: Color(0xFFF3F4F6), height: 1),
                                    ),
                                    _buildDetailCol('Alasan Penolakan', deposit.alasan_penolakan ?? '-'),
                                    const SizedBox(height: 12),
                                    _buildDetailCol('Bantuan', 'Silahkan hubungi admin melalui WA: 085262802141'),
                                  ]
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 30),
                      
                      // Tombol OK
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: config.background_color,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          onPressed: () {
                            Navigator.of(context).popUntil((route) => route.isFirst);
                          },
                          child: Text(
                            'Kembali ke Beranda',
                            style: GoogleFonts.poppins(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
    );
  }

  Widget _buildDetailRow(String label, String value, {bool isCopyable = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF6B7280),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 3,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    value,
                    textAlign: TextAlign.right,
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF1A1A2E),
                    ),
                  ),
                ),
                if (isCopyable) ...[
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () async {
                      await Clipboard.setData(ClipboardData(text: value));
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: const Color(0xFF1A1A2E),
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            content: Row(
                              children: [
                                const Icon(Icons.check_circle_outline, color: Colors.greenAccent),
                                const SizedBox(width: 10),
                                Text(
                                  'Tersalin: $value',
                                  style: GoogleFonts.poppins(fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        );
                      }
                    },
                    child: const Icon(
                      TablerIcons.copy,
                      size: 18,
                      color: Color(0xFF1565C0),
                    ),
                  )
                ]
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailCol(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: const Color(0xFFE53935),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 13,
            color: const Color(0xFF1A1A2E),
            height: 1.5,
          ),
        ),
      ],
    );
  }
}
